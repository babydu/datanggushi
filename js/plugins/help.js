function createHelpPlugin() {
  return {
    id: 'help',
    init(ctx) {
      const w = window;
      this._orig = this._orig || {};

      // Install a delegated click handler so the help button works
      // even if inline handlers / onclick properties are overridden.
      if (!this._orig.delegatedHelpClick) {
        const handler = (e) => {
          const btn = e.target && (e.target.closest ? e.target.closest('#help-btn') : null);
          if (!btn) return;

          if (ctx.flags.help === false) {
            // Normally the button is hidden; this is a fallback.
            alert('求救功能已在设置中关闭');
            return;
          }

          if (typeof w.useHelp === 'function') {
            w.useHelp();
            return;
          }
          console.warn('[help] window.useHelp is not a function');
        };

        document.addEventListener('click', handler, true);
        this._orig.delegatedHelpClick = handler;
      }

      if (typeof w.useHelp === 'function' && !this._orig.useHelp) {
        this._orig.useHelp = w.useHelp;
        w.useHelp = (...args) => {
          if (ctx.flags.help === false) {
            alert('求救功能已在设置中关闭');
            return;
          }
          return this._orig.useHelp(...args);
        };
      }

      if (typeof w.useDeathHelp === 'function' && !this._orig.useDeathHelp) {
        this._orig.useDeathHelp = w.useDeathHelp;
        w.useDeathHelp = (...args) => {
          if (ctx.flags.help === false) {
            alert('求救功能已在设置中关闭');
            return;
          }
          return this._orig.useDeathHelp(...args);
        };
      }

      // Ensure the help button always calls the current global.
      try {
        const btn = document.getElementById('help-btn');
        if (btn) btn.onclick = () => w.useHelp && w.useHelp();
      } catch {}
    },
    onToggle(enabled) {
      const helpBtn = document.getElementById('help-btn');
      if (helpBtn) helpBtn.style.display = enabled ? '' : 'none';
    }
  };
}

window.Plugins = window.Plugins || {};
window.Plugins.createHelpPlugin = createHelpPlugin;
