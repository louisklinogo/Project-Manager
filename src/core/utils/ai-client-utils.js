/**
 * @fileoverview AI client utility functions for Project Manager
 *
 * This module provides utility functions for working with AI providers
 * like Anthropic, OpenAI, Google Gemini, and Perplexity.
 *
 * @module core/utils/ai-client-utils
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { handleError } from './error-handler.js';
import config from '../config.js';
import logger from './logger.js';

// Cache for AI clients to avoid recreating them
const clientCache = {
  anthropic: null,
  openai: null,
  gemini: null,
  perplexity: null
};

/**
 * Get an Anthropic client for MCP
 * @param {object} options - Options for the client
 * @returns {Anthropic} - Anthropic client
 */
export function getAnthropicClientForMCP(options = {}) {
  if (clientCache.anthropic) {
    return clientCache.anthropic;
  }

  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required but not provided');
  }

  clientCache.anthropic = new Anthropic({
    apiKey
  });

  return clientCache.anthropic;
}

/**
 * Get an OpenAI client for MCP
 * @param {object} options - Options for the client
 * @returns {OpenAI} - OpenAI client
 */
export function getOpenAIClientForMCP(options = {}) {
  if (clientCache.openai) {
    return clientCache.openai;
  }

  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required but not provided');
  }

  clientCache.openai = new OpenAI({
    apiKey
  });

  return clientCache.openai;
}

/**
 * Get a Gemini client for MCP
 * @param {object} options - Options for the client
 * @returns {GoogleGenerativeAI} - Gemini client
 */
export function getGeminiClientForMCP(options = {}) {
  if (clientCache.gemini) {
    return clientCache.gemini;
  }

  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required but not provided');
  }

  clientCache.gemini = new GoogleGenerativeAI(apiKey);

  return clientCache.gemini;
}

/**
 * Get a Perplexity client for MCP
 * @param {object} options - Options for the client
 * @returns {object} - Perplexity client
 */
export function getPerplexityClientForMCP(options = {}) {
  if (clientCache.perplexity) {
    return clientCache.perplexity;
  }

  const apiKey = options.apiKey || process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is required but not provided');
  }

  // Perplexity doesn't have an official SDK, so we'll create a simple client
  clientCache.perplexity = {
    apiKey,
    baseUrl: 'https://api.perplexity.ai',
    async query(options) {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: options.model || process.env.PERPLEXITY_MODEL || 'sonar-pro',
          messages: options.messages,
          max_tokens: options.max_tokens || parseInt(process.env.MAX_TOKENS, 10) || 4000,
          temperature: options.temperature || parseFloat(process.env.TEMPERATURE) || 0.2
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Perplexity API error: ${error.error?.message || response.statusText}`);
      }

      return response.json();
    }
  };

  return clientCache.perplexity;
}

/**
 * Get model configuration
 *
 * @param {Object} options - Options for model configuration
 * @param {string} options.provider - Provider to get configuration for (optional)
 * @returns {Object} - Model configuration for all providers or a specific provider
 */
export function getModelConfig(options = {}) {
  const modelConfig = {
    anthropic: {
      model: config.get('anthropic.defaultModel'),
      max_tokens: parseInt(process.env.MAX_TOKENS, 10) || 64000,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.2
    },
    openai: {
      model: config.get('openai.defaultModel'),
      max_tokens: parseInt(process.env.MAX_TOKENS, 10) || 64000,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.2
    },
    gemini: {
      model: config.get('gemini.defaultModel'),
      max_tokens: parseInt(process.env.MAX_TOKENS, 10) || 64000,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.2
    },
    perplexity: {
      model: config.get('perplexity.defaultModel'),
      max_tokens: parseInt(process.env.MAX_TOKENS, 10) || 4000,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.2
    }
  };

  // If a specific provider is requested, return only that provider's config
  if (options.provider && modelConfig[options.provider]) {
    return modelConfig[options.provider];
  }

  return modelConfig;
}

/**
 * Get the best available AI model
 *
 * @param {Object} options - Options for model selection
 * @param {string} options.preferredProvider - Preferred provider to use if available
 * @returns {Object} - Best available model and client
 * @throws {Error} If no AI providers are available
 */
export function getBestAvailableAIModel(options = {}) {
  const modelConfig = getModelConfig();
  const preferredProvider = options.preferredProvider || config.getDefaultProvider();
  const providers = ['anthropic', 'openai', 'gemini', 'perplexity'];

  // If a preferred provider is specified, try it first
  if (preferredProvider && providers.includes(preferredProvider)) {
    try {
      logger.debug(`Trying preferred provider: ${preferredProvider}`);

      let client;
      switch (preferredProvider) {
        case 'anthropic':
          client = getAnthropicClientForMCP(options);
          break;
        case 'openai':
          client = getOpenAIClientForMCP(options);
          break;
        case 'gemini':
          client = getGeminiClientForMCP(options);
          break;
        case 'perplexity':
          client = getPerplexityClientForMCP(options);
          break;
      }

      return {
        provider: preferredProvider,
        client,
        config: modelConfig[preferredProvider]
      };
    } catch (error) {
      logger.warn(`Preferred provider ${preferredProvider} not available:`, error.message);
    }
  }

  // Try each provider in order
  for (const provider of providers) {
    // Skip the preferred provider if it was already tried
    if (provider === preferredProvider) continue;

    try {
      logger.debug(`Trying provider: ${provider}`);

      let client;
      switch (provider) {
        case 'anthropic':
          client = getAnthropicClientForMCP(options);
          break;
        case 'openai':
          client = getOpenAIClientForMCP(options);
          break;
        case 'gemini':
          client = getGeminiClientForMCP(options);
          break;
        case 'perplexity':
          client = getPerplexityClientForMCP(options);
          break;
      }

      return {
        provider,
        client,
        config: modelConfig[provider]
      };
    } catch (error) {
      logger.warn(`${provider} client not available:`, error.message);
    }
  }

  logger.error('No AI providers available. Please check your API keys.');
  throw new Error('No AI providers available. Please check your API keys and try again.');
}

/**
 * Handle AI errors
 *
 * @param {Error} error - Error object
 * @param {string} operation - Operation being performed
 * @param {Object} options - Error handling options
 * @returns {Object} - Error object with additional information
 * @deprecated Use the error-handler.js module instead
 */
export function handleAIError(error, operation = 'AI operation', options = {}) {
  logger.warn('handleAIError is deprecated. Use error-handler.js module instead.');

  // Use the imported handleError function
  return handleError(error, operation, options);
}
