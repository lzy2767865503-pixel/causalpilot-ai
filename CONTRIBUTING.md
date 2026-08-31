# Contributing to CausalPilot AI

Thank you for considering a contribution. CausalPilot AI is an offline-first
experiment-analysis workbench. Contributions are welcome when they preserve its
evidence discipline, privacy boundary, and aggregate-only HR safety policy.

The accountable maintainer and product author is **LAI ZEYU (来泽宇)**.

## Before opening a pull request

For substantial product, statistical, security, or data-contract changes, open
an issue first. Explain the user problem, the proposed scope, and what evidence
would demonstrate that the change works. A feature request is not evidence that
a method is valid or that a release gate has passed.

Do not submit:

- customer, employee, candidate, or other personal data;
- credentials, signing material, Store identities, API keys, or local paths;
- generated claims of adoption, impact, validation, certification, or release;
- code that ranks or recommends decisions about individual employees or
  candidates; or
- a statistical method without a documented estimand, assumptions, failure
  modes, and independent test fixtures.

## Development setup

Requirements:

- Node.js 22 or newer and npm;
- Python 3.9 or newer; and
- macOS, Windows, or Linux for source validation. Installer packaging remains
  platform-specific.

Install JavaScript dependencies:

```bash
npm ci
```

Create and install the Python test environment on macOS or Linux:

```bash
python3 -m venv engine/.venv
engine/.venv/bin/python -m pip install -e 'engine[test]'
```

On Windows PowerShell:

```powershell
py -3 -m venv engine\.venv
engine\.venv\Scripts\python.exe -m pip install -e "engine[test]"
```

## Required checks

Run the JavaScript and renderer checks:

```bash
npm test
npm run build
```

Run the engine suite with the virtual environment's Python:

```bash
PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=engine engine/.venv/bin/python -m pytest -p no:cacheprovider engine/tests
```

Windows PowerShell equivalent:

```powershell
$env:PYTHONDONTWRITEBYTECODE = "1"
engine\.venv\Scripts\python.exe -m pytest -p no:cacheprovider engine\tests
```

Where relevant, also run the visual, packaged, benchmark, or security checks
named in the affected documentation. Report the exact command and result. Do
not convert a development benchmark into a formal holdout claim.

## Pull-request expectations

A focused pull request should include:

1. a concise description of the user-visible change;
2. the scope boundary and any unresolved limitation;
3. tests that fail before the change and pass after it, when practical;
4. documentation updates for changed contracts or claims;
5. screenshots for material interface changes; and
6. a disclosure of material AI-tool assistance used in the contribution.

Keep source changes separate from generated installers and benchmark outputs
unless the pull request is explicitly an evidence-preserving release change.
Never edit a recorded result to make it appear better; preserve failures and
add a new versioned run.

## Statistical and safety review

Changes to estimation, intervals, tests, diagnostics, causal language, or ROI
must update `docs/METHOD_VALIDATION.md` and include transparent fixtures. HR
functionality must remain at aggregate programme, policy, cohort, or team level.
Individual hiring, firing, promotion, compensation, performance, or risk
decisions are outside the product boundary.

## Licence

By submitting a contribution, you agree that your contribution is licensed
under the repository's [MIT License](LICENSE). You retain attribution for your
work. Material contributors should be added to `AUTHORS.md` rather than leaving
an inaccurate sole-contributor impression.

Participation is also governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
