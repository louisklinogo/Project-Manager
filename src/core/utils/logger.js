/**
 * @fileoverview Centralized logging utility for Project Manager
 * 
 * This module provides a centralized way to handle logging throughout
 * the application. It supports different log levels and formats.
 * 
 * @module core/utils/logger
 */

import chalk from 'chalk';
import config from '../config.js';

/**
 * Log levels
 * @enum {number}
 */
export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
};

/**
 * Convert a log level name to its numeric value
 * @param {string} level - The log level name
 * @returns {number} The log level value
 */
function getLogLevelValue(level) {
  if (typeof level === 'number') {
    return level;
  }
  
  const upperLevel = level.toUpperCase();
  return LogLevel[upperLevel] !== undefined ? LogLevel[upperLevel] : LogLevel.INFO;
}

/**
 * Logger class for handling application logging
 */
class Logger {
  /**
   * Initialize the logger
   * @param {Object} options - Logger options
   * @param {string|number} options.level - The log level
   * @param {boolean} options.useColors - Whether to use colors in the output
   * @param {boolean} options.showTimestamp - Whether to show timestamps
   */
  constructor(options = {}) {
    this.level = getLogLevelValue(options.level || process.env.LOG_LEVEL || 'INFO');
    this.useColors = options.useColors !== false;
    this.showTimestamp = options.showTimestamp !== false;
  }

  /**
   * Set the log level
   * @param {string|number} level - The log level
   * @returns {Logger} This logger instance for chaining
   */
  setLevel(level) {
    this.level = getLogLevelValue(level);
    return this;
  }

  /**
   * Format a log message
   * @param {string} level - The log level name
   * @param {string} message - The log message
   * @returns {string} The formatted log message
   * @private
   */
  _format(level, message) {
    const parts = [];
    
    if (this.showTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    
    parts.push(`[${level}]`);
    parts.push(message);
    
    return parts.join(' ');
  }

  /**
   * Log a message at the ERROR level
   * @param {string} message - The message to log
   * @param {...any} args - Additional arguments to log
   */
  error(message, ...args) {
    if (this.level >= LogLevel.ERROR) {
      const formattedMessage = this._format('ERROR', message);
      console.error(this.useColors ? chalk.red(formattedMessage) : formattedMessage, ...args);
    }
  }

  /**
   * Log a message at the WARN level
   * @param {string} message - The message to log
   * @param {...any} args - Additional arguments to log
   */
  warn(message, ...args) {
    if (this.level >= LogLevel.WARN) {
      const formattedMessage = this._format('WARN', message);
      console.warn(this.useColors ? chalk.yellow(formattedMessage) : formattedMessage, ...args);
    }
  }

  /**
   * Log a message at the INFO level
   * @param {string} message - The message to log
   * @param {...any} args - Additional arguments to log
   */
  info(message, ...args) {
    if (this.level >= LogLevel.INFO) {
      const formattedMessage = this._format('INFO', message);
      console.info(this.useColors ? chalk.blue(formattedMessage) : formattedMessage, ...args);
    }
  }

  /**
   * Log a message at the DEBUG level
   * @param {string} message - The message to log
   * @param {...any} args - Additional arguments to log
   */
  debug(message, ...args) {
    if (this.level >= LogLevel.DEBUG) {
      const formattedMessage = this._format('DEBUG', message);
      console.debug(this.useColors ? chalk.cyan(formattedMessage) : formattedMessage, ...args);
    }
  }

  /**
   * Log a message at the TRACE level
   * @param {string} message - The message to log
   * @param {...any} args - Additional arguments to log
   */
  trace(message, ...args) {
    if (this.level >= LogLevel.TRACE) {
      const formattedMessage = this._format('TRACE', message);
      console.trace(this.useColors ? chalk.gray(formattedMessage) : formattedMessage, ...args);
    }
  }

  /**
   * Log a success message (at INFO level with green color)
   * @param {string} message - The message to log
   * @param {...any} args - Additional arguments to log
   */
  success(message, ...args) {
    if (this.level >= LogLevel.INFO) {
      const formattedMessage = this._format('SUCCESS', message);
      console.info(this.useColors ? chalk.green(formattedMessage) : formattedMessage, ...args);
    }
  }
}

// Create and export a singleton instance
const logger = new Logger({
  level: process.env.LOG_LEVEL || 'INFO',
  useColors: true,
  showTimestamp: true,
});

// Set debug mode based on config
if (config.get('debug', false)) {
  logger.setLevel('DEBUG');
}

export default logger;
