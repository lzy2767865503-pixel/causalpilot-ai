import { describe, expect, it } from "vitest";
import { buildMappings, buildSpecFromMappings, sha256Text } from "./browserAnalysis";

describe("browser import metadata helpers", () => {
  it("produces a deterministic SHA-256 digest", async () => {
    await expect(sha256Text("unit_id,treatment,outcome\n1,0,1\n")).resolves.toBe(
      "a85649ba8cbe8559a4d6b6eb1bd2de73cb8e28336bd1df89a02fd0b79ab695ef",
    );
  });

  it("infers mapping candidates without calculating an experiment result", () => {
    const rows = [
      { visitor_id: "c-1", assignment: "control", converted: "0", pre_score: "0.2" },
      { visitor_id: "t-1", assignment: "incentive", converted: "1", pre_score: "0.7" },
    ];
    const mappings = buildMappings(
      ["visitor_id", "assignment", "converted", "pre_score"],
      rows,
    );
    const spec = buildSpecFromMappings(mappings, rows);

    expect(spec.unitColumn).toBe("visitor_id");
    expect(spec.treatmentColumn).toBe("assignment");
    expect(spec.outcomeColumn).toBe("converted");
    expect(spec.controlValue).toBe("control");
    expect(spec.treatmentValue).toBe("incentive");
    expect(spec.covariateColumn).toBe("pre_score");
  });
});
