function createHelpPlugin() {
  return {
    id: 'help',
    init(ctx) {
      const w = window;
      this._orig = this._orig || {};

      function findHelpButtonFromTarget(t) {
        if (!t) return null;
        // Some browsers can report Text nodes as targets.
        if (t.nodeType === 3) t = t.parentElement;
        if (!t) return null;
        if (t.id === 'help-btn') return t;
        if (t.closest) return t.closest('#help-btn');
        return null;
      }

      const invoke = () => {
        if (ctx.flags.help === false) {
          alert('求救功能已在设置中关闭');
          return;
        }
        if (typeof w.useHelp === 'function') {
          w.useHelp();
          return;
        }
        console.warn('[help] window.useHelp is not a function');
      };

      // Install a delegated click handler so the help button works
      // even if inline handlers / onclick properties are overridden.
      if (!this._orig.delegatedHelpClick) {
        const handler = (e) => {
          const btn = findHelpButtonFromTarget(e.target);
          if (!btn) return;
          invoke();
        };
        document.addEventListener('click', handler, true);
        this._orig.delegatedHelpClick = handler;
      }

      // Also bind directly to the button (belt-and-suspenders).
      if (!this._orig.directHelpClick) {
        const direct = (e) => {
          const btn = findHelpButtonFromTarget(e.target);
          if (!btn) return;
          invoke();
        };
        this._orig.directHelpClick = direct;
      }
      try {
        const btn = document.getElementById('help-btn');
        if (btn && !btn.dataset.helpBound) {
          btn.addEventListener('click', this._orig.directHelpClick, true);
          btn.dataset.helpBound = 'true';
        }
      } catch {}

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
    },
    onToggle(enabled) {
      const helpBtn = document.getElementById('help-btn');
      if (helpBtn) helpBtn.style.display = enabled ? '' : 'none';
    }
  };
}

window.Plugins = window.Plugins || {};
window.Plugins.createHelpPlugin = createHelpPlugin;
