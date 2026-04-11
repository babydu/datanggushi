// Main entry: load legacy game.js and add plugin toggles incrementally.
// This is a transitional step towards full modularization.

importScriptsFallback(
  [
    'js/core/config.js',
    'js/core/plugin-manager.js',
    'js/plugins/settings-ui.js',
    'js/plugins/branching.js',
    'js/plugins/cloud-packs.js',
    'js/plugins/level-select.js',
    'js/plugins/help.js',
    'js/plugins/countdown.js',
    'js/plugins/review-knowledge.js',
    'game.js'
  ],
  () => {
    // Bootstrap immediately after scripts are loaded.
    // Do NOT rely on the window load event: legacy game.js may consume it,
    // and we can miss it if we attach too late.
    bootstrapAfterLegacyLoad();
  }
);

function importScriptsFallback(scripts, onDone) {
  // Minimal sequential loader without bundler.
  let idx = 0;
  function next() {
    if (idx >= scripts.length) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    const src = scripts[idx++];
    const s = document.createElement('script');
    s.src = src;
    s.onload = next;
    s.onerror = next;
    document.head.appendChild(s);
  }
  next();
}

// After legacy game.js loads, we install settings UI and initial toggles.
function bootstrapAfterLegacyLoad() {
  if (window.__settingsBootstrapped) return;
  window.__settingsBootstrapped = true;

  if (!window.FeatureFlags || !window.PluginManager || !window.Plugins) {
    // If something failed to load, don't crash the app.
    return;
  }

  const flags = window.FeatureFlags.loadFeatureFlags();
  const pm = window.PluginManager.createPluginManager(flags);
  const ctx = { flags, pluginManager: pm };
  ctx.flags = pm.flags;
  ctx.pluginManager = pm;

  // Settings UI plugin (always on)
  pm.register(window.Plugins.createSettingsPlugin());

  // Feature plugins
  pm.register(window.Plugins.createBranchingPlugin());
  pm.register(window.Plugins.createCloudPacksPlugin());
  pm.register(window.Plugins.createLevelSelectPlugin());
  pm.register(window.Plugins.createHelpPlugin());
  pm.register(window.Plugins.createCountdownPlugin());
  pm.register(window.Plugins.createReviewKnowledgePlugin());
  pm.initAll(ctx);

  // Expose ctx for debugging.
  window.__pluginCtx = ctx;

  // Add a Settings button to welcome page controls.
  const welcomeBtnRow = document.querySelector('#welcome-page > div[style*="display: flex"]');
  if (welcomeBtnRow && !document.getElementById('open-settings-btn')) {
    const btn = document.createElement('button');
    btn.id = 'open-settings-btn';
    btn.className = 'btn btn-secondary';
    btn.textContent = '设置';
    btn.onclick = () => ctx.openSettings && ctx.openSettings();
    welcomeBtnRow.appendChild(btn);
  }
}
