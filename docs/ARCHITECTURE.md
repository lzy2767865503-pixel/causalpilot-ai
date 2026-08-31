# Offline Desktop Architecture

```text
React + Vite renderer
        │ narrow typed API
Electron preload (context isolation)
        │ IPC
Electron main process
        │ JSON over stdin/stdout; no localhost port
Deterministic Python analysis engine
        │
ResultBundle + report + run manifest
```

## Trust boundary

- Raw CSV rows remain local by default.
- The renderer has no direct Node.js access.
- The preload exposes only file selection, analysis, evidence export, and app metadata operations.
- The statistics engine owns all numeric claims.
- The optional AI layer is not required for v1 and may receive only aggregate ResultBundle fields in a future release.

## Static demonstration

The browser build uses an included synthetic example and precomputed evidence bundle. It is a review surface, not proof that cloud analysis exists. The installed desktop application is the authoritative local-analysis path.
