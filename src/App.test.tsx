import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { sampleResult } from "./data/sampleResult";
import { ConfidenceIntervalPlot } from "./features/results/ConfidenceIntervalPlot";

describe("CausalPilot application workflow", () => {
  it("renders the evidence-led result screen with prominent authorship", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Experiment Summary" })).toBeInTheDocument();
    expect(screen.getByText("Did the incentive create incremental conversions?")).toBeInTheDocument();
    expect(screen.getAllByText(/LAI ZEYU/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("img", { name: /Estimated treatment effect with 95 percent confidence interval/i })).toBeInTheDocument();
  });

  it("moves from import mapping through the synthetic analysis result", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Import data/i }));
    expect(screen.getByRole("heading", { name: "Import experiment data" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Use sample dataset" }));
    expect(screen.getByText("checkout_incentive_synthetic_v1.csv")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Field mapping" })).toBeInTheDocument();
    expect(screen.getByLabelText("Role for unit_id")).toBeDisabled();
    expect(screen.getByText(/Frozen example · controls locked/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Open frozen result/i }));
    expect(screen.getByRole("heading", { name: "Experiment Summary" })).toBeInTheDocument();
  });

  it("requires the desktop deterministic engine for arbitrary CSV analysis", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Import data/i }));
    fireEvent.click(screen.getAllByRole("button", { name: "Choose CSV" })[0]);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /requires the CausalPilot desktop app and its deterministic local engine/i,
    );
  });

  it("exposes an About surface with authorship and AI boundaries", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Built by/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByText("LAI ZEYU（来泽宇）").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/deterministic code owns all statistical calculations/i)).toBeInTheDocument();
  });

  it("labels a non-default confidence level from the locked plan", () => {
    render(
      <ConfidenceIntervalPlot
        result={{ ...sampleResult, plan: { ...sampleResult.plan, alpha: 0.1 } }}
      />,
    );

    expect(
      screen.getByRole("img", {
        name: /Estimated treatment effect with 90 percent confidence interval/i,
      }),
    ).toBeInTheDocument();
  });
});
