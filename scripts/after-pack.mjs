import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const runFile = promisify(execFile);

const UNUSED_PERMISSION_KEYS = [
  "NSAudioCaptureUsageDescription",
  "NSBluetoothAlwaysUsageDescription",
  "NSBluetoothPeripheralUsageDescription",
  "NSCameraUsageDescription",
  "NSMicrophoneUsageDescription",
];

async function removePlistKey(plistPath, key) {
  try {
    await runFile("/usr/bin/plutil", ["-remove", key, plistPath]);
  } catch (error) {
    if (!String(error?.stderr || error?.message).includes("Could not modify plist")) {
      throw error;
    }
  }
}

export default async function afterPack(context) {
  if (context.electronPlatformName === "win32") {
    // Electron's official Windows distribution carries both notices. Fail the
    // release build if a future packaging change drops either one.
    await Promise.all(
      ["LICENSE.electron.txt", "LICENSES.chromium.html"].map((fileName) =>
        access(path.join(context.appOutDir, fileName)),
      ),
    );
    return;
  }
  if (context.electronPlatformName !== "darwin") return;

  const productFilename = context.packager.appInfo.productFilename;
  const infoPlist = path.join(
    context.appOutDir,
    `${productFilename}.app`,
    "Contents",
    "Info.plist",
  );

  // v0.1 has no network, camera, microphone, audio-capture, or Bluetooth feature.
  // Remove Electron template declarations so the packaged metadata matches the
  // product's actual offline permission surface before the bundle is signed.
  for (const key of ["NSAppTransportSecurity", ...UNUSED_PERMISSION_KEYS]) {
    await removePlistKey(infoPlist, key);
  }
}
