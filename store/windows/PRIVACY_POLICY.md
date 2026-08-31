# CausalPilot AI Privacy Policy — Windows

**Effective date:** 2026-08-31  
**Applies to:** CausalPilot AI 0.1.0 for Windows  
**Developer and accountable owner:** LAI ZEYU (来泽宇)

## Summary

CausalPilot AI is an offline-first desktop application for analysing declared randomized two-arm experiments. Version 0.1.0 does not require an account and does not include developer-operated cloud analysis, advertising, telemetry integration, or a runtime generative-AI service.

The application accesses a CSV only after the user chooses that file. The CSV is processed locally on the user’s Windows device by the application’s bundled deterministic engine. CausalPilot AI does not send the selected file, its rows, or the calculated result to LAI ZEYU.

## Information the application can access

When the user selects a CSV, CausalPilot AI can access:

- The selected file’s contents
- Its filename, size, and last-modified time
- Column names and the field roles chosen by the user
- Experiment configuration such as treatment/control values, outcome type, expected allocation, and business threshold
- Aggregate analysis results, diagnostics, and reproducibility identifiers

A CSV may contain personal or sensitive information if the user puts such information in it. CausalPilot AI does not require names, email addresses, telephone numbers, government identifiers, resumes, performance reviews, or free-text employee records. Users should remove fields that are not necessary for the declared analysis and should not use version 0.1.0 for individual employment decisions.

## How information is used

Selected information is used only to:

- Display columns for field mapping
- Validate the declared experiment design and input data
- Calculate aggregate statistical results locally
- Display diagnostics and deterministic explanatory text
- Create an evidence export if the user explicitly requests one

The application does not use uploaded data to train a model, profile users, serve advertising, sell information, or make an individual hiring, firing, promotion, compensation, performance, or employee-risk recommendation.

## Collection and transmission

LAI ZEYU does not receive or collect the user’s selected CSV, row-level data, analysis configuration, or results through CausalPilot AI 0.1.0. The application does not intentionally transmit these items to a third party.

The app does not start an HTTP analysis server. Electron passes a local file reference and structured analysis configuration directly to a bundled local engine process. There is no runtime call to a generative-AI API.

Microsoft may separately process Store acquisition, licensing, updates, payments (if any are introduced in a later release), device, or diagnostic information under Microsoft’s own terms and privacy statements. That processing is outside CausalPilot AI’s local experiment-analysis workflow.

## Storage and retention

CausalPilot AI does not intentionally copy or modify the selected source CSV and does not maintain an application database of raw experiment rows. A short-lived in-process file capability is used after file selection and expires after approximately 30 minutes or when the application process ends.

Aggregate evidence is written only when the user selects an export action and destination. Exported JSON and HTML files remain at that destination until the user moves or deletes them. The application cannot delete copies made by Windows backup, sync, antivirus, indexing, or other software. Standard operating-system or runtime caches and diagnostic records may be controlled by Windows, Microsoft Store, Electron, or device-management settings rather than by CausalPilot AI.

## Security

Version 0.1.0 limits file selection to a user-initiated local chooser, constrains accepted CSV files, isolates the renderer from Node.js, invokes the local engine without a shell, redacts local paths from structured results, and rejects recognized raw-row collections from evidence export. These measures reduce risk but do not guarantee perfect security or anonymity.

Users remain responsible for lawful authority to process their data, appropriate access controls, backups, endpoint security, and safe handling of source and exported files.

## Children

CausalPilot AI is a professional analytics tool and is not directed to children. The developer does not knowingly collect children’s personal information through the application. Users must not import children’s personal information without an appropriate lawful basis and safeguards.

## Sharing and sale

LAI ZEYU does not sell data accessed through CausalPilot AI 0.1.0. Because the application does not transmit the selected dataset or results to the developer, the developer does not disclose those items to advertisers, data brokers, or analytics providers through the application.

## User choices

Users control which CSV is selected and whether an evidence file is exported. Closing the application ends the active local session. Users can delete exported evidence using Windows File Explorer and can uninstall the application through Windows Settings. If a Microsoft Store edition is later published, Store management surfaces may also be available; this policy does not claim that the app is currently available in Microsoft Store.

## Changes

This policy applies to Windows version 0.1.0. A future release that adds cloud sync, accounts, telemetry, external AI, collaboration, or a different data-retention model will require an updated policy before release. The effective date and version scope will be changed when the policy changes.

## Contact

Privacy questions and requests can be submitted through the project’s public support page:

https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/store/windows/SUPPORT.md

Do not include CSV rows, personal identifiers, confidential experiment data, credentials, or private local paths in a public support request.
