/**
 * Confidence Scorer for research validation
 * 
 * This module provides utilities for scoring the confidence of research materials.
 */

import { DEFAULT_VALIDATION_CRITERIA, getValidationCriteria } from './validation-criteria.js';

/**
 * Calculate confidence score for a research item
 * @param {Object} researchItem - Research item to score
 * @param {Object} options - Scoring options
 * @param {string} [options.domain] - Domain for domain-specific criteria
 * @param {Object} [options.criteria] - Custom validation criteria
 * @param {Array} [options.otherItems] - Other research items for cross-reference
 * @returns {Object} Confidence score and breakdown
 */
export function calculateConfidenceScore(researchItem, options = {}) {
  // Get appropriate validation criteria
  const criteria = options.criteria || getValidationCriteria(options.domain);
  
  // Calculate source credibility score
  const sourceScore = calculateSourceCredibilityScore(researchItem, criteria.sourceCredibility);
  
  // Calculate content relevance score
  const contentScore = calculateContentRelevanceScore(researchItem, criteria.contentRelevance);
  
  // Calculate information consistency score
  const consistencyScore = calculateInformationConsistencyScore(
    researchItem, 
    criteria.informationConsistency,
    options.otherItems || []
  );
  
  // Calculate overall score
  const overallScore = (
    sourceScore.overall * criteria.sourceCredibility.weight +
    contentScore.overall * criteria.contentRelevance.weight +
    consistencyScore.overall * criteria.informationConsistency.weight
  );
  
  // Determine if the research item passes validation
  const passesValidation = (
    overallScore >= criteria.thresholds.minimumOverallScore &&
    sourceScore.overall >= criteria.thresholds.minimumCategoryScore &&
    contentScore.overall >= criteria.thresholds.minimumCategoryScore &&
    consistencyScore.overall >= criteria.thresholds.minimumCategoryScore
  );
  
  return {
    overall: overallScore,
    sourceCredibility: sourceScore,
    contentRelevance: contentScore,
    informationConsistency: consistencyScore,
    passesValidation
  };
}

/**
 * Calculate source credibility score
 * @param {Object} researchItem - Research item to score
 * @param {Object} criteria - Source credibility criteria
 * @returns {Object} Source credibility score and breakdown
 */
function calculateSourceCredibilityScore(researchItem, criteria) {
  const scores = {};
  let totalScore = 0;
  let totalWeight = 0;
  
  // Calculate authoritative score
  if (criteria.criteria.authoritative) {
    const authoritativeScore = calculateAuthoritativeScore(researchItem);
    scores.authoritative = authoritativeScore;
    totalScore += authoritativeScore * criteria.criteria.authoritative.weight;
    totalWeight += criteria.criteria.authoritative.weight;
  }
  
  // Calculate recency score
  if (criteria.criteria.recency) {
    const recencyScore = calculateRecencyScore(researchItem, criteria.criteria.recency.maxAgeDays);
    scores.recency = recencyScore;
    totalScore += recencyScore * criteria.criteria.recency.weight;
    totalWeight += criteria.criteria.recency.weight;
  }
  
  // Calculate reputation score
  if (criteria.criteria.reputation) {
    const reputationScore = calculateReputationScore(researchItem);
    scores.reputation = reputationScore;
    totalScore += reputationScore * criteria.criteria.reputation.weight;
    totalWeight += criteria.criteria.reputation.weight;
  }
  
  // Calculate overall source credibility score
  const overall = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  return {
    overall,
    scores
  };
}

/**
 * Calculate content relevance score
 * @param {Object} researchItem - Research item to score
 * @param {Object} criteria - Content relevance criteria
 * @returns {Object} Content relevance score and breakdown
 */
