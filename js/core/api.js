// Core API surface for plugins.
// Plugins call into this instead of directly depending on legacy globals.

window.GameCore = window.GameCore || {};

window.GameCore.getAppState = function () {
  return window.appState;
};

window.GameCore.setAppState = function (next) {
  window.appState = next;
};

window.GameCore.isFeatureEnabled = function (id) {
  try {
    const flags = window.FeatureFlags.loadFeatureFlags();
    return flags[id] !== false;
  } catch {
    return true;
  }
};
