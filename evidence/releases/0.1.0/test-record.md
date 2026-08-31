# Test Record — CausalPilot AI 0.1.0

**Owner:** LAI ZEYU (来泽宇)  
**Test date:** 2026-08-31

## Passing checks

- `npm test`: 3 test files, 14/14 tests passed.
- `npm run test:engine`: 14/14 tests passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed.
- `npm audit --json`: 0 known vulnerabilities reported.
- `npm audit --omit=dev --json`: 0 known vulnerabilities reported.
- Browser visual smoke: 1504 × 1046 and 390 × 844; no horizontal overflow; no captured console error.
- Package E2E from local app directory: passed after the export harness was fixed to wait for both atomically written output files.
- Package E2E from the read-only mounted DMG: passed with a 120-second launch allowance.
- Export assertions: JSON schema `causalpilot.evidence.v1`; author `LAI ZEYU (来泽宇)`; sample dataset hash matched; no recognized raw-row collection; HTML credited the author.
- Secret-pattern scan: no OpenAI-style key, Google API key, AWS access key, or private-key header matched in the source scope or extracted `app.asar`. This was a pattern scan, not a formal secrets audit.

## Preserved failure information

- The first exact-DMG automation attempt reached Electron's debugger endpoints but exceeded the 30-second launch timeout. A second run with a 120-second allowance completed successfully. This establishes success on the current machine but records potentially slow first launch from a mounted image.
- One local package-E2E attempt detected the evidence folder before the second atomic output file existed. The harness was corrected to wait for both JSON and HTML files; the application export subsequently passed locally and from the mounted DMG.
- Formal holdout command exited 1 with: `Refusing formal holdout: a clean repository with an existing Git commit is required.` This is expected claim-control behaviour.

The native file/folder chooser result was stubbed only inside the disposable E2E process. Production opaque file tokens, file validation and change detection, bundled sidecar execution, renderer adaptation, export sanitizer, and result rendering were exercised.
