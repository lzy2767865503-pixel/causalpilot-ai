import { Download, FileJson2, FileText, FolderArchive, ShieldCheck } from "lucide-react";
import type { ResultBundle } from "../types";

interface ReportsPageProps { result: ResultBundle; onExport: () => void; }

export function ReportsPage({ result, onExport }: ReportsPageProps) {
  return (
    <div className="workspace utility-page">
      <header className="utility-header"><div><h1>Evidence reports</h1><p>Every numerical claim travels with its source result, method, assumptions, and version.</p></div><button className="button button-primary" type="button" onClick={onExport}><Download aria-hidden="true" /> Export current bundle</button></header>
      <section className="report-owner"><ShieldCheck aria-hidden="true" /><div><h2>Evidence ownership</h2><p>Product author and evidence owner: <strong>LAI ZEYU (来泽宇)</strong>. AI assistance is disclosed separately from statistical computation.</p></div></section>
      <div className="report-artifacts">
        <article><FileJson2 aria-hidden="true" /><div><h2>result_bundle.json</h2><p>Effects, intervals, diagnostics, IDs, and causal-claim permissions.</p></div><span>Machine readable</span></article>
        <article><FileJson2 aria-hidden="true" /><div><h2>analysis_spec.json</h2><p>Locked primary outcome, groups, alpha, threshold, and field roles.</p></div><span>Plan hash</span></article>
        <article><FileText aria-hidden="true" /><div><h2>evidence_report.html</h2><p>Decision-focused narrative with exact values and explicit limitations.</p></div><span>Human readable</span></article>
        <article><FolderArchive aria-hidden="true" /><div><h2>run_manifest.json</h2><p>Dataset hash, engine version, run ID, timestamp, and provenance.</p></div><span>Reproducible</span></article>
      </div>
      <section className="current-report-summary"><h2>Current result</h2><dl><div><dt>Project</dt><dd>{result.projectName}</dd></div><div><dt>Run ID</dt><dd>{result.runId}</dd></div><div><dt>Dataset</dt><dd>{result.dataset.name}</dd></div><div><dt>Engine</dt><dd>{result.engineVersion}</dd></div></dl></section>
    </div>
  );
}
