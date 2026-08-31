import { AlertTriangle, CheckCircle2, LockKeyhole, Scale } from "lucide-react";

export function MethodsPage() {
  return (
    <div className="workspace utility-page methods-page">
      <header className="utility-header"><div><h1>Method Library</h1><p>A narrow, testable method set is stronger than an unverified catalogue.</p></div></header>
      <section className="method-intro"><Scale aria-hidden="true" /><div><h2>Randomized A/B is the v1 identification design</h2><p>Causal wording is available only when assignment and critical quality checks support it. Effect size, uncertainty, sample size, and business relevance stay visible together.</p></div></section>
      <div className="method-list">
        <article><div><CheckCircle2 aria-hidden="true" /><h2>Binary outcome</h2></div><p>Absolute risk difference, configured two-sided interval (95% default), two-sided test, group rates, and event counts.</p><span>Core · validation in progress</span></article>
        <article><div><CheckCircle2 aria-hidden="true" /><h2>Continuous outcome</h2></div><p>Mean difference with Welch uncertainty. No robust or outlier-sensitivity estimator is implemented in v0.1.</p><span>Core · validation in progress</span></article>
        <article><div><AlertTriangle aria-hidden="true" /><h2>CUPED adjustment</h2></div><p>The engine has an attested pre-treatment benchmark path, but UI submission is disabled until explicit attestation and side-by-side raw/adjusted display are implemented.</p><span>Engine-only extension · UI disabled</span></article>
        <article><div><LockKeyhole aria-hidden="true" /><h2>Observational causal methods</h2></div><p>PSM, AIPW, DML, causal forests, and synthetic controls are excluded from v1.</p><span>Locked</span></article>
      </div>
      <section className="language-boundary"><h2>Conclusion language boundary</h2><div><strong>Randomized design passes</strong><p>“Within the randomized sample and stated assumptions, the estimated intention-to-treat effect was…”</p></div><div><strong>Critical diagnostic fails</strong><p>“The current data do not support a causal conclusion. The estimate is retained for audit only.”</p></div></section>
    </div>
  );
}
