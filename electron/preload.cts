// Electron runs sandboxed preloads as CommonJS. The `.cts` source guarantees a
// `.cjs` build even though the main application package uses ESM.
const { contextBridge, ipcRenderer } = require("electron") as typeof import("electron");

type AnalyzeExperimentRequest =
  import("./types.js").AnalyzeExperimentRequest;
type CausalPilotDesktopApi = import("./types.js").CausalPilotDesktopApi;
type EvidenceExportRequest = import("./types.js").EvidenceExportRequest;

// Keep this whitelist duplicated locally so a sandboxed preload does not need
// to require arbitrary runtime modules. ipcRenderer itself is never exposed.
const CHANNELS = {
  selectExperimentFile: "causalpilot:select-experiment-file",
  analyzeExperiment: "causalpilot:analyze-experiment",
  exportEvidence: "causalpilot:export-evidence",
  getAppMetadata: "causalpilot:get-app-metadata",
} as const;

const causalPilotApi: CausalPilotDesktopApi = Object.freeze({
  selectExperimentFile: () =>
    ipcRenderer.invoke(CHANNELS.selectExperimentFile),
  analyzeExperiment: (request: AnalyzeExperimentRequest) =>
    ipcRenderer.invoke(CHANNELS.analyzeExperiment, request),
  exportEvidence: (bundle: EvidenceExportRequest) =>
    ipcRenderer.invoke(CHANNELS.exportEvidence, bundle),
  getAppMetadata: () => ipcRenderer.invoke(CHANNELS.getAppMetadata),
});

// The renderer receives a narrow capability API, never Node.js, file paths,
// child_process, or raw experiment rows.
contextBridge.exposeInMainWorld("causalPilot", causalPilotApi);
