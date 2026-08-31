# Notes for certification

**Behavioral draft; currently under Partner Center’s 2,000-character limit. Re-check every package-specific statement against the final AppX before pasting.**

The Store listing is “CausalPilot AI by LAI ZEYU.” The in-app About page identifies the product as “CausalPilot AI.” Version 0.1.0 is an English-language, offline-first workbench for declared randomized two-arm experiments. It requires no account, credential, payment, advertising, or cloud analysis service. Its analysis workflow works without a network connection after installation.

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

No special hardware, driver, service, or login is required. The final inspected package must target Windows.Desktop x64; its manifest supplies the minimum OS.

## Before pasting

- Confirm this text remains below 2,000 characters in Partner Center.
- Confirm the installed Start-menu/display label, package version, architecture, device family, and minimum OS against the final AppX manifest and installation evidence.
- If reviewer testing finds any difference, update the notes to the exact package behavior.
- Do not attach real user, customer, candidate, or employee data.
