import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const runtimeRoot = path.resolve(
  process.argv[2] ||
    process.env.CAUSALPILOT_WINDOWS_RUNTIME_ROOT ||
    path.join(projectRoot, "release", "win-unpacked"),
);
const reportPath = path.resolve(
  process.argv[3] ||
    process.env.CAUSALPILOT_WINDOWS_RUNTIME_REPORT ||
    path.join(
      projectRoot,
      "release",
      "windows-runtime-evidence",
      "windows-runtime-architecture-report.json",
    ),
);

const MACHINE = {
  0x014c: "I386",
  0x8664: "AMD64",
  0xaa64: "ARM64",
};
const OPTIONAL_MAGIC = {
  0x010b: "PE32",
  0x020b: "PE32+",
};
const SUBSYSTEM = {
  2: "WINDOWS_GUI",
  3: "WINDOWS_CUI",
};
const DLL_CHARACTERISTICS = {
  highEntropyVa: 0x0020,
  dynamicBase: 0x0040,
  nxCompat: 0x0100,
  guardCf: 0x4000,
  terminalServerAware: 0x8000,
};

function portablePath(value) {
  return value.split(path.sep).join("/");
}

async function sha256(filePath) {
  const digest = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => digest.update(chunk));
    stream.once("error", reject);
    stream.once("end", resolve);
  });
  return digest.digest("hex");
}

async function collectPortableExecutables(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await collectPortableExecutables(absolute)));
    } else if (entry.isFile() && /\.(?:dll|exe)$/iu.test(entry.name)) {
      found.push(absolute);
    }
  }
  return found;
}

async function inspectPortableExecutable(filePath) {
  const handle = await open(filePath, "r");
  try {
    const dosHeader = Buffer.alloc(64);
    const dosRead = await handle.read(dosHeader, 0, dosHeader.length, 0);
    if (
      dosRead.bytesRead !== dosHeader.length ||
      dosHeader.toString("ascii", 0, 2) !== "MZ"
    ) {
      throw new Error(`${filePath} does not contain a complete DOS/PE header.`);
    }

    const peOffset = dosHeader.readUInt32LE(0x3c);
    const peHeader = Buffer.alloc(96);
    const peRead = await handle.read(peHeader, 0, peHeader.length, peOffset);
    if (
      peRead.bytesRead !== peHeader.length ||
      peHeader.toString("ascii", 0, 4) !== "PE\u0000\u0000"
    ) {
      throw new Error(`${filePath} does not contain a valid PE signature.`);
    }

    const optionalHeaderOffset = 24;
    const machineValue = peHeader.readUInt16LE(4);
    const magicValue = peHeader.readUInt16LE(optionalHeaderOffset);
    const subsystemValue = peHeader.readUInt16LE(optionalHeaderOffset + 68);
    const dllCharacteristicsValue = peHeader.readUInt16LE(optionalHeaderOffset + 70);
    const fileStats = await stat(filePath);

    return {
      path: portablePath(path.relative(runtimeRoot, filePath)),
      bytes: fileStats.size,
      sha256: await sha256(filePath),
      machine: MACHINE[machineValue] || `UNKNOWN_0x${machineValue.toString(16)}`,
      machineValue: `0x${machineValue.toString(16).padStart(4, "0")}`,
      format: OPTIONAL_MAGIC[magicValue] || `UNKNOWN_0x${magicValue.toString(16)}`,
      operatingSystemVersion: `${peHeader.readUInt16LE(optionalHeaderOffset + 40)}.${peHeader.readUInt16LE(optionalHeaderOffset + 42)}`,
      subsystemVersion: `${peHeader.readUInt16LE(optionalHeaderOffset + 48)}.${peHeader.readUInt16LE(optionalHeaderOffset + 50)}`,
      subsystem: SUBSYSTEM[subsystemValue] || `UNKNOWN_${subsystemValue}`,
      dllCharacteristics: Object.fromEntries(
        Object.entries(DLL_CHARACTERISTICS).map(([name, bit]) => [
          name,
          (dllCharacteristicsValue & bit) === bit,
        ]),
      ),
    };
  } finally {
    await handle.close();
  }
}

