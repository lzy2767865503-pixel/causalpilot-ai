# Microsoft Store draft record — `v0.1.0-store.1`

**Product:** CausalPilot AI by LAI ZEYU

**Author and product owner:** LAI ZEYU (来泽宇)

**Record date:** 2026-09-01

**Partner Center state:** **In draft**

**Certification state:** **Not submitted for certification**

**Microsoft Store availability:** **Not published / not publicly available**

This record binds the inspected Store upload candidate to its frozen source,
automated build, Partner Center draft, and preserved evidence. A Partner Center
section marked `Complete` and a package marked `Validated` are draft-readiness
signals only; neither is Microsoft certification, Store signing, publication,
or public availability.

## Frozen build identity

| Field | Exact value |
| --- | --- |
| Store candidate tag | [`v0.1.0-store.1`](https://github.com/lzy2767865503-pixel/causalpilot-ai/tree/v0.1.0-store.1) |
| Source commit | [`3a46c94c68fa30c4a324aaad6f60f6fceb2dfe14`](https://github.com/lzy2767865503-pixel/causalpilot-ai/commit/3a46c94c68fa30c4a324aaad6f60f6fceb2dfe14) |
| GitHub Actions workflow | [`Microsoft Store AppX candidate`, run `33415607188`](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33415607188) — `success` |
| GitHub Actions job | [`Build and inspect Store AppX`, job `99565393818`](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33415607188/job/99565393818) — `success` |
| Candidate file | `CausalPilot-AI-0.1.0-windows-x64.appx` |
| Candidate size | `175766948` bytes |
| Candidate SHA-256 | `3b5271b822e0a05663b8c7bb802f47914dac61b5f902b52cc02511b661744825` |
| Pre-Store Authenticode state | `NotSigned`; the upload candidate is intended for Microsoft Store processing and re-signing |

The 175,766,948-byte AppX is intentionally **not copied into Git**. This
directory preserves its hash, inspected manifest, runtime inspection, packaged
workflow report, and screenshots without adding the large binary to repository
history.

## Manifest, identity, and authorship

| Field | Inspected value |
| --- | --- |
| Store ID | `9NXZ3MJFFGFG` |
| Submission ID | `1152921505701778491` |
| Package identity name | `LAIZEYU.CausalPilotAIbyLAIZEYU` |
| Publisher | `CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8` |
| Publisher display name | `LAI ZEYU` |
| Application display name | `CausalPilot AI by LAI ZEYU` |
| Author | `LAI ZEYU (来泽宇)` |
| Application ID | `CausalPilotAI` |
| Manifest version | `1.0.0.0` |
| Architecture | `x64` |
| Target device family | `Windows.Desktop` |
| Minimum OS version | `10.0.17763.0` |
| Maximum version tested declared in manifest | `10.0.26100.0` |
| Application executable | `app\\CausalPilot AI.exe` |
| Restricted capability | `runFullTrust` |

The inspected package contains LAI ZEYU (来泽宇) authorship and project notices,
the Electron and Chromium licences, the packaged application archive, and the
native local-analysis sidecar. Its recorded secret scan passed with no sensitive
file or token-pattern matches. These checks concern this exact candidate; they
do not grant Microsoft approval.

## Partner Center draft sections

The Partner Center overview remains **In draft** with submission ID
`1152921505701778491`. The following state was observed and saved in that draft:

| Draft section | Recorded state |
| --- | --- |
| Pricing and availability | `Complete` |
| Properties | `Complete` |
| Age ratings | `Complete` |
| Packages | `Complete`; `CausalPilot-AI-0.1.0-windows-x64.appx` is `Validated` |
| Store listings | `Complete` |
| Submission options | Saved; automatically publish as soon as the submission passes certification |
| Additional Testing Information | Final package-specific reviewer notes saved successfully (`1721` characters); no credentials supplied or required for the offline workflow |

The contemporaneous portal capture
`partner-center-draft-overview.png` is `72561` bytes with SHA-256
`66216965173a609ed9089cb392f040909cd2d35815296e961f25d3b4a3da1617`.
It shows the `In draft` overview, the still-available `Submit` action, the
completed section indicators, and the AppX package marked `Validated`. Its
scope is the Partner Center draft UI state shown in the image; it does not
establish certification or publication.

The automatic-publish selection is only a future release instruction. It has no
effect until the draft is submitted, passes certification, and Microsoft
publishes the product.

The contemporaneous `partner-center-reviewer-notes-saved.png` capture is
`78532` bytes with SHA-256
`a583d7ec674d1855b30e5d55f8305914439625ad8a3732aa070a384a25d3ee1c`.
It shows the package-specific certification notes in Partner Center and an
empty Credentials table.

## IARC preview

The completed age-ratings draft shows the following preview:

| Board / region | Preview rating |
| --- | --- |
| IARC generic | `3+` |
| Microsoft | `3+` |
| ESRB | `Everyone` |
| PEGI | `3` |
| USK | `Everyone` |
| Other displayed regions | Equivalent low-age/general-audience ratings |

The current **Rating ID is `Pending`**. The preview is not a final issued rating
record and remains subject to submission, certification, and publication.

## Store listing screenshots

All four preserved PNGs are 1366 × 768 captures from the packaged Windows x64
executable produced by the frozen workflow:

| File | SHA-256 |
| --- | --- |
| `windows-store/01-overview-1366x768.png` | `080d92f628ef8e07ec8c761da37ce6880d53e1c6eb81588dac6005d07ea2ed95` |
| `windows-store/02-import-mapping-1366x768.png` | `00a529fbba0cd9d5365913af7e6a8ccd736dec97067eb0f8ae189301aecc0060` |
| `windows-store/03-local-results-1366x768.png` | `a75351dcf56bb96f512be96aafdc2536c6657e793879b6b86ff794848808f3c6` |
| `windows-store/04-evidence-reports-1366x768.png` | `a2364a493b4ad85c1a089932b42ba1d075145f5be81c6cd384ff33a0fddea862` |

The capture exercised the packaged renderer, Windows x64 sidecar, Unicode input
path, validation, local analysis, results, and evidence export. Only the native
file chooser response was stubbed inside the disposable automation process.
These are packaged-build screenshots, not proof of an identity-bound AppX
installation from Microsoft Store.

## Preserved evidence

- `store-appx-inspection.json` — exact AppX hash, identity, payload, asset,
  secret-scan, and validation-boundary record.
- `AppxManifest-inspected.xml` — manifest extracted from the exact candidate.
- `SHA256SUMS-appx.txt` — AppX checksum record.
- `windows-runtime-architecture-report.json` — static PE architecture and
  mitigation inspection.
- `packaged-e2e-report.json` — packaged local-engine and evidence-export test.
- `windows-store-capture-report.json` — screenshot provenance and UI checks.
- `windows-store/*.png` — four listing screenshots with hashes above.
- `partner-center-draft-overview.png` — Partner Center draft overview capture,
  `72561` bytes, SHA-256
  `66216965173a609ed9089cb392f040909cd2d35815296e961f25d3b4a3da1617`.
- `partner-center-reviewer-notes-saved.png` — saved certification-notes capture
  with no credentials, `78532` bytes, SHA-256
  `a583d7ec674d1855b30e5d55f8305914439625ad8a3732aa070a384a25d3ee1c`.

## Gates that remain open

As of this record, none of the following has been established for this
candidate:

- submission to Microsoft certification or a certification result;
- Microsoft Store signing or acquisition of the Microsoft-signed package;
- public listing availability or a successful public Store install;
- Windows App Certification Kit (WACK) pass in an interactive Windows session;
- Microsoft Defender malware-scan evidence;
- SmartScreen reputation or warning-free direct-download evidence;
- clean consumer Windows 10 x64 installation and workflow testing;
- clean consumer Windows 11 x64 installation and workflow testing.

Accordingly, the evidence-safe status is: **identity-bound AppX built and
inspected; Partner Center package validated and all recorded draft sections
completed; submission remains In draft; certification and Store availability
remain unproven.**
