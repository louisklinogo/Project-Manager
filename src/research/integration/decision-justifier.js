/**
 * Decision Justifier
 * 
 * This module provides utilities for justifying blueprint decisions based on research.
 */

import { ResearchReference } from '../../models/research-reference.js';
import { getBestAvailableProvider } from '../../providers/index.js';

/**
 * Decision Justifier class
 */
export class DecisionJustifier {
  /**
   * Create a new decision justifier
   * @param {Object} options - Justifier options
   * @param {boolean} [options.useAI=true] - Whether to use AI for justification
   */
  constructor(options = {}) {
    this.useAI = options.useAI !== false;
  }
  
  /**
   * Justify a blueprint decision based on research
   * @param {Object} decision - Decision to justify
   * @param {Array} researchItems - Research items to use for justification
   * @param {Object} options - Justification options
   * @returns {Promise<Object>} Justification with references
   */
  async justifyDecision(decision, researchItems, options = {}) {
    if (!decision) {
      throw new Error('Decision is required');
    }
    
    if (!researchItems || !Array.isArray(researchItems) || researchItems.length === 0) {
      return {
        decision,
        justification: 'No research available to justify this decision.',
        confidence: 0,
        references: []
      };
    }
    
    // Use AI for justification if enabled
    if (this.useAI) {
      return this.justifyWithAI(decision, researchItems, options);
    } else {
      return this.justifyWithRules(decision, researchItems, options);
    }
  }
  
  /**
   * Justify a decision using AI
   * @param {Object} decision - Decision to justify
   * @param {Array} researchItems - Research items to use for justification
   * @param {Object} options - Justification options
   * @returns {Promise<Object>} Justification with references
   */
  async justifyWithAI(decision, researchItems, options = {}) {
    try {
      // Get AI provider
      const provider = options.aiProvider || await getBestAvailableProvider({ allowMock: true });
      
      // Create justification prompt
      const justificationPrompt = this.createJustificationPrompt(decision, researchItems, options);
      
      // Generate justification using AI
      const justificationResult = await provider.generateChatCompletion({
        messages: [
          {
            role: 'system',
            content: `You are a decision justification assistant. Justify the provided decision based on the research materials. Focus on creating a clear, evidence-based justification that references specific research findings. Include confidence level and specific references to research materials.`
          },
          {
            role: 'user',
            content: justificationPrompt
          }
        ],
        temperature: 0.3,
        maxTokens: 1000,
        responseFormat: { type: 'json_object' }
      });
      
      // Parse justification result
      const justificationData = this.parseJustificationResult(justificationResult.message);
      
      // Create references from justification
      const references = this.createReferencesFromJustification(justificationData, researchItems);
      
      return {
        decision,
        justification: justificationData.justification,
        confidence: justificationData.confidence,
        references
      };
    } catch (error) {
      console.error('Error justifying decision with AI:', error);
      
      // Fall back to rule-based justification
      return this.justifyWithRules(decision, researchItems, options);
    }
  }
  
  /**
   * Justify a decision using rule-based methods
   * @param {Object} decision - Decision to justify
   * @param {Array} researchItems - Research items to use for justification
   * @param {Object} options - Justification options
   * @returns {Promise<Object>} Justification with references
   */
  async justifyWithRules(decision, researchItems, options = {}) {
    // Extract decision text
    const decisionText = this.extractDecisionText(decision);
    
    // Find relevant research items
    const relevantItems = this.findRelevantResearch(decisionText, researchItems);
    
    if (relevantItems.length === 0) {
      return {
        decision,
        justification: 'No directly relevant research found to justify this decision.',
        confidence: 0.3,
        references: []
      };
    }
    
    // Generate justification from relevant items
    const justification = this.generateJustificationFromResearch(decisionText, relevantItems);
    
    // Calculate confidence based on relevance and quality
    const confidence = this.calculateJustificationConfidence(relevantItems);
    
    // Create references
    const references = this.createReferencesFromResearch(relevantItems);
    
    return {
      decision,
      justification,
      confidence,
      references
    };
  }
  
  /**
   * Create a justification prompt for AI
   * @param {Object} decision - Decision to justify
   * @param {Array} researchItems - Research items to use for justification
   * @param {Object} options - Justification options
   * @returns {string} Justification prompt
   */
  createJustificationPrompt(decision, researchItems, options = {}) {
    const decisionText = this.extractDecisionText(decision);
    
    let prompt = `
Justify the following decision based on the provided research materials:

Decision: ${decisionText}

Research Materials:
`;
    
    // Add research items to prompt
    researchItems.forEach((item, index) => {
      prompt += `
Item ${index + 1}: ${item.title || 'Untitled'}
Source: ${item.url || 'Unknown'}
Content:
${item.content || 'No content available'}

`;
    });
    
    prompt += `
Please provide:
1. A clear justification for the decision based on the research
2. A confidence level (0.0-1.0) indicating how well the research supports the decision
3. Specific references to research items that support the decision

Return the justification in the following JSON format:
{
  "justification": "string",
  "confidence": number,
  "references": [
    {
      "researchId": "string",
      "type": "source|finding|concept",
      "content": "string",
      "relevance": number
    }
  ]
}
`;
    
    return prompt;
  }
  
