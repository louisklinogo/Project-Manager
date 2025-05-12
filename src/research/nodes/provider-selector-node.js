/**
 * Provider Selector Node
 * 
 * This node selects the appropriate provider for research.
 */

import { FlowNode } from '../../core/flow/flow-node.js';

/**
 * Provider Selector Node class
 */
export class ProviderSelectorNode extends FlowNode {
  /**
   * Constructor
   * @param {Object} options - Node options
   */
  constructor(options = {}) {
    super('ProviderSelector', options);
    
    this.preferredProvider = options.preferredProvider || null;
    this.forceProvider = options.forceProvider || null;
  }
  
  /**
   * Process the input
   * @param {Object} input - Input data
   * @returns {Promise<Object>} - Output data
   */
  async process(input) {
    try {
      // If a provider is forced, use it
      if (this.forceProvider) {
        this.logger.info(`Using forced provider: ${this.forceProvider}`);
        
        return {
          ...input,
          provider: this.getProviderConfig(this.forceProvider)
        };
      }
      
      // If a provider is preferred, use it
      if (this.preferredProvider) {
        this.logger.info(`Using preferred provider: ${this.preferredProvider}`);
        
        return {
          ...input,
          provider: this.getProviderConfig(this.preferredProvider)
        };
      }
      
      // Otherwise, select the best provider based on the query
      const provider = this.selectProvider(input.query);
      
      this.logger.info(`Selected provider: ${provider.name}`);
      
      return {
        ...input,
        provider
      };
    } catch (error) {
      this.logger.error('Error selecting provider:', error);
      
      // Default to perplexity if there's an error
      return {
        ...input,
        provider: this.getProviderConfig('perplexity')
      };
    }
  }
  
  /**
   * Select the best provider based on the query
   * @param {Object} query - Query object
   * @returns {Object} - Provider configuration
   */
  selectProvider(query) {
    // For now, just return perplexity as the default
    return this.getProviderConfig('perplexity');
  }
  
  /**
   * Get the configuration for a provider
   * @param {String} providerName - Provider name
   * @returns {Object} - Provider configuration
   */
  getProviderConfig(providerName) {
    const providers = {
      perplexity: {
        name: 'perplexity',
        model: 'pplx-7b-online',
        maxTokens: 1000,
        temperature: 0.7
      },
      gemini: {
        name: 'gemini',
        model: 'gemini-pro',
        maxTokens: 1000,
        temperature: 0.7
      },
      openai: {
        name: 'openai',
        model: 'gpt-4o',
        maxTokens: 1000,
        temperature: 0.7
      },
      anthropic: {
        name: 'anthropic',
        model: 'claude-3-opus-20240229',
        maxTokens: 1000,
        temperature: 0.7
      }
    };
    
    return providers[providerName.toLowerCase()] || providers.perplexity;
  }
}
