function createPluginManager(flags) {
  const plugins = new Map();

  function register(plugin) {
    if (!plugin || !plugin.id) throw new Error('Invalid plugin');
    plugins.set(plugin.id, plugin);
  }

  function initAll(ctx) {
    for (const plugin of plugins.values()) {
      const enabled = window.FeatureFlags.isFeatureEnabled(flags, plugin.id);

      // Always init so plugins can wrap functions and capture originals.
      if (typeof plugin.init === 'function') {
        plugin.init(ctx);
      }

      // Apply the current enabled state.
      if (typeof plugin.onToggle === 'function') {
        plugin.onToggle(enabled, ctx);
      }
    }
  }

  function toggle(id, enabled, ctx) {
    flags[id] = !!enabled;
    window.FeatureFlags.saveFeatureFlags(flags);
    const plugin = plugins.get(id);
    if (plugin && typeof plugin.onToggle === 'function') {
      plugin.onToggle(!!enabled, ctx);
    }
  }

  return { register, initAll, toggle, plugins, flags };
}

window.PluginManager = { createPluginManager };
