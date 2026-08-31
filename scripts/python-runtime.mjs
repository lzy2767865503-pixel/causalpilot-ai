import { access } from "node:fs/promises";
import path from "node:path";

export const projectRoot = path.resolve(import.meta.dirname, "..");

export async function resolvePythonExecutable() {
  const configured = process.env.CAUSALPILOT_PYTHON_EXECUTABLE?.trim();
  if (configured?.includes("\0")) {
    throw new Error("CAUSALPILOT_PYTHON_EXECUTABLE contains a null byte.");
  }
  if (configured) return configured;

  const virtualEnvironmentPython =
    process.platform === "win32"
      ? path.join(projectRoot, "engine", ".venv", "Scripts", "python.exe")
      : path.join(projectRoot, "engine", ".venv", "bin", "python");
  try {
    await access(virtualEnvironmentPython);
    return virtualEnvironmentPython;
  } catch {
    return process.platform === "win32" ? "python" : "python3";
  }
}

export function utf8PythonEnvironment(extra = {}) {
  return {
    ...process.env,
    PYTHONUTF8: "1",
    PYTHONIOENCODING: "utf-8",
    ...extra,
  };
}

