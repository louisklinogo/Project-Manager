/**
 * IAIService.js
 * Interface for AI service providers
 */

/**
 * IAIService Interface
 * Common interface for all AI service providers
 */
class IAIService {
  /**
   * Initialize the AI service with configuration
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    if (this.constructor === IAIService) {
      throw new Error(
        "IAIService is an abstract class and cannot be instantiated directly",
      );
    }
  }

  /**
   * Send a message to the AI model and get a response
   * @param {Object} options - Message options
   * @param {string} options.prompt - The prompt to send
   * @param {string} options.systemPrompt - System prompt (if applicable)
   * @param {number} options.maxTokens - Maximum tokens for response
   * @param {number} options.temperature - Temperature for response generation
   * @returns {Promise<Object>} - The AI response
   */
  async sendMessage(options) {
    throw new Error("Method 'sendMessage' must be implemented");
  }

  /**
   * Send a message to the AI model and get a streaming response
   * @param {Object} options - Message options
   * @param {string} options.prompt - The prompt to send
   * @param {string} options.systemPrompt - System prompt (if applicable)
   * @param {number} options.maxTokens - Maximum tokens for response
   * @param {number} options.temperature - Temperature for response generation
   * @param {Function} options.onProgress - Callback for streaming progress
   * @returns {Promise<Object>} - The complete AI response
   */
  async sendMessageStream(options) {
    throw new Error("Method 'sendMessageStream' must be implemented");
  }

  /**
   * Check if the service is available
   * @returns {Promise<boolean>} - Whether the service is available
   */
  async isAvailable() {
    throw new Error("Method 'isAvailable' must be implemented");
  }

  /**
   * Get the service name
   * @returns {string} - The service name
   */
  getName() {
    throw new Error("Method 'getName' must be implemented");
  }

  /**
   * Get the service capabilities
   * @returns {Object} - The service capabilities
   */
  getCapabilities() {
    throw new Error("Method 'getCapabilities' must be implemented");
  }

  /**
   * Handle an error from the service
   * @param {Error} error - The error to handle
   * @returns {Error} - Standardized error object
   */
  handleError(error) {
    throw new Error("Method 'handleError' must be implemented");
  }
}

export default IAIService;
