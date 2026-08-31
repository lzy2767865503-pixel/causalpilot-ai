# Microsoft Store submission gates — CausalPilot AI 0.1.0 Windows

**Store-name candidate:** CausalPilot AI by LAI ZEYU  
**Owner:** LAI ZEYU (来泽宇)  
**Rule:** a downstream gate cannot convert an unverified upstream gate into evidence

## 1. Product and account identity

- [ ] Active Microsoft Partner Center developer account verified
- [ ] `CausalPilot AI by LAI ZEYU` reserved, or the exact approved alternative recorded
- [ ] Exact Package/Identity/Name copied from Partner Center
- [ ] Exact Publisher copied from Partner Center
- [ ] Publisher display name verified
- [ ] Package identity values provided to the Windows build without transcription changes
- [ ] No identifier from another Microsoft Store product reused

Current state: the full name was observed as available but is **PENDING_NAME_RESERVATION**; package identity remains **PENDING_PARTNER_CENTER_IDENTITY**.

## 2. Source and licence

- [x] Public GitHub repository exists: `https://github.com/lzy2767865503-pixel/causalpilot-ai`
- [ ] Release commit and tag are frozen
- [ ] Working tree is clean at build time
- [x] MIT `LICENSE` is present and names Copyright © 2026 LAI ZEYU (来泽宇)
- [x] `AUTHORS.md` and `NOTICE.md` are present in the public repository
- [ ] Packaged app contains the intended licence/authorship notices
- [ ] Source archive/release matches the tagged commit
- [x] AI-assistance disclosure is present and remains accurate for the current public source
- [x] Private vulnerability reporting is enabled and `SECURITY.md` provides the reporting policy

Current state: the public repository, MIT licence, authorship/notices, privacy/support content, AI-assistance disclosure, and private vulnerability-reporting route exist. No release tag is present, and the final Store AppX has not been inspected for packaged licence/authorship parity.

## 3. Windows package

- [ ] Final x64 production renderer/Electron build passes
- [ ] Windows x64 local engine sidecar is built from the same frozen source
- [ ] Final package targets `Windows.Desktop`
- [ ] Manifest minimum OS and package version inspected
- [ ] Manifest identity exactly matches Partner Center
- [ ] Application display name and publisher-facing metadata are correct
- [ ] Start menu entry, icon scales, uninstall metadata, and author/copyright are correct
- [ ] No development URL, test hook, source map, private path, `.env`, secret, credential, or real dataset is present
- [ ] Final candidate hash and byte size recorded
- [ ] Final candidate copied to immutable release storage

Current state: GitHub Actions run `33406656618` built the Windows distributions at commit `612a618a3de36ab53865354f9e8f0a5e9a05c26a`, silently installed the NSIS package, exercised the installed application, silently uninstalled it, and confirmed removal of the installed executable on Windows Server 2022 x64. This closes an automated Windows install/workflow/uninstall preflight gate only. The Partner Center-identity-bound final Store AppX remains **PENDING_FINAL_STORE_APPX**.

## 4. Compatibility and runtime QA

- [ ] Install from the final package on Windows 10 22H2 x64 or the oldest supported practical target
- [ ] Install from the final package on Windows 11 24H2 x64
- [ ] Launch as a standard user
- [x] Automated NSIS preflight on run `33406656618`: silent install returned 0, the installed packaged workflow completed, silent uninstall returned 0, and the installed executable was removed
- [ ] Built-in synthetic workflow completes
- [ ] Native CSV chooser works
- [ ] Valid binary CSV analysis completes
- [ ] Valid continuous CSV analysis completes
- [ ] Invalid/duplicate/missing/SRM/sparse fixtures produce expected blocks or warnings
- [ ] Individual-employment-decision request is refused by the engine fixture
- [ ] JSON export completes and contains no raw rows/local paths
- [ ] HTML export opens locally
- [ ] Close/relaunch/uninstall/reinstall work
- [ ] Offline run succeeds after installation
- [ ] High-DPI scaling at 100%, 125%, 150%, and 200% checked
- [ ] Window at minimum supported size has no inaccessible controls or horizontal clipping
- [ ] Keyboard-only smoke and screen-reader labels reviewed; do not claim accessibility certification unless the named standard passes

