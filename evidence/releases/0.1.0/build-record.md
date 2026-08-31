# Build Record — CausalPilot AI 0.1.0

**Owner:** LAI ZEYU (来泽宇)  
**Built:** 2026-08-31 on macOS 26.6.2 (`arm64`)  
**Node/npm:** Node 24.16.0; npm 11.13.0  
**Engine Python:** 3.9.6  
**Electron:** 44.0.0  
**electron-builder:** 26.15.3  
**PyInstaller:** 6.22.2

Successful build path:

```text
npm run package:mac
```

The command rebuilt the icon, arm64 deterministic-engine sidecar, production Vite renderer, Electron main/preload files, ad-hoc-signed application bundle, DMG, and block map. The package hook removed unused camera, microphone, audio-capture, Bluetooth, and permissive network declarations from the final `Info.plist` before signing.

Source-freeze boundary: the repository has no Git commit or tag. This record covers the working snapshot that produced the exact hashed DMG; it is not a reproducible clean-commit build claim.