function calculateContentRelevanceScore(researchItem, criteria) {
  const scores = {};
  let totalScore = 0;
  let totalWeight = 0;
  
  // Calculate query match score
  if (criteria.criteria.queryMatch) {
    const queryMatchScore = calculateQueryMatchScore(researchItem);
    scores.queryMatch = queryMatchScore;
    totalScore += queryMatchScore * criteria.criteria.queryMatch.weight;
    totalWeight += criteria.criteria.queryMatch.weight;
  }
  
  // Calculate specificity score
  if (criteria.criteria.specificity) {
    const specificityScore = calculateSpecificityScore(researchItem);
    scores.specificity = specificityScore;
    totalScore += specificityScore * criteria.criteria.specificity.weight;
    totalWeight += criteria.criteria.specificity.weight;
  }
  
  // Calculate comprehensiveness score
  if (criteria.criteria.comprehensiveness) {
    const comprehensivenessScore = calculateComprehensivenessScore(researchItem);
    scores.comprehensiveness = comprehensivenessScore;
    totalScore += comprehensivenessScore * criteria.criteria.comprehensiveness.weight;
    totalWeight += criteria.criteria.comprehensiveness.weight;
  }
  
  // Calculate overall content relevance score
  const overall = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  return {
    overall,
    scores
  };
}

/**
 * Calculate information consistency score
 * @param {Object} researchItem - Research item to score
 * @param {Object} criteria - Information consistency criteria
 * @param {Array} otherItems - Other research items for cross-reference
 * @returns {Object} Information consistency score and breakdown
 */
function calculateInformationConsistencyScore(researchItem, criteria, otherItems) {
  const scores = {};
  let totalScore = 0;
  let totalWeight = 0;
  
  // Calculate cross-reference consistency score
  if (criteria.criteria.crossReferenceConsistency) {
    const crossReferenceScore = calculateCrossReferenceScore(researchItem, otherItems);
    scores.crossReferenceConsistency = crossReferenceScore;
    totalScore += crossReferenceScore * criteria.criteria.crossReferenceConsistency.weight;
    totalWeight += criteria.criteria.crossReferenceConsistency.weight;
  }
  
  // Calculate internal consistency score
  if (criteria.criteria.internalConsistency) {
    const internalConsistencyScore = calculateInternalConsistencyScore(researchItem);
    scores.internalConsistency = internalConsistencyScore;
    totalScore += internalConsistencyScore * criteria.criteria.internalConsistency.weight;
    totalWeight += criteria.criteria.internalConsistency.weight;
  }
  
  // Calculate logical soundness score
  if (criteria.criteria.logicalSoundness) {
    const logicalSoundnessScore = calculateLogicalSoundnessScore(researchItem);
    scores.logicalSoundness = logicalSoundnessScore;
    totalScore += logicalSoundnessScore * criteria.criteria.logicalSoundness.weight;
    totalWeight += criteria.criteria.logicalSoundness.weight;
  }
  
  // Calculate overall information consistency score
  const overall = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  return {
    overall,
    scores
  };
}

// Helper functions for calculating individual scores

/**
 * Calculate authoritative score
 * @param {Object} researchItem - Research item to score
 * @returns {number} Authoritative score (0-1)
 */
function calculateAuthoritativeScore(researchItem) {
  // Implementation depends on available metadata
  // For now, use a simple heuristic based on source domain
  const authoritativeDomains = [
    'github.com',
    'stackoverflow.com',
    'developer.mozilla.org',
    'docs.microsoft.com',
    'reactjs.org',
    'angular.io',
    'vuejs.org',
    'nodejs.org',
    'python.org',
    'java.com',
    'oracle.com',
    'aws.amazon.com',
    'cloud.google.com',
    'azure.microsoft.com'
  ];
  
  // Extract domain from URL if available
  let domain = '';
  if (researchItem.url) {
    try {
      domain = new URL(researchItem.url).hostname;
    } catch (error) {
      // Invalid URL, try to extract domain from string
      const match = researchItem.url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im);
      domain = match ? match[1] : '';
    }
  }
  
  // Check if domain is in authoritative domains list
  if (domain && authoritativeDomains.some(d => domain.includes(d))) {
    return 0.9;
  }
  
  // Check for academic or educational domains
  if (domain && (domain.endsWith('.edu') || domain.endsWith('.gov'))) {
    return 0.85;
  }
  
  // Default score based on metadata
  return researchItem.metadata?.authoritative || 0.5;
}

/**
 * Calculate recency score
 * @param {Object} researchItem - Research item to score
 * @param {number} maxAgeDays - Maximum age in days for full score
 * @returns {number} Recency score (0-1)
 */