const runtimeStats = await stat(runtimeRoot).catch(() => null);
if (!runtimeStats?.isDirectory()) {
  throw new Error(`Windows runtime directory was not found: ${runtimeRoot}`);
}

const binaries = [];
for (const filePath of (await collectPortableExecutables(runtimeRoot)).sort()) {
  binaries.push(await inspectPortableExecutable(filePath));
}

const byPath = new Map(binaries.map((binary) => [binary.path, binary]));
const mainExecutable = byPath.get("CausalPilot AI.exe");
const sidecarExecutable = byPath.get("resources/engine/causalpilot-engine.exe");
if (!mainExecutable) throw new Error("Missing packaged CausalPilot AI.exe.");
if (!sidecarExecutable) throw new Error("Missing packaged causalpilot-engine.exe.");

for (const [label, binary, expectedSubsystem] of [
  ["main application", mainExecutable, "WINDOWS_GUI"],
  ["local engine", sidecarExecutable, "WINDOWS_CUI"],
]) {
  if (binary.machine !== "AMD64" || binary.format !== "PE32+") {
    throw new Error(
      `The ${label} must be an AMD64 PE32+ executable; received ${binary.machine} ${binary.format}.`,
    );
  }
  if (binary.subsystem !== expectedSubsystem) {
    throw new Error(
      `The ${label} has subsystem ${binary.subsystem}; expected ${expectedSubsystem}.`,
    );
  }
  if (!binary.dllCharacteristics.dynamicBase || !binary.dllCharacteristics.nxCompat) {
    throw new Error(`The ${label} must opt into ASLR and DEP/NX compatibility.`);
  }
}

const unexpectedArchitectures = binaries.filter((binary) => {
  if (binary.machine === "AMD64" && binary.format === "PE32+") return false;
  return !(
    binary.path === "resources/elevate.exe" &&
    binary.machine === "I386" &&
    binary.format === "PE32"
  );
});
if (unexpectedArchitectures.length) {
  throw new Error(
    `Unexpected PE architecture(s): ${unexpectedArchitectures
      .map((binary) => `${binary.path}=${binary.machine}/${binary.format}`)
      .join(", ")}`,
  );
}

const report = {
  status: "validated_windows_runtime_pe_structure",
  author: "LAI ZEYU (来泽宇)",
  runtimeDirectory: path.basename(runtimeRoot),
  coreRuntime: {
    application: {
      path: mainExecutable.path,
      architecture: mainExecutable.machine,
      format: mainExecutable.format,
      subsystem: mainExecutable.subsystem,
      operatingSystemVersion: mainExecutable.operatingSystemVersion,
      subsystemVersion: mainExecutable.subsystemVersion,
    },
    localEngine: {
      path: sidecarExecutable.path,
      architecture: sidecarExecutable.machine,
      format: sidecarExecutable.format,
      subsystem: sidecarExecutable.subsystem,
      operatingSystemVersion: sidecarExecutable.operatingSystemVersion,
      subsystemVersion: sidecarExecutable.subsystemVersion,
    },
  },
  knownArchitectureExceptions: binaries
    .filter((binary) => binary.machine !== "AMD64")
    .map((binary) => ({
      path: binary.path,
      architecture: binary.machine,
      format: binary.format,
      reason:
        "Electron-builder elevation helper; not the CausalPilot application or analysis engine.",
    })),
  binaries,
  assertions: {
    mainApplicationIsAmd64Pe32Plus: true,
    localEngineIsAmd64Pe32Plus: true,
    coreExecutablesUseExpectedSubsystems: true,
    coreExecutablesEnableAslrAndNx: true,
    noUnexpectedPayloadArchitecture: true,
  },
  validationBoundary:
    "Static inspection of packaged PE headers and hashes only. This does not execute the package, prove API availability on a particular Windows build, replace clean-device Windows 10/11 tests, or establish signing, SmartScreen, Defender, WACK, Store certification, or Store availability.",
};

await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
