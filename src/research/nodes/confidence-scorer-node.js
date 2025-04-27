/**
 * Confidence Scorer Node
 * 
 * This node calculates a confidence score for the research results.
 */

import { FlowNode } from '../../core/flow/flow-node.js';

/**
 * Confidence Scorer Node class
 */
export class ConfidenceScorerNode extends FlowNode {
  /**
   * Constructor
   * @param {Object} options - Node options
   */
  constructor(options = {}) {
    super('ConfidenceScorer', options);
  }
  
  /**
   * Process the input
   * @param {Object} input - Input data
   * @returns {Promise<Object>} - Output data
   */
  async process(input) {
    try {
      const { extractedInfo, usedMockData } = input;
      
      this.logger.info('Calculating confidence score');
      
      // Calculate confidence score
      let confidence = this.calculateConfidence(extractedInfo, usedMockData);
      
      // If mock data was used, reduce the confidence
      if (usedMockData) {
        confidence *= 0.5;
      }
      
      return {
        ...input,
        confidence
      };
    } catch (error) {
      this.logger.error('Error calculating confidence score:', error);
      
      // Return a default confidence score
      return {
        ...input,
        confidence: 0.5
      };
    }
  }
  
  /**
   * Calculate confidence score
   * @param {Object} extractedInfo - Extracted information
   * @param {Boolean} usedMockData - Whether mock data was used
   * @returns {Number} - Confidence score (0-1)
   */
  calculateConfidence(extractedInfo, usedMockData) {
    try {
      // Start with a base confidence
      let confidence = 0.7;
      
      // Adjust based on key points
      const keyPoints = extractedInfo?.summary?.keyPoints || [];
      if (keyPoints.length >= 5) {
        confidence += 0.1;
      } else if (keyPoints.length <= 2) {
        confidence -= 0.1;
      }
      
      // Adjust based on code examples
      const codeExamples = extractedInfo?.summary?.codeExamples || 0;
      if (codeExamples > 0) {
        confidence += 0.05;
      }
      
      // Adjust based on citations
      const citations = extractedInfo?.citations || [];
      if (citations.length >= 3) {
        confidence += 0.1;
      } else if (citations.length === 0) {
        confidence -= 0.1;
      }
      
      // Adjust based on content length
      const contentLength = extractedInfo?.fullContent?.length || 0;
      if (contentLength > 1000) {
        confidence += 0.05;
      } else if (contentLength < 500) {
        confidence -= 0.05;
      }
      
      // If mock data was used, reduce the confidence
      if (usedMockData) {
        confidence *= 0.7;
      }
      
      // Ensure the confidence is between 0 and 1
      return Math.max(0, Math.min(1, confidence));
    } catch (error) {
      this.logger.error('Error calculating confidence:', error);
      return 0.5;
    }
  }
}
