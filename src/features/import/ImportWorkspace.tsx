import {
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  FileCheck2,
  FileUp,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import type { AnalysisSpec, FieldMapping, FieldRole, ImportedDataset } from "../../types";
import { StatusMark } from "../../components/StatusMark";
import { truncateHash } from "../../lib/format";

const roleOptions: Array<{ value: FieldRole; label: string }> = [
  { value: "unit_id", label: "Unit ID" },
  { value: "treatment", label: "Treatment" },
  { value: "primary_outcome", label: "Primary outcome" },
  { value: "secondary_outcome", label: "Secondary outcome" },
  { value: "pre_treatment_covariate", label: "Pre-treatment covariate" },
  { value: "treatment_time", label: "Treatment time" },
  { value: "outcome_time", label: "Outcome time" },
  { value: "exclude", label: "Exclude" },
];

interface ImportWorkspaceProps {
  dataset: ImportedDataset | null;
  spec: AnalysisSpec | null;
  error: string | null;
  isAnalyzing: boolean;
  onBack: () => void;
  onChooseFile: () => void;
  onUseSample: () => void;
  onMappingChange: (source: string, role: FieldRole) => void;
  onSpecChange: (patch: Partial<AnalysisSpec>) => void;
  onContinue: () => void;
}

const steps = [
  { number: 1, title: "Select file", state: "complete", icon: FileCheck2 },
  { number: 2, title: "Map fields", state: "current", icon: Database },
  { number: 3, title: "Validate design", state: "pending", icon: ShieldCheck },
  { number: 4, title: "Lock plan", state: "pending", icon: LockKeyhole },
];

function PreflightTable({ mappings, dataset }: { mappings: FieldMapping[]; dataset: ImportedDataset }) {
  const frozenSample = dataset.rawText.startsWith("Built-in deterministic synthetic demonstration");
  const possiblePii = mappings.filter((mapping) => mapping.note === "Possible PII");
  const hasUnit = mappings.some((mapping) => mapping.role === "unit_id");
  const hasTreatment = mappings.some((mapping) => mapping.role === "treatment");
  const hasOutcome = mappings.some((mapping) => mapping.role === "primary_outcome");
  const checks = [
    {
      title: "Unit ID mapped",
      detail: hasUnit ? "One analysis-unit column selected" : "Select the unit identifier",
      status: hasUnit ? ("passed" as const) : ("blocked" as const),
    },
    {
      title: "Treatment encoded",
      detail: hasTreatment ? "Treatment assignment column selected" : "Select the randomized assignment",
      status: hasTreatment ? ("passed" as const) : ("blocked" as const),
    },
    {
      title: "Primary outcome mapped",
      detail: hasOutcome ? "One primary outcome selected" : "Select exactly one primary outcome",
      status: hasOutcome ? ("passed" as const) : ("blocked" as const),
    },
    {
      title: "Possible PII field",
      detail: possiblePii.length ? `${possiblePii.map((item) => item.source).join(", ")} excluded for review` : "No obvious PII column name detected",
      status: possiblePii.length ? ("review" as const) : ("passed" as const),
    },
    {
      title: "Local data boundary",
      detail: frozenSample
        ? "Frozen synthetic evidence bundle; no user data is loaded"
        : `${dataset.rows.length.toLocaleString()} preview rows held only in this application session`,
      status: "passed" as const,
    },
  ];

  return (
    <section className="preflight-section" aria-labelledby="preflight-heading">
      <div className="section-title-row">
        <h3 id="preflight-heading">Preflight checks</h3>
        <span>Critical failures stop causal wording</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th scope="col">Check</th><th scope="col">Result</th><th scope="col">Details</th></tr>
          </thead>
          <tbody>
            {checks.map((check) => (
              <tr key={check.title}>
                <th scope="row">{check.title}</th>
                <td><StatusMark status={check.status} label={check.status === "passed" ? "Passed" : check.status === "review" ? "Review" : "Required"} compact /></td>
                <td>{check.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ImportWorkspace({
  dataset,
  spec,
  error,
  isAnalyzing,
  onBack,
  onChooseFile,
  onUseSample,
  onMappingChange,
  onSpecChange,
  onContinue,
}: ImportWorkspaceProps) {
  const frozenSample = Boolean(
    dataset?.rawText.startsWith("Built-in deterministic synthetic demonstration"),
  );

  return (
    <div className="workspace import-workspace">
      <header className="workspace-header import-header">
        <div>
          <button className="back-link" type="button" onClick={onBack}>
            <ArrowLeft aria-hidden="true" /> Experiments
          </button>
          <h1>Import experiment data</h1>
          <p>Raw rows stay on this device</p>
        </div>
        <div className="header-actions">
          <button className="button button-secondary" type="button" onClick={onChooseFile}>
            <FileUp aria-hidden="true" /> Choose CSV
          </button>
          <button className="text-action" type="button" onClick={onUseSample}>Use sample dataset</button>
        </div>
      </header>

      <ol className="step-rail" aria-label="Import progress">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.number} className={`step step-${step.state}`} aria-current={step.state === "current" ? "step" : undefined}>
              <span className="step-circle">{step.state === "complete" ? <Check aria-hidden="true" /> : step.number}</span>
              <span><strong>{step.title}</strong><small>{step.state === "complete" ? "Complete" : step.state === "current" ? "In progress" : "Pending"}</small></span>
              <Icon className="step-icon" aria-hidden="true" />
            </li>
          );
        })}
      </ol>

      {!dataset ? (
        <section className="empty-import" aria-labelledby="empty-import-title">
          <FileUp aria-hidden="true" />
          <h2 id="empty-import-title">Choose a randomized experiment CSV</h2>
          <p>Map one unit ID, one assigned treatment, and one primary outcome. CausalPilot will inspect the design before calculating a result.</p>
          <div>
            <button className="button button-primary" type="button" onClick={onChooseFile}>Choose CSV</button>
            <button className="button button-secondary" type="button" onClick={onUseSample}>Open synthetic example</button>
          </div>
        </section>
      ) : (
        <>
          <div className="dataset-summary">
            <strong>{dataset.name}</strong>
            <span>{dataset.rows.length ? dataset.rows.length.toLocaleString() : dataset.rawText.startsWith("Built-in") ? "16,000" : "Pending"} rows</span>
            <span>{dataset.columns.length} columns</span>
            <span title={dataset.hash}>SHA-256 {truncateHash(dataset.hash, 9)}</span>
            {frozenSample && <span>Frozen example · controls locked</span>}
          </div>

          <div className="mapping-layout">
            <section className="mapping-table-section" aria-labelledby="mapping-heading">
              <h2 id="mapping-heading">Field mapping</h2>
              <div className="table-wrap mapping-table-wrap">
                <table>
                  <thead>
                    <tr><th scope="col">Source column</th><th scope="col">Detected type</th><th scope="col">Experiment role</th><th scope="col">Validation</th></tr>
                  </thead>
                  <tbody>
                    {dataset.mappings.map((mapping) => (
                      <tr key={mapping.source}>
                        <th scope="row"><code>{mapping.source}</code></th>
                        <td>{mapping.detectedType}</td>
                        <td>
                          <select
                            value={mapping.role}
                            aria-label={`Role for ${mapping.source}`}
                            disabled={frozenSample}
                            onChange={(event) => onMappingChange(mapping.source, event.target.value as FieldRole)}
                          >
                            {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </td>
                        <td><StatusMark status={mapping.status} label={mapping.status === "review" ? "Review" : "Passed"} compact /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="analysis-plan" aria-labelledby="analysis-plan-heading">
              <h2 id="analysis-plan-heading">Analysis plan</h2>
              {spec ? (
                <div className="plan-fields">
                  <label><span>Design</span><input value="Randomized A/B" disabled /></label>
                  <label><span>Control value</span><input value={spec.controlValue} disabled={frozenSample} onChange={(event) => onSpecChange({ controlValue: event.target.value })} /></label>
                  <label><span>Treatment value</span><input value={spec.treatmentValue} disabled={frozenSample} onChange={(event) => onSpecChange({ treatmentValue: event.target.value })} /></label>
                  <label><span>Primary outcome type</span><select value={spec.outcomeType} disabled={frozenSample} onChange={(event) => onSpecChange({ outcomeType: event.target.value as AnalysisSpec["outcomeType"] })}><option value="binary">Binary</option><option value="continuous">Continuous</option></select></label>
                  <label><span>Expected allocation</span><input value={`${spec.expectedAllocation[0] * 100} / ${spec.expectedAllocation[1] * 100}`} disabled /></label>
                  <label><span>Alpha</span><input type="number" min="0.001" max="0.2" step="0.01" value={spec.alpha} disabled={frozenSample} onChange={(event) => onSpecChange({ alpha: Number(event.target.value) })} /></label>
                  <label><span>Business threshold</span><div className="input-with-unit"><input type="number" step="0.1" value={spec.businessThreshold} disabled={frozenSample} onChange={(event) => onSpecChange({ businessThreshold: Number(event.target.value) })} /><span>pp</span></div></label>
                  <label className="confirmation-field"><span>Random assignment</span><span className="checkbox-control"><input type="checkbox" checked={spec.randomizedAssignmentConfirmed} disabled={frozenSample} onChange={(event) => onSpecChange({ randomizedAssignmentConfirmed: event.target.checked })} /><span>I confirm this is the assigned treatment, not post-treatment usage.</span></span></label>
                </div>
              ) : <p>Complete the required mappings to create the plan.</p>}
              <div className="privacy-note">
                <ShieldCheck aria-hidden="true" />
                <div><strong>Ownership & privacy</strong><p>Evidence owner: LAI ZEYU (来泽宇). Raw data is processed locally.</p></div>
              </div>
            </aside>
          </div>

          <PreflightTable mappings={dataset.mappings} dataset={dataset} />
        </>
      )}

      {error && <div className="form-error" role="alert">{error}</div>}

      <footer className="import-action-bar">
        <button className="button button-secondary" type="button" onClick={onBack}>Back</button>
        <p><LockKeyhole aria-hidden="true" /> The analysis plan is hashed and recorded when locked.</p>
        <button className="button button-primary" type="button" onClick={onContinue} disabled={!dataset || !spec || isAnalyzing}>
          {isAnalyzing ? "Validating…" : frozenSample ? "Open frozen result" : "Validate & continue"} <ArrowRight aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}
