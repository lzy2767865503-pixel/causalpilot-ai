import { randomUUID } from "node:crypto";
import { open, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  type IpcMainInvokeEvent,
  type OpenDialogOptions,
} from "electron";

import { analyzeWithLocalEngine } from "./engine-bridge.js";
import { exportEvidenceBundle } from "./evidence-export.js";
// Include the CommonJS sandbox preload in the Electron TypeScript build without
// importing or executing it in the privileged main process.
import type {} from "./preload.cjs";
import type {
  AnalyzeExperimentRequest,
  AppMetadata,
  ExperimentFileSelection,
  JsonObject,
  JsonValue,
} from "./types.js";

const APP_NAME = "CausalPilot AI" as const;
const APP_AUTHOR = "LAI ZEYU (来泽宇)" as const;
const APP_ID = "com.laizeyu.causalpilot" as const;
const MAX_EXPERIMENT_BYTES = 100 * 1024 * 1024;
const MAX_ANALYSIS_SPEC_BYTES = 512 * 1024;
const FILE_TOKEN_TTL_MS = 30 * 60 * 1_000;
const MAX_FILE_TOKENS = 32;
const MAX_HEADER_BYTES = 256 * 1024;
const MODULE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

const CHANNELS = {
  selectExperimentFile: "causalpilot:select-experiment-file",
  analyzeExperiment: "causalpilot:analyze-experiment",
  exportEvidence: "causalpilot:export-evidence",
  getAppMetadata: "causalpilot:get-app-metadata",
} as const;

interface SelectedFileCapability {
  realPath: string;
  displayName: string;
  sizeBytes: number;
  modifiedMs: number;
  expiresAt: number;
}

const selectedFiles = new Map<string, SelectedFileCapability>();
let mainWindow: BrowserWindow | null = null;

function parseCsvHeader(text: string): string[] {
  const fields: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (character === "," && !quoted) {
      fields.push(value.trim());
      value = "";
      continue;
    }
    if ((character === "\n" || character === "\r") && !quoted) {
      fields.push(value.trim());
      break;
    }
    value += character;
  }
  if (!fields.length && value) fields.push(value.trim());
  if (fields[0]?.charCodeAt(0) === 0xfeff) fields[0] = fields[0].slice(1);
  const normalized = fields.filter(Boolean);
  if (!normalized.length || new Set(normalized).size !== normalized.length) {
    throw new Error("The CSV header is empty or contains duplicate column names.");
  }
  return normalized.slice(0, 500);
}

async function readCsvColumns(filePath: string, fileSize: number): Promise<string[]> {
  const handle = await open(filePath, "r");
  try {
    const bytesToRead = Math.min(fileSize, MAX_HEADER_BYTES);
    const buffer = Buffer.alloc(bytesToRead);
    const { bytesRead } = await handle.read(buffer, 0, bytesToRead, 0);
    const text = buffer.subarray(0, bytesRead).toString("utf8");
    const lineBreak = text.search(/[\r\n]/);
    if (lineBreak < 0 && fileSize > bytesToRead) {
      throw new Error("The CSV header exceeds the 256 KB safety limit.");
    }
    return parseCsvHeader(text);
  } finally {
    await handle.close();
  }
}

function isJsonObject(value: unknown): value is JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertJsonValue(value: unknown, depth = 0): asserts value is JsonValue {
  if (depth > 64) throw new Error("Analysis specification is nested too deeply.");
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) assertJsonValue(item, depth + 1);
    return;
  }
  if (isJsonObject(value)) {
    for (const child of Object.values(value)) assertJsonValue(child, depth + 1);
    return;
  }
  throw new Error("Analysis specification must contain JSON values only.");
}

function assertTrustedRenderer(event: IpcMainInvokeEvent): void {
  if (
    !mainWindow ||
    event.sender.id !== mainWindow.webContents.id ||
    event.senderFrame !== event.sender.mainFrame
  ) {
    throw new Error("Rejected IPC call from an untrusted renderer.");
  }
}

function pruneFileCapabilities(): void {
  const now = Date.now();
  for (const [token, selected] of selectedFiles) {
    if (selected.expiresAt <= now) selectedFiles.delete(token);
  }
  while (selectedFiles.size > MAX_FILE_TOKENS) {
    const oldest = selectedFiles.keys().next().value as string | undefined;
    if (!oldest) break;
    selectedFiles.delete(oldest);
  }
}

async function selectExperimentFile(): Promise<ExperimentFileSelection> {
  const options: OpenDialogOptions = {
    title: "Select experiment data",
    properties: ["openFile"],
    filters: [
      { name: "CSV experiment data", extensions: ["csv"] },
      { name: "All files", extensions: ["*"] },
    ],
  };
  const result = mainWindow
    ? await dialog.showOpenDialog(mainWindow, options)
    : await dialog.showOpenDialog(options);
  if (result.canceled || result.filePaths.length !== 1) {
    return { cancelled: true };
  }

  const selectedPath = result.filePaths[0];
  if (path.extname(selectedPath).toLowerCase() !== ".csv") {
    throw new Error("CausalPilot v1 accepts CSV experiment files only.");
  }
  const canonicalPath = await realpath(selectedPath);
  const fileStats = await stat(canonicalPath);
  if (!fileStats.isFile()) throw new Error("The selected experiment is not a file.");
  if (fileStats.size <= 0 || fileStats.size > MAX_EXPERIMENT_BYTES) {
    throw new Error("Experiment files must be between 1 byte and 100 MB.");
  }
  const columns = await readCsvColumns(canonicalPath, fileStats.size);

  pruneFileCapabilities();
  const token = randomUUID();
  selectedFiles.set(token, {
    realPath: canonicalPath,
    displayName: path.basename(canonicalPath),
    sizeBytes: fileStats.size,
    modifiedMs: fileStats.mtimeMs,
    expiresAt: Date.now() + FILE_TOKEN_TTL_MS,
  });
  pruneFileCapabilities();

  return {
    cancelled: false,
    token,
    displayName: path.basename(canonicalPath),
    sizeBytes: fileStats.size,
    lastModifiedIso: fileStats.mtime.toISOString(),
    columns,
  };
}

