/**
 * Information Extractor Node
 * 
 * This node extracts structured information from the raw research response.
 */

import { FlowNode } from '../../core/flow/flow-node.js';

/**
 * Information Extractor Node class
 */
export class InformationExtractorNode extends FlowNode {
  /**
   * Constructor
   * @param {Object} options - Node options
   */
  constructor(options = {}) {
    super('InformationExtractor', options);
  }
  
  /**
   * Process the input
   * @param {Object} input - Input data
   * @returns {Promise<Object>} - Output data
   */
  async process(input) {
    try {
      const { rawResponse } = input;
      
      this.logger.info('Extracting information from raw response');
      
      // Extract information from the raw response
      const extractedInfo = this.extractInformation(rawResponse);
      
      return {
        ...input,
        extractedInfo
      };
    } catch (error) {
      this.logger.error('Error extracting information:', error);
      
      // Return empty extracted info
      return {
        ...input,
        extractedInfo: {
          summary: {
            keyPoints: [],
            codeExamples: 0
          },
          citations: [],
          fullContent: input.rawResponse?.content || ''
        }
      };
    }
  }
  
  /**
   * Extract information from a raw response
   * @param {Object} rawResponse - Raw response object
   * @returns {Object} - Extracted information
   */
  extractInformation(rawResponse) {
    // Get the content from the raw response
    const content = rawResponse?.content || '';
    
    // Extract key points
    const keyPoints = this.extractKeyPoints(content);
    
    // Extract code examples
    const codeExamples = this.extractCodeExamples(content);
    
    // Extract citations
    const citations = this.extractCitations(content);
    
    // Return the extracted information
    return {
      summary: {
        keyPoints,
        codeExamples: codeExamples.length
      },
      citations,
      fullContent: content
    };
  }
  
  /**
   * Extract key points from content
   * @param {String} content - Content string
   * @returns {Array} - Array of key points
   */
  extractKeyPoints(content) {
    try {
      // Look for numbered lists or bullet points
      const keyPointsRegex = /(?:##?\s*Key\s*Points[^\n]*\n+)((?:\d+\.\s*[^\n]+\n*)+)/i;
      const match = content.match(keyPointsRegex);
      
      if (match && match[1]) {
        // Extract individual points
        const pointsText = match[1];
        const pointsRegex = /\d+\.\s*([^\n]+)/g;
        const points = [];
        
        let pointMatch;
        while ((pointMatch = pointsRegex.exec(pointsText)) !== null) {
          if (pointMatch[1]) {
            points.push(pointMatch[1].trim());
          }
        }
        
        return points;
      }
      
      // If no key points section, extract the first few sentences
      const sentences = content.split(/[.!?][\s\n]+/).filter(s => s.trim().length > 0);
      return sentences.slice(0, 5).map(s => s.trim());
    } catch (error) {
      this.logger.error('Error extracting key points:', error);
      return [];
    }
  }
  
  /**
   * Extract code examples from content
   * @param {String} content - Content string
   * @returns {Array} - Array of code examples
   */
  extractCodeExamples(content) {
    try {
      // Look for code blocks
      const codeBlockRegex = /\`\`\`[^\n]*\n([\s\S]*?)\`\`\`/g;
      const codeExamples = [];
      
      let codeMatch;
      while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
        if (codeMatch[1]) {
          codeExamples.push(codeMatch[1].trim());
        }
      }
      
      return codeExamples;
    } catch (error) {
      this.logger.error('Error extracting code examples:', error);
      return [];
    }
  }
  
  /**
   * Extract citations from content
   * @param {String} content - Content string
   * @returns {Array} - Array of citations
   */
  extractCitations(content) {
    try {
      // Look for references or citations section
      const citationsRegex = /(?:##?\s*References|##?\s*Citations)[^\n]*\n+([\s\S]*?)(?:\n##?|$)/i;
      const match = content.match(citationsRegex);
      
      if (match && match[1]) {
        // Extract individual citations
        const citationsText = match[1];
        const citations = citationsText
          .split(/\n+/)
          .map(line => line.trim())
          .filter(line => line.length > 0 && /^\d+\./.test(line));
        
        return citations;
      }
      
      // Look for URLs in the content
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = [];
      
      let urlMatch;
      while ((urlMatch = urlRegex.exec(content)) !== null) {
        if (urlMatch[1]) {
          urls.push(urlMatch[1]);
        }
      }
      
      return urls;
    } catch (error) {
      this.logger.error('Error extracting citations:', error);
      return [];
    }
  }
}
