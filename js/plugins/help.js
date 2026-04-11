function createHelpPlugin() {
  return {
    id: 'help',
    init(ctx) {
      const w = window;
      this._orig = this._orig || {};

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
