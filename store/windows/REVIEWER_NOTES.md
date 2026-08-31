# Notes for certification

**Ready-to-paste draft; keep under Partner Center’s 2,000-character limit.**

The Store product “CausalPilot AI by LAI ZEYU” installs as “CausalPilot AI.” Version 0.1.0 is an English-language, offline-first desktop workbench for declared randomized two-arm experiments. No account, credential, subscription, payment, advertising, cloud analysis service, or network connection is required after installation.

Fast review path:
1. Launch CausalPilot AI.
2. Select “Open synthetic experiment” on the overview page. This built-in dataset/result is synthetic and contains no personal information.
3. Review the effect estimate, 95% confidence interval, sample sizes, sample-ratio-mismatch status, quality diagnostics, practical threshold, and limitations.
4. Open Import and choose “Open synthetic example” to review field mapping and the locked analysis plan.
5. Return to Results and choose Export evidence. Select a local destination. The app creates aggregate JSON and static HTML evidence; it does not export raw rows.
6. Open About to verify version and authorship: LAI ZEYU (来泽宇).

For a user CSV, the app opens a native file chooser, accepts one UTF-8 CSV up to 100 MB, and processes it locally using a bundled deterministic engine. It does not start an HTTP analysis server or transmit raw rows to the developer. The source file is not modified.

Despite “AI” in the product name, version 0.1.0 contains no runtime generative-AI feature. Numeric results and explanatory text are deterministic. The generative-AI product declaration is therefore answered No.

The app is for aggregate experiment analysis. It rejects the structured individual-employment-decision target and must not be used to rank or decide hiring, firing, promotion, compensation, performance, or employee risk.

No special hardware, driver, service, or login is required. The submitted package targets Windows.Desktop x64 and the minimum OS shown in its final manifest.

## Before pasting

- Confirm this text remains below 2,000 characters in Partner Center.
- Replace “submitted package” claims if the final package target differs.
- If reviewer testing finds any difference, update the notes to the exact package behavior.
- Do not attach real user, customer, candidate, or employee data.
