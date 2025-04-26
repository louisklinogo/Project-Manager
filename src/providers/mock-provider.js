/**
 * Mock AI Provider for testing
 */

import { AIProvider } from './ai-provider.js';

export class MockProvider extends AIProvider {
  /**
   * Initialize the mock provider
   * @param {Object} config - Provider configuration
   */
  constructor(config = {}) {
    super(config);
    this.name = 'mock';
    this.apiKey = 'mock-api-key';
    this.defaultModel = 'mock-model';
    this.defaultMaxTokens = 1000;
    this.defaultTemperature = 0.5;
  }
  
  /**
   * Get available models from the mock provider
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    return ['mock-model-1', 'mock-model-2'];
  }
  
  /**
   * Generate a completion using the mock provider
   * @param {Object} params - Completion parameters
   * @returns {Promise<Object>} Completion result
   */
  async generateCompletion(params) {
    const model = params.model || this.defaultModel;
    
    return {
      provider: this.name,
      model,
      completion: `This is a mock completion for prompt: "${params.prompt?.substring(0, 50)}..."`,
      raw: { mock: true }
    };
  }
  
  /**
   * Generate a chat completion using the mock provider
   * @param {Object} params - Chat completion parameters
   * @returns {Promise<Object>} Chat completion result
   */
  async generateChatCompletion(params) {
    const model = params.model || this.defaultModel;
    const lastMessage = params.messages[params.messages.length - 1];
    
    return {
      provider: this.name,
      model,
      message: `This is a mock chat completion for message: "${lastMessage.content?.substring(0, 50)}..."`,
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
    const model = params.model || this.defaultModel;
    const lastMessage = params.messages[params.messages.length - 1];
    
    const response = `This is a mock streaming chat completion for message: "${lastMessage.content?.substring(0, 30)}..."`;
    const chunks = response.split(' ');
    
    for (const chunk of chunks) {
      callback({
        provider: this.name,
        model,
        chunk: chunk + ' ',
        raw: { mock: true }
      });
      
      // Add a small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}
