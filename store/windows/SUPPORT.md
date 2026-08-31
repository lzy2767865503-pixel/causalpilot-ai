# CausalPilot AI Support — Windows

**Developer:** LAI ZEYU (来泽宇)  
**Supported release:** 0.1.0 for Windows x64

## Support channel

https://github.com/lzy2767865503-pixel/causalpilot-ai/issues/new/choose

The public issue tracker is maintained by LAI ZEYU (来泽宇). Microsoft does not provide product support on the developer’s behalf.

Never attach a private CSV, personal identifiers, employee or customer records, API keys, credentials, or confidential business results to a public issue. Reproduce a problem with the built-in synthetic example or a newly generated minimal synthetic file whenever possible.

## Quick checks

1. Confirm the device runs 64-bit Windows 10 version 1809 or later.
2. Install the Microsoft Store build associated with the reported version.
3. Open the built-in synthetic experiment to distinguish an application problem from a data-specific problem.
4. For CSV imports, use a UTF-8 comma-separated file no larger than 100 MB, with a unique non-empty header row.
5. Map one analysis-unit ID, one assigned-treatment field, and one primary outcome.
6. For causal wording, confirm the input represents assigned randomized treatment rather than post-treatment usage or observational exposure.

## Include in a safe bug report

- CausalPilot AI version
- Windows edition and version
- Processor architecture
- Whether the built-in synthetic experiment works
- The visible error message, with personal data and local paths removed
- Reproduction steps using synthetic data
- Whether the issue occurs before import, during validation, during local analysis, or during export

## Current scope

CausalPilot AI 0.1.0 supports declared randomized two-arm experiments with binary or continuous outcomes. It does not implement observational causal identification, Difference-in-Differences, propensity-score matching, causal forests, cloud collaboration, or runtime generative AI. HR use is restricted to aggregate programme, policy, cohort, or team-level interventions; individual employment decisions are refused.

## Privacy and security reports

If a report may expose a vulnerability or private information, do not post sensitive details publicly. The public repository must provide a private vulnerability-reporting route before Store submission. Until that route exists, this support page is not submission-ready.
