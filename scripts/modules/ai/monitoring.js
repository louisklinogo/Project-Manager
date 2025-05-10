/**
 * monitoring.js
 * System health monitoring for AI providers
 */

import AIServiceFactory from "./AIServiceFactory.js";

/**
 * AIProviderMonitor
 * Monitors the health and performance of AI providers
 */
class AIProviderMonitor {
  /**
   * Initialize the monitor
   * @param {AIServiceFactory} factory - The AI service factory to monitor
   * @param {Object} config - Configuration options
   * @param {Object} config.logger - Logger object (default: console)
   * @param {number} config.checkInterval - Check interval in milliseconds (default: 60000)
   * @param {number} config.timeoutThreshold - Timeout threshold in milliseconds (default: 5000)
   * @param {number} config.errorThreshold - Error threshold count (default: 3)
   */
  constructor(factory, config = {}) {
    this.factory = factory;
    this.config = {
      logger: console,
      checkInterval: 60000, // 1 minute
      timeoutThreshold: 5000, // 5 seconds
      errorThreshold: 3,
      ...config,
    };

    this.logger = this.config.logger;
    this.stats = new Map();
    this.checkIntervalId = null;
    this.isRunning = false;
  }

  /**
   * Start monitoring
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.logger.info("Starting AI provider monitoring");

    // Initialize stats for all providers
    for (const [name, provider] of this.factory.providers.entries()) {
      this.stats.set(name, {
        available: true,
        lastCheck: null,
        responseTime: [],
        errorCount: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
      });
    }

    // Start periodic health checks
    this.checkIntervalId = setInterval(() => {
      this.checkHealth();
    }, this.config.checkInterval);

    // Run an initial health check
    this.checkHealth();
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.logger.info("Stopping AI provider monitoring");

    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  /**
   * Check the health of all providers
   */
  async checkHealth() {
    this.logger.info("Checking AI provider health");

    const providers = Array.from(this.factory.providers.keys());
    const results = {};

    // Check each provider in parallel
    await Promise.all(
      providers.map(async (name) => {
        try {
          const provider = this.factory.getProvider(name);
          const startTime = Date.now();

          // Set a timeout for the health check
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(
                new Error(
                  `Health check timed out after ${this.config.timeoutThreshold}ms`,
                ),
              );
            }, this.config.timeoutThreshold);
          });

          // Run the health check with a timeout
          const available = await Promise.race([
            provider.isAvailable(),
            timeoutPromise,
          ]);

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          // Update stats
          const stats = this.stats.get(name);
          stats.available = available;
          stats.lastCheck = new Date();
          stats.responseTime.push(responseTime);

          // Keep only the last 10 response times
          if (stats.responseTime.length > 10) {
            stats.responseTime.shift();
          }

          // Reset error count on success
          stats.errorCount = 0;

          results[name] = {
            available,
            responseTime,
          };

          this.logger.info(
            `Provider ${name} health check: ${available ? "available" : "unavailable"} (${responseTime}ms)`,
          );
        } catch (error) {
          // Update stats on error
          const stats = this.stats.get(name);
          stats.available = false;
          stats.lastCheck = new Date();
          stats.errorCount++;

          results[name] = {
            available: false,
            error: error.message,
          };

          this.logger.warn(
            `Provider ${name} health check failed: ${error.message}`,
          );

          // If error threshold is reached, log a critical error
          if (stats.errorCount >= this.config.errorThreshold) {
            this.logger.error(
              `Provider ${name} has failed ${stats.errorCount} consecutive health checks`,
            );
          }
        }
      }),
    );

    return results;
  }

  /**
   * Record a request to a provider
   * @param {string} providerName - The name of the provider
   * @param {boolean} success - Whether the request was successful
   * @param {number} responseTime - The response time in milliseconds
   */
  recordRequest(providerName, success, responseTime) {
    if (!this.stats.has(providerName)) return;

    const stats = this.stats.get(providerName);
    stats.totalRequests++;

    if (success) {
      stats.successfulRequests++;
      stats.responseTime.push(responseTime);

      // Keep only the last 100 response times
      if (stats.responseTime.length > 100) {
        stats.responseTime.shift();
      }
    } else {
      stats.failedRequests++;
      stats.errorCount++;
    }
  }

  /**
   * Get the health status of all providers
   * @returns {Object} - Health status of all providers
   */
  getHealthStatus() {
    const status = {};

    for (const [name, stats] of this.stats.entries()) {
      // Calculate average response time
      const avgResponseTime =
        stats.responseTime.length > 0
          ? stats.responseTime.reduce((sum, time) => sum + time, 0) /
            stats.responseTime.length
          : null;

      // Calculate success rate
      const successRate =
        stats.totalRequests > 0
          ? (stats.successfulRequests / stats.totalRequests) * 100
          : null;

      status[name] = {
        available: stats.available,
        lastCheck: stats.lastCheck,
        avgResponseTime,
        errorCount: stats.errorCount,
        totalRequests: stats.totalRequests,
        successfulRequests: stats.successfulRequests,
        failedRequests: stats.failedRequests,
        successRate,
      };
    }

    return status;
  }

  /**
   * Get performance metrics for all providers
   * @returns {Object} - Performance metrics of all providers
   */
  getPerformanceMetrics() {
    const metrics = {};

    for (const [name, stats] of this.stats.entries()) {
      // Skip providers with no data
      if (stats.responseTime.length === 0) continue;

      // Calculate metrics
      const responseTime = stats.responseTime.slice().sort((a, b) => a - b);
      const min = responseTime[0];
      const max = responseTime[responseTime.length - 1];
      const median = responseTime[Math.floor(responseTime.length / 2)];
      const avg =
        responseTime.reduce((sum, time) => sum + time, 0) / responseTime.length;
      const p95 = responseTime[Math.floor(responseTime.length * 0.95)];
      const p99 = responseTime[Math.floor(responseTime.length * 0.99)];

      metrics[name] = {
        min,
        max,
        median,
        avg,
        p95,
        p99,
        sampleSize: responseTime.length,
      };
    }

    return metrics;
  }

  /**
   * Get the best performing provider
   * @param {Object} options - Options for provider selection
   * @param {boolean} options.requiresResearch - Whether research capabilities are required
   * @returns {string} - The name of the best performing provider
   */
  getBestPerformingProvider(options = {}) {
    const { requiresResearch = false } = options;

    let bestProvider = null;
    let bestScore = -Infinity;

    for (const [name, provider] of this.factory.providers.entries()) {
      // Skip unavailable providers
      const stats = this.stats.get(name);
      if (!stats.available) continue;

      // Skip providers that don't meet requirements
      if (requiresResearch) {
        const capabilities = provider.instance?.getCapabilities() || {};
        if (!capabilities.research) continue;
      }

      // Calculate score based on response time and success rate
      const avgResponseTime =
        stats.responseTime.length > 0
          ? stats.responseTime.reduce((sum, time) => sum + time, 0) /
            stats.responseTime.length
          : Infinity;

      const successRate =
        stats.totalRequests > 0
          ? stats.successfulRequests / stats.totalRequests
          : 0;

      // Score formula: success rate - normalized response time
      // Higher success rate and lower response time = better score
      const responseTimeScore =
        avgResponseTime === Infinity ? 0 : 1000 / avgResponseTime;
      const score = successRate * 0.7 + responseTimeScore * 0.3;

      if (score > bestScore) {
        bestScore = score;
        bestProvider = name;
      }
    }

    return bestProvider;
  }
}

export default AIProviderMonitor;
