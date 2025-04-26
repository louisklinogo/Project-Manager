/**
 * Research Query model
 * 
 * Represents a research query with parameters for controlling the search.
 */

import { v4 as uuidv4 } from 'uuid';

export class ResearchQuery {
  /**
   * Create a new research query
   * @param {Object} params - Query parameters
   * @param {string} params.query - The search query
   * @param {string} [params.type='general'] - Type of research (general, domain, repository, etc.)
   * @param {number} [params.maxResults=10] - Maximum number of results to return
   * @param {string[]} [params.includeDomains=[]] - Domains to include in search
   * @param {string[]} [params.excludeDomains=[]] - Domains to exclude from search
   * @param {string} [params.timeRange=''] - Time range for search (day, week, month, year)
   * @param {Object} [params.options={}] - Additional options for the search
   */
  constructor(params = {}) {
    this.id = params.id || uuidv4();
    this.query = params.query || '';
    this.type = params.type || 'general';
    this.maxResults = params.maxResults || 10;
    this.includeDomains = params.includeDomains || [];
    this.excludeDomains = params.excludeDomains || [];
    this.timeRange = params.timeRange || '';
    this.options = params.options || {};
    this.createdAt = params.createdAt || new Date().toISOString();
  }

  /**
   * Validate the research query
   * @returns {boolean} True if valid, throws error if invalid
   */
  validate() {
    if (!this.id) {
      throw new Error('Research query ID is required');
    }
    
    if (!this.query) {
      throw new Error('Research query text is required');
    }
    
    return true;
  }

  /**
   * Convert the query to a format suitable for the specified provider
   * @param {string} provider - Provider name (tavily, perplexity, etc.)
   * @returns {Object} Provider-specific query parameters
   */
  toProviderParams(provider) {
    switch (provider.toLowerCase()) {
      case 'tavily':
        return {
          query: this.query,
          max_results: this.maxResults,
          include_domains: this.includeDomains.length > 0 ? this.includeDomains : undefined,
          exclude_domains: this.excludeDomains.length > 0 ? this.excludeDomains : undefined,
          time_range: this.timeRange || undefined,
          search_depth: this.options.searchDepth || 'advanced',
          include_raw_content: this.options.includeRawContent || false,
          include_images: this.options.includeImages || false
        };
        
      case 'perplexity':
        return {
          query: this.query,
          max_results: this.maxResults,
          focus: this.options.focus || 'internet',
          highlight: this.options.highlight || false
        };
        
      case 'firecrawl':
        return {
          query: this.query,
          maxUrls: this.maxResults,
          maxDepth: this.options.maxDepth || 3,
          timeLimit: this.options.timeLimit || 60
        };
        
      default:
        return {
          query: this.query,
          maxResults: this.maxResults,
          options: this.options
        };
    }
  }

  /**
   * Create a new research query from a plain object
   * @param {Object} data - Plain object data
   * @returns {ResearchQuery} New research query instance
   */
  static fromObject(data) {
    return new ResearchQuery(data);
  }

  /**
   * Convert the research query to a plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      query: this.query,
      type: this.type,
      maxResults: this.maxResults,
      includeDomains: this.includeDomains,
      excludeDomains: this.excludeDomains,
      timeRange: this.timeRange,
      options: this.options,
      createdAt: this.createdAt
    };
  }
}
