import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  developmentPythonCandidates,
  engineExecutableName,
  productionEngineCandidates,
  safeChildEnvironment,
} from "./platform-paths.js";

describe("desktop platform paths", () => {
  it("uses the Windows executable suffix and fixed resource locations", () => {
    expect(engineExecutableName("win32")).toBe("causalpilot-engine.exe");
    expect(productionEngineCandidates("C:\\Program Files\\CausalPilot\\resources", "win32", "x64")).toEqual([
      path.win32.join(
        "C:\\Program Files\\CausalPilot\\resources",
        "sidecar",
        "win32-x64",
        "causalpilot-engine.exe",
      ),
      path.win32.join(
        "C:\\Program Files\\CausalPilot\\resources",
        "sidecar",
        "causalpilot-engine.exe",
      ),
      path.win32.join(
        "C:\\Program Files\\CausalPilot\\resources",
        "engine",
        "causalpilot-engine.exe",
      ),
    ]);
  });

  it("prefers the platform-specific project virtual environment", () => {
    expect(developmentPythonCandidates("C:\\repo", "win32")).toEqual([
      path.win32.join("C:\\repo", "engine", ".venv", "Scripts", "python.exe"),
      "python",
    ]);
    expect(developmentPythonCandidates("/repo", "darwin")).toEqual([
      path.posix.join("/repo", "engine", ".venv", "bin", "python"),
      "python3",
    ]);
  });

  it("preserves case-insensitive Windows essentials without forwarding secrets", () => {
    const result = safeChildEnvironment(
      {
        Path: "C:\\Windows\\System32",
        SystemRoot: "C:\\Windows",
        TEMP: "C:\\Temp",
        OPENAI_API_KEY: "must-not-leak",
      },
      {
        PYTHONUTF8: "1",
        PYTHONIOENCODING: "utf-8",
      },
    );

    expect(result).toEqual({
      Path: "C:\\Windows\\System32",
      SystemRoot: "C:\\Windows",
      TEMP: "C:\\Temp",
      PYTHONUTF8: "1",
      PYTHONIOENCODING: "utf-8",
    });
    expect(result).not.toHaveProperty("OPENAI_API_KEY");
  });
});
