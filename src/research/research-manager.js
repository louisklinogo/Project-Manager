/**
 * Research Manager
 *
 * Manages research queries and results, coordinating between different providers.
 */

import { ResearchQuery } from './research-query.js';
import { ResearchResult } from './research-result.js';
import { PerplexityProvider } from '../providers/perplexity-provider.js';
import { GeminiProvider } from '../providers/gemini-provider.js';
import {
  generateProjectPlan,
  generateArchitectureRecommendations,
  generateTaskBreakdown
} from './planning-utils.js';
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

  /**
   * Generate a project plan based on research results
   * @param {Array<string>} resultIds - Array of result IDs to use for planning
   * @param {Object} options - Planning options
   * @returns {Promise<Object>} Generated plan
   */
  async generateProjectPlan(resultIds, options = {}) {
    // Get the research results
    const results = resultIds.map(id => this.getResult(id)).filter(Boolean);

    if (results.length === 0) {
      throw new Error('No valid research results provided');
    }

    // Convert results to the format expected by the planning utilities
    const formattedResults = results.map(result => {
      // Handle both ResearchResult objects and plain objects
      if (result.toObject) {
        // It's a ResearchResult object
        const resultObj = result.toObject();
        return {
          id: resultObj.id,
          queryId: resultObj.queryId,
          type: options.resultType || 'domain', // Default to domain knowledge
          title: resultObj.results && resultObj.results[0] ? resultObj.results[0].title || 'Research Result' : 'Research Result',
          content: resultObj.results && resultObj.results[0] ? resultObj.results[0].content || '' : '',
          provider: resultObj.metadata ? resultObj.metadata.provider || 'unknown' : 'unknown'
        };
      } else {
        // It's a plain object
        return {
          id: result.id,
          queryId: result.queryId,
          type: options.resultType || 'domain', // Default to domain knowledge
          title: result.title || 'Research Result',
          content: result.content || '',
          provider: result.provider || 'unknown'
        };
      }
    });

    // Generate the project plan
    return generateProjectPlan(formattedResults, options);
  }

  /**
   * Generate architecture recommendations based on research results
   * @param {Array<string>} resultIds - Array of result IDs to use for recommendations
   * @param {Object} options - Planning options
   * @returns {Promise<Object>} Generated architecture recommendations
   */
  async generateArchitectureRecommendations(resultIds, options = {}) {
    // Get the research results
    const results = resultIds.map(id => this.getResult(id)).filter(Boolean);

    if (results.length === 0) {
      throw new Error('No valid research results provided');
    }

    // Convert results to the format expected by the planning utilities
    const formattedResults = results.map(result => {
      // Handle both ResearchResult objects and plain objects
      if (result.toObject) {
        // It's a ResearchResult object
        const resultObj = result.toObject();
        return {
          id: resultObj.id,
          queryId: resultObj.queryId,
          type: options.resultType || 'domain', // Default to domain knowledge
          title: resultObj.results && resultObj.results[0] ? resultObj.results[0].title || 'Research Result' : 'Research Result',
          content: resultObj.results && resultObj.results[0] ? resultObj.results[0].content || '' : '',
          provider: resultObj.metadata ? resultObj.metadata.provider || 'unknown' : 'unknown'
        };
      } else {
        // It's a plain object
        return {
          id: result.id,
          queryId: result.queryId,
          type: options.resultType || 'domain', // Default to domain knowledge
          title: result.title || 'Research Result',
          content: result.content || '',
          provider: result.provider || 'unknown'
        };
      }
    });

    // Generate the architecture recommendations
    return generateArchitectureRecommendations(formattedResults, options);
  }

  /**
   * Generate task breakdown based on research results and project plan
   * @param {Array<string>} resultIds - Array of result IDs to use for task breakdown
   * @param {Object} projectPlan - Project plan
   * @param {Object} options - Planning options
   * @returns {Promise<Object>} Generated task breakdown
   */
  async generateTaskBreakdown(resultIds, projectPlan, options = {}) {
    // Get the research results
    const results = resultIds.map(id => this.getResult(id)).filter(Boolean);

    if (results.length === 0) {
      throw new Error('No valid research results provided');
    }

    // Convert results to the format expected by the planning utilities
    const formattedResults = results.map(result => {
      // Handle both ResearchResult objects and plain objects
      if (result.toObject) {
        // It's a ResearchResult object
        const resultObj = result.toObject();
        return {
          id: resultObj.id,
          queryId: resultObj.queryId,
          type: options.resultType || 'domain', // Default to domain knowledge
          title: resultObj.results && resultObj.results[0] ? resultObj.results[0].title || 'Research Result' : 'Research Result',
          content: resultObj.results && resultObj.results[0] ? resultObj.results[0].content || '' : '',
          provider: resultObj.metadata ? resultObj.metadata.provider || 'unknown' : 'unknown'
        };
      } else {
        // It's a plain object
        return {
          id: result.id,
          queryId: result.queryId,
          type: options.resultType || 'domain', // Default to domain knowledge
          title: result.title || 'Research Result',
          content: result.content || '',
          provider: result.provider || 'unknown'
        };
      }
    });

    // Generate the task breakdown
    return generateTaskBreakdown(formattedResults, projectPlan, options);
  }

  /**
   * Generate a complete blueprint based on research results
   * @param {Array<string>} resultIds - Array of result IDs to use for blueprint generation
   * @param {Object} options - Blueprint generation options
   * @returns {Promise<Object>} Generated blueprint
   */
  async generateBlueprint(resultIds, options = {}) {
    try {
      // Generate project plan
      const planResult = await this.generateProjectPlan(resultIds, options);

      if (!planResult.success) {
        throw new Error(`Failed to generate project plan: ${planResult.error.message}`);
      }

      // Generate architecture recommendations
      const architectureResult = await this.generateArchitectureRecommendations(resultIds, options);

      if (!architectureResult.success) {
        throw new Error(`Failed to generate architecture recommendations: ${architectureResult.error.message}`);
      }

      // Generate task breakdown
      const taskBreakdownResult = await this.generateTaskBreakdown(resultIds, planResult.plan, options);

      if (!taskBreakdownResult.success) {
        throw new Error(`Failed to generate task breakdown: ${taskBreakdownResult.error.message}`);
      }

      // Combine the results into a blueprint
      const blueprint = {
        id: options.blueprintId || `blueprint-${Date.now()}`,
        name: options.blueprintName || 'Generated Blueprint',
        description: options.description || 'Blueprint generated from research results',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plan: planResult.plan,
        architecture: architectureResult.architecture,
        tasks: taskBreakdownResult.tasks,
        metadata: {
          research_results: resultIds,
          generated_by: {
            plan: {
              provider: planResult.provider,
              model: planResult.model
            },
            architecture: {
              provider: architectureResult.provider,
              model: architectureResult.model
            },
            tasks: {
              provider: taskBreakdownResult.provider,
              model: taskBreakdownResult.model
            }
          }
        }
      };

      return {
        success: true,
        blueprint
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BLUEPRINT_GENERATION_FAILED',
          message: `Failed to generate blueprint: ${error.message}`
        }
      };
    }
  }
}
