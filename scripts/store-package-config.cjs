const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const packageMetadata = require(path.join(projectRoot, "package.json"));

function requiredEnvironment(environment, name) {
  const value = environment[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is required for a Microsoft Store package. Copy the exact, case-sensitive value from Partner Center; placeholders are deliberately rejected.`,
    );
  }
  return value;
}

function rejectXmlUnsafe(name, value) {
  if (/[<>&'"\u0000-\u001f]/u.test(value)) {
    throw new Error(`${name} contains a character that cannot be inserted safely in AppxManifest.xml.`);
  }
  return value;
}

function validateIdentityName(value) {
  if (!/^[A-Za-z0-9.-]{3,50}$/.test(value)) {
    throw new Error(
      "CAUSALPILOT_STORE_IDENTITY_NAME must be the 3-50 character Package/Identity/Name shown in Partner Center.",
    );
  }
  return value;
}

function validateStoreVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (!match) {
    throw new Error("CAUSALPILOT_STORE_PACKAGE_VERSION must contain four numeric parts.");
  }
  const parts = match.slice(1).map(Number);
  if (
    parts[0] < 1 ||
    parts.slice(0, 3).some((part) => part < 0 || part > 65535) ||
    parts[3] !== 0
  ) {
    throw new Error(
      "Store package versions require a first part from 1-65535, remaining first three parts up to 65535, and a Store-reserved fourth part of 0.",
    );
  }
  return value;
}

function createStoreConfig(environment = process.env, platform = process.platform) {
  if (platform !== "win32") {
    throw new Error(
      "Microsoft Store AppX packages must be built on Windows so the bundled PyInstaller sidecar is a genuine Windows executable.",
    );
  }

  const identityName = validateIdentityName(
    requiredEnvironment(environment, "CAUSALPILOT_STORE_IDENTITY_NAME"),
  );
  const publisher = rejectXmlUnsafe(
    "CAUSALPILOT_STORE_PUBLISHER",
    requiredEnvironment(environment, "CAUSALPILOT_STORE_PUBLISHER"),
  );
  const publisherDisplayName = rejectXmlUnsafe(
    "CAUSALPILOT_STORE_PUBLISHER_DISPLAY_NAME",
    environment.CAUSALPILOT_STORE_PUBLISHER_DISPLAY_NAME?.trim() || "LAI ZEYU",
  );
  const displayName = rejectXmlUnsafe(
    "CAUSALPILOT_STORE_DISPLAY_NAME",
    environment.CAUSALPILOT_STORE_DISPLAY_NAME?.trim() ||
      "CausalPilot AI by LAI ZEYU",
  );
  const storePackageVersion = validateStoreVersion(
    environment.CAUSALPILOT_STORE_PACKAGE_VERSION?.trim() || "1.0.0.0",
  );

  const workDirectory = path.join(projectRoot, "work", "appx-store");
  const generatedManifest = path.join(workDirectory, "AppxManifest.xml");
  const manifestTemplate = fs.readFileSync(
    path.join(projectRoot, "build", "appx-store-manifest.template.xml"),
    "utf8",
  );
  fs.mkdirSync(workDirectory, { recursive: true });
  fs.writeFileSync(
    generatedManifest,
    manifestTemplate.replace("__STORE_PACKAGE_VERSION__", storePackageVersion),
    "utf8",
  );

  return {
    ...packageMetadata.build,
    files: [...packageMetadata.build.files, "!**/*.map"],
    win: {
      ...packageMetadata.build.win,
      target: ["appx"],
      // Microsoft re-signs an accepted AppX package. Keeping this unsigned also
      // avoids pretending that a local test certificate is a Store identity.
      signExecutable: false,
      artifactName: "CausalPilot-AI-${version}-windows-${arch}.${ext}",
    },
    appx: {
      applicationId: "CausalPilotAI",
      identityName,
      publisher,
      publisherDisplayName,
      displayName,
      languages: ["en-US"],
      capabilities: ["runFullTrust"],
      backgroundColor: "#0B55D9",
      minVersion: "10.0.17763.0",
      maxVersionTested: "10.0.26100.0",
      customManifestPath: generatedManifest,
      artifactName: "CausalPilot-AI-${version}-windows-${arch}.${ext}",
    },
  };
}

module.exports = {
  createStoreConfig,
  validateIdentityName,
  validateStoreVersion,
};
