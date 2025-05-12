/**
 * Research Validator
 * 
 * This module provides utilities for validating research materials.
 */

import { calculateConfidenceScore } from './confidence-scorer.js';
import { getValidationCriteria } from './validation-criteria.js';

/**
 * Research Validator class
 */
export class ResearchValidator {
  /**
   * Create a new research validator
   * @param {Object} options - Validator options
   * @param {string} [options.domain] - Domain for domain-specific validation
   * @param {Object} [options.criteria] - Custom validation criteria
   * @param {boolean} [options.strictMode=false] - Whether to use strict validation
   */
  constructor(options = {}) {
    this.domain = options.domain;
    this.criteria = options.criteria || getValidationCriteria(this.domain);
    this.strictMode = options.strictMode || false;
  }
  
  /**
   * Validate a single research item
   * @param {Object} researchItem - Research item to validate
   * @param {Array} [otherItems=[]] - Other research items for cross-reference
   * @returns {Object} Validation result with confidence score
   */
  validateItem(researchItem, otherItems = []) {
    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(researchItem, {
      domain: this.domain,
      criteria: this.criteria,
      otherItems
    });
    
    // Determine validation status
    const isValid = this.strictMode
      ? confidenceScore.passesValidation
      : confidenceScore.overall >= this.criteria.thresholds.minimumOverallScore;
    
    // Create validation result
    return {
      isValid,
      confidenceScore,
      item: researchItem,
      validatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Validate multiple research items
   * @param {Array} researchItems - Research items to validate
   * @returns {Object} Validation results with statistics
   */
  validateItems(researchItems) {
    if (!researchItems || !Array.isArray(researchItems) || researchItems.length === 0) {
      return {
        validItems: [],
        invalidItems: [],
        stats: {
          total: 0,
          valid: 0,
          invalid: 0,
          averageConfidence: 0
        }
      };
    }
    
    // Validate each item
    const validationResults = researchItems.map(item => 
      this.validateItem(item, researchItems.filter(i => i !== item))
    );
    
    // Separate valid and invalid items
    const validItems = validationResults.filter(result => result.isValid);
    const invalidItems = validationResults.filter(result => !result.isValid);
    
    // Calculate statistics
    const total = validationResults.length;
    const valid = validItems.length;
    const invalid = invalidItems.length;
    const averageConfidence = total > 0
      ? validationResults.reduce((sum, result) => sum + result.confidenceScore.overall, 0) / total
      : 0;
    
    return {
      validItems,
      invalidItems,
      stats: {
        total,
        valid,
        invalid,
        averageConfidence
      }
    };
  }
  
  /**
   * Filter research items by confidence threshold
   * @param {Array} researchItems - Research items to filter
   * @param {number} [threshold=0.7] - Confidence threshold
   * @returns {Array} Filtered research items
   */
  filterByConfidence(researchItems, threshold = 0.7) {
    if (!researchItems || !Array.isArray(researchItems) || researchItems.length === 0) {
      return [];
    }
    
    // Validate each item
    const validationResults = researchItems.map(item => 
      this.validateItem(item, researchItems.filter(i => i !== item))
    );
    
    // Filter by confidence threshold
    return validationResults
      .filter(result => result.confidenceScore.overall >= threshold)
      .map(result => result.item);
  }
  
  /**
   * Rank research items by confidence score
   * @param {Array} researchItems - Research items to rank
   * @returns {Array} Ranked research items with scores
   */
  rankByConfidence(researchItems) {
    if (!researchItems || !Array.isArray(researchItems) || researchItems.length === 0) {
      return [];
    }
    
    // Validate each item
    const validationResults = researchItems.map(item => 
      this.validateItem(item, researchItems.filter(i => i !== item))
    );
    
    // Sort by confidence score (descending)
    return validationResults
      .sort((a, b) => b.confidenceScore.overall - a.confidenceScore.overall)
      .map(result => ({
        item: result.item,
        confidence: result.confidenceScore.overall,
        isValid: result.isValid
      }));
  }
  
  /**
   * Get validation issues for a research item
   * @param {Object} researchItem - Research item to check
   * @param {Array} [otherItems=[]] - Other research items for cross-reference
   * @returns {Array} Validation issues
   */
  getValidationIssues(researchItem, otherItems = []) {
    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(researchItem, {
      domain: this.domain,
      criteria: this.criteria,
      otherItems
    });
    
    const issues = [];
    
    // Check source credibility issues
    if (confidenceScore.sourceCredibility.overall < this.criteria.thresholds.minimumCategoryScore) {
      issues.push({
        category: 'sourceCredibility',
        message: 'Source credibility is below the required threshold',
        score: confidenceScore.sourceCredibility.overall,
        threshold: this.criteria.thresholds.minimumCategoryScore
      });
      
      // Check specific source credibility issues
      Object.entries(confidenceScore.sourceCredibility.scores).forEach(([key, score]) => {
        const criteriaThreshold = this.criteria.sourceCredibility.criteria[key]?.threshold || 0.5;
        if (score < criteriaThreshold) {
          issues.push({
            category: 'sourceCredibility',
            subcategory: key,
            message: `${key} score is below the required threshold`,
            score,
            threshold: criteriaThreshold
          });
        }
      });
    }
    
    // Check content relevance issues
    if (confidenceScore.contentRelevance.overall < this.criteria.thresholds.minimumCategoryScore) {
      issues.push({
        category: 'contentRelevance',
        message: 'Content relevance is below the required threshold',
        score: confidenceScore.contentRelevance.overall,
        threshold: this.criteria.thresholds.minimumCategoryScore
      });
      
      // Check specific content relevance issues
      Object.entries(confidenceScore.contentRelevance.scores).forEach(([key, score]) => {
        const criteriaThreshold = this.criteria.contentRelevance.criteria[key]?.threshold || 0.5;
        if (score < criteriaThreshold) {
          issues.push({
            category: 'contentRelevance',
            subcategory: key,
            message: `${key} score is below the required threshold`,
            score,
            threshold: criteriaThreshold
          });
        }
      });
    }
    
    // Check information consistency issues
    if (confidenceScore.informationConsistency.overall < this.criteria.thresholds.minimumCategoryScore) {
      issues.push({
        category: 'informationConsistency',
        message: 'Information consistency is below the required threshold',
        score: confidenceScore.informationConsistency.overall,
        threshold: this.criteria.thresholds.minimumCategoryScore
      });
      
      // Check specific information consistency issues
      Object.entries(confidenceScore.informationConsistency.scores).forEach(([key, score]) => {
        const criteriaThreshold = this.criteria.informationConsistency.criteria[key]?.threshold || 0.5;
        if (score < criteriaThreshold) {
          issues.push({
            category: 'informationConsistency',
            subcategory: key,
            message: `${key} score is below the required threshold`,
            score,
            threshold: criteriaThreshold
          });
        }
      });
    }
    
    return issues;
  }
  
  /**
   * Suggest improvements for a research item
   * @param {Object} researchItem - Research item to improve
   * @param {Array} [otherItems=[]] - Other research items for cross-reference
   * @returns {Array} Improvement suggestions
   */
  suggestImprovements(researchItem, otherItems = []) {
    // Get validation issues
    const issues = this.getValidationIssues(researchItem, otherItems);
    
    // Generate improvement suggestions based on issues
    return issues.map(issue => {
      switch (issue.category) {
        case 'sourceCredibility':
          if (issue.subcategory === 'authoritative') {
            return {
              issue,
              suggestion: 'Consider finding information from more authoritative sources in this domain.'
            };
          } else if (issue.subcategory === 'recency') {
            return {
              issue,
              suggestion: 'This information may be outdated. Consider finding more recent sources.'
            };
          } else if (issue.subcategory === 'reputation') {
            return {
              issue,
              suggestion: 'Consider finding information from sources with better reputation.'
            };
          } else {
            return {
              issue,
              suggestion: 'Consider improving the overall credibility of the source.'
            };
          }
          
        case 'contentRelevance':
          if (issue.subcategory === 'queryMatch') {
            return {
              issue,
              suggestion: 'This content may not be directly relevant to the query. Consider finding more relevant information.'
            };
          } else if (issue.subcategory === 'specificity') {
            return {
              issue,
              suggestion: 'This content lacks specificity. Consider finding more detailed information.'
            };
          } else if (issue.subcategory === 'comprehensiveness') {
            return {
              issue,
              suggestion: 'This content is not comprehensive enough. Consider finding more complete information.'
            };
          } else {
            return {
              issue,
              suggestion: 'Consider improving the overall relevance of the content.'
            };
          }
          
        case 'informationConsistency':
          if (issue.subcategory === 'crossReferenceConsistency') {
            return {
              issue,
              suggestion: 'This information conflicts with other sources. Consider cross-checking with additional sources.'
            };
          } else if (issue.subcategory === 'internalConsistency') {
            return {
              issue,
              suggestion: 'This information contains internal inconsistencies. Consider finding more coherent sources.'
            };
          } else if (issue.subcategory === 'logicalSoundness') {
            return {
              issue,
              suggestion: 'This information lacks logical soundness. Consider finding sources with better reasoning.'
            };
          } else {
            return {
              issue,
              suggestion: 'Consider improving the overall consistency of the information.'
            };
          }
          
        default:
          return {
            issue,
            suggestion: 'Consider improving this aspect of the research.'
          };
      }
    });
  }
}
