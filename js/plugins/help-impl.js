function createHelpImplPlugin() {
  return {
    id: 'helpImpl',
    init(_ctx) {
      const w = window;
      // Provide a namespaced implementation and delegate from legacy globals.

      function useHelpImpl() {
        console.log('[help] useHelpImpl');
        const appState = w.appState;
        if (!appState?.gameState) return;

        // Useful for diagnosing “click but no effect” reports.
        try {
          console.log('[help] state', {
            helpTimes: appState.gameState.helpTimes,
            selectedOption: !!appState.gameState.selectedOption,
            hasOptions: Array.isArray(appState.gameState.currentOptions) ? appState.gameState.currentOptions.length : null
          });
        } catch {}
        if (appState.gameState.helpTimes <= 0) {
          alert('你的求救机会已经用完了！');
          return;
        }
        if (appState.gameState.selectedOption) {
          alert('你已经做出了选择，无法再使用求救机会！');
          return;
        }

        const correctOption = appState.gameState.currentOptions.find(opt => opt.isCorrect);
        w.updateAttribute('helpTimes', -1);
        appState.gameState.debuff = 0;
        w.updateAttribute('health', 20);
        appState.gameState.consecutiveCorrect = 0;
        w.updateGameUI();

        // reset countdown
        w.startCountdown();

        w.showHistoryModal(
          '求救成功',
          `<div class="tip-box">
            当地的资深人士给了你关键提示：<br><br>
            <strong>正确的选择，与「${(correctOption?.text || '').split('，')[0] || '关键史实'}」有关。</strong>
          </div>
          <p>你清除了所有负面状态，恢复了20点生命值，还剩${appState.gameState.helpTimes}次求救机会。</p>`
        );
      }

      function useDeathHelpImpl() {
        console.log('[help] useDeathHelpImpl');
        const appState = w.appState;
        if (!appState?.gameState) return;
        document.getElementById('death-modal').classList.remove('active');

        w.updateAttribute('helpTimes', -1);
        appState.gameState.health = 1;
        appState.gameState.consecutiveCorrect = 0;
        appState.gameState.debuff = 0;
        appState.gameEnded = false;
        w.updateGameUI();

        const option = appState.gameState.pendingDeathOption;
        const title = '死里逃生！';
        const content = `
          <div class="warning-box">
            <strong>⚠️ 这个选择原本是致命的！</strong><br>
            ${option.result}
          </div>
          <div class="tip-box">
            <strong>你使用了1次求救机会，死里逃生！</strong><br>
            - 消耗1次求救机会<br>
            - 生命值降低到1点<br>
            - 清除所有负面状态<br>
            - 连续正确计数重置<br>
            <br>
            <strong>请谨慎选择，继续前行！</strong>
          </div>
          <br><strong>历史知识点：</strong>${option.history}
        `;

        appState.gameState.pendingDeathOption = null;
        w.showHistoryModal(title, content);
      }

      w.HelpImpl = { useHelpImpl, useDeathHelpImpl };

      // IMPORTANT: Do not overwrite legacy globals here.
      // game.js keeps `useHelp()`/`useDeathHelp()` as stable entrypoints and delegates to HelpImpl.
      // This avoids fighting with other plugins that wrap those globals.
    }
  };
}

window.Plugins = window.Plugins || {};
window.Plugins.createHelpImplPlugin = createHelpImplPlugin;
