import {
  ArrowLeft,
  Download,
  FileInput,
  Info,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import type { ResultBundle } from "../../types";
import {
  formatCurrency,
  formatInteger,
  formatPValue,
  formatSigned,
  truncateHash,
} from "../../lib/format";
import { StatusMark } from "../../components/StatusMark";
import { ConfidenceIntervalPlot } from "./ConfidenceIntervalPlot";

interface ResultsWorkspaceProps {
  result: ResultBundle;
  onImport: () => void;
  onExport: () => void;
  onBackToOverview: () => void;
}

export function ResultsWorkspace({ result, onImport, onExport, onBackToOverview }: ResultsWorkspaceProps) {
  const { estimate } = result;
  const ready = result.status === "ready";
  const binary = result.plan.outcomeType === "binary";
  const effectUnit = binary ? "pp" : "units";
  const outcomeLabel = binary ? "Conversion rate" : "Mean outcome";
  const confidencePercent = Number(((1 - result.plan.alpha) * 100).toFixed(1));
  const formatGroupMean = (value: number) => binary ? `${value.toFixed(2)}%` : value.toFixed(3);

  return (
    <div className="workspace results-workspace">
      <header className="workspace-header">
        <div>
          <button className="back-link" type="button" onClick={onBackToOverview}>
            <ArrowLeft aria-hidden="true" /> Overview
          </button>
          <h1>Experiment Summary</h1>
          <p>
            Project: <span>{result.projectName}</span>
          </p>
        </div>
        <div className="header-actions">
          <button className="button button-secondary" type="button" onClick={onImport}>
            <FileInput aria-hidden="true" /> Import data
          </button>
          <button className="button button-primary" type="button" onClick={onExport}>
            <Download aria-hidden="true" /> Export evidence
          </button>
        </div>
      </header>

      <section className="result-hero" aria-labelledby="decision-question">
        <div className="result-provenance-row">
          <span className="evidence-classification">
            <ShieldCheck aria-hidden="true" /> {result.provenance === "synthetic_demo" ? "Synthetic worked example" : "Local analysis"}
          </span>
          <span>Run {result.runId}</span>
        </div>
        <h2 id="decision-question">{result.question}</h2>
        <div className="headline-metrics">
          <div>
            <span>Estimated lift</span>
            <strong>{formatSigned(estimate.value)} <small>{effectUnit}</small></strong>
          </div>
          <div>
            <span>{confidencePercent}% CI</span>
            <strong>
              {formatSigned(estimate.ciLow)} <small>to</small> {formatSigned(estimate.ciHigh)} <small>{effectUnit}</small>
            </strong>
          </div>
          <div>
            <span>Business threshold</span>
            <strong>{formatSigned(result.plan.businessThreshold)} <small>{effectUnit}</small></strong>
          </div>
          <div className="sample-size-metric">
            <span>Analyzed units</span>
            <strong>{formatInteger(result.dataset.analyzedUnits)}</strong>
            <small>{formatInteger(estimate.controlN)} control · {formatInteger(estimate.treatmentN)} treatment</small>
          </div>
        </div>
        <ConfidenceIntervalPlot result={result} />
      </section>

      {!ready && (
        <section className="blocking-banner" role="alert">
          <ShieldCheck aria-hidden="true" />
          <div>
            <strong>Causal conclusion blocked</strong>
            <p>At least one critical design diagnostic failed. The numerical estimate is shown for audit only.</p>
          </div>
        </section>
      )}

      {ready && !estimate.causalClaimAllowed && (
        <section className="review-banner" role="status">
          <Info aria-hidden="true" />
          <div>
            <strong>Causal language withheld</strong>
            <p>The estimate is available, but randomized assignment has not been confirmed. Interpret it as an association only.</p>
          </div>
        </section>
      )}

      <section className="diagnostic-band" aria-labelledby="diagnostics-heading">
        <div className="section-title-row">
          <h3 id="diagnostics-heading">Diagnostics</h3>
          <span>{result.diagnostics.length} checks recorded</span>
        </div>
        <div className="diagnostic-grid">
          {result.diagnostics.slice(0, 4).map((diagnostic) => (
            <article key={diagnostic.code}>
              <span className="diagnostic-name">{diagnostic.title}</span>
              <StatusMark status={diagnostic.status} label={diagnostic.summary} />
              <small>{diagnostic.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <div className="evidence-layout">
        <section className="decision-evidence" aria-labelledby="decision-evidence-heading">
          <div className="section-title-row">
            <div>
              <h3 id="decision-evidence-heading">Decision evidence</h3>
              <span>Primary metric: {result.plan.primaryOutcome.replaceAll("_", " ")}</span>
            </div>
            <span>p-value {formatPValue(estimate.pValue)}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Group</th>
                  <th scope="col">{binary ? "Events" : "Observed"}</th>
                  <th scope="col">Units</th>
                  <th scope="col">{outcomeLabel}</th>
                  <th scope="col">Lift vs control</th>
                  <th scope="col">{confidencePercent}% CI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Control</th>
                  <td>{binary ? (estimate.controlEvents == null ? "—" : formatInteger(estimate.controlEvents)) : formatInteger(estimate.controlN)}</td>
                  <td>{formatInteger(estimate.controlN)}</td>
                  <td>{formatGroupMean(estimate.controlMean)}</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
                <tr>
                  <th scope="row">Treatment</th>
                  <td>{binary ? (estimate.treatmentEvents == null ? "—" : formatInteger(estimate.treatmentEvents)) : formatInteger(estimate.treatmentN)}</td>
                  <td>{formatInteger(estimate.treatmentN)}</td>
                  <td>{formatGroupMean(estimate.treatmentMean)}</td>
                  <td>{formatSigned(estimate.value, 2)} {effectUnit}</td>
                  <td>({formatSigned(estimate.ciLow, 2)}, {formatSigned(estimate.ciHigh, 2)})</td>
                </tr>
              </tbody>
            </table>
          </div>

          {result.roi && (
            <div className="roi-section">
              <h4>Business impact scenario</h4>
              <div className="roi-grid">
                <div><span>Incremental outcomes</span><strong>{formatInteger(result.roi.incrementalOutcomes)}</strong></div>
                <div><span>Incremental revenue</span><strong>{formatCurrency(result.roi.incrementalRevenue)}</strong></div>
                <div><span>Incremental cost</span><strong>{formatCurrency(result.roi.incrementalCost)}</strong></div>
                <div><span>Incremental profit</span><strong>{formatCurrency(result.roi.incrementalProfit)}</strong></div>
                <div><span>Profit / cost</span><strong>{result.roi.returnMultiple.toFixed(2)}×</strong></div>
              </div>
              <p className="inline-note">
                <Info aria-hidden="true" /> Scenario assumes {formatCurrency(result.roi.valuePerIncrementalOutcome)} per incremental outcome and ${result.roi.costPerTreatedUnit.toFixed(2)} per treated unit. Edit assumptions before a real decision.
              </p>
            </div>
          )}
        </section>

        <aside className="evidence-inspector" aria-labelledby="inspector-heading">
          <h3 id="inspector-heading">Evidence inspector</h3>
          <dl>
            <div>
              <dt>Analysis plan</dt>
              <dd><LockKeyhole aria-hidden="true" /> {result.plan.locked ? "Locked" : "Draft"}</dd>
            </div>
            <div><dt>Dataset hash</dt><dd title={result.dataset.hash}>{truncateHash(result.dataset.hash)}</dd></div>
            <div><dt>Plan hash</dt><dd title={result.plan.hash}>{truncateHash(result.plan.hash)}</dd></div>
            <div><dt>Engine version</dt><dd>{result.engineVersion}</dd></div>
            <div><dt>Result IDs</dt><dd>{result.resultIds.join(", ")}</dd></div>
            <div>
              <dt>Assumptions</dt>
              <dd>{result.assumptions.slice(0, 2).join(" ")}</dd>
            </div>
          </dl>
          <button className="button button-outline full-width" type="button" onClick={onExport}>
            <Download aria-hidden="true" /> Open reproducibility bundle
          </button>
          <p className="inspector-owner">Evidence owner: <strong>LAI ZEYU (来泽宇)</strong></p>
        </aside>
      </div>

      <footer className="limitations-bar">
        <ShieldCheck aria-hidden="true" />
        <p><strong>Limitations:</strong> {result.limitations[0]}</p>
        <span>Evidence owner · LAI ZEYU (来泽宇)</span>
      </footer>
    </div>
  );
}
