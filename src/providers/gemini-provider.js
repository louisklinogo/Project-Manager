/**
 * Gemini AI Provider
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './ai-provider.js';

export class GeminiProvider extends AIProvider {
  /**
   * Initialize the Gemini provider
   * @param {Object} config - Provider configuration
   */
  constructor(config = {}) {
    super(config);
    this.name = 'gemini';
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required but not provided');
    }

    this.client = new GoogleGenerativeAI(this.apiKey);

    this.defaultModel = config.model || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.defaultMaxTokens = parseInt(config.maxTokens || process.env.MAX_TOKENS || 64000, 10);
    this.defaultTemperature = parseFloat(config.temperature || process.env.TEMPERATURE || 0.2);
  }

  /**
   * Get available models from Gemini
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    // Gemini doesn't have an API to list models, so we return a static list
    // Only include models that are known to work with the current API version
    return [
      // Latest models (as of April 2025)
      'gemini-2.5-pro-preview-03-25',
      'gemini-2.5-flash-preview-04-17',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b'
    ];
  }

  /**
   * Convert messages to Gemini format
   * @param {Array} messages - Messages in OpenAI format
   * @returns {Array} Messages in Gemini format
   */
  _convertMessages(messages) {
    // Gemini doesn't support system messages, so we need to handle them differently
    // We'll combine system messages with the first user message
    let systemMessage = '';
    const geminiMessages = [];

    for (const message of messages) {
      if (message.role === 'system') {
        // Collect system messages
        systemMessage += message.content + '\n';
      } else if (message.role === 'assistant') {
        // Convert assistant to model
        geminiMessages.push({
          role: 'model',
          parts: [{ text: message.content }]
        });
      } else {
        // Handle user messages
        if (systemMessage && message.role === 'user' && geminiMessages.length === 0) {
          // Prepend system message to the first user message
          geminiMessages.push({
            role: 'user',
            parts: [{ text: `${systemMessage}\n\n${message.content}` }]
          });
          systemMessage = ''; // Clear system message after using it
        } else {
          // Regular user message
          geminiMessages.push({
            role: message.role,
            parts: [{ text: message.content }]
          });
        }
      }
    }

    return geminiMessages;
  }

  /**
   * Generate a completion using Gemini
   * @param {Object} params - Completion parameters
   * @returns {Promise<Object>} Completion result
   */
  async generateCompletion(params) {
    const model = params.model || this.defaultModel;
    const maxTokens = params.maxTokens || this.defaultMaxTokens;
    const temperature = params.temperature || this.defaultTemperature;

    const geminiModel = this.client.getGenerativeModel({ model });

    const response = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
        ...params.options
      }
    });

    return {
      provider: this.name,
      model,
      completion: response.response.text(),
      raw: response
    };
  }

  /**
   * Generate a chat completion using Gemini
   * @param {Object} params - Chat completion parameters
   * @returns {Promise<Object>} Chat completion result
   */
  async generateChatCompletion(params) {
    const model = params.model || this.defaultModel;
    const maxTokens = params.maxTokens || this.defaultMaxTokens;
    const temperature = params.temperature || this.defaultTemperature;

    const geminiModel = this.client.getGenerativeModel({ model });
    const geminiMessages = this._convertMessages(params.messages);

    const response = await geminiModel.generateContent({
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
        ...params.options
      }
    });

    // Convert to a standardized format similar to OpenAI for easier integration
    return {
      provider: this.name,
      model,
      choices: [
        {
          message: {
            role: 'assistant',
            content: response.response.text()
          },
          index: 0,
          finish_reason: 'stop'
        }
      ],
      // Also include the original format
      message: response.response.text(),
      raw: response
    };
  }

  /**
   * Generate a streaming chat completion using Gemini
   * @param {Object} params - Chat completion parameters
   * @param {Function} callback - Callback function for each chunk
   * @returns {Promise<void>}
   */
  async generateStreamingChatCompletion(params, callback) {
    // For simplicity, we'll use a non-streaming approach and simulate streaming
    // This is more reliable for testing purposes
    const chatCompletion = await this.generateChatCompletion(params);
    const text = chatCompletion.message;

    // Split the text into words to simulate streaming
    const words = text.split(' ');

    for (const word of words) {
      callback({
        provider: this.name,
        model: chatCompletion.model,
        chunk: word + ' ',
        raw: { text: word }
      });

      // Add a small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}
