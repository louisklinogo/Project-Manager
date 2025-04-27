/**
 * Output Formatter Node
 * 
 * This node formats the final output of the research flow.
 */

import { FlowNode } from '../../core/flow/flow-node.js';

/**
 * Output Formatter Node class
 */
export class OutputFormatterNode extends FlowNode {
  /**
   * Constructor
   * @param {Object} options - Node options
   */
  constructor(options = {}) {
    super('OutputFormatter', options);
  }
  
  /**
   * Process the input
   * @param {Object} input - Input data
   * @returns {Promise<Object>} - Output data
   */
  async process(input) {
    try {
      const { query, provider, extractedInfo, confidence, usedMockData } = input;
      
      this.logger.info('Formatting output');
      
      // Format the output
      const result = {
        query,
        provider,
        summary: extractedInfo.summary,
        citations: extractedInfo.citations,
        fullContent: extractedInfo.fullContent,
        confidence,
        usedMockData
      };
      
      return { result };
    } catch (error) {
      this.logger.error('Error formatting output:', error);
      
      // Return a default result
      return {
        result: {
          query: input.query,
          provider: input.provider,
          summary: {
            keyPoints: [],
            codeExamples: 0
          },
          citations: [],
          fullContent: '',
          confidence: 0.5,
          usedMockData: true
        }
      };
    }
  }
}
