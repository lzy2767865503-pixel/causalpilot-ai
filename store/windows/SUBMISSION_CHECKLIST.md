# Microsoft Store submission gates — CausalPilot AI 0.1.0 Windows

**Store-name candidate:** CausalPilot AI by LAI ZEYU  
**Owner:** LAI ZEYU (来泽宇)  
**Rule:** a downstream gate cannot convert an unverified upstream gate into evidence

## 1. Product and account identity

- [x] Active Microsoft Partner Center developer account reached and product reservation completed
- [x] `CausalPilot AI by LAI ZEYU` reserved
- [x] Exact Package/Identity/Name copied from Partner Center: `LAIZEYU.CausalPilotAIbyLAIZEYU`
- [x] Exact Publisher copied from Partner Center: `CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8`
- [x] Publisher display name verified: `LAI ZEYU`
- [ ] Package identity values provided to the Windows build without transcription changes
- [x] CausalPilot-specific Store ID `9NXZ3MJFFGFG` and PFN `LAIZEYU.CausalPilotAIbyLAIZEYU_jex0hdpdrk7qw` recorded; no identifier from another Store product used

Current state: the product is `In draft`; reservation and identity capture are complete. The exact values are preserved in `PARTNER_CENTER_IDENTITY.md`. Build binding and final manifest inspection remain open, so **PENDING_FINAL_STORE_APPX** is still a hard gate.

## 2. Source and licence

- [x] Public GitHub repository exists: `https://github.com/lzy2767865503-pixel/causalpilot-ai`
- [x] Release commit and annotated tag `v0.1.0` are frozen at `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`
- [x] Tagged GitHub build checked out the exact frozen tag in a clean hosted workspace
- [x] MIT `LICENSE` is present and names Copyright © 2026 LAI ZEYU (来泽宇)
- [x] `AUTHORS.md` and `NOTICE.md` are present in the public repository
- [x] Direct-download GitHub package contains the intended licence/authorship notices; final Store AppX remains a separate inspection gate
- [x] Public source archive and tagged GitHub release resolve to the frozen `v0.1.0` commit
- [x] AI-assistance disclosure is present and remains accurate for the current public source
- [x] Private vulnerability reporting is enabled and `SECURITY.md` provides the reporting policy

Current state: the annotated `v0.1.0` tag, public source archive, reviewed GitHub Windows x64 pre-release, MIT licence, packaged direct-download authorship/notices, privacy/support content, AI-assistance disclosure, and private vulnerability-reporting route exist. This closes the GitHub-release source/licence gate only; the final Store AppX has not been created or inspected for packaged licence/authorship parity.

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

Current state: GitHub Actions run `33409332005` built the public Windows distributions from tagged commit `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`, silently installed the NSIS package, exercised the installed application, silently uninstalled it, and confirmed removal of the installed executable on Windows Server 2022 x64. The reviewed public installer is 123,901,221 bytes with SHA-256 `3d8f12ea5dc999cd014710ef78c7e6dcce467a2aa20c5a609f37ca35b116a0ce`. This closes the direct-download GitHub preview package gate only. All Store-package checklist items above remain open, and the Partner Center-identity-bound final Store AppX remains **PENDING_FINAL_STORE_APPX**.

## 4. Compatibility and runtime QA

- [ ] Install from the final package on Windows 10 22H2 x64 or the oldest supported practical target
- [ ] Install from the final package on Windows 11 24H2 x64
- [ ] Launch as a standard user
- [x] Automated tagged-package lifecycle on run `33409332005`: silent install returned 0, the installed packaged workflow completed, silent uninstall returned 0, and the installed executable was removed
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
- [x] Tagged NSIS install/workflow/uninstall report reviewed for run `33409332005`
- [ ] Package install/uninstall logs reviewed
- [ ] Package capability list is minimal and matches product behavior
- [ ] Restricted capabilities absent or separately justified
- [ ] Dependency/advisory audit preserved
- [ ] Secret and personal-data scan includes nested package contents
- [ ] Network observation on Windows confirms no app analysis traffic in the tested configuration
- [ ] Temporary-file and retention behavior reviewed on Windows

Current state: a reviewed public tagged GitHub Windows preview exists, but WACK, Defender, package install/uninstall logs, independent network observation, Windows retention review, restricted-capability review for the final identity-bound package, and final Store AppX inspection remain pending.

## 6. Store metadata and public pages

- [ ] English listing copy reviewed against the exact package
- [x] English text fields fit current documented limits: description 2,646/10,000 characters, short description 138/1,000 characters, 12/20 features, seven keywords, and copyright 155/200 characters
- [ ] At least four final Windows screenshots captured and hashed
- [x] Four 1366 × 768 tagged packaged Windows screenshots captured in run `33409332005`; these are not final Store AppX screenshots
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

Current state: public metadata/support foundations exist, the public GitHub preview is available at `https://github.com/lzy2767865503-pixel/causalpilot-ai/releases/tag/v0.1.0`, the English text fields pass current limit checks, and four tagged-package screenshots are preserved. Exact wording/behavior review against the final Store AppX, final AppX screenshots, Store tile review, IARC output, pricing/markets/release choices, and Partner Center section completion remain pending.

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
