import { AIProvider } from '../../../src/providers/ai-provider.js';
import { jest } from '@jest/globals';

describe('AIProvider', () => {
  let provider;
  
  beforeEach(() => {
    provider = new AIProvider({ test: true });
  });
  
  test('should initialize with config', () => {
    expect(provider.config).toEqual({ test: true });
    expect(provider.name).toBe('base');
  });
  
  test('should throw error for getAvailableModels', async () => {
    await expect(provider.getAvailableModels()).rejects.toThrow('Method getAvailableModels must be implemented by subclass');
  });
  
  test('should throw error for generateCompletion', async () => {
    await expect(provider.generateCompletion({})).rejects.toThrow('Method generateCompletion must be implemented by subclass');
  });
  
  test('should throw error for generateChatCompletion', async () => {
    await expect(provider.generateChatCompletion({})).rejects.toThrow('Method generateChatCompletion must be implemented by subclass');
  });
  
  test('should throw error for generateStreamingChatCompletion', async () => {
    await expect(provider.generateStreamingChatCompletion({}, () => {})).rejects.toThrow('Method generateStreamingChatCompletion must be implemented by subclass');
  });
  
  test('should return false for isAvailable when getAvailableModels throws', async () => {
    // This test is a bit tricky because getAvailableModels is not implemented
    // We're testing that isAvailable catches the error and returns false
    const result = await provider.isAvailable();
    expect(result).toBe(false);
  });
});
