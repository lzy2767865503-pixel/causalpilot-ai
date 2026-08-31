import { randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  open,
  realpath,
  rename,
  stat,
} from "node:fs/promises";
import path from "node:path";

import {
  BrowserWindow,
  dialog,
  type OpenDialogOptions,
} from "electron";

import type {
  EvidenceExportBundle,
  EvidenceExportResult,
  JsonObject,
  JsonValue,
} from "./types.js";

const MAX_EVIDENCE_BYTES = 20 * 1024 * 1024;
const AUTHOR = "LAI ZEYU (来泽宇)";
const RAW_ROW_KEYS = new Set([
  "raw_rows",
  "rows",
  "records",
  "observations",
  "raw_data",
  "data_rows",
]);

function isJsonObject(value: unknown): value is JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sanitizeFileStem(value: string | undefined): string {
  const normalized = (value || "causalpilot-analysis")
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}_.-]+/gu, "-")
    .replace(/^\.+/, "")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return normalized || "causalpilot-analysis";
}

function ensureJsonValue(value: unknown, depth = 0): asserts value is JsonValue {
  if (depth > 64) {
    throw new Error("Evidence data is nested too deeply.");
  }
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) ensureJsonValue(item, depth + 1);
    return;
  }
  if (isJsonObject(value)) {
    for (const child of Object.values(value)) ensureJsonValue(child, depth + 1);
    return;
  }
  throw new Error("Evidence contains a non-JSON value.");
}

function sanitizeForEvidence(
  value: JsonValue,
  keyName = "",
  depth = 0,
): JsonValue {
  if (depth > 64) throw new Error("Evidence data is nested too deeply.");
  if (Array.isArray(value)) {
    if (RAW_ROW_KEYS.has(keyName.toLowerCase()) && value.length > 0) {
      throw new Error(
        "Evidence export rejected a raw-row collection; export aggregate results only.",
      );
    }
    return value.map((item) => sanitizeForEvidence(item, "", depth + 1));
  }
  if (isJsonObject(value)) {
    const sanitized = Object.create(null) as JsonObject;
    for (const [key, child] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      if (
        normalizedKey === "csv_path" ||
        normalizedKey === "file_path" ||
        normalizedKey === "source_path" ||
        normalizedKey === "absolute_path" ||
        normalizedKey.endsWith("_local_path")
      ) {
        sanitized[key] = "[redacted-local-path]";
        continue;
      }
      sanitized[key] = sanitizeForEvidence(child, key, depth + 1);
    }
    return sanitized;
  }
  return value;
}

