# Mounted-DMG Launch Record — CausalPilot AI 0.1.0

**Owner:** LAI ZEYU (来泽宇)  
**Observed:** 2026-08-31 on the build Mac

The final DMG was mounted read-only and the executable inside that mounted image was launched through the packaged Electron E2E harness. With a 120-second launch allowance, the workflow completed:

1. application metadata reported packaged macOS `arm64` mode and offline local-engine processing;
2. the synthetic 16,000-row CSV was selected through a chooser-response stub;
3. four fields were mapped and randomized assignment was confirmed;
4. the bundled engine returned `+2.6 pp`, 95% CI `+1.6 to +3.5 pp`, and the expected dataset hash;
5. no renderer console error or horizontal overflow was captured; and
6. an aggregate evidence folder containing JSON and HTML was exported, with no recognized raw-row field and with `LAI ZEYU (来泽宇)` attribution.

The same embedded sidecar was also invoked directly from the mounted image and returned an `ok` deterministic result for the sample SHA-256 `47ab1a639eecfbb1630063298d6d3b447bac5123e87d6e9653bdc283bf9de244`.

Boundary: this was not a drag-to-Applications installation on a separate clean Mac. The first mounted launch exceeded a 30-second automation timeout; the successful recorded run allowed 120 seconds.
