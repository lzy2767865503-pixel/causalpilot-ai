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
- [x] A truthful Windows preview release-notes draft exists.
- [x] A local scan of 105 current-tree text files found no high-confidence private-key, AWS,
  GitHub, OpenAI, Google, Slack, Stripe, credential-URL, or JWT patterns. No
  `.env`, signing-key, certificate, or provisioning-profile files were found.
- [x] The locked JavaScript tree declared a licence for every resolved package
  in the local audit; this is an inventory check, not legal advice.

## Completed or verified on GitHub

- [x] The MIT source repository is public at
  `https://github.com/lzy2767865503-pixel/causalpilot-ai`.
- [x] The public history and current installer-preflight commit are recorded;
  Windows run 33406656618 used
  `612a618a3de36ab53865354f9e8f0a5e9a05c26a`.
- [x] Private vulnerability reporting, secret scanning, and secret-scanning
  push protection are enabled.
- [x] `LICENSE`, `CITATION.cff`, contribution/security files, issue forms, and
  the MIT package metadata are present in the public repository.
- [x] Source validation and Security review completed successfully for commit
  `612a618a3de36ab53865354f9e8f0a5e9a05c26a`.
- [x] GitHub-hosted Windows Server 2022 installer preflight 33406656618
  completed successfully: 17 frontend tests, 15 engine tests, Unicode-path
  sidecar smoke, silent install, installed-app E2E/export, silent uninstall,
  main-executable removal, and four 1366 × 768 screenshots passed.
- [x] The preflight recorded these exact SHA-256 values:
  - `22cf9261e8bf86f21637764c0c1d4f4807b0bce24567d22a1b9fa1020f4cdc88`
    — `CausalPilot-AI-0.1.0-windows-x64-setup.exe`
  - `70cffa566f09fd105e64c9f83965e9bc5e5daeb7c6875201cfb50fe58aaa9c74`
    — `CausalPilot-AI-0.1.0-windows-x64.zip`

## Still required before a public binary or Store release

- [ ] Protect the default branch and require passing source-validation and
  security checks before merge.
- [ ] Enable Dependabot security updates if repository policy permits; they
  were disabled at this evidence snapshot.
- [ ] Preserve the Windows reports, screenshots, checksums, and artifacts in a
  durable release record before the temporary Actions artifacts expire.
- [ ] Install the exact NSIS package on clean Windows 10 and Windows 11 targets;
  test the native chooser, launch, offline workflow, uninstall, and reinstall.
- [ ] Complete trusted Windows signing, WACK, Defender, capability, network,
  DPI/accessibility, and retention checks where applicable.
- [ ] Obtain and verify exact Partner Center name, Identity, Publisher, and
  Publisher display-name values before producing the Store AppX candidate.
- [ ] Create a draft GitHub release first. The successful manual preflight did
  not create one; publish only after its files and notes match the tested commit.
- [ ] Keep Microsoft Store upload, certification, signed-out listing access,
  acquisition, and Store-installed retesting as separate gates.

The Windows preflight establishes a hosted `win32`/`x64` package,
install/workflow/uninstall smoke, and main-executable removal check. It does not
establish clean consumer-Windows compatibility, a full residue audit, trusted
publisher identity, WACK, Store certification, or public binary availability.

## Never commit

- Partner Center identity or signing secrets;
- certificate/private-key files (`.pfx`, `.p12`, `.pem`, `.key`);
- API keys, access tokens, passwords, or populated `.env` files;
- personal, customer, employee, or candidate data; or
- local machine paths, unredacted diagnostic exports, or reviewer credentials.
