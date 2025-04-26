/**
 * Research Result model
 * 
 * Represents the results of a research query.
 */

import { v4 as uuidv4 } from 'uuid';

export class ResearchResult {
  /**
   * Create a new research result
   * @param {Object} params - Result parameters
   * @param {string} [params.id] - Unique ID for the result
   * @param {string} params.queryId - ID of the query that produced this result
   * @param {string} params.provider - Provider that produced the result (tavily, perplexity, etc.)
   * @param {Array} params.results - Array of result items
   * @param {Object} [params.metadata={}] - Additional metadata about the result
   * @param {string} [params.createdAt] - ISO timestamp of when the result was created
   */
  constructor(params = {}) {
    this.id = params.id || uuidv4();
    this.queryId = params.queryId || '';
    this.provider = params.provider || '';
    this.results = params.results || [];
    this.metadata = params.metadata || {};
    this.createdAt = params.createdAt || new Date().toISOString();
  }

  /**
   * Validate the research result
   * @returns {boolean} True if valid, throws error if invalid
   */
  validate() {
    if (!this.id) {
      throw new Error('Research result ID is required');
    }
    
    if (!this.queryId) {
      throw new Error('Research query ID is required');
    }
    
    if (!this.provider) {
      throw new Error('Research provider is required');
    }
    
    return true;
  }

  /**
   * Get the result items as plain objects
   * @returns {Array} Array of result items
   */
  getItems() {
    return this.results;
  }

  /**
   * Get the result items as markdown text
   * @returns {string} Markdown formatted result
   */
  toMarkdown() {
    let markdown = `# Research Results\n\n`;
    markdown += `Query: ${this.metadata.query || 'Unknown'}\n`;
    markdown += `Provider: ${this.provider}\n`;
    markdown += `Results: ${this.results.length}\n\n`;
    
    this.results.forEach((result, index) => {
      markdown += `## Result ${index + 1}\n\n`;
      
      if (result.title) {
        markdown += `### ${result.title}\n\n`;
      }
      
      if (result.url) {
        markdown += `Source: [${result.url}](${result.url})\n\n`;
      }
      
      if (result.content || result.snippet) {
        markdown += `${result.content || result.snippet}\n\n`;
      }
      
      markdown += `---\n\n`;
    });
    
    return markdown;
  }

  /**
   * Extract key information from the results
   * @param {Object} options - Extraction options
   * @param {string} [options.format='text'] - Format to extract (text, json, etc.)
   * @param {string} [options.focus='summary'] - What to focus on (summary, details, etc.)
   * @returns {string|Object} Extracted information
   */
  extractInformation(options = {}) {
    const format = options.format || 'text';
    const focus = options.focus || 'summary';
    
    if (format === 'json') {
      return {
        query: this.metadata.query,
        provider: this.provider,
        resultCount: this.results.length,
        results: this.results.map(result => ({
          title: result.title,
          url: result.url,
          content: focus === 'summary' ? (result.snippet || '') : (result.content || '')
        }))
      };
    }
    
    // Default to text format
    let text = `Research Results for "${this.metadata.query || 'Unknown query'}"\n\n`;
    
    this.results.forEach((result, index) => {
      text += `${index + 1}. ${result.title || 'Untitled'}\n`;
      text += `   Source: ${result.url || 'Unknown source'}\n`;
      
      if (focus === 'summary') {
        text += `   ${result.snippet || ''}\n\n`;
      } else {
        text += `   ${result.content || result.snippet || ''}\n\n`;
      }
    });
    
    return text;
  }

  /**
   * Create a new research result from a plain object
   * @param {Object} data - Plain object data
   * @returns {ResearchResult} New research result instance
   */
  static fromObject(data) {
    return new ResearchResult(data);
  }

  /**
   * Convert the research result to a plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      queryId: this.queryId,
      provider: this.provider,
      results: this.results,
      metadata: this.metadata,
      createdAt: this.createdAt
    };
  }
}
