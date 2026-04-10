function createSettingsPlugin() {
  return {
    id: 'settingsUI',
    init(ctx) {
      // Inject a simple settings modal into the DOM.
      // Keep it minimal and non-invasive.
      const modal = document.createElement('div');
      modal.id = 'settings-modal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 640px;">
          <h2 style="margin: 0 0 10px 0;">设置</h2>
          <p style="margin: 0 0 15px 0; color: var(--text-muted);">开关功能模块（默认全开）。部分开关可能需要返回首页后重新进入剧本页生效。</p>
          <div id="settings-flags" style="display: grid; gap: 10px;"></div>
          <div style="display:flex; gap:10px; justify-content:flex-end; margin-top: 16px;">
            <button class="btn btn-secondary" id="settings-close-btn">关闭</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const closeBtn = modal.querySelector('#settings-close-btn');
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));

      function labelFor(id) {
        const map = {
          branching: '分支剧情',
          levelSelect: '关卡数量选择',
          cloudPacks: '云端剧本',
          help: '求救机会',
          countdown: '血量倒计时',
          reviewKnowledge: '结束后复盘与知识点'
        };
        return map[id] || id;
      }

      function render() {
        const container = modal.querySelector('#settings-flags');
        const ids = ['branching', 'levelSelect', 'cloudPacks', 'help', 'countdown', 'reviewKnowledge'];
        container.innerHTML = ids.map((id) => {
          const checked = ctx.flags[id] !== false;
          return `
            <label style="display:flex; align-items:center; justify-content:space-between; padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; background: rgba(255,255,255,0.6);">
              <span style="font-weight: 600;">${labelFor(id)}</span>
              <input type="checkbox" data-flag-id="${id}" ${checked ? 'checked' : ''} />
            </label>
          `;
        }).join('');

        container.querySelectorAll('input[type="checkbox"]').forEach((el) => {
          el.addEventListener('change', (e) => {
            const id = e.target.dataset.flagId;
            ctx.pluginManager.toggle(id, e.target.checked, ctx);
          });
        });
      }

      render();
      ctx.openSettings = () => {
        render();
        modal.classList.add('active');
      };
    }
  };
}

window.Plugins = window.Plugins || {};
window.Plugins.createSettingsPlugin = createSettingsPlugin;
