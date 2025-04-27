/**
 * @fileoverview Core utilities index
 * 
 * This module exports all core utility functions for easy access.
 * 
 * @module core/utils
 */

// Export path utilities
export * from './path-utils.js';

// Export error handling utilities
export * from './error-handler.js';

// Export AI client utilities
export * from './ai-client-utils.js';

// Export logger
export { default as logger } from './logger.js';

// Export default logger instance
import logger from './logger.js';
export default logger;