function calculateRecencyScore(researchItem, maxAgeDays = 365) {
  // Try to get publication date from metadata
  let publicationDate = null;
  
  if (researchItem.metadata?.publishedDate) {
    publicationDate = new Date(researchItem.metadata.publishedDate);
  } else if (researchItem.metadata?.date) {
    publicationDate = new Date(researchItem.metadata.date);
  }
  
  // If no publication date, use a default score
  if (!publicationDate || isNaN(publicationDate.getTime())) {
    return 0.5;
  }
  
  // Calculate age in days
  const now = new Date();
  const ageInDays = (now - publicationDate) / (1000 * 60 * 60 * 24);
  
  // Calculate recency score (1.0 for fresh content, decreasing with age)
  return Math.max(0, 1 - (ageInDays / maxAgeDays));
}

/**
 * Calculate reputation score
 * @param {Object} researchItem - Research item to score
 * @returns {number} Reputation score (0-1)
 */
function calculateReputationScore(researchItem) {
  // Implementation depends on available metadata
  // For now, use a simple heuristic based on source domain
  const highReputationDomains = [
    'github.com',
    'stackoverflow.com',
    'developer.mozilla.org',
    'docs.microsoft.com',
    'reactjs.org',
    'angular.io',
    'vuejs.org',
    'nodejs.org',
    'python.org',
    'java.com',
    'oracle.com',
    'aws.amazon.com',
    'cloud.google.com',
    'azure.microsoft.com'
  ];
  
  // Extract domain from URL if available
  let domain = '';
  if (researchItem.url) {
    try {
      domain = new URL(researchItem.url).hostname;
    } catch (error) {
      // Invalid URL, try to extract domain from string
      const match = researchItem.url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im);
      domain = match ? match[1] : '';
    }
  }
  
  // Check if domain is in high reputation domains list
  if (domain && highReputationDomains.some(d => domain.includes(d))) {
    return 0.9;
  }
  
  // Check for academic or educational domains
  if (domain && (domain.endsWith('.edu') || domain.endsWith('.gov'))) {
    return 0.85;
  }
  
  // Default score based on metadata
  return researchItem.metadata?.reputation || 0.5;
}

/**
 * Calculate query match score
 * @param {Object} researchItem - Research item to score
 * @returns {number} Query match score (0-1)
 */
function calculateQueryMatchScore(researchItem) {
  // Implementation depends on available metadata
  // For now, use a simple heuristic based on metadata
  return researchItem.metadata?.relevance || 0.7;
}

/**
 * Calculate specificity score
 * @param {Object} researchItem - Research item to score
 * @returns {number} Specificity score (0-1)
 */
function calculateSpecificityScore(researchItem) {
  // Implementation depends on available metadata
  // For now, use a simple heuristic based on content length and structure
  
  // Get content
  const content = researchItem.content || '';
  
  // Check for code blocks (indicates specific technical content)
  const hasCodeBlocks = content.includes('```') || content.includes('    ') || content.includes('<code>');
  
  // Check for specific numbers or measurements
  const hasNumbers = /\d+(\.\d+)?(%|px|em|rem|s|ms|kg|mb|gb|tb)?/i.test(content);
  
  // Check for lists (indicates structured content)
  const hasLists = content.includes('- ') || content.includes('* ') || content.includes('1. ');
  
  // Calculate specificity score
  let score = 0.5; // Default score
  
  if (hasCodeBlocks) score += 0.2;
  if (hasNumbers) score += 0.15;
  if (hasLists) score += 0.15;
  
  // Cap score at 1.0
  return Math.min(1.0, score);
}

/**
 * Calculate comprehensiveness score
 * @param {Object} researchItem - Research item to score
 * @returns {number} Comprehensiveness score (0-1)
 */
function calculateComprehensivenessScore(researchItem) {
  // Implementation depends on available metadata
  // For now, use a simple heuristic based on content length and structure
  
  // Get content
  const content = researchItem.content || '';
  
  // Calculate comprehensiveness based on content length
  const contentLength = content.length;
  
  // Check for section headings (indicates structured content)
  const hasSections = /#{2,}\s+\w+|<h[2-6]>/.test(content);
  
  // Check for links to additional resources
  const hasLinks = content.includes('http') || content.includes('www.');
  
  // Calculate comprehensiveness score
  let score = 0;
  
  // Score based on content length
  if (contentLength > 5000) {
    score = 0.9;
  } else if (contentLength > 2000) {
    score = 0.7;
  } else if (contentLength > 1000) {
    score = 0.5;
  } else if (contentLength > 500) {
    score = 0.3;
  } else {
    score = 0.1;
  }
  
  // Adjust score based on structure
  if (hasSections) score += 0.1;
  if (hasLinks) score += 0.1;
  
  // Cap score at 1.0
  return Math.min(1.0, score);
}

