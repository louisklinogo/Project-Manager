/**
 * Mock providers for testing
 */

import { AIProvider } from '../../../src/providers/ai-provider.js';

/**
 * Mock Claude Provider
 */
export class MockClaudeProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'claude';
    this.shouldFail = config.shouldFail || false;
  }
  
  async getAvailableModels() {
    if (this.shouldFail) {
      throw new Error('Mock Claude provider failed');
    }
    return ['claude-3-7-sonnet-20250219', 'claude-3-opus-20240229'];
  }
  
  async generateCompletion(params) {
    if (this.shouldFail) {
      throw new Error('Mock Claude provider failed');
    }
    return {
      provider: this.name,
      model: params.model || 'claude-3-7-sonnet-20250219',
      completion: 'This is a mock Claude completion',
      raw: { mock: true }
    };
  }
  
  async generateChatCompletion(params) {
    if (this.shouldFail) {
      throw new Error('Mock Claude provider failed');
    }
    return {
      provider: this.name,
      model: params.model || 'claude-3-7-sonnet-20250219',
      message: 'This is a mock Claude chat completion',
      raw: { mock: true }
    };
  }
  
  async generateStreamingChatCompletion(params, callback) {
    if (this.shouldFail) {
      throw new Error('Mock Claude provider failed');
    }
    
    const chunks = ['This', ' is', ' a', ' mock', ' Claude', ' streaming', ' chat', ' completion'];
    
    for (const chunk of chunks) {
      callback({
        provider: this.name,
        model: params.model || 'claude-3-7-sonnet-20250219',
        chunk,
        raw: { mock: true }
      });
      
      // Simulate delay between chunks
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

/**
 * Mock OpenAI Provider
 */
export class MockOpenAIProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'openai';
    this.shouldFail = config.shouldFail || false;
  }
  
  async getAvailableModels() {
    if (this.shouldFail) {
      throw new Error('Mock OpenAI provider failed');
    }
    return ['gpt-4o', 'gpt-4-turbo'];
  }
  
  async generateCompletion(params) {
    if (this.shouldFail) {
      throw new Error('Mock OpenAI provider failed');
    }
    return {
      provider: this.name,
      model: params.model || 'gpt-4o',
      completion: 'This is a mock OpenAI completion',
      raw: { mock: true }
    };
  }
  
  async generateChatCompletion(params) {
    if (this.shouldFail) {
      throw new Error('Mock OpenAI provider failed');
    }
    return {
      provider: this.name,
      model: params.model || 'gpt-4o',
      message: 'This is a mock OpenAI chat completion',
      raw: { mock: true }
    };
  }
  
  async generateStreamingChatCompletion(params, callback) {
    if (this.shouldFail) {
      throw new Error('Mock OpenAI provider failed');
    }
    
    const chunks = ['This', ' is', ' a', ' mock', ' OpenAI', ' streaming', ' chat', ' completion'];
    
    for (const chunk of chunks) {
      callback({
        provider: this.name,
        model: params.model || 'gpt-4o',
        chunk,
        raw: { mock: true }
      });
      
      // Simulate delay between chunks
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

/**
 * Mock Gemini Provider
 */
export class MockGeminiProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'gemini';
    this.shouldFail = config.shouldFail || false;
  }
  
  async getAvailableModels() {
    if (this.shouldFail) {
      throw new Error('Mock Gemini provider failed');
    }
    return ['gemini-2.5-pro', 'gemini-1.5-pro'];
  }
  
  async generateCompletion(params) {
    if (this.shouldFail) {
      throw new Error('Mock Gemini provider failed');
    }
    return {
      provider: this.name,
      model: params.model || 'gemini-2.5-pro',
      completion: 'This is a mock Gemini completion',
      raw: { mock: true }
    };
  }
  
  async generateChatCompletion(params) {
    if (this.shouldFail) {
      throw new Error('Mock Gemini provider failed');
    }
    return {
      provider: this.name,
      model: params.model || 'gemini-2.5-pro',
      message: 'This is a mock Gemini chat completion',
      raw: { mock: true }
    };
  }
  
  async generateStreamingChatCompletion(params, callback) {
    if (this.shouldFail) {
      throw new Error('Mock Gemini provider failed');
    }
    
    const chunks = ['This', ' is', ' a', ' mock', ' Gemini', ' streaming', ' chat', ' completion'];
    
    for (const chunk of chunks) {
      callback({
        provider: this.name,
        model: params.model || 'gemini-2.5-pro',
        chunk,
        raw: { mock: true }
      });
      
      // Simulate delay between chunks
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

/**
 * Mock Perplexity Provider
 */
export class MockPerplexityProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'perplexity';
    this.shouldFail = config.shouldFail || false;
  }
  
  async getAvailableModels() {
    if (this.shouldFail) {
      throw new Error('Mock Perplexity provider failed');
    }
    return ['sonar-pro', 'sonar-small-online'];
  }
  
  async generateCompletion(params) {
    if (this.shouldFail) {
      throw new Error('Mock Perplexity provider failed');
    }
    return {
      provider: this.name,
      model: params.model || 'sonar-pro',
      completion: 'This is a mock Perplexity completion',
      raw: { mock: true }
    };
  }
  
  async generateChatCompletion(params) {
    if (this.shouldFail) {
      throw new Error('Mock Perplexity provider failed');
    }
    return {
      provider: this.name,
      model: params.model || 'sonar-pro',
      message: 'This is a mock Perplexity chat completion',
      raw: { mock: true }
    };
  }
  
  async generateStreamingChatCompletion(params, callback) {
    if (this.shouldFail) {
      throw new Error('Mock Perplexity provider failed');
    }
    
    const chunks = ['This', ' is', ' a', ' mock', ' Perplexity', ' streaming', ' chat', ' completion'];
    
    for (const chunk of chunks) {
      callback({
        provider: this.name,
        model: params.model || 'sonar-pro',
        chunk,
        raw: { mock: true }
      });
      
      // Simulate delay between chunks
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}
