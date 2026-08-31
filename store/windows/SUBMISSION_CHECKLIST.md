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
- [x] Package identity values provided to the Windows build without transcription changes and verified in the generated manifest
- [x] CausalPilot-specific Store ID `9NXZ3MJFFGFG` and PFN `LAIZEYU.CausalPilotAIbyLAIZEYU_jex0hdpdrk7qw` recorded; no identifier from another Store product used

Current state: submission `1152921505701778491` is `In certification`; reservation, identity capture, build binding, and exact manifest inspection are complete. The values are preserved in `PARTNER_CENTER_IDENTITY.md` and match the uploaded, server-validated AppX. This does not establish a certification pass or publication.

## 2. Source and licence

- [x] Public GitHub repository exists: `https://github.com/lzy2767865503-pixel/causalpilot-ai`
- [x] Release commit and annotated tag `v0.1.0` are frozen at `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`
- [x] Immutable Store-candidate tag `v0.1.0-store.1` is frozen at `3a46c94c68fa30c4a324aaad6f60f6fceb2dfe14`
- [x] Tagged GitHub build checked out the exact frozen tag in a clean hosted workspace
- [x] MIT `LICENSE` is present and names Copyright © 2026 LAI ZEYU (来泽宇)
- [x] `AUTHORS.md` and `NOTICE.md` are present in the public repository
- [x] Direct-download GitHub package contains the intended licence/authorship notices
- [x] Store AppX nested package inspection confirms the intended licence/authorship notices and application version
- [x] Public source archive and tagged GitHub release resolve to the frozen `v0.1.0` commit
- [x] AI-assistance disclosure is present and remains accurate for the current public source
- [x] Private vulnerability reporting is enabled and `SECURITY.md` provides the reporting policy

Current state: the public `v0.1.0` release and immutable `v0.1.0-store.1` Store-candidate tag are preserved separately. The Store AppX inspection verified packaged version, authorship, licence, notices, and byte parity for the tested core payload. This closes the Store package source/licence parity check; it does not prove AppX installation, certification, or availability.

## 3. Windows package

- [x] Final x64 production renderer/Electron build passes
- [x] Windows x64 local engine sidecar is built from the same frozen source
- [x] Final package targets `Windows.Desktop`
- [x] Manifest minimum OS `10.0.17763.0` and package version `1.0.0.0` inspected
- [x] Manifest identity exactly matches Partner Center
- [x] Application display name and publisher-facing metadata are correct
- [x] Required AppX asset references, dimensions, source hashes, and packaged author/copyright notices are correct
- [ ] AppX installation verifies the Start-menu entry, installed label, uninstall metadata, and uninstall behavior
- [x] Nested package scan confirms no source maps, `.env` files, certificate/private-key files, or recognized credential/token patterns
- [ ] Independent package check for private build paths and unintended non-synthetic datasets preserved
- [x] Final candidate hash and byte size recorded
- [ ] Final candidate copied to immutable release storage

Current state: immutable tag `v0.1.0-store.1` at `3a46c94c68fa30c4a324aaad6f60f6fceb2dfe14` was built in [run `33415607188`, job `99565393818`](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33415607188/job/99565393818). The inspected AppX is `CausalPilot-AI-0.1.0-windows-x64.appx`, 175,766,948 bytes, SHA-256 `3b5271b822e0a05663b8c7bb802f47914dac61b5f902b52cc02511b661744825`. Identity, manifest, assets, notices, nested secret scan, AMD64 PE structure/security flags, and AppX-to-tested-unpacked core-payload byte parity passed. Partner Center accepted this exact package and reports `Validated`. The AppX has not been installed or copied to permanent immutable archival storage.

## 4. Compatibility and runtime QA

- [ ] Install from the final package on Windows 10 22H2 x64 or the oldest supported practical target
- [ ] Install from the final package on Windows 11 24H2 x64
- [ ] Launch as a standard user
- [x] Automated tagged-package lifecycle on run `33409332005`: silent install returned 0, the installed packaged workflow completed, silent uninstall returned 0, and the installed executable was removed
- [x] Built-in synthetic workflow completes in the candidate-matched unpacked payload from run `33415607188`
- [ ] Native CSV chooser works
- [x] Valid binary CSV analysis completes in the candidate-matched packaged E2E workflow
- [ ] Valid continuous CSV analysis completes
- [ ] Invalid/duplicate/missing/SRM/sparse fixtures produce expected blocks or warnings
- [ ] Individual-employment-decision request is refused by the engine fixture
- [x] JSON export completes and contains no recognized raw-row collection in the candidate-matched packaged E2E workflow
- [ ] HTML export opens locally
- [ ] Close/relaunch/uninstall/reinstall work
- [ ] Offline run succeeds after installation
- [ ] High-DPI scaling at 100%, 125%, 150%, and 200% checked
- [ ] Window at minimum supported size has no inaccessible controls or horizontal clipping
- [ ] Keyboard-only smoke and screen-reader labels reviewed; do not claim accessibility certification unless the named standard passes

