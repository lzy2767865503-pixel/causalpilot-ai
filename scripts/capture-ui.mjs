import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputDirectory = path.join(projectRoot, "design", "qa");
const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const appUrl = process.env.CAUSALPILOT_PREVIEW_URL || "http://127.0.0.1:5173/";

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--force-device-scale-factor=1"],
});

const page = await browser.newPage({
  viewport: { width: 1504, height: 1046 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  reducedMotion: "reduce",
});

const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(appUrl, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Experiment Summary" }).waitFor();
await page.screenshot({
  path: path.join(outputDirectory, "results-workbench-1504x1046.png"),
  fullPage: false,
});

const desktopGeometry = await page.evaluate(() => ({
  viewport: [window.innerWidth, window.innerHeight],
  body: [document.body.scrollWidth, document.body.scrollHeight],
  horizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth,
}));

await page.getByRole("button", { name: "Import data", exact: true }).click();
await page.getByRole("button", { name: "Use sample dataset", exact: true }).click();
await page.getByRole("heading", { name: "Field mapping" }).waitFor();
await page.screenshot({
  path: path.join(outputDirectory, "import-mapping-1504x1046.png"),
  fullPage: false,
});

await page
  .getByRole("button", { name: /Validate & continue|Open frozen result/ })
  .click();
await page.getByRole("heading", { name: "Experiment Summary" }).waitFor();
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: path.join(outputDirectory, "results-mobile-390x844.png"),
  fullPage: false,
});

const mobileGeometry = await page.evaluate(() => ({
  viewport: [window.innerWidth, window.innerHeight],
  body: [document.body.scrollWidth, document.body.scrollHeight],
  horizontalOverflow: document.body.scrollWidth > document.documentElement.clientWidth,
  mobileMenuVisible: Boolean(
    document.querySelector('.mobile-menu-button') &&
      getComputedStyle(document.querySelector('.mobile-menu-button')).display !== "none"
  ),
}));

const report = {
  capturedAt: new Date().toISOString(),
  browser: "Google Chrome via playwright-core",
  appUrl,
  desktopGeometry,
  mobileGeometry,
  consoleErrors: errors,
  author: "LAI ZEYU (来泽宇)",
};

await writeFile(
  path.join(outputDirectory, "visual-smoke-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

await browser.close();

if (errors.length) {
  throw new Error(`Browser console errors: ${errors.join(" | ")}`);
}

if (desktopGeometry.horizontalOverflow || mobileGeometry.horizontalOverflow) {
  throw new Error("Unexpected horizontal overflow detected.");
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
