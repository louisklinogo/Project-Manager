/**
 * Tests for confidence scorer
 */

import { calculateConfidenceScore } from '../../../../src/research/validation/confidence-scorer.js';
import { DEFAULT_VALIDATION_CRITERIA } from '../../../../src/research/validation/validation-criteria.js';
import { jest } from '@jest/globals';

describe('Confidence Scorer', () => {
  // Sample research items for testing
  const highQualityItem = {
    id: 'high-quality',
    title: 'High Quality Research',
    content: 'This is a comprehensive guide to JavaScript best practices. \n\n## Section 1\n\nHere are some examples:\n\n```javascript\nconst example = () => {\n  return "Hello World";\n};\n```\n\nAccording to the latest research from 2023, this approach is 25% more efficient.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    metadata: {
      publishedDate: new Date().toISOString(),
      authoritative: 0.9,
      relevance: 0.95
    }
  };
  
  const mediumQualityItem = {
    id: 'medium-quality',
    title: 'Medium Quality Research',
    content: 'JavaScript best practices guide. Use const instead of var. Functions should be small.',
    url: 'https://example.com/js-guide',
    metadata: {
      publishedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year old
      authoritative: 0.6,
      relevance: 0.7
    }
  };
  
  const lowQualityItem = {
    id: 'low-quality',
    title: 'Low Quality Research',
    content: 'JS tips.',
    url: 'https://random-blog.com/js-tips',
    metadata: {
      publishedDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 3 years old
      authoritative: 0.3,
      relevance: 0.4
    }
  };
  
  test('calculateConfidenceScore should return a valid score object', () => {
    const score = calculateConfidenceScore(highQualityItem);
    
    expect(score).toHaveProperty('overall');
    expect(score).toHaveProperty('sourceCredibility');
    expect(score).toHaveProperty('contentRelevance');
    expect(score).toHaveProperty('informationConsistency');
    expect(score).toHaveProperty('passesValidation');
    
    expect(score.sourceCredibility).toHaveProperty('overall');
    expect(score.sourceCredibility).toHaveProperty('scores');
    expect(score.contentRelevance).toHaveProperty('overall');
    expect(score.contentRelevance).toHaveProperty('scores');
    expect(score.informationConsistency).toHaveProperty('overall');
    expect(score.informationConsistency).toHaveProperty('scores');
    
    expect(typeof score.overall).toBe('number');
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(1);
    expect(typeof score.passesValidation).toBe('boolean');
  });
  
  test('high quality item should have high confidence score', () => {
    const score = calculateConfidenceScore(highQualityItem);
    
    expect(score.overall).toBeGreaterThanOrEqual(0.7);
    expect(score.passesValidation).toBe(true);
    
    // Source credibility should be high
    expect(score.sourceCredibility.overall).toBeGreaterThanOrEqual(0.7);
    
    // Content relevance should be high
    expect(score.contentRelevance.overall).toBeGreaterThanOrEqual(0.7);
  });
  
  test('medium quality item should have medium confidence score', () => {
    const score = calculateConfidenceScore(mediumQualityItem);
    
    expect(score.overall).toBeGreaterThanOrEqual(0.5);
    expect(score.overall).toBeLessThanOrEqual(0.8);
  });
  
  test('low quality item should have low confidence score', () => {
    const score = calculateConfidenceScore(lowQualityItem);
    
    expect(score.overall).toBeLessThanOrEqual(0.6);
    expect(score.passesValidation).toBe(false);
  });
  
  test('cross-reference should affect consistency score', () => {
    // Score without cross-reference
    const scoreWithoutCrossRef = calculateConfidenceScore(highQualityItem);
    
    // Score with cross-reference
    const scoreWithCrossRef = calculateConfidenceScore(highQualityItem, {
      otherItems: [mediumQualityItem, lowQualityItem]
    });
    
    // Scores should be different
    expect(scoreWithCrossRef.informationConsistency.overall)
      .not.toEqual(scoreWithoutCrossRef.informationConsistency.overall);
  });
  
  test('custom criteria should affect scoring', () => {
    // Default criteria
    const scoreWithDefaultCriteria = calculateConfidenceScore(highQualityItem);
    
    // Custom criteria with higher thresholds
    const customCriteria = {
      ...DEFAULT_VALIDATION_CRITERIA,
      thresholds: {
        minimumOverallScore: 0.9,
        minimumCategoryScore: 0.8
      }
    };
    
    const scoreWithCustomCriteria = calculateConfidenceScore(highQualityItem, {
      criteria: customCriteria
    });
    
    // Overall score should be the same
    expect(scoreWithCustomCriteria.overall).toEqual(scoreWithDefaultCriteria.overall);
    
    // But validation result should be different due to higher thresholds
    expect(scoreWithCustomCriteria.passesValidation).not.toEqual(scoreWithDefaultCriteria.passesValidation);
  });
  
  test('domain-specific criteria should affect scoring', () => {
    // Default criteria
    const scoreWithDefaultCriteria = calculateConfidenceScore(mediumQualityItem);
    
    // Technology domain (stricter recency)
    const scoreWithTechDomain = calculateConfidenceScore(mediumQualityItem, {
      domain: 'technology'
    });
    
    // Academic domain (values source credibility more)
    const scoreWithAcademicDomain = calculateConfidenceScore(mediumQualityItem, {
      domain: 'academic'
    });
    
    // Scores should be different
    expect(scoreWithTechDomain.overall).not.toEqual(scoreWithDefaultCriteria.overall);
    expect(scoreWithAcademicDomain.overall).not.toEqual(scoreWithDefaultCriteria.overall);
  });
});
