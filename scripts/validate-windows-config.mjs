import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(import.meta.dirname, "..");
const packageMetadata = require(path.join(projectRoot, "package.json"));
const { createStoreConfig, validateStoreVersion } = require(
  "./store-package-config.cjs",
);

function expectFailure(action, expectedFragment) {
  try {
    action();
  } catch (error) {
    if (String(error.message).includes(expectedFragment)) return;
    throw error;
  }
  throw new Error(`Expected validation failure containing: ${expectedFragment}`);
}

expectFailure(
  () => createStoreConfig({}, "win32"),
  "CAUSALPILOT_STORE_IDENTITY_NAME is required",
);
expectFailure(
  () =>
    createStoreConfig(
      {
        CAUSALPILOT_STORE_IDENTITY_NAME: "Partner.CausalPilot",
        CAUSALPILOT_STORE_PUBLISHER: "CN=TEST-ONLY",
      },
      "darwin",
    ),
  "must be built on Windows",
);
expectFailure(() => validateStoreVersion("0.1.0.0"), "first part from 1-65535");
expectFailure(() => validateStoreVersion("1.0.0.1"), "Store-reserved fourth part of 0");

const config = createStoreConfig(
  {
    CAUSALPILOT_STORE_IDENTITY_NAME: "Partner.CausalPilot",
    CAUSALPILOT_STORE_PUBLISHER: "CN=TEST-ONLY",
  },
  "win32",
);
if (config.appx.identityName !== "Partner.CausalPilot") {
  throw new Error("Validated Store identity did not reach the AppX configuration.");
}
if (config.appx.displayName !== "CausalPilot AI by LAI ZEYU") {
  throw new Error("Unexpected default Store display name.");
}
if (config.appx.publisherDisplayName !== "LAI ZEYU") {
  throw new Error("Unexpected default Store publisher display name.");
}
if (
  config.appx.minVersion !== "10.0.17763.0" ||
  config.appx.maxVersionTested !== "10.0.26100.0"
) {
  throw new Error("Unexpected Windows.Desktop version declaration.");
}
if (config.appx.capabilities.join(",") !== "runFullTrust") {
  throw new Error("The Store package must declare only the required runFullTrust capability.");
}

const generatedManifest = await readFile(config.appx.customManifestPath, "utf8");
if (!generatedManifest.includes('Version="1.0.0.0"')) {
  throw new Error("Generated Store manifest is missing the valid four-part package version.");
}
if (generatedManifest.includes("__STORE_PACKAGE_VERSION__")) {
  throw new Error("Generated Store manifest still contains an unresolved version token.");
}

const dimensions = {};
for (const [fileName, expected] of Object.entries({
  "StoreLogo.png": [50, 50],
  "Square44x44Logo.png": [44, 44],
  "Square150x150Logo.png": [150, 150],
})) {
  const image = await readFile(path.join(projectRoot, "build", "appx", fileName));
  if (image.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`${fileName} is not a PNG asset.`);
  }
  const actual = [image.readUInt32BE(16), image.readUInt32BE(20)];
  if (actual[0] !== expected[0] || actual[1] !== expected[1]) {
    throw new Error(`${fileName} is ${actual.join("x")}; expected ${expected.join("x")}.`);
  }
  dimensions[fileName] = actual.join("x");
}

const windowsTargets = packageMetadata.build.win.target.map((entry) => entry.target);
if (windowsTargets.join(",") !== "nsis,zip") {
  throw new Error("Windows public build must produce both NSIS and ZIP targets.");
}

const report = {
  status: "configuration_validated",
  author: "LAI ZEYU (来泽宇)",
  publicWindowsTargets: windowsTargets,
  publicArtifactNames: [
    "CausalPilot-AI-0.1.0-windows-x64-setup.exe",
    "CausalPilot-AI-0.1.0-windows-x64.zip",
  ],
  storeArtifactName: "CausalPilot-AI-0.1.0-windows-x64.appx",
  storeIdentityBoundary: "exact Partner Center Identity Name and Publisher required",
  storeDisplayNameCandidate: config.appx.displayName,
  storePublisherDisplayName: config.appx.publisherDisplayName,
  storePackageVersion: "1.0.0.0",
  targetDeviceFamily: {
    name: "Windows.Desktop",
    minVersion: config.appx.minVersion,
    maxVersionTested: config.appx.maxVersionTested,
  },
  capabilities: config.appx.capabilities,
  appxAssetDimensions: dimensions,
  validationBoundary:
    "Configuration-only validation on this host; no Windows executable, AppX, WACK result, install result, or Store submission was produced.",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

