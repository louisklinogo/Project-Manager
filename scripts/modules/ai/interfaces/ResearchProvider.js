/**
 * ResearchProvider.js
 * Interface for research-capable AI providers
 */

import IAIService from "./IAIService.js";

/**
 * ResearchProvider Interface
 * Interface for AI providers with research capabilities
 * Extends the base IAIService interface with research-specific methods
 */
class ResearchProvider extends IAIService {
  /**
   * Initialize the research provider
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    super(config);

    if (this.constructor === ResearchProvider) {
      throw new Error(
        "ResearchProvider is an abstract class and cannot be instantiated directly",
      );
    }
  }

  /**
   * Perform research on a topic
   * @param {Object} options - Research options
   * @param {string} options.query - The research query
   * @param {number} options.maxResults - Maximum number of results
   * @param {string} options.depth - Research depth ('basic' or 'comprehensive')
   * @param {Function} options.onProgress - Callback for research progress
   * @returns {Promise<Object>} - Research results
   */
  async research(options) {
    throw new Error("Method 'research' must be implemented");
  }

  /**
   * Get sources for the research
   * @param {Object} options - Source options
   * @param {string} options.query - The research query
   * @param {number} options.maxSources - Maximum number of sources
   * @returns {Promise<Array>} - List of sources
   */
  async getSources(options) {
    throw new Error("Method 'getSources' must be implemented");
  }

  /**
   * Check if the provider supports a specific research feature
   * @param {string} feature - The feature to check
   * @returns {boolean} - Whether the feature is supported
   */
  supportsFeature(feature) {
    throw new Error("Method 'supportsFeature' must be implemented");
  }

  /**
   * Get the research capabilities
   * @returns {Object} - The research capabilities
   */
  getResearchCapabilities() {
    throw new Error("Method 'getResearchCapabilities' must be implemented");
  }
}

export default ResearchProvider;
