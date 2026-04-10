function createCloudPacksPlugin() {
  return {
    id: 'cloudPacks',
    init(ctx) {
      // Wrap legacy functions to make the feature truly pluggable.
      const w = window;
      this._orig = this._orig || {};

      if (typeof w.loadCloudPackIndex === 'function' && !this._orig.loadCloudPackIndex) {
        this._orig.loadCloudPackIndex = w.loadCloudPackIndex;
        w.loadCloudPackIndex = async (...args) => {
          if (ctx.flags.cloudPacks === false) return;
          return this._orig.loadCloudPackIndex(...args);
        };
      }

      if (typeof w.switchPackTab === 'function' && !this._orig.switchPackTab) {
        this._orig.switchPackTab = w.switchPackTab;
        w.switchPackTab = (tab) => {
          if (ctx.flags.cloudPacks === false && tab === 'cloud') tab = 'local';
          return this._orig.switchPackTab(tab);
        };
      }

      if (typeof w.downloadCloudPack === 'function' && !this._orig.downloadCloudPack) {
        this._orig.downloadCloudPack = w.downloadCloudPack;
        w.downloadCloudPack = async (...args) => {
          if (ctx.flags.cloudPacks === false) {
            alert('云端剧本功能已在设置中关闭');
            return;
          }
          return this._orig.downloadCloudPack(...args);
        };
      }

      if (typeof w.confirmPack === 'function' && !this._orig.confirmPack) {
        this._orig.confirmPack = w.confirmPack;
        w.confirmPack = async (...args) => {
          try {
            if (ctx.flags.cloudPacks === false && w.appState?.selectedPackType === 'cloud') {
              alert('云端剧本功能已在设置中关闭');
              return;
            }
          } catch {}
          return this._orig.confirmPack(...args);
        };
      }
    },
    onToggle(enabled, ctx) {
      // Hide/show cloud tab button.
      const cloudBtn = document.querySelector('.pack-tab-btn[data-tab="cloud"]');
      if (cloudBtn) cloudBtn.style.display = enabled ? '' : 'none';

      if (!enabled) {
        try {
          window.switchPackTab && window.switchPackTab('local');
        } catch {}
      }
    }
  };
}

window.Plugins = window.Plugins || {};
window.Plugins.createCloudPacksPlugin = createCloudPacksPlugin;
