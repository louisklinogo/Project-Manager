/**
 * Error Handler
 * 
 * This module provides comprehensive error handling utilities for the application,
 * including error categorization, automatic retries, and user-friendly error messages.
 */

/**
 * Error types
 * @enum {string}
 */
export const ErrorType = {
  // General errors
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
  TIMEOUT_ERROR: 'timeout_error',
  NOT_FOUND_ERROR: 'not_found_error',
  PERMISSION_ERROR: 'permission_error',
  
  // AI provider errors
  AI_PROVIDER_ERROR: 'ai_provider_error',
  ANTHROPIC_ERROR: 'anthropic_error',
  OPENAI_ERROR: 'openai_error',
  GEMINI_ERROR: 'gemini_error',
  PERPLEXITY_ERROR: 'perplexity_error',
  
  // Rate limiting and quota errors
  RATE_LIMIT_ERROR: 'rate_limit_error',
  QUOTA_EXCEEDED_ERROR: 'quota_exceeded_error',
  
  // Authentication errors
  AUTHENTICATION_ERROR: 'authentication_error',
  
  // File system errors
  FILE_SYSTEM_ERROR: 'file_system_error',
  
  // Unknown errors
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * Custom error class with additional metadata
 */
export class AppError extends Error {
  /**
   * Create a new application error
   * @param {string} message - Error message
   * @param {object} options - Error options
   * @param {string} options.type - Error type from ErrorType enum
   * @param {number} options.status - HTTP status code (if applicable)
   * @param {Error} options.cause - Original error that caused this error
   * @param {object} options.metadata - Additional error metadata
   */
  constructor(message, options = {}) {
    super(message);
    this.name = 'AppError';
    this.type = options.type || ErrorType.UNKNOWN_ERROR;
    this.status = options.status || 500;
    this.cause = options.cause;
    this.metadata = options.metadata || {};
    this.timestamp = new Date().toISOString();
  }

  /**
   * Convert the error to a user-friendly message
   * @returns {string} - User-friendly error message
   */
  toUserMessage() {
    return this.message;
  }

  /**
   * Convert the error to a JSON object
   * @returns {object} - JSON representation of the error
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      status: this.status,
      timestamp: this.timestamp,
      metadata: this.metadata,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message
      } : undefined
    };
  }
}

/**
 * Create an error from an API error
 * @param {Error} error - Original error
 * @param {string} operation - Operation being performed
 * @returns {AppError} - Standardized error
 */
export function createErrorFromApiError(error, operation = 'API operation') {
  // Handle Anthropic-specific errors
  if (error.name === 'AnthropicError' || error.type === 'anthropic_error') {
    return new AppError(`Anthropic API error during ${operation}: ${error.message}`, {
      type: ErrorType.ANTHROPIC_ERROR,
      status: error.status || 500,
      cause: error,
      metadata: error.error || {}
    });
  }
  
  // Handle OpenAI-specific errors
  if (error.name === 'OpenAIError' || error.type === 'openai_error') {
    return new AppError(`OpenAI API error during ${operation}: ${error.message}`, {
      type: ErrorType.OPENAI_ERROR,
      status: error.status || 500,
      cause: error,
      metadata: error.error || {}
    });
  }
  
  // Handle Gemini-specific errors
  if (error.name === 'GoogleGenerativeAIError' || error.type === 'gemini_error') {
    return new AppError(`Gemini API error during ${operation}: ${error.message}`, {
      type: ErrorType.GEMINI_ERROR,
      status: error.status || 500,
      cause: error,
      metadata: error.error || {}
    });
  }
  
  // Handle Perplexity-specific errors
  if (error.name === 'PerplexityError' || error.type === 'perplexity_error') {
    return new AppError(`Perplexity API error during ${operation}: ${error.message}`, {
      type: ErrorType.PERPLEXITY_ERROR,
      status: error.status || 500,
      cause: error,
      metadata: error.error || {}
    });
  }
  
  // Handle rate limit errors
  if (error.status === 429 || error.message?.toLowerCase().includes('rate limit') || 
      error.message?.toLowerCase().includes('too many requests')) {
    return new AppError(`Rate limit exceeded during ${operation}. Please try again later.`, {
      type: ErrorType.RATE_LIMIT_ERROR,
      status: 429,
      cause: error
    });
  }
  
  // Handle authentication errors
  if (error.status === 401 || error.message?.toLowerCase().includes('authentication') || 
      error.message?.toLowerCase().includes('api key')) {
    return new AppError(`Authentication failed during ${operation}. Please check your API key.`, {
      type: ErrorType.AUTHENTICATION_ERROR,
      status: 401,
      cause: error
    });
  }
  
  // Handle timeout errors
  if (error.message?.toLowerCase().includes('timeout')) {
    return new AppError(`Request timed out during ${operation}. Please try again.`, {
      type: ErrorType.TIMEOUT_ERROR,
      status: 408,
      cause: error
    });
  }
  
  // Handle network errors
  if (error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('connection')) {
    return new AppError(`Network error during ${operation}. Please check your connection.`, {
      type: ErrorType.NETWORK_ERROR,
      status: 503,
      cause: error
    });
  }
  
  // Handle generic errors
  return new AppError(`Error during ${operation}: ${error.message}`, {
    type: ErrorType.UNKNOWN_ERROR,
    status: error.status || 500,
    cause: error
  });
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in milliseconds (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in milliseconds (default: 30000)
 * @param {Function} options.shouldRetry - Function to determine if retry should be attempted (default: retry on network and timeout errors)
 * @param {Function} options.onRetry - Function called before each retry attempt
 * @returns {Promise<any>} - Result of the function
 * @throws {AppError} - If all retries fail
 */
export async function retryWithExponentialBackoff(fn, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const initialDelay = options.initialDelay || 1000;
  const maxDelay = options.maxDelay || 30000;
  const shouldRetry = options.shouldRetry || ((error) => {
    return error.type === ErrorType.NETWORK_ERROR || 
           error.type === ErrorType.TIMEOUT_ERROR ||
           error.type === ErrorType.RATE_LIMIT_ERROR;
  });
  const onRetry = options.onRetry || (() => {});
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Convert to AppError if it's not already
      const appError = error instanceof AppError 
        ? error 
        : createErrorFromApiError(error);
      
      lastError = appError;
      
      // Check if we should retry
      if (attempt < maxRetries && shouldRetry(appError)) {
        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          initialDelay * Math.pow(2, attempt) + Math.random() * 1000,
          maxDelay
        );
        
        // Call onRetry callback
        onRetry(appError, attempt + 1, delay);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // No more retries or shouldn't retry
        throw appError;
      }
    }
  }
  
  // This should never be reached, but just in case
  throw lastError;
}

/**
 * Handle an error and return a user-friendly message
 * @param {Error} error - Error to handle
 * @param {string} operation - Operation being performed
 * @param {object} options - Error handling options
 * @param {boolean} options.logError - Whether to log the error (default: true)
 * @param {boolean} options.throwError - Whether to throw the error (default: false)
 * @returns {object} - Error object with user-friendly message
 * @throws {AppError} - If throwError is true
 */
export function handleError(error, operation = 'operation', options = {}) {
  const logError = options.logError !== false;
  const throwError = options.throwError === true;
  
  // Convert to AppError if it's not already
  const appError = error instanceof AppError 
    ? error 
    : createErrorFromApiError(error, operation);
  
  // Log the error
  if (logError) {
    console.error(`Error during ${operation}:`, appError);
    if (appError.cause) {
      console.error('Caused by:', appError.cause);
    }
  }
  
  // Throw the error if requested
  if (throwError) {
    throw appError;
  }
  
  // Return error information
  return {
    success: false,
    error: {
      message: appError.toUserMessage(),
      type: appError.type,
      status: appError.status
    }
  };
}

/**
 * Handle an AI error specifically
 * @param {Error} error - Error to handle
 * @param {string} operation - Operation being performed
 * @param {object} options - Error handling options
 * @returns {object} - Error object with user-friendly message
 */
export function handleAIError(error, operation = 'AI operation', options = {}) {
  return handleError(error, operation, options);
}
