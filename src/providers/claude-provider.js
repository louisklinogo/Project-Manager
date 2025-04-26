/**
 * Claude AI Provider
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { AIProvider } from './ai-provider.js';
import { retryWithExponentialBackoff, createErrorFromApiError, ErrorType } from '../core/utils/error-handler.js';

export class ClaudeProvider extends AIProvider {
  /**
   * Initialize the Claude provider
   * @param {Object} config - Provider configuration
   */
  constructor(config = {}) {
    super(config);
    this.name = 'claude';
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required but not provided');
    }

    this.client = new Anthropic({
      apiKey: this.apiKey
    });

    this.defaultModel = config.model || process.env.DEFAULT_MODEL || 'claude-3-7-sonnet-20250219';
    this.defaultMaxTokens = parseInt(config.maxTokens || process.env.MAX_TOKENS || 64000, 10);
    this.defaultTemperature = parseFloat(config.temperature || process.env.TEMPERATURE || 0.2);
  }

  /**
   * Get available models from Claude
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    // Claude doesn't have an API to list models, so we return a static list
    return [
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
      'claude-3-sonnet-20240229',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2'
    ];
  }

  /**
   * Generate a completion using Claude
   * @param {Object} params - Completion parameters
   * @returns {Promise<Object>} Completion result
   */
  async generateCompletion(params) {
    const model = params.model || this.defaultModel;
    const maxTokens = params.maxTokens || this.defaultMaxTokens;
    const temperature = params.temperature || this.defaultTemperature;

    return retryWithExponentialBackoff(async () => {
      try {
        const response = await this.client.completions.create({
          model,
          prompt: params.prompt,
          max_tokens_to_sample: maxTokens,
          temperature,
          ...params.options
        });

        return {
          provider: this.name,
          model,
          completion: response.completion,
          raw: response
        };
      } catch (error) {
        throw createErrorFromApiError(error, 'Claude completion generation');
      }
    }, {
      maxRetries: 3,
      shouldRetry: (error) => {
        return error.type === ErrorType.NETWORK_ERROR ||
               error.type === ErrorType.TIMEOUT_ERROR ||
               error.type === ErrorType.RATE_LIMIT_ERROR;
      },
      onRetry: (error, attempt, delay) => {
        console.warn(`Retrying Claude completion after error: ${error.message} (Attempt ${attempt}, Delay: ${delay}ms)`);
      }
    });
  }

  /**
   * Generate a chat completion using Claude
   * @param {Object} params - Chat completion parameters
   * @returns {Promise<Object>} Chat completion result
   */
  async generateChatCompletion(params) {
    const model = params.model || this.defaultModel;
    const maxTokens = params.maxTokens || this.defaultMaxTokens;
    const temperature = params.temperature || this.defaultTemperature;

    return retryWithExponentialBackoff(async () => {
      try {
        const response = await this.client.messages.create({
          model,
          messages: params.messages,
          max_tokens: maxTokens,
          temperature,
          ...params.options
        });

        return {
          provider: this.name,
          model,
          message: response.content,
          raw: response
        };
      } catch (error) {
        throw createErrorFromApiError(error, 'Claude chat completion generation');
      }
    }, {
      maxRetries: 3,
      shouldRetry: (error) => {
        return error.type === ErrorType.NETWORK_ERROR ||
               error.type === ErrorType.TIMEOUT_ERROR ||
               error.type === ErrorType.RATE_LIMIT_ERROR;
      },
      onRetry: (error, attempt, delay) => {
        console.warn(`Retrying Claude chat completion after error: ${error.message} (Attempt ${attempt}, Delay: ${delay}ms)`);
      }
    });
  }

  /**
   * Generate a streaming chat completion using Claude
   * @param {Object} params - Chat completion parameters
   * @param {Function} callback - Callback function for each chunk
   * @returns {Promise<void>}
   */
  async generateStreamingChatCompletion(params, callback) {
    const model = params.model || this.defaultModel;
    const maxTokens = params.maxTokens || this.defaultMaxTokens;
    const temperature = params.temperature || this.defaultTemperature;

    return retryWithExponentialBackoff(async () => {
      try {
        const stream = await this.client.messages.stream({
          model,
          messages: params.messages,
          max_tokens: maxTokens,
          temperature,
          ...params.options
        });

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.text) {
            callback({
              provider: this.name,
              model,
              chunk: chunk.delta.text,
              raw: chunk
            });
          }
        }
      } catch (error) {
        throw createErrorFromApiError(error, 'Claude streaming chat completion generation');
      }
    }, {
      maxRetries: 2, // Fewer retries for streaming to avoid long delays
      shouldRetry: (error) => {
        return error.type === ErrorType.NETWORK_ERROR ||
               error.type === ErrorType.TIMEOUT_ERROR;
      },
      onRetry: (error, attempt, delay) => {
        console.warn(`Retrying Claude streaming chat completion after error: ${error.message} (Attempt ${attempt}, Delay: ${delay}ms)`);
        // Notify the client that we're retrying
        callback({
          provider: this.name,
          model,
          chunk: `\n[Connection error. Retrying... (${attempt})]`,
          isRetry: true
        });
      }
    });
  }
}
