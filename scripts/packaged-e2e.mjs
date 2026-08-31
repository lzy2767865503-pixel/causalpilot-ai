import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { _electron as electron } from "playwright-core";

const projectRoot = path.resolve(import.meta.dirname, "..");
const defaultExecutablePath =
  process.platform === "win32"
    ? path.join(projectRoot, "release", "win-unpacked", "CausalPilot AI.exe")
    : path.join(
        projectRoot,
        "release",
        "mac-arm64",
        "CausalPilot AI.app",
        "Contents",
        "MacOS",
        "CausalPilot AI",
      );
const executablePath =
  process.env.CAUSALPILOT_APP_EXECUTABLE ||
  defaultExecutablePath;
const configuredLaunchTimeout = Number(
  process.env.CAUSALPILOT_LAUNCH_TIMEOUT_MS || "30000",
);
const launchTimeout =
  Number.isFinite(configuredLaunchTimeout) &&
  configuredLaunchTimeout >= 5_000 &&
  configuredLaunchTimeout <= 180_000
    ? configuredLaunchTimeout
    : 30_000;
const frozenSamplePath = path.join(
  projectRoot,
  "public",
  "samples",
  "checkout_incentive_synthetic_v1.csv",
);
const qaDirectory = path.join(projectRoot, "design", "qa");

await mkdir(qaDirectory, { recursive: true });
await mkdir(path.join(projectRoot, "work"), { recursive: true });
const exportRoot = await mkdtemp(path.join(projectRoot, "work", "packaged-export-"));
const inputRoot = await mkdtemp(path.join(projectRoot, "work", "packaged-input-来泽宇-"));
const samplePath = path.join(inputRoot, "实验 数据.csv");
await copyFile(frozenSamplePath, samplePath);

const application = await electron.launch({
  executablePath,
  timeout: launchTimeout,
});

try {
  // Replace only the OS chooser response inside this disposable test process.
  // Production code, renderer capability tokens, file validation, and the
  // packaged engine bridge remain unchanged and are exercised end to end.
  await application.evaluate(async ({ dialog }, selectedPath) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [selectedPath] });
  }, samplePath);

  const page = await application.firstWindow({ timeout: 30_000 });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.getByRole("heading", { name: "Experiment Summary" }).waitFor();
  await page.getByRole("button", { name: "Import data", exact: true }).click();
  await page.getByRole("button", { name: "Choose CSV", exact: true }).first().click();
  await page.getByRole("heading", { name: "Field mapping" }).waitFor();

  const mappingRows = await page.locator(".mapping-table-wrap tbody tr").count();
  await page.getByLabel(/I confirm this is the assigned treatment/i).check();
  await page.getByRole("button", { name: /Validate & continue/ }).click();
  await page.getByRole("heading", { name: "Experiment Summary" }).waitFor({ timeout: 120_000 });
  await page.getByText("Local analysis", { exact: true }).waitFor();

  await application.evaluate(async ({ dialog }, selectedPath) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [selectedPath] });
  }, exportRoot);
  await page.getByRole("button", { name: "Export evidence", exact: true }).click();

  let exportedFolder = "";
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const entries = await readdir(exportRoot);
    exportedFolder = entries.find((entry) => entry.includes("-evidence-")) || "";
    if (exportedFolder) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!exportedFolder) throw new Error("Packaged evidence export did not create its bundle folder.");
  const exportedJsonPath = path.join(exportRoot, exportedFolder, "result-bundle.json");
  const exportedHtmlPath = path.join(exportRoot, exportedFolder, "evidence-report.html");
  let exportComplete = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      await Promise.all([access(exportedJsonPath), access(exportedHtmlPath)]);
      exportComplete = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  if (!exportComplete) {
    throw new Error("Packaged evidence export did not finish writing both report files.");
  }
  const exportedEvidence = JSON.parse(await readFile(exportedJsonPath, "utf8"));
  const exportedHtml = await readFile(exportedHtmlPath, "utf8");

  const report = {
    testedAt: new Date().toISOString(),
    executablePath,
    launchTimeoutMs: launchTimeout,
    application: await page.evaluate(() => window.causalPilot?.getAppMetadata()),
    sourceFile: path.basename(samplePath),
    unicodeInputPathRoundTrip: /[^\x00-\x7F]/u.test(samplePath),
    mappingRows,
    provenance: await page.getByText("Local analysis", { exact: true }).innerText(),
    metrics: (await page.locator(".headline-metrics").innerText()).split("\n"),
    engineVersion: await page.locator(".evidence-inspector dd").nth(3).innerText(),
    datasetHash: await page.locator(".evidence-inspector dd").nth(1).getAttribute("title"),
    decision: await page.getByRole("heading", { name: /Did the assigned treatment create/ }).innerText(),
    authorMentions: await page.getByText(/LAI ZEYU/).count(),
    horizontalOverflow: await page.evaluate(
      () => document.body.scrollWidth > document.documentElement.clientWidth,
    ),
    consoleErrors,
    evidenceExport: {
      folder: exportedFolder,
      files: [path.basename(exportedJsonPath), path.basename(exportedHtmlPath)],
      schema: exportedEvidence.evidence_schema,
      author: exportedEvidence.author,
      datasetHash: exportedEvidence.result_bundle?.dataset?.hash,
      containsRawRows: /\"(?:raw_rows|rows|records|observations|raw_data|data_rows)\"\s*:/i.test(
        JSON.stringify(exportedEvidence),
      ),
      htmlCreditsAuthor: exportedHtml.includes("LAI ZEYU (来泽宇)"),
    },
    testBoundary:
      "The native chooser response was stubbed only inside this disposable test process; production tokenization, validation, packaged sidecar execution, and result rendering were exercised.",
  };

  await page.screenshot({
    path: path.join(qaDirectory, "packaged-local-engine-result.png"),
    fullPage: false,
  });
  await writeFile(
    path.join(qaDirectory, "packaged-e2e-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  if (mappingRows !== 4) throw new Error(`Expected four mapped columns, received ${mappingRows}.`);
  if (!report.unicodeInputPathRoundTrip) {
    throw new Error("The packaged test did not exercise a Unicode input path.");
  }
  if (report.application?.packaged !== true) throw new Error("The test did not run inside a packaged app.");
  if (report.engineVersion !== "causalpilot-engine 0.1.0") {
    throw new Error(`Unexpected engine version: ${report.engineVersion}`);
  }
  if (report.datasetHash !== "47ab1a639eecfbb1630063298d6d3b447bac5123e87d6e9653bdc283bf9de244") {
    throw new Error(`Unexpected dataset hash: ${report.datasetHash}`);
  }
  if (report.horizontalOverflow) throw new Error("Packaged result has horizontal overflow.");
  if (consoleErrors.length) throw new Error(`Renderer errors: ${consoleErrors.join(" | ")}`);
  if (report.evidenceExport.schema !== "causalpilot.evidence.v1") {
    throw new Error(`Unexpected evidence schema: ${report.evidenceExport.schema}`);
  }
  if (report.evidenceExport.author !== "LAI ZEYU (来泽宇)") {
    throw new Error(`Unexpected evidence author: ${report.evidenceExport.author}`);
  }
  if (report.evidenceExport.containsRawRows || !report.evidenceExport.htmlCreditsAuthor) {
    throw new Error("Evidence export privacy or attribution check failed.");
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} finally {
  await application.close();
}
