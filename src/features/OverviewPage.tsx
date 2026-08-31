import { ArrowRight, FileUp, FlaskConical, LockKeyhole, ShieldCheck } from "lucide-react";

interface OverviewPageProps { onOpenSample: () => void; onImport: () => void; }

export function OverviewPage({ onOpenSample, onImport }: OverviewPageProps) {
  return (
    <div className="workspace overview-page">
      <header className="overview-header">
        <div>
          <h1>Evidence before explanation.</h1>
          <p>CausalPilot AI turns randomized business experiments into locked plans, visible diagnostics, deterministic estimates, and reproducible decision reports.</p>
          <div className="overview-actions">
            <button className="button button-primary" type="button" onClick={onOpenSample}>Open synthetic experiment <ArrowRight aria-hidden="true" /></button>
            <button className="button button-secondary" type="button" onClick={onImport}><FileUp aria-hidden="true" /> Import local CSV</button>
          </div>
        </div>
        <div className="overview-proof">
          <span>Product principle</span>
          <blockquote>“AI may explain structured evidence. It does not calculate, replace, or silently rewrite the evidence.”</blockquote>
          <p>Designed and owned by <strong>LAI ZEYU (来泽宇)</strong></p>
        </div>
      </header>
      <section className="workflow-strip" aria-label="CausalPilot workflow">
        <article><FileUp aria-hidden="true" /><span>01</span><h2>Import locally</h2><p>Raw rows stay on the device by default.</p></article>
        <article><ShieldCheck aria-hidden="true" /><span>02</span><h2>Audit the design</h2><p>Critical data and assignment failures block causal wording.</p></article>
        <article><LockKeyhole aria-hidden="true" /><span>03</span><h2>Lock the plan</h2><p>The primary outcome and method become traceable.</p></article>
        <article><FlaskConical aria-hidden="true" /><span>04</span><h2>Export evidence</h2><p>Results, assumptions, hashes, and limitations travel together.</p></article>
      </section>
      <section className="scope-section">
        <div><h2>Focused v1 scope</h2><p>Randomized two-group experiments for Marketing and ethical team-level HR interventions.</p></div>
        <dl><div><dt>Built now</dt><dd>Binary and continuous A/B evidence, SRM, missingness, locked plans, confidence intervals, ROI scenarios.</dd></div><div><dt>Deliberately excluded</dt><dd>Arbitrary observational causality, employee ranking, hiring or firing decisions, and AI-generated statistics.</dd></div></dl>
      </section>
    </div>
  );
}
