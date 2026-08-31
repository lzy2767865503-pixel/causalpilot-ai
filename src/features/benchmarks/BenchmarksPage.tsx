import { CheckCircle2, FlaskConical, LockKeyhole, Play, ShieldAlert } from "lucide-react";

const families = [
  ["Null effect", "Type I error and interval coverage", "Planned"],
  ["Known positive effect", "Bias and confidence-interval recovery", "Planned"],
  ["Sample-ratio mismatch", "Critical design must be blocked", "Golden test"],
  ["Duplicate units", "Critical input must be blocked", "Golden test"],
  ["Missing outcomes", "Group-specific missingness warning", "Golden test"],
  ["CUPED", "Unbiased estimate with variance reduction", "Planned"],
];

export function BenchmarksPage() {
  return (
    <div className="workspace utility-page">
      <header className="utility-header">
        <div><h1>Benchmark Lab</h1><p>Predefined tests protect the statistical claims before release.</p></div>
        <button className="button button-primary" type="button" disabled title="Formal holdout run is enabled after the engine baseline is frozen"><Play aria-hidden="true" /> Holdout run not yet unlocked</button>
      </header>
      <section className="benchmark-principle">
        <FlaskConical aria-hidden="true" />
        <div><h2>Targets are not results</h2><p>The thresholds below are release gates fixed before the formal holdout run. CausalPilot will never present a planned target as an achieved metric.</p></div>
      </section>
      <div className="benchmark-kpis">
        <article><span>Ground-truth family pass rate</span><strong>≥ 90%</strong><small>Release target · not yet measured</small></article>
        <article><span>Critical invalid designs blocked</span><strong>100%</strong><small>Release target · golden fixtures first</small></article>
        <article><span>Evidence-linked numerical claims</span><strong>100%</strong><small>Release target · report audit required</small></article>
      </div>
      <section className="benchmark-table-section">
        <div className="section-title-row"><h2>Scenario families</h2><span>Development and holdout seeds are separated</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th scope="col">Scenario family</th><th scope="col">What it verifies</th><th scope="col">Current gate</th></tr></thead>
            <tbody>{families.map(([name, purpose, state]) => <tr key={name}><th scope="row">{name}</th><td>{purpose}</td><td>{state === "Golden test" ? <span className="gate-state gate-golden"><CheckCircle2 aria-hidden="true" /> {state}</span> : <span className="gate-state"><LockKeyhole aria-hidden="true" /> {state}</span>}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <p className="method-warning"><ShieldAlert aria-hidden="true" /> A failed benchmark narrows the product claim; it is never hidden or overwritten.</p>
    </div>
  );
}
