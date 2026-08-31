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

## Must be completed or verified on GitHub

- [ ] Create the repository under the intended GitHub account and record the
  exact URL; no URL is invented in this source tree.
- [ ] Review the first commit and its full Git history before pushing. The local
  scan above covers the current tree, not future commits or external history.
- [ ] Enable private vulnerability reporting, secret scanning, and push
  protection in repository settings.
- [ ] Protect the default branch and require passing source-validation and
  security checks before merge.
- [ ] Confirm GitHub recognizes `LICENSE`, `CITATION.cff`, issue forms, and the
  security policy.
- [ ] Run CI on the public commit; a workflow file in the tree is not proof that
  its jobs have passed.
- [ ] Review Windows artifacts on a supported Windows machine, preserve the
  build/test record, and compare their hashes with workflow output.
- [ ] Create a draft GitHub release first. Publish it only after the attached
  artifacts and notes match the tested commit.
- [ ] Keep Microsoft Store submission, certification, and public availability
  as separate gates with their own portal evidence.

## Never commit

- Partner Center identity or signing secrets;
- certificate/private-key files (`.pfx`, `.p12`, `.pem`, `.key`);
- API keys, access tokens, passwords, or populated `.env` files;
- personal, customer, employee, or candidate data; or
- local machine paths, unredacted diagnostic exports, or reviewer credentials.
