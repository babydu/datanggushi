function createBranchingPlugin() {
  return {
    id: 'branching',
    init(ctx) {
      const w = window;
      this._orig = this._orig || {};

      // Disable storyVariants when branching is off
      if (typeof w.resolveStoryForLevel === 'function' && !this._orig.resolveStoryForLevel) {
        this._orig.resolveStoryForLevel = w.resolveStoryForLevel;
        w.resolveStoryForLevel = (levelData) => {
          if (ctx.flags.branching === false) {
            return (levelData && levelData.story) ? levelData.story : '';
          }
          return this._orig.resolveStoryForLevel(levelData);
        };
      }

      // Disable nextLevel branching when off
      if (typeof w.closeHistoryModal === 'function' && !this._orig.closeHistoryModal) {
        this._orig.closeHistoryModal = w.closeHistoryModal;
        w.closeHistoryModal = async (...args) => {
          if (ctx.flags.branching === false) {
            // Temporarily clear nextLevel to force linear progression.
            try {
              const gs = w.appState && w.appState.gameState;
              const last = gs && gs.lastAnswer;
              if (last && last.nextLevel) {
                const saved = last.nextLevel;
                last.nextLevel = null;
                const res = await this._orig.closeHistoryModal(...args);
                last.nextLevel = saved;
                return res;
              }
            } catch {}
          }
          return this._orig.closeHistoryModal(...args);
        };
      }

      // Disable runFlags influence when off
      if (typeof w.checkConditions === 'function' && !this._orig.checkConditions) {
        this._orig.checkConditions = w.checkConditions;
        w.checkConditions = (...args) => {
          if (ctx.flags.branching === false) {
            try {
              const gs = w.appState && w.appState.gameState;
              if (gs) {
                const saved = gs.runFlags;
                gs.runFlags = null;
                const res = this._orig.checkConditions(...args);
                gs.runFlags = saved;
                return res;
              }
            } catch {}
          }
          return this._orig.checkConditions(...args);
        };
      }

      // Disable setting runFlags when off
      if (typeof w.processNormalOption === 'function' && !this._orig.processNormalOption) {
        this._orig.processNormalOption = w.processNormalOption;
        w.processNormalOption = (option, ...rest) => {
          if (ctx.flags.branching === false && option && (option.setFlags || option.clearFlags)) {
            // Strip flag mutations for this call.
            const savedSet = option.setFlags;
            const savedClear = option.clearFlags;
            try {
              delete option.setFlags;
              delete option.clearFlags;
              return this._orig.processNormalOption(option, ...rest);
            } finally {
              if (savedSet !== undefined) option.setFlags = savedSet;
              if (savedClear !== undefined) option.clearFlags = savedClear;
            }
          }
          return this._orig.processNormalOption(option, ...rest);
        };
      }

      if (typeof w.triggerEvent === 'function' && !this._orig.triggerEvent) {
        this._orig.triggerEvent = w.triggerEvent;
        w.triggerEvent = (...args) => {
          if (ctx.flags.branching === false) {
            // Prevent events from mutating runFlags when branching is off.
            try {
              const ev = args && args[0];
              if (ev && ev.eventData && (ev.eventData.setFlags || ev.eventData.clearFlags)) {
                const savedSet = ev.eventData.setFlags;
                const savedClear = ev.eventData.clearFlags;
                delete ev.eventData.setFlags;
                delete ev.eventData.clearFlags;
                const res = this._orig.triggerEvent(...args);
                ev.eventData.setFlags = savedSet;
                ev.eventData.clearFlags = savedClear;
                return res;
              }
            } catch {}
          }
          return this._orig.triggerEvent(...args);
        };
      }
    },
    onToggle(_enabled) {
      // No direct UI to hide.
    }
  };
}

window.Plugins = window.Plugins || {};
window.Plugins.createBranchingPlugin = createBranchingPlugin;
