function createReviewKnowledgePlugin() {
  return {
    id: 'reviewKnowledge',
    init(ctx) {
      const w = window;
      this._orig = this._orig || {};

      if (typeof w.extractKnowledgeFromGame === 'function' && !this._orig.extractKnowledgeFromGame) {
        this._orig.extractKnowledgeFromGame = w.extractKnowledgeFromGame;
        w.extractKnowledgeFromGame = (...args) => {
          if (ctx.flags.reviewKnowledge === false) return;
          return this._orig.extractKnowledgeFromGame(...args);
        };
      }

      if (typeof w.goToReview === 'function' && !this._orig.goToReview) {
        this._orig.goToReview = w.goToReview;
        w.goToReview = (...args) => {
          if (ctx.flags.reviewKnowledge === false) {
            alert('复盘功能已在设置中关闭');
            return;
          }
          return this._orig.goToReview(...args);
        };
      }
    },
    onToggle(enabled) {
      const reviewBtn = document.getElementById('review-btn');
      if (reviewBtn) reviewBtn.style.display = enabled ? '' : 'none';
      const weaknessBox = document.getElementById('weakness-box');
      if (weaknessBox && !enabled) weaknessBox.style.display = 'none';
    }
  };
}

window.Plugins = window.Plugins || {};
window.Plugins.createReviewKnowledgePlugin = createReviewKnowledgePlugin;
