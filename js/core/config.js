// Feature flags (plugin toggles)
// Stored in localStorage so users can enable/disable modules.

const FEATURE_FLAGS_KEY = 'history_survivor_feature_flags_v1';

const DEFAULT_FEATURE_FLAGS = {
  branching: true,
  levelSelect: true,
  cloudPacks: true,
  help: true,
  countdown: true,
  reviewKnowledge: true
};

function loadFeatureFlags() {
  try {
    const raw = localStorage.getItem(FEATURE_FLAGS_KEY);
    if (!raw) return { ...DEFAULT_FEATURE_FLAGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FEATURE_FLAGS, ...(parsed || {}) };
  } catch {
    return { ...DEFAULT_FEATURE_FLAGS };
  }
}

function saveFeatureFlags(flags) {
  try {
    localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(flags));
  } catch {
    // ignore
  }
}

function isFeatureEnabled(flags, key) {
  return flags[key] !== false;
}

window.FeatureFlags = {
  FEATURE_FLAGS_KEY,
  DEFAULT_FEATURE_FLAGS,
  loadFeatureFlags,
  saveFeatureFlags,
  isFeatureEnabled
};