  /**
   * Parse justification result from AI
   * @param {string} result - Justification result
   * @returns {Object} Parsed justification data
   */
  parseJustificationResult(result) {
    try {
      // If result is already an object, return it
      if (typeof result === 'object' && result !== null) {
        return {
          justification: result.justification || '',
          confidence: result.confidence || 0.5,
          references: result.references || []
        };
      }
      
      // Try to parse JSON from the result
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || 
                        result.match(/```\n([\s\S]*?)\n```/) ||
                        result.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        return {
          justification: parsedData.justification || '',
          confidence: parsedData.confidence || 0.5,
          references: parsedData.references || []
        };
      }
      
      // If no JSON found, extract justification using regex
      const justificationMatch = result.match(/justification:?\s*(.*?)(?=confidence|\n\n|$)/is);
      const confidenceMatch = result.match(/confidence:?\s*([0-9.]+)/i);
      
      const justification = justificationMatch ? justificationMatch[1].trim() : '';
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;
      
      return {
        justification,
        confidence,
        references: []
      };
    } catch (error) {
      console.error('Error parsing justification result:', error);
      
      // Return default justification on error
      return {
        justification: 'Unable to generate justification from research.',
        confidence: 0.3,
        references: []
      };
    }
  }
  
  /**
   * Create references from justification data
   * @param {Object} justificationData - Justification data
   * @param {Array} researchItems - Research items
   * @returns {Array} Research references
   */
  createReferencesFromJustification(justificationData, researchItems) {
    const references = [];
    
    if (!justificationData.references || !Array.isArray(justificationData.references)) {
      return references;
    }
    
    for (const ref of justificationData.references) {
      // Find research item by ID
      const researchItem = researchItems.find(item => item.id === ref.researchId);
      
      if (!researchItem) {
        continue;
      }
      
      // Create reference based on type
      if (ref.type === 'source') {
        references.push(ResearchReference.createSourceReference(
          researchItem.id,
          { relevance: ref.relevance || 0.5 }
        ));
      } else if (ref.type === 'finding') {
        references.push(ResearchReference.createFindingReference(
          researchItem.id,
          ref.content || '',
          { relevance: ref.relevance || 0.5 }
        ));
      } else if (ref.type === 'concept') {
        references.push(ResearchReference.createConceptReference(
          researchItem.id,
          ref.content || '',
          '',
          { relevance: ref.relevance || 0.5 }
        ));
      }
    }
    
    return references;
  }
  
  /**
   * Extract decision text from a decision object
   * @param {Object} decision - Decision object
   * @returns {string} Decision text
   */
  extractDecisionText(decision) {
    if (typeof decision === 'string') {
      return decision;
    }
    
    if (typeof decision === 'object' && decision !== null) {
      // Try to extract text from common decision properties
      if (decision.text) {
        return decision.text;
      }
      
      if (decision.description) {
        return decision.description;
      }
      
      if (decision.content) {
        return decision.content;
      }
      
      if (decision.title) {
        return decision.title;
      }
      
      // If no text found, stringify the decision
      return JSON.stringify(decision);
    }
    
    return String(decision);
  }
  
  /**
   * Find research items relevant to a decision
   * @param {string} decisionText - Decision text
   * @param {Array} researchItems - Research items
   * @returns {Array} Relevant research items with relevance scores
   */
  findRelevantResearch(decisionText, researchItems) {
    const relevantItems = [];
    
    for (const item of researchItems) {
      // Calculate relevance score
      const relevance = this.calculateRelevance(decisionText, item);
      
      // Only include items with sufficient relevance
      if (relevance > 0.3) {
        relevantItems.push({
          item,
          relevance
        });
      }
    }
    
    // Sort by relevance (descending)
    return relevantItems.sort((a, b) => b.relevance - a.relevance);
  }
  
  /**
   * Calculate relevance between decision text and research item
   * @param {string} decisionText - Decision text
   * @param {Object} researchItem - Research item
   * @returns {number} Relevance score (0-1)
   */
  calculateRelevance(decisionText, researchItem) {
    // Use relevance from metadata if available
    if (researchItem.metadata && typeof researchItem.metadata.relevance === 'number') {
      return researchItem.metadata.relevance;
    }
    
    const content = [
      researchItem.title || '',
      researchItem.description || '',
      researchItem.content || ''
    ].join(' ').toLowerCase();
    
    const decisionTerms = decisionText.toLowerCase().split(/\s+/);
    
    // Count matching terms
    const matchingTerms = decisionTerms.filter(term => content.includes(term));
    
    // Calculate relevance score
    return matchingTerms.length / Math.max(1, decisionTerms.length);
  }
  
  /**
   * Generate justification from relevant research
   * @param {string} decisionText - Decision text
   * @param {Array} relevantItems - Relevant research items
   * @returns {string} Generated justification
   */
  generateJustificationFromResearch(decisionText, relevantItems) {
    if (relevantItems.length === 0) {
      return 'No relevant research found to justify this decision.';
    }
    
    // Use top 3 most relevant items
    const topItems = relevantItems.slice(0, 3);
    
    // Generate justification
    let justification = `This decision is supported by research from ${topItems.length} sources. `;
    
    // Add evidence from each item
    topItems.forEach((relevantItem, index) => {
      const item = relevantItem.item;
      
      // Extract relevant sentences from content
      const relevantSentences = this.extractRelevantSentences(decisionText, item.content || '');
      
      if (relevantSentences.length > 0) {
        justification += `${index === 0 ? '' : ' Additionally, '}${item.title || 'Research'} states: "${relevantSentences[0]}"`;
      }
    });
    
    return justification;
  }
  
  /**
   * Extract sentences relevant to a decision from content
   * @param {string} decisionText - Decision text
   * @param {string} content - Content to extract from
   * @returns {Array} Relevant sentences
   */
  extractRelevantSentences(decisionText, content) {
    if (!content) {
      return [];
    }
    
    // Split content into sentences
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    
    // Calculate relevance for each sentence
    const scoredSentences = sentences.map(sentence => {
      const relevance = this.calculateRelevance(decisionText, { content: sentence });
      return { sentence, relevance };
    });
    
    // Sort by relevance (descending)
    return scoredSentences
      .filter(item => item.relevance > 0.2)
      .sort((a, b) => b.relevance - a.relevance)
      .map(item => item.sentence.trim());
  }
  
  /**
   * Calculate confidence for justification
   * @param {Array} relevantItems - Relevant research items
   * @returns {number} Confidence score (0-1)
   */
  calculateJustificationConfidence(relevantItems) {
    if (relevantItems.length === 0) {
      return 0.3;
    }
    
    // Calculate average relevance
    const totalRelevance = relevantItems.reduce((sum, item) => sum + item.relevance, 0);
    const averageRelevance = totalRelevance / relevantItems.length;
    
    // Calculate average confidence
    const totalConfidence = relevantItems.reduce((sum, item) => {
      const confidence = item.item.metadata?.confidence || 0.5;
      return sum + confidence;
    }, 0);
    const averageConfidence = totalConfidence / relevantItems.length;
    
    // Combine relevance and confidence
    return (averageRelevance * 0.6) + (averageConfidence * 0.4);
  }
  
  /**
   * Create references from relevant research
   * @param {Array} relevantItems - Relevant research items
   * @returns {Array} Research references
   */
  createReferencesFromResearch(relevantItems) {
    const references = [];
    
    for (const relevantItem of relevantItems) {
      const item = relevantItem.item;
      
      // Create source reference
      references.push(ResearchReference.createSourceReference(
        item.id,
        { relevance: relevantItem.relevance }
      ));
      
      // Extract key findings
      const findings = this.extractKeyFindings(item.content || '');
      
      // Create finding references
      findings.slice(0, 2).forEach(finding => {
        references.push(ResearchReference.createFindingReference(
          item.id,
          finding,
          { relevance: relevantItem.relevance }
        ));
      });
    }
    
    return references;
  }
  
  /**
   * Extract key findings from content
   * @param {string} content - Content to extract from
   * @returns {Array} Key findings
   */
  extractKeyFindings(content) {
    if (!content) {
      return [];
    }
    
    const findings = [];
    
    // Extract bullet points
    const bulletPoints = content.match(/[-*•]\s*([^\n]+)/g) || [];
    
    for (const point of bulletPoints) {
      const cleanPoint = point.replace(/^[-*•]\s*/, '').trim();
      
      // Skip short points
      if (cleanPoint.length < 10) {
        continue;
      }
      
      findings.push(cleanPoint);
    }
    
    // Extract sentences with key phrases
    const keyPhrases = [
      'important', 'significant', 'key', 'critical', 'essential',
      'best practice', 'recommended', 'should', 'must', 'need to',
      'advantage', 'benefit', 'drawback', 'limitation', 'challenge'
    ];
    
    for (const phrase of keyPhrases) {
      const regex = new RegExp(`[^.!?]*\\b${phrase}\\b[^.!?]*[.!?]`, 'gi');
      const matches = content.match(regex) || [];
      
      for (const match of matches) {
        const cleanMatch = match.trim();
        
        // Skip short matches
        if (cleanMatch.length < 20) {
          continue;
        }
        
        findings.push(cleanMatch);
      }
    }
    
    // Remove duplicates and limit to 5 findings
    return [...new Set(findings)].slice(0, 5);
  }
}
