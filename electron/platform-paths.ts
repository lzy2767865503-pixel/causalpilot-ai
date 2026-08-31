import path from "node:path";

export type DesktopPlatform = "darwin" | "linux" | "win32";

const CHILD_ENVIRONMENT_KEYS = new Set(
  [
    "PATH",
    "LANG",
    "LC_ALL",
    "LC_CTYPE",
    "TMPDIR",
    "TEMP",
    "TMP",
    "SYSTEMROOT",
    "WINDIR",
    "USERPROFILE",
    "VIRTUAL_ENV",
  ].map((key) => key.toLowerCase()),
);

export function engineExecutableName(platform: NodeJS.Platform): string {
  return platform === "win32" ? "causalpilot-engine.exe" : "causalpilot-engine";
}

export function productionEngineCandidates(
  resourcesRoot: string,
  platform: NodeJS.Platform,
  architecture: string,
): string[] {
  const platformPath = platform === "win32" ? path.win32 : path.posix;
  const executableName = engineExecutableName(platform);
  return [
    platformPath.join(
      resourcesRoot,
      "sidecar",
      `${platform}-${architecture}`,
      executableName,
    ),
    platformPath.join(resourcesRoot, "sidecar", executableName),
    platformPath.join(resourcesRoot, "engine", executableName),
  ];
}

export function developmentPythonCandidates(
  projectRoot: string,
  platform: NodeJS.Platform,
): string[] {
  if (platform === "win32") {
    return [
      path.win32.join(projectRoot, "engine", ".venv", "Scripts", "python.exe"),
      "python",
    ];
  }
  return [
    path.posix.join(projectRoot, "engine", ".venv", "bin", "python"),
    "python3",
  ];
}

export function safeChildEnvironment(
  source: NodeJS.ProcessEnv,
  extra: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  // Environment variable keys are case-insensitive on Windows. Preserve the
  // spelling supplied by the OS so values such as `Path` and `SystemRoot` are
  // not accidentally dropped, while forwarding only the narrow allow-list.
  const inherited: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(source)) {
    if (value && CHILD_ENVIRONMENT_KEYS.has(key.toLowerCase())) {
      inherited[key] = value;
    }
  }
  return { ...inherited, ...extra };
}
