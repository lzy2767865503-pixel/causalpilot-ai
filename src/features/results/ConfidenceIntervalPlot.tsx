import { useId } from "react";
import type { ResultBundle } from "../../types";
import { formatSigned } from "../../lib/format";

interface ConfidenceIntervalPlotProps {
  result: ResultBundle;
}

export function ConfidenceIntervalPlot({ result }: ConfidenceIntervalPlotProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { estimate } = result;
  const threshold = result.plan.businessThreshold;
  const observed = [estimate.ciLow, estimate.ciHigh, estimate.value, 0, threshold];
  const min = Math.floor(Math.min(...observed) - 1);
  const max = Math.ceil(Math.max(...observed) + 1);
  const span = Math.max(max - min, 1);
  const ticks = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  const isBinary = estimate.unit === "percentage_points";
  const unitLong = isBinary ? "percentage points" : "outcome units";
  const unitShort = isBinary ? "pp" : "units";
  const confidencePercent = Number(((1 - result.plan.alpha) * 100).toFixed(1));

  const renderPlot = (mobile: boolean) => {
    const width = mobile ? 360 : 1020;
    const height = mobile ? 220 : 184;
    const left = mobile ? 20 : 80;
    const right = mobile ? 340 : 940;
    const axisY = mobile ? 146 : 130;
    const effectY = mobile ? 96 : 94;
    const x = (value: number) => left + ((value - min) / span) * (right - left);
    const visibleTicks = mobile ? [min, 0, max].filter((value, index, values) => values.indexOf(value) === index) : ticks;
    return (
      <svg
        className={mobile ? "interval-mobile-svg" : "interval-desktop-svg"}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
      >
        <text x={left} y={mobile ? 17 : 18} className="chart-direction" textAnchor="start">
          ← Favors control
        </text>
        <text x={right} y={mobile ? 17 : 18} className="chart-direction" textAnchor="end">
          Favors treatment →
        </text>

        <line x1={x(0)} x2={x(0)} y1={mobile ? 34 : 30} y2={axisY} className="zero-line" />
        <text x={x(0)} y={mobile ? 169 : 151} textAnchor="middle" className="zero-label">
          Zero (no effect)
        </text>
        <line x1={x(threshold)} x2={x(threshold)} y1={mobile ? 34 : 30} y2={axisY} className="threshold-line" />
        <text x={x(threshold)} y={mobile ? 187 : 151} textAnchor="middle" className="threshold-label">
          Threshold {formatSigned(threshold)} {unitShort}
        </text>

        <line x1={left} x2={right} y1={axisY} y2={axisY} className="axis-line" />
        {visibleTicks.map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} x2={x(tick)} y1={axisY} y2={axisY + 7} className="tick-line" />
            <text x={x(tick)} y={mobile ? 215 : 172} textAnchor="middle" className="tick-label">
              {tick > 0 ? `+${tick}` : tick}
            </text>
          </g>
        ))}

        <line x1={x(estimate.ciLow)} x2={x(estimate.ciHigh)} y1={effectY} y2={effectY} className="ci-line" />
        <line x1={x(estimate.ciLow)} x2={x(estimate.ciLow)} y1={effectY - 9} y2={effectY + 9} className="ci-cap" />
        <line x1={x(estimate.ciHigh)} x2={x(estimate.ciHigh)} y1={effectY - 9} y2={effectY + 9} className="ci-cap" />
        <circle cx={x(estimate.value)} cy={effectY} r="7" className="estimate-dot" />
        <text x={x(estimate.ciLow)} y={effectY - 18} textAnchor="middle" className="ci-label">
          {formatSigned(estimate.ciLow)}
        </text>
        <text x={x(estimate.value)} y={effectY - 18} textAnchor="middle" className="estimate-label">
          {formatSigned(estimate.value)}
        </text>
        <text x={x(estimate.ciHigh)} y={effectY - 18} textAnchor="middle" className="ci-label">
          {formatSigned(estimate.ciHigh)}
        </text>
      </svg>
    );
  };

  return (
    <figure className="interval-figure" role="img" aria-labelledby={titleId} aria-describedby={descriptionId}>
      <span className="visually-hidden" id={titleId}>Estimated treatment effect with {confidencePercent} percent confidence interval</span>
      <span className="visually-hidden" id={descriptionId}>
        The estimated difference is {formatSigned(estimate.value)} {unitLong}. The {confidencePercent} percent
        confidence interval runs from {formatSigned(estimate.ciLow)} to {formatSigned(estimate.ciHigh)}.
        The business threshold is {formatSigned(threshold)} {unitLong}.
      </span>
      {renderPlot(false)}
      {renderPlot(true)}
      <figcaption>
        {isBinary ? "Risk difference in percentage points." : "Mean difference in outcome units."} Exact values remain visible without hover.
      </figcaption>
    </figure>
  );
}
