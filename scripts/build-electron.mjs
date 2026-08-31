import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
await rm(path.join(projectRoot, "dist-electron"), { recursive: true, force: true });

const executable = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(executable, ["tsc", "-p", "tsconfig.electron.json"], {
  cwd: projectRoot,
  env: process.env,
  shell: false,
  stdio: "inherit",
  windowsHide: true,
});

child.once("error", (error) => {
  process.stderr.write(`Could not start the Electron TypeScript build: ${error.message}\n`);
  process.exitCode = 1;
});
child.once("close", (code, signal) => {
  if (code !== 0) {
    process.stderr.write(
      `Electron TypeScript build failed (${signal || `exit ${String(code)}`}).\n`,
    );
    process.exitCode = code || 1;
  }
});

