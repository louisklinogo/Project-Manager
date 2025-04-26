/**
 * AI client utility functions for Project Manager
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
 * @returns {object} - Model configuration
 */
export function getModelConfig() {
  return {
    anthropic: {
      model: process.env.DEFAULT_MODEL || 'claude-3-7-sonnet-20250219',
      max_tokens: parseInt(process.env.MAX_TOKENS, 10) || 64000,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.2
    },
    openai: {
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      max_tokens: parseInt(process.env.MAX_TOKENS, 10) || 64000,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.2
    },
    gemini: {
      model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
      max_tokens: parseInt(process.env.MAX_TOKENS, 10) || 64000,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.2
    },
    perplexity: {
      model: process.env.PERPLEXITY_MODEL || 'sonar-pro',
      max_tokens: parseInt(process.env.MAX_TOKENS, 10) || 4000,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.2
    }
  };
}

/**
 * Get the best available AI model
 * @param {object} options - Options for model selection
 * @returns {object} - Best available model and client
 */
export function getBestAvailableAIModel(options = {}) {
  const modelConfig = getModelConfig();
  
  // Try Anthropic first
  try {
    const anthropicClient = getAnthropicClientForMCP(options);
    return {
      provider: 'anthropic',
      client: anthropicClient,
      config: modelConfig.anthropic
    };
  } catch (error) {
    console.warn('Anthropic client not available:', error.message);
  }
  
  // Try OpenAI next
  try {
    const openaiClient = getOpenAIClientForMCP(options);
    return {
      provider: 'openai',
      client: openaiClient,
      config: modelConfig.openai
    };
  } catch (error) {
    console.warn('OpenAI client not available:', error.message);
  }
  
  // Try Gemini next
  try {
    const geminiClient = getGeminiClientForMCP(options);
    return {
      provider: 'gemini',
      client: geminiClient,
      config: modelConfig.gemini
    };
  } catch (error) {
    console.warn('Gemini client not available:', error.message);
  }
  
  // Try Perplexity last
  try {
    const perplexityClient = getPerplexityClientForMCP(options);
    return {
      provider: 'perplexity',
      client: perplexityClient,
      config: modelConfig.perplexity
    };
  } catch (error) {
    console.warn('Perplexity client not available:', error.message);
  }
  
  throw new Error('No AI providers available. Please check your API keys and try again.');
}

/**
 * Handle AI errors
 * @param {Error} error - Error object
 * @param {string} operation - Operation being performed
 * @returns {object} - Error object with additional information
 */
export function handleAIError(error, operation = 'AI operation') {
  console.error(`Error during ${operation}:`, error);
  
  // Handle Anthropic-specific errors
  if (error.name === 'AnthropicError') {
    return {
      message: `Anthropic API error: ${error.message}`,
      status: error.status || 500,
      type: 'anthropic_error',
      details: error
    };
  }
  
  // Handle OpenAI-specific errors
  if (error.name === 'OpenAIError') {
    return {
      message: `OpenAI API error: ${error.message}`,
      status: error.status || 500,
      type: 'openai_error',
      details: error
    };
  }
  
  // Handle Gemini-specific errors
  if (error.name === 'GoogleGenerativeAIError') {
    return {
      message: `Gemini API error: ${error.message}`,
      status: error.status || 500,
      type: 'gemini_error',
      details: error
    };
  }
  
  // Handle generic errors
  return {
    message: `Error during ${operation}: ${error.message}`,
    status: error.status || 500,
    type: 'ai_error',
    details: error
  };
}
