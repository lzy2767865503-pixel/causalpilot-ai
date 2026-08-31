# Open-source publication checklist

This file separates repository preparation from actions that can only be
verified after a GitHub repository and release exist.

## Completed in the local source tree

- [x] MIT project licence names LAI ZEYU (来泽宇) as copyright holder.
- [x] Package metadata and project notices use the same licence boundary.
- [x] Contribution, conduct, and private security-reporting policies exist.
- [x] Structured issue forms and a pull-request checklist protect evidence and
  data-safety boundaries.
- [x] CI definitions validate renderer/Electron source and the Python engine on
  Linux and Windows.
- [x] CodeQL, dependency review, Dependabot, and a Windows release workflow are
  defined.
- [x] Truthful Windows preview release notes exist and are published with the release.
- [x] A release-preparation scan of 105 source-tree text files found no high-confidence private-key, AWS,
  GitHub, OpenAI, Google, Slack, Stripe, credential-URL, or JWT patterns. No
  `.env`, signing-key, certificate, or provisioning-profile files were found.
- [x] The final `v0.1.0` evidence bundle and four screenshots were scanned for
  credentials and private/local paths; reports use `%GITHUB_WORKSPACE%`
  redactions and no sensitive value was found.
- [x] The locked JavaScript tree declared a licence for every resolved package
  in the local audit; this is an inventory check, not legal advice.

## Completed or verified on GitHub

- [x] The MIT source repository is public at
  `https://github.com/lzy2767865503-pixel/causalpilot-ai`.
- [x] The public history, preflight commits, and tagged release commit are
  recorded; annotated tag `v0.1.0` resolves to
  `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`.
- [x] Private vulnerability reporting, secret scanning, and secret-scanning
  push protection are enabled.
- [x] `LICENSE`, `CITATION.cff`, contribution/security files, issue forms, and
  the MIT package metadata are present in the public repository.
- [x] Source validation run `33409072874` and Security review run `33409072634`
  completed successfully for tagged commit
  `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`.
- [x] GitHub-hosted Windows Server 2022 installer preflight 33406656618
  completed successfully: 17 frontend tests, 15 engine tests, Unicode-path
  sidecar smoke, silent install, installed-app E2E/export, silent uninstall,
  main-executable removal, and four 1366 × 768 screenshots passed.
- [x] The preflight recorded these exact SHA-256 values:
  - `22cf9261e8bf86f21637764c0c1d4f4807b0bce24567d22a1b9fa1020f4cdc88`
    — `CausalPilot-AI-0.1.0-windows-x64-setup.exe`
  - `70cffa566f09fd105e64c9f83965e9bc5e5daeb7c6875201cfb50fe58aaa9c74`
    — `CausalPilot-AI-0.1.0-windows-x64.zip`
- [x] Annotated tag `v0.1.0` resolves to
  `b2a226ac9e2623ba210a192095d2feb2eb7dacf4` and the tagged Windows run
  `33409332005` passed every build, test, installer, screenshot, checksum, and
  draft-release job.
- [x] The public GitHub pre-release is available at
  `https://github.com/lzy2767865503-pixel/causalpilot-ai/releases/tag/v0.1.0`.
- [x] Final public installer SHA-256:
  `3d8f12ea5dc999cd014710ef78c7e6dcce467a2aa20c5a609f37ca35b116a0ce`.
- [x] Final public ZIP SHA-256:
  `76fca35d57595f480a06c4e89d51e28b4f8e424d3e737a26ffdbe84ae508d790`.
- [x] The installer, ZIP, reports, screenshots, final checksum file, workflow
  run, tag, and public release record are preserved; unauthenticated release
  and asset endpoints returned HTTP 200.
- [x] A draft release was created first; its binary hashes, byte sizes, ZIP
  integrity, checksum portability, release notes, and tag were reviewed before
  publication as a public pre-release.

## Still required for Store and stronger release claims

- [ ] Protect the default branch and require passing source-validation and
  security checks before merge.
- [ ] Enable Dependabot security updates if repository policy permits; they
  were disabled at this evidence snapshot.
- [ ] Install the exact NSIS package on clean Windows 10 and Windows 11 targets;
  test the native chooser, launch, offline workflow, uninstall, and reinstall.
- [ ] Complete trusted Windows signing, WACK, Defender, capability, network,
  DPI/accessibility, and retention checks where applicable.
- [ ] Obtain and verify exact Partner Center name, Identity, Publisher, and
  Publisher display-name values before producing the Store AppX candidate.
- [ ] Keep Microsoft Store upload, certification, signed-out listing access,
  acquisition, and Store-installed retesting as separate gates.

The tagged Windows preview establishes public GitHub binary availability plus a
hosted `win32`/`x64` install/workflow/uninstall smoke and main-executable removal
check. It does not establish clean consumer-Windows compatibility, a full
residue audit, trusted publisher identity, WACK, Microsoft Store certification,
or Microsoft Store availability.

## Never commit

- Partner Center identity or signing secrets;
- certificate/private-key files (`.pfx`, `.p12`, `.pem`, `.key`);
- API keys, access tokens, passwords, or populated `.env` files;
- personal, customer, employee, or candidate data; or
- local machine paths, unredacted diagnostic exports, or reviewer credentials.
