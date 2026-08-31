# Notes for certification

**Package-specific draft for Partner Center; keep the note body below 2,000 characters.**

**Current portal state:** package validated; submission `1152921505701778491` is `In certification`

The Store listing is “CausalPilot AI by LAI ZEYU.” The in-app About page identifies the product as “CausalPilot AI.” Version 0.1.0 is an English-language, offline-first workbench for declared randomized two-arm experiments. Analysis requires no account, credential, payment, advertising, cloud service, or network connection after installation.

Fast review path:
1. Launch CausalPilot AI.
2. Select “Open synthetic experiment.” The built-in dataset/result is synthetic and contains no personal information.
3. Review the estimate, 95% confidence interval, sample sizes, diagnostics, practical threshold, and limitations.
4. Open Import, then “Open synthetic example,” to inspect field mapping and the locked plan.
5. Return to Results, choose Export evidence, and select a local destination. The app writes aggregate JSON and HTML, not raw rows.
6. Open About to verify version and authorship: LAI ZEYU (来泽宇).

For a user CSV, the native chooser accepts one UTF-8 CSV up to 100 MB. A bundled deterministic engine processes it locally. The app does not start an HTTP analysis server, transmit raw rows to the developer, or modify the source file.

Despite “AI” in the name, version 0.1.0 has no runtime generative-AI feature. Results and explanatory text are deterministic, so the generative-AI declaration is No.

The app is for aggregate experiment analysis. It rejects the individual-employment-decision target and must not rank or decide hiring, firing, promotion, compensation, performance, or employee risk.

No special hardware, driver, service, or login is required. The validated candidate targets Windows.Desktop x64, uses package version 1.0.0.0, and declares minimum OS 10.0.17763.0 (Windows 10 version 1809).

## Before pasting

- Confirm this text remains below 2,000 characters in Partner Center.
- If reviewer testing finds any difference, update the notes to the exact package behavior.
- Do not attach real user, customer, candidate, or employee data.
