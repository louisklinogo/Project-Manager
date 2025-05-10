/**
 * feature-flags.js
 * Feature flags for AI provider infrastructure
 */

/**
 * AIFeatureFlags
 * Manages feature flags for AI provider infrastructure
 */
class AIFeatureFlags {
  /**
   * Initialize feature flags
   * @param {Object} config - Configuration options
   * @param {Object} config.logger - Logger object (default: console)
   * @param {Object} config.initialFlags - Initial feature flags (default: {})
   */
  constructor(config = {}) {
    this.config = {
      logger: console,
      initialFlags: {},
      ...config,
    };

    this.logger = this.config.logger;
    this.flags = {
      // Provider flags
      "provider.anthropic.enabled": true,
      "provider.openai.enabled": true,
      "provider.gemini.enabled": true,
      "provider.perplexity.enabled": true,

      // Feature flags
      "feature.streaming.enabled": true,
      "feature.research.enabled": true,
      "feature.fallback.enabled": true,
      "feature.monitoring.enabled": true,

      // Rollout flags
      "rollout.openai.percentage": 100,
      "rollout.gemini.percentage": 100,

      // Override with initial flags
      ...this.config.initialFlags,
    };
  }

  /**
   * Get a feature flag value
   * @param {string} flag - The flag name
   * @param {*} defaultValue - Default value if flag is not found
   * @returns {*} - The flag value
   */
  get(flag, defaultValue = false) {
    return flag in this.flags ? this.flags[flag] : defaultValue;
  }

  /**
   * Set a feature flag value
   * @param {string} flag - The flag name
   * @param {*} value - The flag value
   */
  set(flag, value) {
    this.flags[flag] = value;
    this.logger.info(`Feature flag ${flag} set to ${value}`);
  }

  /**
   * Check if a feature is enabled
   * @param {string} feature - The feature name
   * @returns {boolean} - Whether the feature is enabled
   */
  isEnabled(feature) {
    return this.get(`feature.${feature}.enabled`, false);
  }

  /**
   * Check if a provider is enabled
   * @param {string} provider - The provider name
   * @returns {boolean} - Whether the provider is enabled
   */
  isProviderEnabled(provider) {
    return this.get(`provider.${provider}.enabled`, false);
  }

  /**
   * Check if a user is in the rollout for a feature
   * @param {string} feature - The feature name
   * @param {string} userId - The user ID
   * @returns {boolean} - Whether the user is in the rollout
   */
  isUserInRollout(feature, userId) {
    const percentage = this.get(`rollout.${feature}.percentage`, 0);

    // If percentage is 0 or 100, we can return immediately
    if (percentage <= 0) return false;
    if (percentage >= 100) return true;

    // Otherwise, hash the user ID to get a consistent value
    const hash = this.hashString(userId);
    const normalizedHash = hash % 100;

    return normalizedHash < percentage;
  }

  /**
   * Hash a string to a number
   * @param {string} str - The string to hash
   * @returns {number} - The hash value
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get all feature flags
   * @returns {Object} - All feature flags
   */
  getAllFlags() {
    return { ...this.flags };
  }

  /**
   * Reset feature flags to defaults
   */
  reset() {
    this.flags = {
      "provider.anthropic.enabled": true,
      "provider.openai.enabled": true,
      "provider.gemini.enabled": true,
      "provider.perplexity.enabled": true,

      "feature.streaming.enabled": true,
      "feature.research.enabled": true,
      "feature.fallback.enabled": true,
      "feature.monitoring.enabled": true,

      "rollout.openai.percentage": 100,
      "rollout.gemini.percentage": 100,
    };

    this.logger.info("Feature flags reset to defaults");
  }

  /**
   * Load feature flags from environment variables
   */
  loadFromEnvironment() {
    // Look for environment variables with the prefix AI_FEATURE_
    for (const key in process.env) {
      if (key.startsWith("AI_FEATURE_")) {
        // Convert environment variable name to flag name
        // AI_FEATURE_PROVIDER_ANTHROPIC_ENABLED -> provider.anthropic.enabled
        const flagName = key
          .replace("AI_FEATURE_", "")
          .toLowerCase()
          .replace(/_/g, ".");

        // Parse the value
        let value = process.env[key];
        if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (!isNaN(value)) value = Number(value);

        // Set the flag
        this.set(flagName, value);
      }
    }

    this.logger.info("Feature flags loaded from environment variables");
  }
}

// Export the feature flags class
export default AIFeatureFlags;
