# Security Policy

## Supported versions

Security fixes are currently considered for the latest source revision and the
latest published preview release only. Version `0.1.x` is an early preview, not
a security-certified production system.

| Version | Supported |
|---|---|
| Latest source revision | Yes |
| Latest `0.1.x` preview | Best effort |
| Older or modified builds | No |

## Reporting a vulnerability

Do **not** include vulnerability details, exploit code, credentials, personal
data, or sensitive local paths in a public issue.

Use GitHub's private **Report a vulnerability** form in the repository Security
tab. If private vulnerability reporting has not yet been enabled, open a public
issue containing only the words “Private security contact requested”; the
maintainer will arrange a private channel. Do not disclose technical details in
that issue.

Please include privately:

- the affected version, commit, and operating system;
- reproducible steps or a minimal proof of concept;
- the security impact and required preconditions;
- whether the issue is already public; and
- a safe way to contact you for follow-up.

The maintainer, **LAI ZEYU (来泽宇)**, intends to acknowledge a complete report
within seven days. This is a best-effort target, not a service-level guarantee.
Coordinated disclosure timing will be discussed with the reporter after the
issue is reproduced and its impact is assessed.

## Scope notes

Particularly relevant areas include Electron IPC and sandbox boundaries, file
capabilities, CSV parsing, child-process invocation, local evidence export,
installer configuration, dependency integrity, and accidental network or data
disclosure.

The following are not, by themselves, security vulnerabilities:

- a statistically uncertain or unsupported conclusion that is already labelled
  as such;
- absence of Apple Developer ID signing or notarization on an artifact clearly
  documented as unsigned/unnotarized;
- absence of Microsoft Store certification on a package not claimed to be
  certified; or
- a feature listed as out of scope or unimplemented.

Privacy, scientific-validity, or HR-safety failures may still be important.
Report them through the appropriate issue template without including personal
data; use the private path above when public disclosure could cause harm.
