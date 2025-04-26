import { jest } from '@jest/globals';
import { AIProvider } from '../../../src/providers/ai-provider.js';

/**
 * This test file tests the provider selection functionality
 * without relying on the actual provider implementations.
 *
 * Instead of mocking the actual provider modules, we create
 * a simple test that verifies the basic functionality of
 * the provider selection logic.
 */

// Create a simple mock provider for testing
class MockProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.name = config.name || 'mock';
    this.shouldFail = config.shouldFail || false;
  }

  async getAvailableModels() {
    if (this.shouldFail) {
      throw new Error('Mock provider failed');
    }
    return ['mock-model-1', 'mock-model-2'];
  }

  async generateCompletion() {
    if (this.shouldFail) {
      throw new Error('Mock provider failed');
    }
    return { provider: this.name, completion: 'mock completion' };
  }

  async generateChatCompletion() {
    if (this.shouldFail) {
      throw new Error('Mock provider failed');
    }
    return { provider: this.name, message: 'mock message' };
  }

  async generateStreamingChatCompletion() {
    if (this.shouldFail) {
      throw new Error('Mock provider failed');
    }
  }
}

describe('Provider Selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AIProvider', () => {
    test('should have isAvailable method that returns false when getAvailableModels throws', async () => {
      const provider = new MockProvider({ shouldFail: true });
      const available = await provider.isAvailable();
      expect(available).toBe(false);
    });

    test('should have isAvailable method that returns true when getAvailableModels succeeds', async () => {
      const provider = new MockProvider();
      const available = await provider.isAvailable();
      expect(available).toBe(true);
    });
  });

  describe('Provider Interface', () => {
    test('should have required methods', () => {
      const provider = new MockProvider();

      expect(typeof provider.getAvailableModels).toBe('function');
      expect(typeof provider.generateCompletion).toBe('function');
      expect(typeof provider.generateChatCompletion).toBe('function');
      expect(typeof provider.generateStreamingChatCompletion).toBe('function');
      expect(typeof provider.isAvailable).toBe('function');
    });

    test('should initialize with config', () => {
      const config = { apiKey: 'test-key', model: 'test-model' };
      const provider = new MockProvider(config);

      expect(provider.config).toEqual(config);
    });

    test('should have a name', () => {
      const provider = new MockProvider({ name: 'test-provider' });
      expect(provider.name).toBe('test-provider');
    });
  });
});