function buildEvidencePayload(bundle: EvidenceExportBundle): JsonObject {
  if (!isJsonObject(bundle.resultBundle)) {
    throw new Error("Evidence must contain a ResultBundle JSON object.");
  }
  ensureJsonValue(bundle.resultBundle);
  if (bundle.analysisSpec !== undefined) ensureJsonValue(bundle.analysisSpec);
  if (bundle.provenance !== undefined) ensureJsonValue(bundle.provenance);

  const payload: JsonObject = {
    evidence_schema: "causalpilot.evidence.v1",
    application: "CausalPilot AI",
    author: AUTHOR,
    exported_at: new Date().toISOString(),
    result_bundle: sanitizeForEvidence(bundle.resultBundle),
  };
  if (bundle.analysisSpec) {
    payload.analysis_spec = sanitizeForEvidence(bundle.analysisSpec);
  }
  if (bundle.provenance) {
    payload.provenance = sanitizeForEvidence(bundle.provenance);
  }

  const serialized = JSON.stringify(payload, null, 2);
  if (Buffer.byteLength(serialized, "utf8") > MAX_EVIDENCE_BYTES) {
    throw new Error("Evidence bundle exceeds the 20 MB export safety limit.");
  }
  return payload;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderEvidenceHtml(title: string, payload: JsonObject): string {
  const safeTitle = escapeHtml(title);
  const safeJson = escapeHtml(JSON.stringify(payload, null, 2));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
  <title>${safeTitle}</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    body { max-width: 960px; margin: 0 auto; padding: 48px 28px; color: #18201c; background: #ffffff; }
    h1 { margin: 0 0 8px; font-size: 30px; line-height: 1.2; }
    .meta { margin: 0 0 28px; color: #5d6962; }
    pre { overflow: auto; padding: 22px; border: 1px solid #d9e1dc; border-radius: 12px; background: #f6f8f7; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <h1>${safeTitle}</h1>
  <p class="meta">Generated locally by CausalPilot AI · ${escapeHtml(AUTHOR)}</p>
  <pre>${safeJson}</pre>
</body>
</html>
`;
}

function timestampForFile(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function canonicalUserTarget(selectedPath: string): Promise<string> {
  if (!path.isAbsolute(selectedPath) || selectedPath.includes("\0")) {
    throw new Error("The selected export path is invalid.");
  }
  const canonicalParent = await realpath(path.dirname(selectedPath));
  const target = path.join(canonicalParent, path.basename(selectedPath));
  try {
    const existing = await lstat(target);
    if (existing.isSymbolicLink() || !existing.isFile()) {
      throw new Error("The selected export target is not a regular file.");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return target;
}

async function atomicWriteFile(target: string, contents: string): Promise<void> {
  const temporary = path.join(
    path.dirname(target),
    `.${path.basename(target)}.${randomUUID()}.tmp`,
  );
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(contents, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporary, target);
}

async function chooseSaveTarget(
  parent: BrowserWindow | null,
  extension: "json" | "html",
  safeStem: string,
): Promise<string | null> {
  const options = {
    title: `Export CausalPilot ${extension.toUpperCase()} evidence`,
    defaultPath: `${safeStem}.${extension}`,
    filters: [
      {
        name: extension === "json" ? "JSON evidence" : "HTML report",
        extensions: [extension],
      },
    ],
  };
  const result = parent
    ? await dialog.showSaveDialog(parent, options)
    : await dialog.showSaveDialog(options);
  if (result.canceled || !result.filePath) return null;

  const withExtension = result.filePath.toLowerCase().endsWith(`.${extension}`)
    ? result.filePath
    : `${result.filePath}.${extension}`;
  return await canonicalUserTarget(withExtension);
}

async function createEvidenceFolder(
  parent: BrowserWindow | null,
  safeStem: string,
): Promise<string | null> {
  const options: OpenDialogOptions = {
    title: "Choose or create an evidence destination folder",
    properties: ["openDirectory", "createDirectory", "promptToCreate"],
  };
  const result = parent
    ? await dialog.showOpenDialog(parent, options)
    : await dialog.showOpenDialog(options);
  if (result.canceled || result.filePaths.length !== 1) return null;

  const selectedRoot = await realpath(result.filePaths[0]);
  if (!(await stat(selectedRoot)).isDirectory()) {
    throw new Error("The selected evidence destination is not a directory.");
  }

  const baseName = `${safeStem}-evidence-${timestampForFile()}`;
  for (let suffix = 0; suffix < 100; suffix += 1) {
    const folderName = suffix === 0 ? baseName : `${baseName}-${suffix}`;
    const candidate = path.join(selectedRoot, folderName);
    const relative = path.relative(selectedRoot, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Unsafe evidence folder path.");
    }
    try {
      await mkdir(candidate, { mode: 0o700 });
      return candidate;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
  }
  throw new Error("Could not create a unique evidence folder.");
}

export async function exportEvidenceBundle(
  parent: BrowserWindow | null,
  input: unknown,
): Promise<EvidenceExportResult> {
  if (!isJsonObject(input)) {
    throw new Error("Evidence must be a JSON object.");
  }
  const hasWrappedResult = isJsonObject(input.resultBundle);
  const bundle: EvidenceExportBundle = hasWrappedResult
    ? (input as unknown as EvidenceExportBundle)
    : {
        format: "folder",
        resultBundle: input,
        title:
          typeof input.question === "string"
            ? input.question
            : "CausalPilot AI Evidence Report",
        suggestedBaseName:
          typeof input.projectName === "string"
            ? input.projectName
            : "causalpilot-analysis",
      };

  if (!["folder", "json", "html"].includes(bundle.format)) {
    throw new Error("Unsupported evidence export format.");
  }
  if (bundle.title !== undefined && typeof bundle.title !== "string") {
    throw new Error("Evidence title must be text.");
  }
  if (
    bundle.suggestedBaseName !== undefined &&
    typeof bundle.suggestedBaseName !== "string"
  ) {
    throw new Error("Evidence file name must be text.");
  }
  if (bundle.analysisSpec !== undefined && !isJsonObject(bundle.analysisSpec)) {
    throw new Error("Evidence analysisSpec must be a JSON object.");
  }
  if (bundle.provenance !== undefined && !isJsonObject(bundle.provenance)) {
    throw new Error("Evidence provenance must be a JSON object.");
  }

  const payload = buildEvidencePayload(bundle);
  const safeStem = sanitizeFileStem(bundle.suggestedBaseName);
  const title = (bundle.title || "CausalPilot AI Evidence Report").slice(0, 160);
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  const html = renderEvidenceHtml(title, payload);

  if (bundle.format === "folder") {
    const folder = await createEvidenceFolder(parent, safeStem);
    if (!folder) return { cancelled: true, paths: [] };
    const jsonPath = path.join(folder, "result-bundle.json");
    const htmlPath = path.join(folder, "evidence-report.html");
    await atomicWriteFile(jsonPath, json);
    await atomicWriteFile(htmlPath, html);
    return { cancelled: false, paths: [folder, jsonPath, htmlPath] };
  }

  const target = await chooseSaveTarget(parent, bundle.format, safeStem);
  if (!target) return { cancelled: true, paths: [] };
  await atomicWriteFile(target, bundle.format === "json" ? json : html);
  return { cancelled: false, paths: [target] };
}