function validateAnalyzeRequest(value: unknown): AnalyzeExperimentRequest {
  if (!isJsonObject(value)) throw new Error("Invalid analysis request.");
  const token = value.experimentFileToken;
  const analysisSpec = value.analysisSpec;
  const requestId = value.requestId;
  if (typeof token !== "string" || !/^[0-9a-f-]{36}$/i.test(token)) {
    throw new Error("Invalid or expired experiment file token.");
  }
  if (!isJsonObject(analysisSpec)) {
    throw new Error("analysisSpec must be a JSON object.");
  }
  assertJsonValue(analysisSpec);
  const encoded = JSON.stringify(analysisSpec);
  if (Buffer.byteLength(encoded, "utf8") > MAX_ANALYSIS_SPEC_BYTES) {
    throw new Error("Analysis specification exceeds the 512 KB safety limit.");
  }
  if (
    requestId !== undefined &&
    (typeof requestId !== "string" || !/^[A-Za-z0-9._-]{1,128}$/.test(requestId))
  ) {
    throw new Error("requestId contains unsupported characters.");
  }
  return {
    experimentFileToken: token,
    analysisSpec,
    requestId: requestId as string | undefined,
  };
}

async function analyzeExperiment(value: unknown): Promise<JsonObject> {
  const request = validateAnalyzeRequest(value);
  pruneFileCapabilities();
  const selected = selectedFiles.get(request.experimentFileToken);
  if (!selected || selected.expiresAt <= Date.now()) {
    selectedFiles.delete(request.experimentFileToken);
    throw new Error("The experiment file selection expired; select the file again.");
  }

  const currentStats = await stat(selected.realPath);
  if (
    !currentStats.isFile() ||
    currentStats.size !== selected.sizeBytes ||
    currentStats.mtimeMs !== selected.modifiedMs
  ) {
    selectedFiles.delete(request.experimentFileToken);
    throw new Error("The experiment file changed after selection; select it again.");
  }

  return await analyzeWithLocalEngine(
    selected.realPath,
    request.requestId || randomUUID(),
    request.analysisSpec,
  );
}

function getAppMetadata(): AppMetadata {
  return {
    name: APP_NAME,
    author: APP_AUTHOR,
    description:
      "Offline-first experiment analysis and evidence export with a deterministic local engine.",
    version: app.getVersion(),
    platform: process.platform,
    architecture: process.arch,
    packaged: app.isPackaged,
    processingMode: "offline-local-engine",
  };
}

function registerIpcHandlers(): void {
  for (const channel of Object.values(CHANNELS)) ipcMain.removeHandler(channel);

  ipcMain.handle(CHANNELS.selectExperimentFile, async (event) => {
    assertTrustedRenderer(event);
    return await selectExperimentFile();
  });
  ipcMain.handle(CHANNELS.analyzeExperiment, async (event, request: unknown) => {
    assertTrustedRenderer(event);
    return await analyzeExperiment(request);
  });
  ipcMain.handle(CHANNELS.exportEvidence, async (event, bundle: unknown) => {
    assertTrustedRenderer(event);
    if (!isJsonObject(bundle)) throw new Error("Invalid evidence bundle.");
    return await exportEvidenceBundle(mainWindow, bundle);
  });
  ipcMain.handle(CHANNELS.getAppMetadata, async (event) => {
    assertTrustedRenderer(event);
    return getAppMetadata();
  });
}

function developmentRendererUrl(): string {
  const configured = process.env.CAUSALPILOT_RENDERER_URL || "http://127.0.0.1:5173";
  const parsed = new URL(configured);
  const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
  if (!loopbackHosts.has(parsed.hostname) || !["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Development renderer URL must use a loopback HTTP(S) host.");
  }
  return parsed.toString();
}

async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1040,
    minHeight: 720,
    show: false,
    title: APP_NAME,
    webPreferences: {
      preload: path.join(MODULE_DIRECTORY, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: !app.isPackaged,
    },
  });

  const trustedSession = mainWindow.webContents.session;
  trustedSession.setPermissionCheckHandler(() => false);
  trustedSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-attach-webview", (event) => event.preventDefault());
  mainWindow.webContents.on("will-navigate", (event, targetUrl) => {
    if (targetUrl !== mainWindow?.webContents.getURL()) event.preventDefault();
  });
  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
    selectedFiles.clear();
  });

  if (app.isPackaged) {
    await mainWindow.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  } else {
    await mainWindow.loadURL(developmentRendererUrl());
  }
}

app.setName(APP_NAME);
if (process.platform === "win32") app.setAppUserModelId(APP_ID);

app.whenReady().then(async () => {
  app.setAboutPanelOptions({
    applicationName: APP_NAME,
    applicationVersion: app.getVersion(),
    version: app.getVersion(),
    authors: [APP_AUTHOR],
    credits: `${APP_NAME} · Offline causal decision workbench`,
    copyright: `Copyright © ${new Date().getFullYear()} ${APP_AUTHOR}`,
  });
  registerIpcHandlers();
  await createMainWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
