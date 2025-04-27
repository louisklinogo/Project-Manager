/**
 * Tests for the error handling system
 */

import { describe, test, expect, jest } from '@jest/globals';
import { 
  AppError, 
  ErrorType, 
  createErrorFromApiError, 
  retryWithExponentialBackoff, 
  handleError 
} from '../../../src/core/utils/error-handler.js';

describe('AppError', () => {
  test('should create an error with default values', () => {
    const error = new AppError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.type).toBe(ErrorType.UNKNOWN_ERROR);
    expect(error.status).toBe(500);
  });

  test('should create an error with custom values', () => {
    const cause = new Error('Original error');
    const error = new AppError('Test error', {
      type: ErrorType.NETWORK_ERROR,
      status: 503,
      cause,
      metadata: { foo: 'bar' }
    });
    expect(error.message).toBe('Test error');
    expect(error.type).toBe(ErrorType.NETWORK_ERROR);
    expect(error.status).toBe(503);
    expect(error.cause).toBe(cause);
    expect(error.metadata).toEqual({ foo: 'bar' });
  });

  test('should convert to JSON', () => {
    const cause = new Error('Original error');
    const error = new AppError('Test error', {
      type: ErrorType.NETWORK_ERROR,
      status: 503,
      cause,
      metadata: { foo: 'bar' }
    });
    const json = error.toJSON();
    expect(json.message).toBe('Test error');
    expect(json.type).toBe(ErrorType.NETWORK_ERROR);
    expect(json.status).toBe(503);
    expect(json.metadata).toEqual({ foo: 'bar' });
    expect(json.cause).toEqual({
      name: 'Error',
      message: 'Original error'
    });
  });
});

describe('createErrorFromApiError', () => {
  test('should create an error from an Anthropic error', () => {
    const originalError = {
      name: 'AnthropicError',
      message: 'Rate limit exceeded',
      status: 429,
      error: { type: 'rate_limit_error' }
    };
    const error = createErrorFromApiError(originalError, 'test operation');
    expect(error.type).toBe(ErrorType.ANTHROPIC_ERROR);
    expect(error.status).toBe(429);
    expect(error.message).toContain('Anthropic API error');
    expect(error.message).toContain('test operation');
  });

  test('should create an error from an OpenAI error', () => {
    const originalError = {
      name: 'OpenAIError',
      message: 'Invalid API key',
      status: 401
    };
    const error = createErrorFromApiError(originalError, 'test operation');
    expect(error.type).toBe(ErrorType.OPENAI_ERROR);
    expect(error.status).toBe(401);
    expect(error.message).toContain('OpenAI API error');
  });

  test('should create an error from a rate limit error', () => {
    const originalError = {
      message: 'Too many requests',
      status: 429
    };
    const error = createErrorFromApiError(originalError, 'test operation');
    expect(error.type).toBe(ErrorType.RATE_LIMIT_ERROR);
    expect(error.status).toBe(429);
    expect(error.message).toContain('Rate limit exceeded');
  });

  test('should create an error from a network error', () => {
    const originalError = {
      message: 'Network connection failed'
    };
    const error = createErrorFromApiError(originalError, 'test operation');
    expect(error.type).toBe(ErrorType.NETWORK_ERROR);
    expect(error.message).toContain('Network error');
  });
});

describe('retryWithExponentialBackoff', () => {
  test('should return the result if successful', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retryWithExponentialBackoff(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should retry on failure and eventually succeed', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new AppError('Network error', { type: ErrorType.NETWORK_ERROR }))
      .mockResolvedValueOnce('success');
    
    const onRetry = jest.fn();
    const result = await retryWithExponentialBackoff(fn, {
      maxRetries: 3,
      initialDelay: 10,
      onRetry
    });
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('should throw after max retries', async () => {
    const error = new AppError('Network error', { type: ErrorType.NETWORK_ERROR });
    const fn = jest.fn().mockRejectedValue(error);
    
    await expect(retryWithExponentialBackoff(fn, {
      maxRetries: 2,
      initialDelay: 10
    })).rejects.toThrow('Network error');
    
    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  test('should not retry if shouldRetry returns false', async () => {
    const error = new AppError('Validation error', { type: ErrorType.VALIDATION_ERROR });
    const fn = jest.fn().mockRejectedValue(error);
    
    await expect(retryWithExponentialBackoff(fn, {
      maxRetries: 2,
      initialDelay: 10,
      shouldRetry: () => false
    })).rejects.toThrow('Validation error');
    
    expect(fn).toHaveBeenCalledTimes(1); // No retries
  });
});

describe('handleError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should log the error and return error info', () => {
    const error = new Error('Test error');
    const result = handleError(error, 'test operation');
    
    expect(console.error).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error.message).toContain('Test error');
  });

  test('should throw the error if throwError is true', () => {
    const error = new Error('Test error');
    expect(() => handleError(error, 'test operation', { throwError: true })).toThrow('Test error');
  });

  test('should not log the error if logError is false', () => {
    const error = new Error('Test error');
    handleError(error, 'test operation', { logError: false });
    
    expect(console.error).not.toHaveBeenCalled();
  });
});
