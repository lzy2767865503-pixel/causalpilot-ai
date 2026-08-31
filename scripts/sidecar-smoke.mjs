import { spawn } from "node:child_process";
import { copyFile, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const executable = path.join(
  projectRoot,
  "engine",
  "dist",
  process.platform === "win32" ? "causalpilot-engine.exe" : "causalpilot-engine",
);
const sourceSample = path.join(
  projectRoot,
  "public",
  "samples",
  "checkout_incentive_synthetic_v1.csv",
);
const temporaryRoot = await mkdtemp(path.join(tmpdir(), "causalpilot-来泽宇-"));
const unicodeSample = path.join(temporaryRoot, "实验 数据.csv");

try {
  await copyFile(sourceSample, unicodeSample);
  const request = {
    schema_version: "1.0",
    request_id: "packaged-sidecar-unicode-path-smoke",
    csv_path: unicodeSample,
    analysis_spec: {
      analysis_name: "Checkout incentive experiment",
      unit_id_column: "unit_id",
      treatment_column: "treatment",
      outcome_column: "checkout_completed",
      outcome_type: "binary",
      decision_target: "aggregate_business_outcome",
      treatment_value: "1",
      control_value: "0",
      positive_outcome_value: "1",
      negative_outcome_value: "0",
      expected_treatment_fraction: 0.5,
      srm_alpha: 0.001,
      confidence_level: 0.95,
      randomized_assignment_confirmed: true,
      cuped: null,
      business: {
        minimum_practical_effect: 0.01,
        preferred_direction: "increase",
        currency: "USD",
      },
    },
  };

  const result = await new Promise((resolve, reject) => {
    const child = spawn(executable, ["analyze"], {
      cwd: path.dirname(executable),
      env: {
        ...process.env,
        PYTHONUTF8: "1",
        PYTHONIOENCODING: "utf-8",
      },
      shell: false,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.once("error", reject);
    child.once("close", (code) => {
      const stdoutText = Buffer.concat(stdout).toString("utf8");
      const stderrText = Buffer.concat(stderr).toString("utf8");
      let parsed;
      try {
        parsed = JSON.parse(stdoutText);
      } catch (error) {
        if (code !== 0) {
          reject(
            new Error(
              `Sidecar exited ${String(code)} with invalid JSON stdout ${JSON.stringify(stdoutText)} and stderr ${JSON.stringify(stderrText)}.`,
            ),
          );
          return;
        }
        reject(error);
        return;
      }
      if (code !== 0) {
        reject(
          new Error(
            `Sidecar exited ${String(code)} with result ${JSON.stringify({
              status: parsed.status,
              errors: parsed.errors,
              warnings: parsed.warnings,
            })} and stderr ${JSON.stringify(stderrText)}.`,
          ),
        );
        return;
      }
      resolve(parsed);
    });
    child.stdin.end(JSON.stringify(request), "utf8");
  });

  const expectedMetadata = JSON.parse(
    await readFile(
      path.join(
        projectRoot,
        "public",
        "samples",
        "checkout_incentive_synthetic_v1.metadata.json",
      ),
      "utf8",
    ),
  );
  if (result.status !== "ok") {
    throw new Error(`Expected ok sidecar result, received ${String(result.status)}.`);
  }
  if (result.dataset?.sha256 !== expectedMetadata.sha256) {
    throw new Error("Sidecar dataset hash did not match the frozen synthetic sample.");
  }
  if (result.engine?.project_owner !== "LAI ZEYU (来泽宇)") {
    throw new Error("Sidecar attribution is missing or incorrect.");
  }
  process.stdout.write(
    `${JSON.stringify({
      status: result.status,
      engine: result.engine,
      datasetHash: result.dataset.sha256,
      unicodePathRoundTrip: true,
      platform: process.platform,
      architecture: process.arch,
    }, null, 2)}\n`,
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