Current state: automated NSIS silent install, installed-app workflow, silent uninstall, and executable-removal verification passed on Windows Server 2022 x64. Consumer Windows 10/11 clean installation, real chooser interaction, standard-user testing, reinstall, offline observation, high-DPI, accessibility, and broader compatibility remain open.

## 5. Store certification preparation

- [ ] Windows App Certification Kit run against the final package; report preserved
- [ ] Microsoft Defender or equivalent consumer antivirus scan run; report preserved
- [x] Preflight NSIS install/workflow/uninstall report reviewed for run `33406656618`
- [ ] Package install/uninstall logs reviewed
- [ ] Package capability list is minimal and matches product behavior
- [ ] Restricted capabilities absent or separately justified
- [ ] Dependency/advisory audit preserved
- [ ] Secret and personal-data scan includes nested package contents
- [ ] Network observation on Windows confirms no app analysis traffic in the tested configuration
- [ ] Temporary-file and retention behavior reviewed on Windows

Current state: a successful direct Windows packaged preflight exists, but WACK, Defender, package install/uninstall logs, independent network observation, Windows retention review, restricted-capability review for the final identity-bound package, and final Store AppX inspection remain pending.

## 6. Store metadata and public pages

- [ ] English listing copy reviewed against the exact package
- [ ] At least four final Windows screenshots captured and hashed
- [x] Four 1366 × 768 packaged Windows preflight screenshots captured in run `33406656618`; these are not final Store AppX screenshots
- [ ] 300 × 300 Store tile inspected
- [ ] Optional Chinese listing explicitly says the UI is English
- [x] Public privacy policy exists in the public repository
- [x] Public support page and issue intake exist in the public repository
- [x] Public repository, MIT licence, authorship, and notices are available
- [x] Private vulnerability-reporting form is enabled
- [ ] Category is Business → Data + analytics
- [ ] Generative-AI declaration is No for 0.1.0
- [ ] Privacy question is Yes because the app accesses a user-selected file
- [ ] IARC questionnaire completed accurately and generated rating saved
- [ ] “Tested accessible” remains unchecked unless substantiated
- [ ] Price, markets, discoverability, and release hold intentionally chosen

Current state: public metadata/support foundations exist, and four packaged-preflight screenshots are preserved. The English listing still requires review against the final Store AppX; final AppX screenshots, Store tile review, IARC output, pricing/markets/release choices, and Partner Center completion remain pending.

## 7. Partner Center upload and certification

- [ ] Exact final package uploaded
- [ ] Partner Center package preprocessing reports no errors
- [ ] Device family/architecture delivery table reviewed
- [ ] All submission sections show complete
- [ ] Reviewer notes match the uploaded package
- [ ] No real personal/client data or credential supplied
- [ ] Legal declarations answered by the account owner
- [ ] Submission sent for certification
- [ ] Submission ID, timestamp, and screenshot preserved

Permitted status after this section: **Submitted for certification** or **In certification**, never “live.”

## 8. Publication verification

- [ ] Certification result reviewed
- [ ] Any failure report preserved and fixed in a new version without overwriting failed evidence
- [ ] Status becomes `In the Store`
- [ ] Public product-detail URL opens in a signed-out browser
- [ ] Listing text, screenshots, author, price, age rating, privacy, and support links verified
- [ ] Acquisition/install from Microsoft Store tested on a clean Windows target
- [ ] Installed Store binary/version identity matches the submitted release
- [ ] Built-in sample, local analysis, and evidence export re-tested from the Store-installed build
- [ ] Public URL and final evidence archived

Only after all applicable items pass may the project say: **“CausalPilot AI is available in Microsoft Store.”**

## Stop conditions

Do not submit if any of these is true:

- Partner Center identity is absent or guessed.
- Final AppX/MSIX was not installed and tested on Windows.
- Privacy/support URL is a placeholder, private page, or broken link.
- Screenshots were taken on macOS, a browser mock, or a different package.
- Package contains credentials, private datasets, personal information, or local build paths.
- Runtime behavior differs from the listing or reviewer notes.
- The package or repository licence/authorship does not name LAI ZEYU (来泽宇) correctly.
