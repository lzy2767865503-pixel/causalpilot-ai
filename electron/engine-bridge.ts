import { spawn } from "node:child_process";
import { constants as fileConstants } from "node:fs";
import { access, lstat, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { app } from "electron";

import {
  developmentPythonCandidates,
  productionEngineCandidates,
  safeChildEnvironment,
} from "./platform-paths.js";
import type { AnalysisResultBundle, JsonObject } from "./types.js";

const ENGINE_TIMEOUT_MS = 120_000;
const MAX_STDOUT_BYTES = 20 * 1024 * 1024;
const MAX_STDERR_BYTES = 1024 * 1024;
const MODULE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

interface EngineCommand {
  executable: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ensureInside(parentPath: string, candidatePath: string): void {
  const relative = path.relative(parentPath, candidatePath);
  if (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  ) {
    return;
  }
  throw new Error("Bundled engine path escaped the application resources directory.");
}

async function findDevelopmentProjectRoot(): Promise<string> {
  const candidates = [
    app.getAppPath(),
    path.resolve(MODULE_DIRECTORY, ".."),
    path.resolve(MODULE_DIRECTORY, "..", ".."),
  ];

  for (const candidate of candidates) {
    const enginePackage = path.join(candidate, "engine", "causalpilot_engine");
    try {
      if ((await lstat(enginePackage)).isDirectory()) {
        return await realpath(candidate);
      }
    } catch {
      // Try the next fixed candidate.
    }
  }

  throw new Error(
    "Could not locate engine/causalpilot_engine for the offline development engine.",
  );
}

async function resolveProductionSidecar(): Promise<string> {
  const resourcesRoot = await realpath(process.resourcesPath);
  const candidates = productionEngineCandidates(
    resourcesRoot,
    process.platform,
    process.arch,
  );

  for (const candidate of candidates) {
    try {
      const resolved = await realpath(candidate);
      ensureInside(resourcesRoot, resolved);
      const stats = await lstat(resolved);
      if (stats.isFile()) {
        if (process.platform !== "win32") {
          await access(resolved, fileConstants.X_OK);
        }
        return resolved;
      }
    } catch {
      // Packagers may choose any one of the documented fixed locations.
    }
  }

  throw new Error(
    "The bundled CausalPilot engine sidecar is missing or is not executable.",
  );
}

async function resolveEngineCommand(): Promise<EngineCommand> {
  if (app.isPackaged) {
    const executable = await resolveProductionSidecar();
    return {
      executable,
      args: ["analyze"],
      cwd: path.dirname(executable),
      env: safeChildEnvironment(process.env, {
        PYTHONUTF8: "1",
        PYTHONIOENCODING: "utf-8",
      }),
    };
  }

  const projectRoot = await findDevelopmentProjectRoot();
  const engineRoot = path.join(projectRoot, "engine");
  const configuredPython = process.env.CAUSALPILOT_PYTHON_EXECUTABLE?.trim();
  if (configuredPython?.includes("\0")) {
    throw new Error("Invalid Python executable configuration.");
  }

  let executable = configuredPython;
  if (!executable) {
    const candidates = developmentPythonCandidates(projectRoot, process.platform);
    executable = candidates[candidates.length - 1];
    for (const candidate of candidates.slice(0, -1)) {
      try {
        const candidateStats = await lstat(candidate);
        if (candidateStats.isFile()) {
          executable = candidate;
          break;
        }
      } catch {
        // Fall through to the platform's PATH-resolved Python executable.
      }
    }
  }

  return {
    executable,
    // All arguments are fixed by the main process; the renderer cannot inject argv.
    args: ["-m", "causalpilot_engine.cli", "analyze"],
    cwd: projectRoot,
    env: safeChildEnvironment(process.env, {
      PYTHONPATH: [engineRoot, process.env.PYTHONPATH]
        .filter((value): value is string => Boolean(value))
        .join(path.delimiter),
      PYTHONUNBUFFERED: "1",
      PYTHONUTF8: "1",
      PYTHONIOENCODING: "utf-8",
    }),
  };
}

function sanitizeEngineError(stderr: string, experimentFilePath: string): string {
  const withoutLocalPath = stderr.split(experimentFilePath).join("[experiment-file]");
  return withoutLocalPath.trim().slice(-4_000);
}

function sanitizeEngineResult(
  value: unknown,
  experimentFilePath: string,
  keyName = "",
): unknown {
  if (typeof value === "string") {
    if (
      keyName.toLowerCase() === "path" ||
      keyName.toLowerCase().endsWith("_path")
    ) {
      return "[redacted-local-path]";
    }
    return value.split(experimentFilePath).join("[experiment-file]");
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      sanitizeEngineResult(item, experimentFilePath),
    );
  }
  if (isObject(value)) {
    const sanitized: Record<string, unknown> = Object.create(null);
    for (const [key, child] of Object.entries(value)) {
      sanitized[key] = sanitizeEngineResult(child, experimentFilePath, key);
    }
    return sanitized;
  }
  return value;
}

export async function analyzeWithLocalEngine(
  experimentFilePath: string,
  requestId: string,
  analysisSpec: JsonObject,
): Promise<AnalysisResultBundle> {
  const command = await resolveEngineCommand();
  const payload = JSON.stringify({
    request_id: requestId,
    csv_path: experimentFilePath,
    analysis_spec: analysisSpec,
  });

  return await new Promise<AnalysisResultBundle>((resolve, reject) => {
    // Raw experiment rows remain local. Electron passes only the selected file
    // path to the local Python child process over stdin; no HTTP server is opened.
    const child = spawn(command.executable, command.args, {
      cwd: command.cwd,
      env: command.env,
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let settled = false;

    const fail = (error: Error): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error);
    };

    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      fail(new Error("The local analysis exceeded the two-minute safety limit."));
    }, ENGINE_TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > MAX_STDOUT_BYTES) {
        child.kill("SIGKILL");
        fail(new Error("The local engine returned an unexpectedly large result."));
        return;
      }
      stdoutChunks.push(chunk);
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderrBytes += chunk.length;
      if (stderrBytes <= MAX_STDERR_BYTES) {
        stderrChunks.push(chunk);
      }
    });

    child.once("error", (error) => {
      fail(new Error(`Could not start the local analysis engine: ${error.message}`));
    });

    child.once("close", (code, signal) => {
      if (settled) return;
      clearTimeout(timeout);

      const stdout = Buffer.concat(stdoutChunks).toString("utf8").trim();
      const stderr = sanitizeEngineError(
        Buffer.concat(stderrChunks).toString("utf8"),
        experimentFilePath,
      );

      try {
        const parsed: unknown = JSON.parse(stdout);
        if (!isObject(parsed)) {
          throw new Error("Engine output was not a JSON object.");
        }
        const sanitized = sanitizeEngineResult(parsed, experimentFilePath);
        if (!isObject(sanitized)) {
          throw new Error("Sanitized engine output was not a JSON object.");
        }
        settled = true;
        // The CLI intentionally returns structured status=error bundles with a
        // non-zero exit code. Preserve those results for the UI to explain.
        resolve(sanitized as AnalysisResultBundle);
      } catch (error) {
        if (code !== 0) {
          fail(
            new Error(
              `Local analysis failed (${signal || `exit ${String(code)}`})${
                stderr ? `: ${stderr}` : "."
              }`,
            ),
          );
          return;
        }
        fail(
          new Error(
            `The local engine returned invalid JSON: ${
              error instanceof Error ? error.message : "unknown parse error"
            }`,
          ),
        );
      }
    });

    child.stdin.once("error", (error) => {
      fail(new Error(`Could not send the analysis request: ${error.message}`));
    });
    child.stdin.end(payload, "utf8");
  });
}
