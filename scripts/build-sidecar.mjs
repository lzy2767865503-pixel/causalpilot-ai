import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

import {
  projectRoot,
  resolvePythonExecutable,
  utf8PythonEnvironment,
} from "./python-runtime.mjs";

const engineRoot = path.join(projectRoot, "engine");
const distPath = path.join(engineRoot, "dist");
const workPath = path.join(engineRoot, "build", "pyinstaller");
const specPath = path.join(engineRoot, "build");
const python = await resolvePythonExecutable();

// These directories contain generated PyInstaller output only. Clearing them
// prevents a stale macOS binary from entering a Windows package (or vice versa).
await rm(distPath, { recursive: true, force: true });
await rm(workPath, { recursive: true, force: true });
await mkdir(distPath, { recursive: true });
await mkdir(specPath, { recursive: true });

const args = [
  "-m",
  "PyInstaller",
  "--noconfirm",
  "--clean",
  "--onefile",
  "--name",
  "causalpilot-engine",
  "--paths",
  "engine",
  "--distpath",
  path.relative(projectRoot, distPath),
  "--workpath",
  path.relative(projectRoot, workPath),
  "--specpath",
  path.relative(projectRoot, specPath),
];

if (process.platform === "win32") {
  if (process.arch !== "x64") {
    throw new Error(
      `The current Windows release target is x64; received host architecture ${process.arch}.`,
    );
  }
  // PyInstaller resolves this value from the generated spec-file directory,
  // not consistently from `cwd`, so pass an absolute project path.
  args.push(
    "--version-file",
    path.join(projectRoot, "build", "windows-sidecar-version.txt"),
  );
}

args.push(path.join("engine", "sidecar_entry.py"));

const child = spawn(python, args, {
  cwd: projectRoot,
  env: utf8PythonEnvironment(),
  shell: false,
  stdio: "inherit",
  windowsHide: true,
});

child.once("error", (error) => {
  process.stderr.write(`Could not start PyInstaller with ${python}: ${error.message}\n`);
  process.exitCode = 1;
});

child.once("close", (code, signal) => {
  if (code !== 0) {
    process.stderr.write(
      `PyInstaller failed (${signal || `exit ${String(code)}`}). Install engine/requirements-build.txt in the selected Python environment.\n`,
    );
    process.exitCode = code || 1;
  }
});
