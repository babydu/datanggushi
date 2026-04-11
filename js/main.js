// Main entry: load legacy game.js and add plugin toggles incrementally.
// This is a transitional step towards full modularization.

importScriptsFallback(
  [
    'js/core/config.js',
    'js/core/plugin-manager.js',
    'js/core/api.js',
    'js/plugins/settings-ui.js',
    'js/plugins/branching.js',
    'js/plugins/cloud-packs.js',
    'js/plugins/level-select.js',
    'js/plugins/help.js',
    'js/plugins/help-impl.js',
    'js/plugins/countdown.js',
    'js/plugins/review-knowledge.js',
    'game.js'
  ],
  () => {
    // Bootstrap after scripts are loaded, but ensure DOM is ready.
    document.addEventListener('DOMContentLoaded', () => bootstrapAfterLegacyLoad(), { once: true });
    window.addEventListener('load', () => bootstrapAfterLegacyLoad(), { once: true });
    // Also attempt immediately (may fail if DOM not ready; bootstrap retries).
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
  // If we already initialized plugins, just ensure the settings button exists.
  if (window.__pluginCtx) {
    ensureSettingsButton(window.__pluginCtx);
    return;
  }

  if (!window.FeatureFlags || !window.PluginManager || !window.Plugins) {
    // Scripts may still be loading.
    setTimeout(bootstrapAfterLegacyLoad, 50);
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
  pm.register(window.Plugins.createHelpImplPlugin());
  pm.register(window.Plugins.createCountdownPlugin());
  pm.register(window.Plugins.createReviewKnowledgePlugin());
  pm.initAll(ctx);

  // Expose ctx for debugging.
  window.__pluginCtx = ctx;
  window.__settingsBootstrapped = true;

  ensureSettingsButton(ctx);
}

function ensureSettingsButton(ctx) {
  if (document.getElementById('open-settings-btn')) return true;

  const startBtn = document.getElementById('start-game-btn');
  if (!startBtn) {
    // DOM not ready yet or unexpected markup.
    setTimeout(() => ensureSettingsButton(ctx), 50);
    return false;
  }

  const btn = document.createElement('button');
  btn.id = 'open-settings-btn';
  btn.className = 'btn btn-secondary';
  btn.textContent = '设置';
  btn.onclick = () => ctx.openSettings && ctx.openSettings();

  // Insert next to the start button (more robust than matching style attributes).
  const row = startBtn.parentElement;
  if (row) {
    row.appendChild(btn);
    return true;
  }

  // Last resort: append to welcome page.
  const welcome = document.getElementById('welcome-page');
  if (welcome) {
    welcome.appendChild(btn);
    return true;
  }

  setTimeout(() => ensureSettingsButton(ctx), 50);
  return false;
}
