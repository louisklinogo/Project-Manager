/**
 * Research Manager
 *
 * Manages research queries and results, coordinating between different providers.
 */

import { ResearchQuery } from './research-query.js';
import { ResearchResult } from './research-result.js';
import { PerplexityProvider } from '../providers/perplexity-provider.js';
import { GeminiProvider } from '../providers/gemini-provider.js';
import fs from 'fs/promises';
import path from 'path';

export class ResearchManager {
  /**
   * Create a new research manager
   * @param {Object} config - Configuration options
   * @param {string} [config.storageDir='./data/research'] - Directory to store research data
   * @param {Object} [config.providers={}] - Provider configurations
   */
  constructor(config = {}) {
    this.storageDir = config.storageDir || './data/research';
    this.providers = config.providers || {};
    this.defaultProvider = config.defaultProvider || 'gemini'; // Use Gemini as default
    this.allowMock = config.allowMock || false; // Allow mock provider for testing
    this.queries = new Map();
    this.results = new Map();

    // Ensure storage directory exists
    this._ensureStorageDir();
  }

  /**
   * Ensure the storage directory exists
   * @private
   */
  async _ensureStorageDir() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error(`Error creating storage directory: ${error.message}`);
    }
  }

  /**
   * Create a new research query
   * @param {Object} params - Query parameters
   * @returns {ResearchQuery} The created query
   */
  createQuery(params) {
    const query = new ResearchQuery(params);
    query.validate();
    this.queries.set(query.id, query);
    return query;
  }

  /**
   * Execute a research query
   * @param {ResearchQuery|string} query - Research query or query ID
   * @param {string} [providerName] - Provider to use (defaults to this.defaultProvider)
   * @returns {Promise<ResearchResult>} Research result
   */
  async executeQuery(query, providerName) {
    // Get the query object if an ID was provided
    if (typeof query === 'string') {
      query = this.getQuery(query);
      if (!query) {
        throw new Error(`Query with ID ${query} not found`);
      }
    }

    // Validate the query
    query.validate();

    // Determine which provider to use
    const provider = await this._getProvider(providerName || this.defaultProvider);

    // Convert the query to provider-specific parameters
    const providerParams = query.toProviderParams(provider.name);

    // Execute the query with the provider
    let providerResult;

    try {
      if (provider.name === 'perplexity' || provider.name === 'gemini' || provider.name === 'mock') {
        // For providers that support chat completion API
        const messages = [
          { role: 'system', content: 'You are a helpful research assistant. Provide detailed, accurate information based on the user\'s query.' },
          { role: 'user', content: query.query }
        ];

        providerResult = await provider.generateChatCompletion({
          messages,
          model: providerParams.options?.model || provider.defaultModel,
          maxTokens: providerParams.options?.maxTokens || provider.defaultMaxTokens,
          temperature: providerParams.options?.temperature || 0.3
        });
      } else {
        // For other providers, we use their specific research APIs
        throw new Error(`Provider ${provider.name} is not supported for research queries`);
      }
    } catch (error) {
      throw new Error(`Error executing query with provider ${provider.name}: ${error.message}`);
    }

    // Create a research result
    const result = new ResearchResult({
      queryId: query.id,
      provider: provider.name,
      results: [
        {
          title: 'Research Result',
          content: providerResult.message,
          metadata: {
            model: providerResult.model
          }
        }
      ],
      metadata: {
        query: query.query,
        model: providerResult.model,
        provider: provider.name
      }
    });

    // Store the result
    this.results.set(result.id, result);

    // Save the result to disk
    await this._saveResult(result);

    return result;
  }

  /**
   * Get a provider instance
   * @param {string} providerName - Provider name
   * @returns {Promise<Object>} Provider instance
   * @private
   */
  async _getProvider(providerName) {
    try {
      let provider;

      // Create the appropriate provider based on name
      if (providerName === 'perplexity') {
        provider = new PerplexityProvider(this.providers[providerName] || {});
      } else if (providerName === 'gemini') {
        provider = new GeminiProvider(this.providers[providerName] || {});
      } else if (providerName === 'mock') {
        // For testing purposes, use a mock provider
        return {
          name: 'mock',
          generateChatCompletion: async () => ({
            provider: 'mock',
            model: 'mock-model',
            message: 'This is a mock response for research purposes.'
          })
        };
      } else {
        throw new Error(`Provider ${providerName} is not supported`);
      }

      const available = await provider.isAvailable();

      if (!available) {
        throw new Error(`Provider ${providerName} is not available`);
      }

      return provider;
    } catch (error) {
      // If provider is not available, use mock provider for testing
      if (this.allowMock) {
        console.warn(`Using mock provider instead of ${providerName}: ${error.message}`);
        return {
          name: 'mock',
          generateChatCompletion: async () => ({
            provider: 'mock',
            model: 'mock-model',
            message: 'This is a mock response for research purposes.'
          })
        };
      }

      throw new Error(`Error getting provider ${providerName}: ${error.message}`);
    }
  }

  /**
   * Get a query by ID
   * @param {string} id - Query ID
   * @returns {ResearchQuery|null} The query or null if not found
   */
  getQuery(id) {
    return this.queries.get(id) || null;
  }

  /**
   * Get a result by ID
   * @param {string} id - Result ID
   * @returns {ResearchResult|null} The result or null if not found
   */
  getResult(id) {
    return this.results.get(id) || null;
  }

  /**
   * Get results for a query
   * @param {string} queryId - Query ID
   * @returns {Array<ResearchResult>} Array of results
   */
  getResultsForQuery(queryId) {
    const results = [];

    for (const result of this.results.values()) {
      if (result.queryId === queryId) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Save a result to disk
   * @param {ResearchResult} result - Result to save
   * @private
   */
  async _saveResult(result) {
    try {
      const filePath = path.join(this.storageDir, `result-${result.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(result.toObject(), null, 2));
    } catch (error) {
      console.error(`Error saving result: ${error.message}`);
    }
  }

  /**
   * Load results from disk
   * @returns {Promise<Array<ResearchResult>>} Loaded results
   */
  async loadResults() {
    try {
      const files = await fs.readdir(this.storageDir);
      const resultFiles = files.filter(file => file.startsWith('result-') && file.endsWith('.json'));

      for (const file of resultFiles) {
        try {
          const filePath = path.join(this.storageDir, file);
          const data = await fs.readFile(filePath, 'utf8');
          const resultData = JSON.parse(data);
          const result = ResearchResult.fromObject(resultData);

          this.results.set(result.id, result);

          // If we have the query for this result, add it to our queries map
          if (resultData.metadata && resultData.metadata.query) {
            const query = new ResearchQuery({
              id: result.queryId,
              query: resultData.metadata.query
            });

            this.queries.set(query.id, query);
          }
        } catch (error) {
          console.error(`Error loading result file ${file}: ${error.message}`);
        }
      }

      return Array.from(this.results.values());
    } catch (error) {
      console.error(`Error loading results: ${error.message}`);
      return [];
    }
  }

  /**
   * Clear all queries and results from memory
   */
  clear() {
    this.queries.clear();
    this.results.clear();
  }
}
