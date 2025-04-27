/**
 * Tests for validation criteria
 */

import { 
  DEFAULT_VALIDATION_CRITERIA, 
  DOMAIN_VALIDATION_CRITERIA, 
  getValidationCriteria 
} from '../../../../src/research/validation/validation-criteria.js';
import { jest } from '@jest/globals';

describe('Validation Criteria', () => {
  test('DEFAULT_VALIDATION_CRITERIA should have required properties', () => {
    expect(DEFAULT_VALIDATION_CRITERIA).toHaveProperty('sourceCredibility');
    expect(DEFAULT_VALIDATION_CRITERIA).toHaveProperty('contentRelevance');
    expect(DEFAULT_VALIDATION_CRITERIA).toHaveProperty('informationConsistency');
    expect(DEFAULT_VALIDATION_CRITERIA).toHaveProperty('thresholds');
    
    expect(DEFAULT_VALIDATION_CRITERIA.sourceCredibility).toHaveProperty('weight');
    expect(DEFAULT_VALIDATION_CRITERIA.sourceCredibility).toHaveProperty('criteria');
    expect(DEFAULT_VALIDATION_CRITERIA.contentRelevance).toHaveProperty('weight');
    expect(DEFAULT_VALIDATION_CRITERIA.contentRelevance).toHaveProperty('criteria');
    expect(DEFAULT_VALIDATION_CRITERIA.informationConsistency).toHaveProperty('weight');
    expect(DEFAULT_VALIDATION_CRITERIA.informationConsistency).toHaveProperty('criteria');
    
    expect(DEFAULT_VALIDATION_CRITERIA.thresholds).toHaveProperty('minimumOverallScore');
    expect(DEFAULT_VALIDATION_CRITERIA.thresholds).toHaveProperty('minimumCategoryScore');
  });
  
  test('DOMAIN_VALIDATION_CRITERIA should have domain-specific criteria', () => {
    expect(DOMAIN_VALIDATION_CRITERIA).toHaveProperty('technology');
    expect(DOMAIN_VALIDATION_CRITERIA).toHaveProperty('business');
    expect(DOMAIN_VALIDATION_CRITERIA).toHaveProperty('academic');
    
    // Technology domain should have stricter recency criteria
    expect(DOMAIN_VALIDATION_CRITERIA.technology.sourceCredibility.criteria.recency.maxAgeDays)
      .toBeLessThan(DEFAULT_VALIDATION_CRITERIA.sourceCredibility.criteria.recency.maxAgeDays);
    
    // Business domain should value specificity more
    expect(DOMAIN_VALIDATION_CRITERIA.business.contentRelevance.criteria.specificity.weight)
      .toBeGreaterThan(DEFAULT_VALIDATION_CRITERIA.contentRelevance.criteria.specificity.weight);
    
    // Academic domain should value source credibility more
    expect(DOMAIN_VALIDATION_CRITERIA.academic.sourceCredibility.weight)
      .toBeGreaterThan(DEFAULT_VALIDATION_CRITERIA.sourceCredibility.weight);
  });
  
  test('getValidationCriteria should return default criteria for invalid domain', () => {
    expect(getValidationCriteria()).toEqual(DEFAULT_VALIDATION_CRITERIA);
    expect(getValidationCriteria(null)).toEqual(DEFAULT_VALIDATION_CRITERIA);
    expect(getValidationCriteria(undefined)).toEqual(DEFAULT_VALIDATION_CRITERIA);
    expect(getValidationCriteria(123)).toEqual(DEFAULT_VALIDATION_CRITERIA);
    expect(getValidationCriteria('invalid-domain')).toEqual(DEFAULT_VALIDATION_CRITERIA);
  });
  
  test('getValidationCriteria should return domain-specific criteria for valid domain', () => {
    expect(getValidationCriteria('technology')).toEqual(DOMAIN_VALIDATION_CRITERIA.technology);
    expect(getValidationCriteria('business')).toEqual(DOMAIN_VALIDATION_CRITERIA.business);
    expect(getValidationCriteria('academic')).toEqual(DOMAIN_VALIDATION_CRITERIA.academic);
    
    // Should be case-insensitive
    expect(getValidationCriteria('Technology')).toEqual(DOMAIN_VALIDATION_CRITERIA.technology);
    expect(getValidationCriteria('BUSINESS')).toEqual(DOMAIN_VALIDATION_CRITERIA.business);
    expect(getValidationCriteria('Academic')).toEqual(DOMAIN_VALIDATION_CRITERIA.academic);
    
    // Should trim whitespace
    expect(getValidationCriteria(' technology ')).toEqual(DOMAIN_VALIDATION_CRITERIA.technology);
  });
});
