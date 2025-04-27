/**
 * @fileoverview Centralized configuration management for Project Manager
 * 
 * This module provides a centralized way to manage configuration options
 * for the Project Manager application. It loads configuration from environment
 * variables and provides default values for all options.
 * 
 * @module core/config
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Default configuration values
 */
const defaultConfig = {
  // Application settings
  appName: 'Project Manager',
  version: '0.1.0',
  
  // Environment settings
  environment: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
  
  // Path settings
  rootDir,
  templatesDir: path.join(rootDir, 'templates'),
  
  // AI provider settings
  defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'openai',
  
  // OpenAI settings
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o',
    fallbackModel: process.env.OPENAI_FALLBACK_MODEL || 'gpt-3.5-turbo',
  },
  
  // Anthropic settings
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-opus-20240229',
    fallbackModel: process.env.ANTHROPIC_FALLBACK_MODEL || 'claude-3-haiku-20240307',
  },
  
  // Google Gemini settings
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    defaultModel: process.env.GEMINI_DEFAULT_MODEL || 'gemini-1.5-pro',
    fallbackModel: process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.0-pro',
  },
  
  // Perplexity settings
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY,
    defaultModel: process.env.PERPLEXITY_DEFAULT_MODEL || 'sonar-medium-online',
    fallbackModel: process.env.PERPLEXITY_FALLBACK_MODEL || 'sonar-small-online',
  },
  
  // Research settings
  research: {
    maxResults: parseInt(process.env.RESEARCH_MAX_RESULTS || '5', 10),
    minConfidenceScore: parseFloat(process.env.RESEARCH_MIN_CONFIDENCE_SCORE || '0.7'),
    defaultTimeout: parseInt(process.env.RESEARCH_DEFAULT_TIMEOUT || '60000', 10),
  },
  
  // Blueprint settings
  blueprint: {
    defaultFormat: process.env.BLUEPRINT_DEFAULT_FORMAT || 'json',
    includeValidation: process.env.BLUEPRINT_INCLUDE_VALIDATION !== 'false',
  },
};

/**
 * Load package.json for version information
 */
try {
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    defaultConfig.version = packageJson.version;
  }
} catch (error) {
  console.warn('Could not load package.json for version information:', error.message);
}

/**
 * Configuration class for managing application configuration
 */
class Config {
  /**
   * Initialize the configuration
   * @param {Object} options - Override default configuration options
   */
  constructor(options = {}) {
    this.config = { ...defaultConfig, ...options };
  }

  /**
   * Get a configuration value
   * @param {string} key - The configuration key to get
   * @param {*} defaultValue - Default value if key is not found
   * @returns {*} The configuration value
   */
  get(key, defaultValue) {
    const parts = key.split('.');
    let value = this.config;
    
    for (const part of parts) {
      if (value === undefined || value === null) {
        return defaultValue;
      }
      value = value[part];
    }
    
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set a configuration value
   * @param {string} key - The configuration key to set
   * @param {*} value - The value to set
   * @returns {Config} This config instance for chaining
   */
  set(key, value) {
    const parts = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
    return this;
  }

  /**
   * Check if a configuration key exists
   * @param {string} key - The configuration key to check
   * @returns {boolean} Whether the key exists
   */
  has(key) {
    const parts = key.split('.');
    let current = this.config;
    
    for (const part of parts) {
      if (current === undefined || current === null || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    
    return true;
  }

  /**
   * Get all configuration values
   * @returns {Object} All configuration values
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Get configuration for a specific AI provider
   * @param {string} provider - The provider name (openai, anthropic, gemini, perplexity)
   * @returns {Object} The provider configuration
   */
  getProviderConfig(provider) {
    return this.get(provider, {});
  }

  /**
   * Check if an AI provider is configured
   * @param {string} provider - The provider name
   * @returns {boolean} Whether the provider is configured
   */
  isProviderConfigured(provider) {
    const config = this.getProviderConfig(provider);
    return !!config.apiKey;
  }

  /**
   * Get the default AI provider
   * @returns {string} The default provider name
   */
  getDefaultProvider() {
    const defaultProvider = this.get('defaultProvider');
    
    // If the default provider is not configured, try to find a configured one
    if (!this.isProviderConfigured(defaultProvider)) {
      const providers = ['openai', 'anthropic', 'gemini', 'perplexity'];
      for (const provider of providers) {
        if (this.isProviderConfigured(provider)) {
          return provider;
        }
      }
    }
    
    return defaultProvider;
  }
}

// Create and export a singleton instance
const config = new Config();

export default config;
