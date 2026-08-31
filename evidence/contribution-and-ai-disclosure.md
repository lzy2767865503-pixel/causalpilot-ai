# CausalPilot AI Contribution and AI-Assistance Disclosure

Document status: authorship and disclosure policy; update against repository evidence at every release  
Created: 2026-08-31

## Product authorship and accountability

**LAI ZEYU (来泽宇)** is the product author, problem owner, and QA owner for CausalPilot AI.

This means LAI ZEYU owns and is accountable for:

- Defining the business problem, primary Marketing Analytics direction, and secondary aggregate HR Analytics boundary
- Deciding the target users, supported decisions, product scope, and feature priorities
- Approving the statistical methods, benchmark design, acceptance targets, and release gates
- Making final product, safety, evidence, and release decisions
- Reviewing outputs, investigating failures, and deciding whether a result is suitable for an application claim
- Owning final QA sign-off and the accuracy of résumé, portfolio, interview, and public statements

“Product author” does not mean that every line of source code, test, design, or prose was typed manually without assistance.

## Codex and other AI assistance

Codex and other AI tools may assist with work such as:

- Product ideation and alternative scoping
- Architecture, interface, and data-contract suggestions
- Code scaffolding and implementation drafts
- Test-case, simulation-scenario, and fixture generation
- Debugging hypotheses and code review
- Documentation, report structure, and wording drafts
- Repetitive validation and evidence-pack preparation

AI assistance must be described as assistance, not hidden or represented as entirely manual work. Substantial AI-generated implementation remains AI-assisted implementation even after it is reviewed and incorporated into the product.

AI tools do not own the product, do not provide independent ground truth, and do not replace LAI ZEYU’s responsibility to:

- Verify statistical formulas and reference outputs
- Inspect code and test failures
- Validate privacy and HR-safety boundaries
- Confirm that preserved evidence supports each public statement
- Reject unsafe, incorrect, fabricated, or out-of-scope suggestions
- Attribute third-party libraries, datasets, and source material

## Honest contribution language

Preferred wording after the relevant work is evidenced:

> I conceived and led CausalPilot AI as product author, problem owner, and QA owner. I used Codex and other AI tools to accelerate prototyping, implementation, testing, and documentation, while retaining responsibility for scope, methodological choices, validation, safety controls, release decisions, and final claims.

Short portfolio disclosure:

> Product author and QA owner: LAI ZEYU (来泽宇). AI-assisted implementation and documentation were reviewed against versioned tests, benchmarks, and release evidence.

Avoid wording such as:

- “I manually coded every line” when AI or third-party code materially contributed
- “The AI validated the statistics” when no independent reference comparison exists
- “Built entirely independently” if collaborators, AI, templates, or external assets made material contributions
- “Proprietary algorithm” for a standard statistical method or third-party implementation
- “Production-grade” merely because the application builds or looks complete

## Evidence required before contribution claims

At each release, reconcile this disclosure against:

- Repository commit and issue history
- Product decision records
- Benchmark and QA sign-off records
- Third-party dependency and licence records
- Dataset provenance and licences
- Design assets, templates, and external contributions
- Material AI-assisted files or workstreams, where traceable

If another person later contributes, add their name, role, date range, work products, and approval status. Do not preserve a sole-author impression that no longer matches the evidence.

## Role-and-evidence table

| Role or contribution | Accountable party | Evidence expected before public claim | Current statement boundary |
|---|---|---|---|
| Product concept and problem definition | LAI ZEYU | Dated scope/decision record | Authorship role declared; product outcome not implied |
| Product requirements and prioritization | LAI ZEYU | Versioned requirements and decision history | Do not claim every planned feature is implemented |
| Statistical-method selection | LAI ZEYU, supported by references and AI-assisted research where used | Method specification, reference comparison, review record | Selection is not proof of correctness |
| Implementation | LAI ZEYU with Codex/AI assistance where used | Source history, tests, review record | Describe as AI-assisted when material |
| Benchmark planning | LAI ZEYU with Codex/AI assistance | Frozen manifest and decision record | Planned thresholds are not achieved results |
| Benchmark execution | LAI ZEYU as QA owner | Preserved commands, environment, raw and summarized results | State actual outcomes, including failures |
| Documentation and application narrative | LAI ZEYU with Codex/AI assistance where used | Source/evidence links and final human review | No unsupported metrics or adoption claims |
| Final QA and release decision | LAI ZEYU | Signed release decision record | Packaging, installation, signing, and publication remain separate gates |

## Release sign-off questions for LAI ZEYU

- [ ] Can I explain why each supported method was chosen and when it should not be used?
- [ ] Did I inspect the formal holdout failures, not only the summary score?
- [ ] Can every numerical application claim be traced to a preserved artifact?
- [ ] Have I separated simulation evidence, public-data demonstrations, and real-world outcomes?
- [ ] Did I disclose material AI assistance accurately?
- [ ] Have all third-party libraries, datasets, templates, and assets been attributed?
- [ ] Does the privacy and HR-safety statement match the exact released code and configuration?
- [ ] Am I claiming only the release gates actually passed by the exact version?

Final sign-off must be added only after review:

```text
Release version:
Source commit:
Evidence bundle version:
Reviewed by LAI ZEYU (来泽宇):
Review date:
Known limitations accepted:
```

