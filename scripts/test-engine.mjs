import path from "node:path";
import { spawn } from "node:child_process";

import {
  projectRoot,
  resolvePythonExecutable,
  utf8PythonEnvironment,
} from "./python-runtime.mjs";

const python = await resolvePythonExecutable();
const engineRoot = path.join(projectRoot, "engine");
const pythonPath = [engineRoot, process.env.PYTHONPATH].filter(Boolean).join(path.delimiter);
const child = spawn(python, ["-m", "pytest", "engine/tests", "-q"], {
  cwd: projectRoot,
  env: utf8PythonEnvironment({ PYTHONPATH: pythonPath }),
  shell: false,
  stdio: "inherit",
  windowsHide: true,
});

child.once("error", (error) => {
  process.stderr.write(`Could not start engine tests with ${python}: ${error.message}\n`);
  process.exitCode = 1;
});

child.once("close", (code, signal) => {
  if (code !== 0) {
    process.stderr.write(`Engine tests failed (${signal || `exit ${String(code)}`}).\n`);
    process.exitCode = code || 1;
  }
});

