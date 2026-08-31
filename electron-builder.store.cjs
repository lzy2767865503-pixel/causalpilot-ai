// Fail-closed Microsoft Store build configuration. The implementation lives in
// a testable helper; loading this file on a non-Windows host or without the
// exact Partner Center identity is intentionally an error.
module.exports = require("./scripts/store-package-config.cjs").createStoreConfig();

