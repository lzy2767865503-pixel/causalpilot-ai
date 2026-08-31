# CausalPilot AI Release Gates

Status: gate definitions only; no gate is marked passed in this document  
Created: 2026-08-31  
Release owner: LAI ZEYU (来泽宇)

## Rule

Build, test, package, install, signing/notarization, and public availability are separate claims. Passing one gate does not pass any later gate, and a release gate does not replace the scientific-validity benchmark.

Each gate must refer to one exact source commit and, when an artifact exists, one exact SHA-256. Record `NOT EVALUATED`, `FAIL`, `PARTIAL`, or `PASS` with the date and evidence path. Do not use `PASS` without preserved evidence.

## Gate 0 — Source and scope freeze

**Question:** Is the release candidate clearly identified and is its supported scope explicit?

Required evidence:

- Source commit and clean/dirty state record
- Application version
- Benchmark manifest version
- Supported methods and out-of-scope methods
- Target platforms and architectures
- Privacy and HR-safety policy version
- Known limitations and unresolved issues

Passing wording:

> Release candidate version X was frozen at commit Y for the declared platform and scope.

This does not mean the candidate builds or works.

## Gate 1 — Build

**Question:** Can the frozen source produce the expected development or distribution output?

Required evidence:

- Exact build command
- Runtime and dependency versions
- Complete build output and exit status
- Build artifact inventory
- Build date, OS, and architecture

Minimum pass condition:

- The documented build command exits successfully from the declared starting state.
- Expected outputs exist and are not obviously empty or incomplete.
- No secret is included in the build log or known output tree.

Passing wording:

> Version X built successfully on the recorded environment.

Prohibited leap:

> Tested, installable, signed, notarized, production-ready, or publicly available.

## Gate 2 — Test

**Question:** Does the exact build/source version pass a defined and preserved test scope?

Required evidence:

- Unit, integration, and end-to-end command records
- Numerator, denominator, skipped tests, failures, and duration
- Golden/reference comparison outputs
- Development-versus-holdout distinction
- Known failing or quarantined tests with reasons
- Exact commit and environment

Minimum pass condition:

- All release-blocking tests pass.
- Skips and exclusions are disclosed.
- Formal benchmark results, if claimed, come from a frozen holdout run rather than the development split.

Passing wording:

> Version X passed N/N defined release-blocking tests on the recorded environment; M tests were skipped for the stated reasons.

Prohibited leap:

> Correct for every dataset, universally causal, installable, signed, or publicly available.

## Gate 3 — Package

**Question:** Was a distributable artifact produced from the tested release candidate?

Required evidence:

- Package command and log
- Artifact name, version, size, target OS/architecture, and SHA-256
- Package-content audit
- Licence/attribution and secret scan
- Mapping from artifact to source commit and test record

Minimum pass condition:

- The exact artifact exists and has a recorded hash.
- It corresponds to the tested commit.
- No known credential or private test data appears in the package-content audit.

Passing wording:

> Packaged version X for platform Y; SHA-256: Z.

Prohibited leap:

> Installed, runs on a clean device, signed, notarized, store-certified, or publicly downloadable.

For a web-only release, record the immutable deployment/build identifier instead of pretending a desktop installer exists.

## Gate 4 — Install and launch

**Question:** Can the exact packaged artifact be installed and complete a smoke workflow on a clean supported target?

Required evidence:

- Artifact hash matching Gate 3
- Target OS version, architecture, and relevant hardware
- Installation result and first-launch result
- Defined smoke workflow, including import, analysis, report, and privacy setting checks as applicable
- Uninstall or cleanup result where relevant
- Crash and console output record

Minimum pass condition:

- The exact artifact installs and launches on each claimed target configuration.
- The defined smoke workflow completes without an unresolved release-blocking error.

Passing wording:

> The exact version X artifact was installed, launched, and completed the defined smoke workflow on target Y.

Prohibited leap:

> Compatible with all devices, signed, notarized, certified, or publicly available.

## Gate 5 — Signing and notarization

This gate is platform-specific and optional for a web-only v1. Do not mark a web deployment as signed/notarized merely because HTTPS is available.

### macOS signing

Required evidence when claimed:

- Exact artifact hash
- Signing identity summary without exposing private material
- `codesign --verify --deep --strict` output
- Gatekeeper assessment output where applicable
- Entitlements record

Ad-hoc signing is not Developer ID signing.

### macOS notarization

Required evidence when claimed:

- Apple notarization submission identifier and accepted result
- Stapling result where applicable
- Gatekeeper assessment of the exact stapled artifact
- Exact artifact hash

Local execution, ad-hoc signing, or a successful package build is not notarization.

### Windows signing

Required evidence when claimed:

- Exact package hash
- Signature verification output
- Certificate identity/chain summary and timestamp status
- Target package format

A locally generated package is not store certification or public availability.

Passing wording must name the exact platform operation completed. Avoid the generic word “certified” unless the certifying authority and status are explicit.

## Gate 6 — Public availability

**Question:** Can an external person reach or download the exact declared version from the claimed public channel?

Public channels must be distinguished:

- Live web deployment
- Public GitHub repository
- Public GitHub release asset
- Microsoft Store, Mac App Store, or another store listing
- Public package/download page

Required evidence:

- Exact public URL
- Deployment/release/listing identifier
- Public version and mapping to commit/artifact hash
- External unauthenticated availability check with date
- Store status screenshot or API/page evidence when a store claim is made

Minimum pass condition:

- The exact URL or listing is reachable from a clean external session.
- The publicly served version can be tied to the release record.

Passing wording:

> Version X was publicly accessible at URL Y on date Z.

Channel-specific boundaries:

- A live web app is not a store listing.
- A public repository is not a packaged release.
- A GitHub release is not a store publication.
- “Submitted”, “in review”, “in certification”, or “approved” is not the same as publicly searchable and downloadable.
- A public page is not evidence of real users, adoption, or business impact.

## Scientific evidence gate — independent of release gates

The following must be reviewed separately before using scientific-performance claims:

- Frozen `benchmark-manifest.json`
- Formal holdout result artifact
- Per-family numerator, denominator, and uncertainty
- Reference comparison
- Preserved failures and exclusions
- Reproducibility record
- Report traceability audit

A signed, notarized, installed, or public application can still fail this scientific gate.

## Release decision record template

| Gate | Status | Date | Commit/version | Artifact hash or deployment ID | Evidence path | Open limitations | Owner sign-off |
|---|---|---|---|---|---|---|---|
| Source/scope freeze | NOT EVALUATED | — | — | — | — | — | — |
| Build | NOT EVALUATED | — | — | — | — | — | — |
| Test | NOT EVALUATED | — | — | — | — | — | — |
| Package | NOT EVALUATED | — | — | — | — | — | — |
| Install/launch | NOT EVALUATED | — | — | — | — | — | — |
| Signing/notarization | NOT EVALUATED | — | — | — | — | — | — |
| Public availability | NOT EVALUATED | — | — | — | — | — | — |
| Scientific evidence | NOT EVALUATED | — | — | — | — | — | — |

