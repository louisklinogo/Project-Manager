/**
 * Base AI Provider class
 * This serves as the interface for all AI providers
 */
export class AIProvider {
  /**
   * Initialize the provider with configuration
   * @param {Object} config - Provider configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.name = 'base';
  }
  
  /**
   * Get available models from this provider
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    throw new Error('Method getAvailableModels must be implemented by subclass');
  }
  
  /**
   * Generate a completion using the specified model
   * @param {Object} params - Completion parameters
   * @returns {Promise<Object>} Completion result
   */
  async generateCompletion(params) {
    throw new Error('Method generateCompletion must be implemented by subclass');
  }
  
  /**
   * Generate a chat completion using the specified model
   * @param {Object} params - Chat completion parameters
   * @returns {Promise<Object>} Chat completion result
   */
  async generateChatCompletion(params) {
    throw new Error('Method generateChatCompletion must be implemented by subclass');
  }
  
  /**
   * Generate a streaming chat completion
   * @param {Object} params - Chat completion parameters
   * @param {Function} callback - Callback function for each chunk
   * @returns {Promise<void>}
   */
  async generateStreamingChatCompletion(params, callback) {
    throw new Error('Method generateStreamingChatCompletion must be implemented by subclass');
  }
  
  /**
   * Check if the provider is available
   * @returns {Promise<boolean>} Whether the provider is available
   */
  async isAvailable() {
    try {
      await this.getAvailableModels();
      return true;
    } catch (error) {
      return false;
    }
  }
}
