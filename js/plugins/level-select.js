function createLevelSelectPlugin() {
  return {
    id: 'levelSelect',
    init(ctx) {
      const w = window;
      this._orig = this._orig || {};

      if (typeof w.goToLevelSelect === 'function' && !this._orig.goToLevelSelect) {
        this._orig.goToLevelSelect = w.goToLevelSelect;
        w.goToLevelSelect = (...args) => {
          if (ctx.flags.levelSelect === false) {
            try {
              w.appState.gameState.userSelectedLevelCount = w.appState.gameState.currentIdentity.levelList.length;
              w.startGame();
              return;
            } catch {}
          }
          return this._orig.goToLevelSelect(...args);
        };
      }

      if (typeof w.goToLevelSelectDirectly === 'function' && !this._orig.goToLevelSelectDirectly) {
        this._orig.goToLevelSelectDirectly = w.goToLevelSelectDirectly;
        w.goToLevelSelectDirectly = (...args) => {
          if (ctx.flags.levelSelect === false) {
            try {
              w.appState.gameState.userSelectedLevelCount = w.appState.gameState.currentIdentity.levelList.length;
              w.startGame();
              return;
            } catch {}
          }
          return this._orig.goToLevelSelectDirectly(...args);
        };
      }
    },
    onToggle(_enabled, _ctx) {
      // No UI to hide. When disabled, plugin bypasses level select page.
    }
  };
}

window.Plugins = window.Plugins || {};
window.Plugins.createLevelSelectPlugin = createLevelSelectPlugin;
