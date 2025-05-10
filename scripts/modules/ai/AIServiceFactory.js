/**
 * AIServiceFactory.js
 * Factory for creating and managing AI service providers
 */

/**
 * AIServiceFactory
 * Factory for creating and managing AI service providers
 */
class AIServiceFactory {
  /**
   * Initialize the factory
   * @param {Object} config - Configuration options
   * @param {Object} config.logger - Logger object (default: console)
   */
  constructor(config = {}) {
    this.config = {
      logger: console,
      ...config,
    };

    this.logger = this.config.logger;
    this.providers = new Map(); // Cache of provider instances
    this.providerPriority = []; // Priority order for providers
  }

  /**
   * Register a provider with the factory
   * @param {string} name - Provider name
   * @param {Class} providerClass - Provider class
   * @param {Object} config - Provider configuration
   * @param {number} priority - Provider priority (lower is higher priority)
   */
  registerProvider(name, providerClass, config, priority = 100) {
    this.providerPriority.push({ name, priority });
    this.providerPriority.sort((a, b) => a.priority - b.priority);

    // Store the provider class and config for lazy initialization
    this.providers.set(name, {
      class: providerClass,
      config,
      instance: null,
    });

    this.logger.info(
      `Registered AI provider: ${name} with priority ${priority}`,
    );
  }

  /**
   * Get a provider instance
   * @param {string} name - Provider name
   * @returns {IAIService} - Provider instance
   */
  getProvider(name) {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider not found: ${name}`);
    }

    // Lazy initialization
    if (!provider.instance) {
      try {
        provider.instance = new provider.class(provider.config);
        this.logger.info(`Initialized AI provider: ${name}`);
      } catch (error) {
        this.logger.error(
          `Failed to initialize provider ${name}: ${error.message}`,
        );
        throw error;
      }
    }

    return provider.instance;
  }

  /**
   * Get the best available provider based on requirements
   * @param {Object} options - Selection options
   * @param {boolean} options.requiresResearch - Whether research capabilities are required
   * @param {Array<string>} options.preferredProviders - Preferred providers in order
   * @returns {Promise<IAIService>} - The best available provider
   */
  async getBestProvider(options = {}) {
    const { requiresResearch = false, preferredProviders = [] } = options;

    // Try preferred providers first
    for (const name of preferredProviders) {
      if (this.providers.has(name)) {
        try {
          const provider = this.getProvider(name);
          const isAvailable = await provider.isAvailable();

          if (isAvailable) {
            // Check if provider meets requirements
            if (requiresResearch) {
              const capabilities = provider.getCapabilities();
              if (!capabilities.research) {
                this.logger.info(
                  `Provider ${name} does not support research, skipping`,
                );
                continue;
              }
            }

            this.logger.info(`Selected preferred provider: ${name}`);
            return provider;
          }
        } catch (error) {
          this.logger.warn(
            `Error with preferred provider ${name}: ${error.message}`,
          );
        }
      }
    }

    // Try providers in priority order
    for (const { name } of this.providerPriority) {
      try {
        const provider = this.getProvider(name);
        const isAvailable = await provider.isAvailable();

        if (isAvailable) {
          // Check if provider meets requirements
          if (requiresResearch) {
            const capabilities = provider.getCapabilities();
            if (!capabilities.research) {
              this.logger.info(
                `Provider ${name} does not support research, skipping`,
              );
              continue;
            }
          }

          this.logger.info(`Selected provider by priority: ${name}`);
          return provider;
        }
      } catch (error) {
        this.logger.warn(`Error with provider ${name}: ${error.message}`);
      }
    }

    throw new Error(
      "No available AI providers found that meet the requirements",
    );
  }

  /**
   * Clear the provider cache
   */
  clearCache() {
    for (const [name, provider] of this.providers.entries()) {
      provider.instance = null;
    }
    this.logger.info("Cleared provider cache");
  }
}

export default AIServiceFactory;