Current state: automated NSIS silent install/workflow/uninstall evidence remains valid for the public preview. The Store-candidate run separately proved packaged E2E behavior against the unpacked core payload whose main executable, sidecar, and app.asar hashes match the AppX. It did not install the AppX. Consumer Windows 10/11 clean installation, AppX Start-menu/uninstall behavior, real chooser interaction, standard-user testing, reinstall, offline-after-install observation, high-DPI, accessibility, and broader compatibility remain open.

## 5. Store certification preparation

- [ ] Windows App Certification Kit run against the final package; report preserved
- [ ] Microsoft Defender or equivalent consumer antivirus scan run; report preserved
- [x] Tagged NSIS install/workflow/uninstall report reviewed for run `33409332005`
- [ ] Package install/uninstall logs reviewed
- [x] Package capability list is minimal and matches product behavior: `runFullTrust` only
- [x] The sole restricted capability, `runFullTrust`, is identified and justified by the packaged full-trust Electron desktop runtime
- [ ] Dependency/advisory audit preserved
- [x] Sensitive-file and credential/token-pattern scan includes the expanded AppX and nested app.asar
- [ ] Independent personal-data scan of the final package preserved
- [x] Core Windows executables are AMD64 PE32+ with expected subsystems, ASLR, and DEP/NX flags
- [ ] Network observation on Windows confirms no app analysis traffic in the tested configuration
- [ ] Temporary-file and retention behavior reviewed on Windows

Current state: final AppX structure, capability, nested secret, authorship/notices, asset, PE, and payload-parity inspections passed. WACK, Defender/SmartScreen, AppX install/uninstall logs, independent network observation, independent personal-data scan, and Windows retention review remain pending.

## 6. Store metadata and public pages

- [x] English Store listing reports `Complete`
- [x] English text fields fit current documented limits: description 2,646/10,000 characters, short description 138/1,000 characters, 12/20 features, seven keywords, and copyright 155/200 characters
- [x] Four 1366 × 768 candidate-matched Windows screenshots captured and verified in run `33415607188`
- [x] Four screenshots uploaded to the English Store listing
- [ ] 300 × 300 Store tile inspected
- [ ] Optional Chinese listing explicitly says the UI is English
- [x] Public privacy policy exists in the public repository
- [x] Public support page and issue intake exist in the public repository
- [x] Public repository, MIT licence, authorship, and notices are available
- [x] Private vulnerability-reporting form is enabled
- [x] Partner Center Properties section reports `Complete`
- [x] Live category value recorded as Business → Data + analytics, with Productivity as the secondary category
- [x] Live generative-AI declaration recorded as No for 0.1.0
- [x] Live privacy answer recorded as Yes because the app accesses a user-selected file
- [x] IARC questionnaire completed and the Partner Center age-rating section reports `Complete`
- [ ] A named accessibility standard and preserved test evidence support any “tested accessible” claim
- [x] Pricing and availability section reports `Complete`; automatic publishing after certification selected

Current state: Pricing and availability, Properties, IARC age ratings, Submission options, Testing notes, Packages, and the English Store listing all report `Complete`; four candidate-matched screenshots are uploaded. The 300 × 300 listing tile and accessibility-standard evidence remain open. Completion badges do not mean certification or public availability.

## 7. Partner Center upload and certification

- [x] Exact final package uploaded
- [x] Partner Center package preprocessing reports `Validated` with no server validation error
- [x] Device family/architecture delivery limited to Windows 10/11 Desktop x64; future device families not selected
- [x] Pricing and availability, Properties, IARC age ratings, Submission options, Testing notes, Packages, and English listing all show `Complete`
- [x] Testing/reviewer notes match the uploaded package behavior and declared limitations
- [x] Uploaded package credential/token-pattern scan passed
- [x] Reviewer submission confirmed to contain no real personal/client data or credentials
- [ ] Legal declarations answered by the account owner
- [x] Automatic publishing after certification selected
- [x] Submission sent for certification on 2026-09-01; Partner Center reports `In certification`
- [x] Draft submission ID `1152921505701778491`, record date, and Partner Center overview screenshot preserved

Current state: **In certification — Submission complete; Pre-processing in progress at the first post-submit observation.** Automatic publishing remains scheduled only after a successful certification result. Do not describe this state as certified, published, or live.

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
- The final AppX/MSIX payload was neither installed on Windows nor byte-matched to the Windows-tested packaged payload. For this candidate, Partner Center validation plus recorded byte parity closes the pre-submission payload-equivalence gate; AppX installation remains an explicitly open post-signing/Store gate.
- Privacy/support URL is a placeholder, private page, or broken link.
- Screenshots were taken on macOS, a browser mock, or a different package.
- Package contains credentials, private datasets, personal information, or local build paths.
- Runtime behavior differs from the listing or reviewer notes.
- The package or repository licence/authorship does not name LAI ZEYU (来泽宇) correctly.
