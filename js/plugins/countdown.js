function createCountdownPlugin() {
  return {
    id: 'countdown',
    init(ctx) {
      const w = window;
      this._orig = this._orig || {};

      if (typeof w.startCountdown === 'function' && !this._orig.startCountdown) {
        this._orig.startCountdown = w.startCountdown;
        w.startCountdown = (...args) => {
          if (ctx.flags.countdown === false) {
            try {
              const el = document.getElementById('countdown-text');
              if (el) el.innerText = '--';
              w.clearCountdown && w.clearCountdown();
            } catch {}
            return;
          }
          return this._orig.startCountdown(...args);
        };
      }
    },
    onToggle(enabled) {
      const countdownItem = document.querySelector('.countdown-item');
      if (countdownItem) countdownItem.style.display = enabled ? '' : 'none';
      if (!enabled) {
        try {
          const el = document.getElementById('countdown-text');
          if (el) el.innerText = '--';
        } catch {}
      }
    }
  };
}

window.Plugins = window.Plugins || {};
window.Plugins.createCountdownPlugin = createCountdownPlugin;
