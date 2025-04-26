import { AIProvider } from '../../../src/providers/ai-provider.js';

/**
 * Mock AI Provider for testing
 */
export class MockProvider extends AIProvider {
  /**
   * Initialize the mock provider
   * @param {Object} config - Provider configuration
   */
  constructor(config = {}) {
    super(config);
    this.name = 'mock';
    this.shouldFail = config.shouldFail || false;
  }
  
  /**
   * Get available models from the mock provider
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    if (this.shouldFail) {
      throw new Error('Mock provider failed');
    }
    return ['mock-model-1', 'mock-model-2'];
  }
  
  /**
   * Generate a completion using the mock provider
   * @param {Object} params - Completion parameters
   * @returns {Promise<Object>} Completion result
   */
  async generateCompletion(params) {
    if (this.shouldFail) {
      throw new Error('Mock provider failed');
    }
    return {
      provider: this.name,
      model: params.model || 'mock-model-1',
      completion: 'This is a mock completion',
      raw: { mock: true }
    };
  }
  
  /**
   * Generate a chat completion using the mock provider
   * @param {Object} params - Chat completion parameters
   * @returns {Promise<Object>} Chat completion result
   */
  async generateChatCompletion(params) {
    if (this.shouldFail) {
      throw new Error('Mock provider failed');
    }
    return {
      provider: this.name,
      model: params.model || 'mock-model-1',
      message: 'This is a mock chat completion',
      raw: { mock: true }
    };
  }
  
  /**
   * Generate a streaming chat completion using the mock provider
   * @param {Object} params - Chat completion parameters
   * @param {Function} callback - Callback function for each chunk
   * @returns {Promise<void>}
   */
  async generateStreamingChatCompletion(params, callback) {
    if (this.shouldFail) {
      throw new Error('Mock provider failed');
    }
    
    const chunks = ['This', ' is', ' a', ' mock', ' streaming', ' chat', ' completion'];
    
    for (const chunk of chunks) {
      callback({
        provider: this.name,
        model: params.model || 'mock-model-1',
        chunk,
        raw: { mock: true }
      });
      
      // Simulate delay between chunks
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}
