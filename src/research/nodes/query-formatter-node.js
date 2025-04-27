/**
 * Query Formatter Node
 * 
 * This node formats the query for research.
 */

import { FlowNode } from '../../core/flow/flow-node.js';

/**
 * Query Formatter Node class
 */
export class QueryFormatterNode extends FlowNode {
  /**
   * Constructor
   * @param {Object} options - Node options
   */
  constructor(options = {}) {
    super('QueryFormatter', options);
  }
  
  /**
   * Process the input
   * @param {Object} input - Input data
   * @returns {Promise<Object>} - Output data
   */
  async process(input) {
    try {
      const { query } = input;
      
      // Format the query
      const formattedQuery = {
        original: query,
        formatted: query,
        keywords: this.extractKeywords(query)
      };
      
      return {
        ...input,
        query: formattedQuery
      };
    } catch (error) {
      this.logger.error('Error formatting query:', error);
      throw error;
    }
  }
  
  /**
   * Extract keywords from a query
   * @param {String} query - Query string
   * @returns {Array} - Array of keywords
   */
  extractKeywords(query) {
    if (!query) return [];
    
    // Split the query into words
    const words = query.toLowerCase().split(/\s+/);
    
    // Filter out common words
    const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'for', 'in', 'on', 'at', 'to', 'with', 'by', 'of'];
    const keywords = words.filter(word => {
      return word.length > 2 && !commonWords.includes(word);
    });
    
    // Return unique keywords
    return [...new Set(keywords)];
  }
}