/**
 * Calculate cross-reference consistency score
 * @param {Object} researchItem - Research item to score
 * @param {Array} otherItems - Other research items for cross-reference
 * @returns {number} Cross-reference consistency score (0-1)
 */
function calculateCrossReferenceScore(researchItem, otherItems) {
  // If no other items, return default score
  if (!otherItems || otherItems.length === 0) {
    return 0.7; // Default score when no cross-reference is possible
  }
  
  // Implementation depends on available metadata and content analysis
  // For now, use a simple heuristic based on content similarity
  
  // Get content
  const content = researchItem.content || '';
  
  // Calculate similarity with other items
  let totalSimilarity = 0;
  let itemCount = 0;
  
  for (const otherItem of otherItems) {
    // Skip self
    if (otherItem.id === researchItem.id) {
      continue;
    }
    
    // Get other item content
    const otherContent = otherItem.content || '';
    
    // Skip empty content
    if (!otherContent) {
      continue;
    }
    
    // Calculate simple similarity score
    const similarity = calculateTextSimilarity(content, otherContent);
    
    totalSimilarity += similarity;
    itemCount++;
  }
  
  // Calculate average similarity
  const averageSimilarity = itemCount > 0 ? totalSimilarity / itemCount : 0.7;
  
  return averageSimilarity;
}

/**
 * Calculate internal consistency score
 * @param {Object} researchItem - Research item to score
 * @returns {number} Internal consistency score (0-1)
 */
function calculateInternalConsistencyScore(researchItem) {
  // Implementation depends on content analysis
  // For now, use a simple heuristic based on content structure
  
  // Get content
  const content = researchItem.content || '';
  
  // Check for contradictions (simple heuristic)
  const hasContradictions = /however|but|although|contrary|opposite|conflict|disagree|dispute/i.test(content);
  
  // Check for consistent formatting
  const hasConsistentFormatting = !/#{1,6}\s+\w+.*?#{1,6}\s+\w+/s.test(content);
  
  // Calculate internal consistency score
  let score = 0.7; // Default score
  
  if (hasContradictions) score -= 0.2;
  if (hasConsistentFormatting) score += 0.2;
  
  // Cap score between 0 and 1
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate logical soundness score
 * @param {Object} researchItem - Research item to score
 * @returns {number} Logical soundness score (0-1)
 */
function calculateLogicalSoundnessScore(researchItem) {
  // Implementation depends on content analysis
  // For now, use a simple heuristic based on content structure
  
  // Get content
  const content = researchItem.content || '';
  
  // Check for logical connectors (indicates logical flow)
  const hasLogicalConnectors = /therefore|thus|hence|consequently|because|since|as a result|due to|leads to/i.test(content);
  
  // Check for examples (indicates supporting evidence)
  const hasExamples = /for example|for instance|such as|e\.g\.|i\.e\.|to illustrate/i.test(content);
  
  // Check for citations or references
  const hasCitations = /\[\d+\]|\(\d{4}\)|et al\./i.test(content);
  
  // Calculate logical soundness score
  let score = 0.5; // Default score
  
  if (hasLogicalConnectors) score += 0.2;
  if (hasExamples) score += 0.2;
  if (hasCitations) score += 0.2;
  
  // Cap score at 1.0
  return Math.min(1.0, score);
}

/**
 * Calculate text similarity between two strings
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score (0-1)
 */
function calculateTextSimilarity(text1, text2) {
  // Simple implementation using Jaccard similarity of words
  if (!text1 || !text2) {
    return 0;
  }
  
  // Tokenize texts into words
  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 0));
  const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 0));
  
  // Calculate intersection and union
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  // Calculate Jaccard similarity
  return intersection.size / union.size;
}
