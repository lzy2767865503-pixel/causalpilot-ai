# Signing Record — CausalPilot AI 0.1.0

**Owner:** LAI ZEYU (来泽宇)

The final application bundle has a complete **ad-hoc** signature for local integrity:

- identifier: `com.laizeyu.causalpilot`
- signature: ad-hoc
- TeamIdentifier: not set
- `codesign --verify --deep --strict --verbose=4`: passed locally and inside the mounted DMG
- `spctl --assess --type execute --verbose=4`: rejected, exit 3

Therefore the signing/notarization release gate is **not achieved**. The artifact is not signed with an Apple Developer ID certificate, has no identity assurance, and has not been notarized by Apple. Users may encounter Gatekeeper warnings. No stronger signing or distribution statement is permitted.
