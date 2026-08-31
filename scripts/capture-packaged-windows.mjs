import { copyFile, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { _electron as electron } from "playwright-core";

if (process.platform !== "win32") {
  throw new Error(
    "Windows Store screenshots must be captured from the packaged Windows executable on Windows.",
  );
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const executablePath =
  process.env.CAUSALPILOT_APP_EXECUTABLE ||
  path.join(projectRoot, "release", "win-unpacked", "CausalPilot AI.exe");
const sourceSample = path.join(
  projectRoot,
  "public",
  "samples",
  "checkout_incentive_synthetic_v1.csv",
);
const outputDirectory = path.join(projectRoot, "design", "qa", "windows-store");
const workDirectory = path.join(projectRoot, "work");
await mkdir(outputDirectory, { recursive: true });
await mkdir(workDirectory, { recursive: true });
const inputRoot = await mkdtemp(path.join(workDirectory, "windows-capture-来泽宇-"));
const samplePath = path.join(inputRoot, "实验 数据.csv");
await copyFile(sourceSample, samplePath);

const screenshotPaths = {
  overview: path.join(outputDirectory, "01-overview-1366x768.png"),
  mapping: path.join(outputDirectory, "02-import-mapping-1366x768.png"),
  results: path.join(outputDirectory, "03-local-results-1366x768.png"),
  reports: path.join(outputDirectory, "04-evidence-reports-1366x768.png"),
};

const application = await electron.launch({ executablePath, timeout: 60_000 });
const consoleErrors = [];

try {
  await application.evaluate(async ({ dialog }, selectedPath) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [selectedPath] });
  }, samplePath);

  const page = await application.firstWindow({ timeout: 60_000 });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });

  await page.getByRole("heading", { name: "Experiment Summary" }).waitFor();
  const primaryNavigation = page.getByLabel("Primary navigation");
  await primaryNavigation
    .getByRole("button", { name: "Overview", exact: true })
    .click();
  await page.getByRole("heading", { name: "Evidence before explanation." }).waitFor();
  await page.screenshot({ path: screenshotPaths.overview, fullPage: false });

  await page.getByRole("button", { name: "Import local CSV", exact: true }).click();
  await page.getByRole("button", { name: "Choose CSV", exact: true }).first().click();
  await page.getByRole("heading", { name: "Field mapping" }).waitFor();
  await page.screenshot({ path: screenshotPaths.mapping, fullPage: false });

  await page.getByLabel(/I confirm this is the assigned treatment/i).check();
  await page.getByRole("button", { name: /Validate & continue/ }).click();
  await page.getByRole("heading", { name: "Experiment Summary" }).waitFor({
    timeout: 120_000,
  });
  await page.getByText("Local analysis", { exact: true }).waitFor();
  await page.screenshot({ path: screenshotPaths.results, fullPage: false });
  const datasetHash = await page
    .locator(".evidence-inspector dd")
    .nth(1)
    .getAttribute("title");

  await primaryNavigation
    .getByRole("button", { name: "Reports", exact: true })
    .click();
  await page.getByRole("heading", { name: "Evidence reports" }).waitFor();
  await page.screenshot({ path: screenshotPaths.reports, fullPage: false });

  const dimensions = {};
  for (const [name, screenshotPath] of Object.entries(screenshotPaths)) {
    const png = await readFile(screenshotPath);
    if (png.toString("ascii", 1, 4) !== "PNG") {
      throw new Error(`${name} screenshot is not a PNG file.`);
    }
    dimensions[name] = {
      width: png.readUInt32BE(16),
      height: png.readUInt32BE(20),
    };
    if (dimensions[name].width !== 1366 || dimensions[name].height !== 768) {
      throw new Error(
        `${name} screenshot was ${dimensions[name].width}x${dimensions[name].height}, expected 1366x768.`,
      );
    }
  }

  const report = {
    capturedAt: new Date().toISOString(),
    captureBoundary:
      "Captured from the packaged Windows x64 executable. Only the native file chooser response was stubbed; the production file capability, validation, Windows sidecar, and renderer were exercised.",
    executablePath,
    application: await page.evaluate(() => window.causalPilot?.getAppMetadata()),
    screenshots: Object.fromEntries(
      Object.entries(screenshotPaths).map(([name, screenshotPath]) => [
        name,
        { file: path.basename(screenshotPath), ...dimensions[name] },
      ]),
    ),
    datasetHash,
    author: "LAI ZEYU (来泽宇)",
    unicodeInputPathRoundTrip: true,
    horizontalOverflow: await page.evaluate(
      () => document.body.scrollWidth > document.documentElement.clientWidth,
    ),
    consoleErrors,
  };
  await writeFile(
    path.join(outputDirectory, "windows-store-capture-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  if (report.application?.platform !== "win32" || report.application?.architecture !== "x64") {
    throw new Error("Screenshot capture did not run in a packaged Windows x64 application.");
  }
  if (report.application?.packaged !== true) {
    throw new Error("Screenshot capture did not run from a packaged application.");
  }
  if (report.horizontalOverflow) throw new Error("Packaged Windows page has horizontal overflow.");
  if (consoleErrors.length) throw new Error(`Renderer errors: ${consoleErrors.join(" | ")}`);

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} finally {
  await application.close();
}
