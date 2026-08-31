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

- [ ] Public GitHub repository exists
- [ ] Release commit and tag are frozen
- [ ] Working tree is clean at build time
- [ ] MIT `LICENSE` is present and names Copyright © 2026 LAI ZEYU (来泽宇)
- [ ] `AUTHORS.md` and `NOTICE.md` are present
- [ ] Packaged app contains the intended licence/authorship notices
- [ ] Source archive/release matches the tagged commit
- [ ] AI-assistance disclosure remains accurate

Current state: repository work is being prepared; **no public URL should be inferred until verified**.

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

Current state: **PENDING_WINDOWS_PACKAGE_EVIDENCE**

## 4. Compatibility and runtime QA

- [ ] Install from the final package on Windows 10 22H2 x64 or the oldest supported practical target
- [ ] Install from the final package on Windows 11 24H2 x64
- [ ] Launch as a standard user
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

Current state: **not established by macOS evidence**.

## 5. Store certification preparation

- [ ] Windows App Certification Kit run against the final package; report preserved
- [ ] Microsoft Defender or equivalent consumer antivirus scan run; report preserved
- [ ] Package install/uninstall logs reviewed
- [ ] Package capability list is minimal and matches product behavior
- [ ] Restricted capabilities absent or separately justified
- [ ] Dependency/advisory audit preserved
- [ ] Secret and personal-data scan includes nested package contents
- [ ] Network observation on Windows confirms no app analysis traffic in the tested configuration
- [ ] Temporary-file and retention behavior reviewed on Windows

Current state: pending Windows runner and package identity.

## 6. Store metadata and public pages

- [ ] English listing copy reviewed against the exact package
- [ ] At least four final Windows screenshots captured and hashed
- [ ] 300 × 300 Store tile inspected
- [ ] Optional Chinese listing explicitly says the UI is English
- [ ] Public privacy policy URL opens without login
- [ ] Public support URL opens without login
- [ ] Public repository/licence URL opens without login
- [ ] Category is Business → Data + analytics
- [ ] Generative-AI declaration is No for 0.1.0
- [ ] Privacy question is Yes because the app accesses a user-selected file
- [ ] IARC questionnaire completed accurately and generated rating saved
- [ ] “Tested accessible” remains unchecked unless substantiated
- [ ] Price, markets, discoverability, and release hold intentionally chosen

Current state: copy prepared; public URLs and screenshots pending.

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
