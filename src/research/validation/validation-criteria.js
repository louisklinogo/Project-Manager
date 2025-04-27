/**
 * Validation criteria for research materials
 * 
 * This module defines the criteria used to validate research materials.
 */

/**
 * Default validation criteria
 */
export const DEFAULT_VALIDATION_CRITERIA = {
  // Source credibility factors
  sourceCredibility: {
    // Weight for source credibility in overall score (0-1)
    weight: 0.3,
    // Criteria for evaluating source credibility
    criteria: {
      // Is the source authoritative in the domain?
      authoritative: {
        weight: 0.4,
        threshold: 0.7
      },
      // Is the source recent/up-to-date?
      recency: {
        weight: 0.3,
        threshold: 0.6,
        // Maximum age in days for a source to be considered fully recent
        maxAgeDays: 365
      },
      // Is the source reputable?
      reputation: {
        weight: 0.3,
        threshold: 0.6
      }
    }
  },
  
  // Content relevance factors
  contentRelevance: {
    // Weight for content relevance in overall score (0-1)
    weight: 0.4,
    // Criteria for evaluating content relevance
    criteria: {
      // How closely does the content match the query?
      queryMatch: {
        weight: 0.4,
        threshold: 0.6
      },
      // Does the content provide specific details?
      specificity: {
        weight: 0.3,
        threshold: 0.5
      },
      // Is the content comprehensive?
      comprehensiveness: {
        weight: 0.3,
        threshold: 0.5
      }
    }
  },
  
  // Information consistency factors
  informationConsistency: {
    // Weight for information consistency in overall score (0-1)
    weight: 0.3,
    // Criteria for evaluating information consistency
    criteria: {
      // Is the information consistent with other sources?
      crossReferenceConsistency: {
        weight: 0.5,
        threshold: 0.6
      },
      // Is the information internally consistent?
      internalConsistency: {
        weight: 0.3,
        threshold: 0.7
      },
      // Is the information logically sound?
      logicalSoundness: {
        weight: 0.2,
        threshold: 0.6
      }
    }
  },
  
  // Overall validation thresholds
  thresholds: {
    // Minimum overall score for a research item to be considered valid
    minimumOverallScore: 0.7,
    // Minimum score for each major category (source, content, consistency)
    minimumCategoryScore: 0.6
  }
};

/**
 * Domain-specific validation criteria
 */
export const DOMAIN_VALIDATION_CRITERIA = {
  // Technology domain criteria
  technology: {
    ...DEFAULT_VALIDATION_CRITERIA,
    sourceCredibility: {
      ...DEFAULT_VALIDATION_CRITERIA.sourceCredibility,
      criteria: {
        ...DEFAULT_VALIDATION_CRITERIA.sourceCredibility.criteria,
        // Technology information becomes outdated more quickly
        recency: {
          weight: 0.5,
          threshold: 0.7,
          maxAgeDays: 180
        }
      }
    }
  },
  
  // Business domain criteria
  business: {
    ...DEFAULT_VALIDATION_CRITERIA,
    contentRelevance: {
      ...DEFAULT_VALIDATION_CRITERIA.contentRelevance,
      // Business domain values specificity more
      criteria: {
        ...DEFAULT_VALIDATION_CRITERIA.contentRelevance.criteria,
        specificity: {
          weight: 0.5,
          threshold: 0.7
        }
      }
    }
  },
  
  // Academic domain criteria
  academic: {
    ...DEFAULT_VALIDATION_CRITERIA,
    sourceCredibility: {
      ...DEFAULT_VALIDATION_CRITERIA.sourceCredibility,
      // Academic domain values source credibility more
      weight: 0.5,
      criteria: {
        ...DEFAULT_VALIDATION_CRITERIA.sourceCredibility.criteria,
        authoritative: {
          weight: 0.6,
          threshold: 0.8
        }
      }
    },
    // Adjust weights of other categories
    contentRelevance: {
      ...DEFAULT_VALIDATION_CRITERIA.contentRelevance,
      weight: 0.3
    },
    informationConsistency: {
      ...DEFAULT_VALIDATION_CRITERIA.informationConsistency,
      weight: 0.2
    }
  }
};

/**
 * Get validation criteria for a specific domain
 * @param {string} domain - Domain name (technology, business, academic, etc.)
 * @returns {Object} Validation criteria for the domain
 */
export function getValidationCriteria(domain) {
  if (!domain || typeof domain !== 'string') {
    return DEFAULT_VALIDATION_CRITERIA;
  }
  
  const normalizedDomain = domain.toLowerCase().trim();
  
  if (DOMAIN_VALIDATION_CRITERIA[normalizedDomain]) {
    return DOMAIN_VALIDATION_CRITERIA[normalizedDomain];
  }
  
  return DEFAULT_VALIDATION_CRITERIA;
}
