# CausalPilot AI Privacy and HR-Safety Boundary

Policy status: intended v1 boundary and acceptance criteria; implementation must be tested before any compliance claim  
Created: 2026-08-31  
Accountable owner: LAI ZEYU (来泽宇)

## Product boundary

CausalPilot AI is intended to support experiment design, aggregate intervention evaluation, statistical interpretation, and evidence-linked reporting. It is not an automated employment-decision system.

Primary v1 examples include Marketing campaign, pricing, conversion, engagement, and retention experiments. HR examples are limited to aggregate programme or team-level interventions such as onboarding, training, flexible-work, communication, or engagement initiatives.

## Local raw-data processing

The intended default is local processing of raw uploaded data.

For the released implementation to claim this boundary, it must satisfy and preserve evidence for all of the following:

- CSV, spreadsheet, or other supported raw rows are parsed and analysed locally in the declared application environment.
- Raw rows are not sent to an external AI service by default.
- Raw data, filenames, row values, free-text responses, and direct identifiers are not written to telemetry or ordinary application logs.
- The application provides a visible way to clear the active dataset and generated local artifacts.
- Temporary files and persistence behaviour are documented and tested for the exact platform.
- Example data shipped with the application is synthetic or has documented permission and provenance.

“Local by default” must not be rewritten as “data can never leave the device” unless network and storage tests prove that stronger statement for the exact released configuration.

## Optional external-AI boundary

Any external-AI feature is optional and off by default unless a later reviewed policy explicitly changes that decision.

When enabled, the intended v1 payload boundary is aggregate-only or metadata-only. Permitted categories may include:

- User-approved business question
- User-approved variable labels or a manually reviewed schema without row values
- Aggregate sample counts
- Aggregate effect estimates and confidence intervals
- Method name, assumptions, diagnostic flags, and non-sensitive limitations
- Synthetic examples that contain no real person or organisation data

The optional-AI path must not send:

- Names, email addresses, phone numbers, addresses, identity numbers, account identifiers, or employee/candidate IDs
- Row-level observations
- Resumes, applications, performance reviews, interview notes, or communications
- Free-text employee or candidate feedback unless it has a separately reviewed de-identification and consent path
- Small-group breakdowns that create a material re-identification risk
- Secrets, credentials, local paths containing private information, or unredacted error dumps

Required controls before enabling optional AI:

- Explicit user action and a clear description of what will be sent
- Preview of the outgoing structured payload
- Payload allow-list rather than a block-list alone
- Redacted audit metadata that records event type and schema, not raw sensitive values
- A deterministic report path that works with AI disabled
- Vendor, model, region, retention, and account settings documented without promising controls the vendor does not provide
- A test demonstrating that disallowed fields do not enter the outgoing payload

## HR decision restrictions

CausalPilot AI must not:

- Rank, shortlist, reject, hire, fire, promote, demote, compensate, discipline, or schedule an identifiable person
- Predict whether a named person should leave or be terminated
- Produce an individual “risk”, “fit”, “loyalty”, “potential”, “performance”, or employability score
- Infer personality, emotion, health, disability, ethnicity, religion, political belief, sexual orientation, or another sensitive trait
- Monitor private communications, keystrokes, location, or off-duty behaviour
- Recommend an employment action from a protected or proxy attribute
- Turn an aggregate exploratory pattern into an individual employment decision

HR outputs must be framed at the programme, policy, experiment arm, cohort, or sufficiently large group level. They must include uncertainty, assumptions, time window, and a statement that the result does not determine an individual employment outcome.

## Small-group and sensitive-segment protection

Planned v1 safety policy:

- Suppress or refuse subgroup output below a configurable minimum group size.
- The initial planned default is 10 observations per displayed group; this is a policy target, not evidence that the control is currently implemented or legally sufficient.
- Do not expose intersectional breakdowns that create a foreseeable re-identification risk even when each individual filter appears acceptable.
- Treat protected-attribute analysis as disabled by default and require a separately reviewed legitimate purpose, lawful basis, aggregation design, and human governance before any future implementation.

The project must not claim that one numeric threshold guarantees anonymity.

## Data minimisation and retention

Only fields needed for the declared analysis should be imported or retained. The product should distinguish:

- Treatment or intervention assignment
- Outcome
- Pre-treatment covariates
- Time or unit identifiers needed for the design
- Fields not required for the analysis

Fields not required should be excluded before analysis. Retention should be session-scoped by default unless the user explicitly saves a local project. Saved-project location, encryption behaviour, backup implications, and deletion limitations must be documented for the exact implementation.

No claim of secure deletion should be made without platform-specific verification, including the effect of backups, caches, and filesystem behaviour.

## Logs, exports, and evidence

Application and benchmark logs should contain:

- Software and manifest version
- Method and configuration identifiers
- Counts and aggregate diagnostics
- Result IDs and status codes
- Redacted error category

They should not contain raw row values or direct identifiers.

Public case studies and admissions evidence must use:

- Synthetic data with a documented generator, or
- Public/licensed data with a documented source and permitted use, or
- Separately authorised data with an explicit publication boundary

Simulation, public-data demonstration, and real-world operational evidence must never be conflated.

## Safety response behaviour

The application should refuse or prominently warn when:

- The requested output is an individual employment recommendation
- Required treatment, outcome, time, or unit fields are missing
- A treatment assignment or outcome appears to leak into a covariate
- A subgroup is below the configured disclosure threshold
- The design cannot support the requested causal language
- An optional-AI payload contains a disallowed field

A refusal is a successful safety outcome, not a product failure.

## Verification required before public claims

- [ ] Network inspection with optional AI disabled
- [ ] Network and payload inspection with optional AI enabled
- [ ] Test fixtures containing planted direct identifiers and row-level values
- [ ] Log and crash-report content audit
- [ ] Temporary-file and saved-project retention test
- [ ] Clear-data workflow test
- [ ] Small-group suppression test
- [ ] Individual HR-decision refusal test
- [ ] Protected/sensitive attribute boundary test
- [ ] Package-content secret and private-data scan
- [ ] Manual review of privacy text against the exact release

Until these checks have been run and preserved, safe wording is:

> CausalPilot AI is designed around local raw-data processing, optional aggregate-only AI assistance, and a prohibition on individual employment decisions. These are intended product boundaries pending verification of the released implementation.

After testing, report the exact configuration, version, test scope, and result. Do not use unqualified terms such as “fully private”, “anonymous”, “compliant”, “bias-free”, or “zero risk”.

## Incident and change rule

If a test or user report shows raw data leaving the intended boundary, an individual HR recommendation, a sensitive-data exposure, or a misleading causal statement:

1. Disable the affected feature or release path.
2. Preserve a redacted incident record.
3. Identify affected versions and evidence claims.
4. Correct the implementation and add a regression test.
5. Issue a new version and update public/application wording.
6. Do not overwrite the prior failed evidence.

Any future cloud sync, team sharing, resume processing, individual prediction, or external connector requires a new privacy and HR-safety review; it is not covered by this v1 policy.
