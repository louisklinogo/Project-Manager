/**
 * Export all AI providers
 */

import { AIProvider } from './ai-provider.js';
import { ClaudeProvider } from './claude-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { GeminiProvider } from './gemini-provider.js';
import { PerplexityProvider } from './perplexity-provider.js';
import { MockProvider } from './mock-provider.js';

// Re-export all providers
export {
  AIProvider,
  ClaudeProvider,
  OpenAIProvider,
  GeminiProvider,
  PerplexityProvider,
  MockProvider
};

/**
 * Get the best available AI provider
 * @param {Object} options - Options for provider selection
 * @returns {Promise<Object>} Best available provider
 */
export async function getBestAvailableProvider(options = {}) {
  // Try each provider in order of preference
  const providers = [];

  // Try Gemini provider first (preferred for testing)
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiProvider = new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        ...options
      });
      providers.push(geminiProvider);
    } catch (error) {
      console.warn('Gemini provider initialization failed:', error.message);
    }
  }

  // Try Claude provider
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const claudeProvider = new ClaudeProvider({
        apiKey: process.env.ANTHROPIC_API_KEY,
        ...options
      });
      providers.push(claudeProvider);
    } catch (error) {
      console.warn('Claude provider initialization failed:', error.message);
    }
  }

  // Try OpenAI provider (note: may have quota issues)
  if (process.env.OPENAI_API_KEY) {
    try {
      const openaiProvider = new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        ...options
      });
      providers.push(openaiProvider);
    } catch (error) {
      console.warn('OpenAI provider initialization failed:', error.message);
    }
  }

  // Try Perplexity provider
  if (process.env.PERPLEXITY_API_KEY) {
    try {
      const perplexityProvider = new PerplexityProvider({
        apiKey: process.env.PERPLEXITY_API_KEY,
        ...options
      });
      providers.push(perplexityProvider);
    } catch (error) {
      console.warn('Perplexity provider initialization failed:', error.message);
    }
  }

  // Check if any provider is available
  for (const provider of providers) {
    try {
      const available = await provider.isAvailable();
      if (available) {
        return provider;
      }
    } catch (error) {
      console.warn(`${provider.name} provider availability check failed:`, error.message);
    }
  }

  // If no provider is available, create a mock provider for testing
  if (process.env.NODE_ENV === 'test' || options.allowMock) {
    console.warn('No AI providers available, creating mock provider for testing');
    return new MockProvider(options);
  }

  throw new Error('No AI providers available. Please check your API keys and try again.');
}

/**
 * Get a provider by name
 * @param {string} name - Provider name
 * @param {Object} options - Options for provider
 * @returns {AIProvider} Provider instance
 */
export function getProviderByName(name, options = {}) {
  switch (name.toLowerCase()) {
    case 'claude':
    case 'anthropic':
      try {
        return new ClaudeProvider(options);
      } catch (error) {
        console.warn('Claude provider not available:', error.message);
        if (options.allowMock) {
          console.warn('Using mock provider instead');
          return new MockProvider(options);
        }
        throw error;
      }
    case 'openai':
    case 'gpt':
      try {
        return new OpenAIProvider(options);
      } catch (error) {
        console.warn('OpenAI provider not available:', error.message);
        if (options.allowMock) {
          console.warn('Using mock provider instead');
          return new MockProvider(options);
        }
        throw error;
      }
    case 'gemini':
    case 'google':
      try {
        return new GeminiProvider(options);
      } catch (error) {
        console.warn('Gemini provider not available:', error.message);
        if (options.allowMock) {
          console.warn('Using mock provider instead');
          return new MockProvider(options);
        }
        throw error;
      }
    case 'perplexity':
    case 'sonar':
      try {
        return new PerplexityProvider(options);
      } catch (error) {
        console.warn('Perplexity provider not available:', error.message);
        if (options.allowMock) {
          console.warn('Using mock provider instead');
          return new MockProvider(options);
        }
        throw error;
      }
    case 'mock':
      return new MockProvider(options);
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}
