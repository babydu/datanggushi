// Main entry: load legacy game.js and add plugin toggles incrementally.
// This is a transitional step towards full modularization.

importScriptsFallback([
  'js/core/config.js',
  'js/core/plugin-manager.js',
  'js/plugins/settings-ui.js',
  'game.js'
]);

function importScriptsFallback(scripts) {
  // Minimal sequential loader without bundler.
  let idx = 0;
  function next() {
    if (idx >= scripts.length) return;
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
  const flags = window.FeatureFlags.loadFeatureFlags();
  const pm = window.PluginManager.createPluginManager(flags);
  const ctx = { flags, pluginManager: pm };

  // Settings UI plugin (always on)
  pm.register(window.Plugins.createSettingsPlugin());
  pm.initAll(ctx);

  // Apply initial toggles for UI-only behaviors that live in legacy code.
  // Cloud tab visibility
  try {
    const cloudBtn = document.querySelector('.pack-tab-btn[data-tab="cloud"]');
    if (cloudBtn) {
      cloudBtn.style.display = (ctx.flags.cloudPacks === false) ? 'none' : '';
    }
  } catch {}

  // Level select page visibility (kept, but will be skipped when disabled)

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

// Wait until legacy game.js is loaded.
(function waitForLegacy() {
  if (typeof window.FeatureFlags === 'undefined' || typeof window.Plugins === 'undefined') {
    setTimeout(waitForLegacy, 10);
    return;
  }
  // game.js attaches window.onload; we attach a separate handler.
  window.addEventListener('load', bootstrapAfterLegacyLoad);
})();
