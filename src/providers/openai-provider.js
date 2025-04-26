/**
 * OpenAI Provider
 */

import { OpenAI } from 'openai';
import { AIProvider } from './ai-provider.js';

export class OpenAIProvider extends AIProvider {
  /**
   * Initialize the OpenAI provider
   * @param {Object} config - Provider configuration
   */
  constructor(config = {}) {
    super(config);
    this.name = 'openai';
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is required but not provided');
    }
    
    this.client = new OpenAI({
      apiKey: this.apiKey
    });
    
    this.defaultModel = config.model || process.env.OPENAI_MODEL || 'gpt-4o';
    this.defaultMaxTokens = parseInt(config.maxTokens || process.env.MAX_TOKENS || 64000, 10);
    this.defaultTemperature = parseFloat(config.temperature || process.env.TEMPERATURE || 0.2);
  }
  
  /**
   * Get available models from OpenAI
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    const response = await this.client.models.list();
    return response.data.map(model => model.id);
  }
  
  /**
   * Generate a completion using OpenAI
   * @param {Object} params - Completion parameters
   * @returns {Promise<Object>} Completion result
   */
  async generateCompletion(params) {
    const model = params.model || this.defaultModel;
    const maxTokens = params.maxTokens || this.defaultMaxTokens;
    const temperature = params.temperature || this.defaultTemperature;
    
    const response = await this.client.completions.create({
      model,
      prompt: params.prompt,
      max_tokens: maxTokens,
      temperature,
      ...params.options
    });
    
    return {
      provider: this.name,
      model,
      completion: response.choices[0].text,
      raw: response
    };
  }
  
  /**
   * Generate a chat completion using OpenAI
   * @param {Object} params - Chat completion parameters
   * @returns {Promise<Object>} Chat completion result
   */
  async generateChatCompletion(params) {
    const model = params.model || this.defaultModel;
    const maxTokens = params.maxTokens || this.defaultMaxTokens;
    const temperature = params.temperature || this.defaultTemperature;
    
    const response = await this.client.chat.completions.create({
      model,
      messages: params.messages,
      max_tokens: maxTokens,
      temperature,
      ...params.options
    });
    
    return {
      provider: this.name,
      model,
      message: response.choices[0].message.content,
      raw: response
    };
  }
  
  /**
   * Generate a streaming chat completion using OpenAI
   * @param {Object} params - Chat completion parameters
   * @param {Function} callback - Callback function for each chunk
   * @returns {Promise<void>}
   */
  async generateStreamingChatCompletion(params, callback) {
    const model = params.model || this.defaultModel;
    const maxTokens = params.maxTokens || this.defaultMaxTokens;
    const temperature = params.temperature || this.defaultTemperature;
    
    const stream = await this.client.chat.completions.create({
      model,
      messages: params.messages,
      max_tokens: maxTokens,
      temperature,
      stream: true,
      ...params.options
    });
    
    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        callback({
          provider: this.name,
          model,
          chunk: chunk.choices[0].delta.content,
          raw: chunk
        });
      }
    }
  }
}
