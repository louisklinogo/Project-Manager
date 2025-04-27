/**
 * Priority Ranker for research synthesis
 * 
 * This module provides utilities for ranking research by relevance and priority.
 */

/**
 * Priority Ranker class
 */
export class PriorityRanker {
  /**
   * Create a new priority ranker
   * @param {Object} options - Ranker options
   * @param {Object} [options.weights] - Weights for different ranking factors
   */
  constructor(options = {}) {
    this.weights = {
      confidence: options.weights?.confidence || 0.3,
      relevance: options.weights?.relevance || 0.3,
      recency: options.weights?.recency || 0.2,
      specificity: options.weights?.specificity || 0.2,
      ...options.weights
    };
  }
  
  /**
   * Rank research items by priority
   * @param {Array} researchItems - Research items to rank
   * @param {Object} options - Ranking options
   * @param {string} [options.query] - Query for relevance calculation
   * @param {string} [options.domain] - Domain for domain-specific ranking
   * @returns {Array} Ranked research items with scores
   */
  rankItems(researchItems, options = {}) {
    if (!researchItems || !Array.isArray(researchItems) || researchItems.length === 0) {
      return [];
    }
    
    // Calculate scores for each item
    const scoredItems = researchItems.map(item => {
      const scores = {
        confidence: this.calculateConfidenceScore(item),
        relevance: this.calculateRelevanceScore(item, options.query),
        recency: this.calculateRecencyScore(item),
        specificity: this.calculateSpecificityScore(item)
      };
      
      // Calculate weighted score
      const weightedScore = Object.entries(scores).reduce((total, [key, score]) => {
        return total + (score * (this.weights[key] || 0));
      }, 0);
      
      return {
        item,
        scores,
        weightedScore
      };
    });
    
    // Sort by weighted score (descending)
    return scoredItems.sort((a, b) => b.weightedScore - a.weightedScore);
  }
  
  /**
   * Calculate confidence score for a research item
   * @param {Object} item - Research item
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidenceScore(item) {
    // Use confidence score if available
    if (typeof item.confidence === 'number') {
      return item.confidence;
    }
    
    // Use confidence from metadata if available
    if (item.metadata && typeof item.metadata.confidence === 'number') {
      return item.metadata.confidence;
    }
    
    // Default confidence based on source
    if (item.url) {
      const url = item.url.toLowerCase();
      
      // Higher confidence for reputable domains
      if (url.includes('github.com') || 
          url.includes('stackoverflow.com') || 
          url.includes('developer.mozilla.org') ||
          url.includes('docs.microsoft.com') ||
          url.endsWith('.edu') ||
          url.endsWith('.gov')) {
        return 0.8;
      }
    }
    
    return 0.5; // Default confidence
  }
  
  /**
   * Calculate relevance score for a research item
   * @param {Object} item - Research item
   * @param {string} query - Query for relevance calculation
   * @returns {number} Relevance score (0-1)
   */
  calculateRelevanceScore(item, query) {
    // Use relevance from metadata if available
    if (item.metadata && typeof item.metadata.relevance === 'number') {
      return item.metadata.relevance;
    }
    
    // If no query, can't calculate relevance
    if (!query) {
      return 0.5; // Default relevance
    }
    
    // Calculate relevance based on query match
    const content = [
      item.title || '',
      item.description || '',
      item.content || ''
    ].join(' ').toLowerCase();
    
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    // Count matching terms
    const matchingTerms = queryTerms.filter(term => content.includes(term));
    
    // Calculate relevance score
    return matchingTerms.length / queryTerms.length;
  }
  
  /**
   * Calculate recency score for a research item
   * @param {Object} item - Research item
   * @returns {number} Recency score (0-1)
   */
  calculateRecencyScore(item) {
    // Try to get publication date
    let publicationDate = null;
    
    if (item.metadata && item.metadata.publishedDate) {
      publicationDate = new Date(item.metadata.publishedDate);
    } else if (item.metadata && item.metadata.date) {
      publicationDate = new Date(item.metadata.date);
    } else if (item.createdAt) {
      publicationDate = new Date(item.createdAt);
    }
    
    // If no date, use default recency
    if (!publicationDate || isNaN(publicationDate.getTime())) {
      return 0.5; // Default recency
    }
    
    // Calculate age in days
    const now = new Date();
    const ageInDays = (now - publicationDate) / (1000 * 60 * 60 * 24);
    
    // Calculate recency score (1.0 for fresh content, decreasing with age)
    // Use 365 days (1 year) as the threshold for minimum recency
    return Math.max(0, 1 - (ageInDays / 365));
  }
  
  /**
   * Calculate specificity score for a research item
   * @param {Object} item - Research item
   * @returns {number} Specificity score (0-1)
   */
  calculateSpecificityScore(item) {
    // Use specificity from metadata if available
    if (item.metadata && typeof item.metadata.specificity === 'number') {
      return item.metadata.specificity;
    }
    
    const content = item.content || '';
    
    // Calculate specificity based on content length and structure
    
    // Check for code blocks (indicates specific technical content)
    const hasCodeBlocks = content.includes('```') || content.includes('    ') || content.includes('<code>');
    
    // Check for specific numbers or measurements
    const hasNumbers = /\d+(\.\d+)?(%|px|em|rem|s|ms|kg|mb|gb|tb)?/i.test(content);
    
    // Check for lists (indicates structured content)
    const hasLists = content.includes('- ') || content.includes('* ') || content.includes('1. ');
    
    // Check for section headings (indicates structured content)
    const hasSections = /#{2,}\s+\w+|<h[2-6]>/.test(content);
    
    // Calculate specificity score
    let score = 0.5; // Default score
    
    if (hasCodeBlocks) score += 0.2;
    if (hasNumbers) score += 0.1;
    if (hasLists) score += 0.1;
    if (hasSections) score += 0.1;
    
    // Cap score at 1.0
    return Math.min(1.0, score);
  }
  
  /**
   * Get top N ranked items
   * @param {Array} researchItems - Research items to rank
   * @param {number} n - Number of items to return
   * @param {Object} options - Ranking options
   * @returns {Array} Top N ranked items
   */
  getTopItems(researchItems, n = 5, options = {}) {
    const rankedItems = this.rankItems(researchItems, options);
    return rankedItems.slice(0, n).map(item => item.item);
  }
  
  /**
   * Filter items by minimum score
   * @param {Array} researchItems - Research items to filter
   * @param {number} minScore - Minimum score threshold
   * @param {Object} options - Ranking options
   * @returns {Array} Filtered items
   */
  filterByMinScore(researchItems, minScore = 0.7, options = {}) {
    const rankedItems = this.rankItems(researchItems, options);
    return rankedItems
      .filter(item => item.weightedScore >= minScore)
      .map(item => item.item);
  }
}
