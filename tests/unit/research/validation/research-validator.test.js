/**
 * Tests for research validator
 */

import { ResearchValidator } from '../../../../src/research/validation/research-validator.js';
import { jest } from '@jest/globals';

describe('Research Validator', () => {
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
  
  const researchItems = [highQualityItem, mediumQualityItem, lowQualityItem];
  
  test('ResearchValidator should be instantiable with default options', () => {
    const validator = new ResearchValidator();
    expect(validator).toBeInstanceOf(ResearchValidator);
    expect(validator.domain).toBeUndefined();
    expect(validator.criteria).toBeDefined();
    expect(validator.strictMode).toBe(false);
  });
  
  test('ResearchValidator should be instantiable with custom options', () => {
    const validator = new ResearchValidator({
      domain: 'technology',
      strictMode: true
    });
    
    expect(validator).toBeInstanceOf(ResearchValidator);
    expect(validator.domain).toBe('technology');
    expect(validator.criteria).toBeDefined();
    expect(validator.strictMode).toBe(true);
  });
  
  test('validateItem should return a valid result object', () => {
    const validator = new ResearchValidator();
    const result = validator.validateItem(highQualityItem);
    
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('confidenceScore');
    expect(result).toHaveProperty('item');
    expect(result).toHaveProperty('validatedAt');
    
    expect(typeof result.isValid).toBe('boolean');
    expect(result.confidenceScore).toHaveProperty('overall');
    expect(result.item).toEqual(highQualityItem);
    expect(new Date(result.validatedAt)).toBeInstanceOf(Date);
  });
  
  test('validateItems should return valid statistics', () => {
    const validator = new ResearchValidator();
    const results = validator.validateItems(researchItems);
    
    expect(results).toHaveProperty('validItems');
    expect(results).toHaveProperty('invalidItems');
    expect(results).toHaveProperty('stats');
    
    expect(Array.isArray(results.validItems)).toBe(true);
    expect(Array.isArray(results.invalidItems)).toBe(true);
    
    expect(results.stats).toHaveProperty('total');
    expect(results.stats).toHaveProperty('valid');
    expect(results.stats).toHaveProperty('invalid');
    expect(results.stats).toHaveProperty('averageConfidence');
    
    expect(results.stats.total).toBe(researchItems.length);
    expect(results.stats.valid + results.stats.invalid).toBe(results.stats.total);
    expect(results.stats.averageConfidence).toBeGreaterThanOrEqual(0);
    expect(results.stats.averageConfidence).toBeLessThanOrEqual(1);
  });
  
  test('strictMode should affect validation results', () => {
    // Default mode (non-strict)
    const defaultValidator = new ResearchValidator();
    const defaultResults = defaultValidator.validateItems(researchItems);
    
    // Strict mode
    const strictValidator = new ResearchValidator({ strictMode: true });
    const strictResults = strictValidator.validateItems(researchItems);
    
    // Strict mode should have fewer valid items
    expect(strictResults.stats.valid).toBeLessThanOrEqual(defaultResults.stats.valid);
  });
  
  test('filterByConfidence should return filtered items', () => {
    const validator = new ResearchValidator();
    
    // Default threshold (0.7)
    const defaultFiltered = validator.filterByConfidence(researchItems);
    
    // Lower threshold (0.5)
    const lowerFiltered = validator.filterByConfidence(researchItems, 0.5);
    
    // Higher threshold (0.9)
    const higherFiltered = validator.filterByConfidence(researchItems, 0.9);
    
    // Lower threshold should return more items
    expect(lowerFiltered.length).toBeGreaterThanOrEqual(defaultFiltered.length);
    
    // Higher threshold should return fewer items
    expect(higherFiltered.length).toBeLessThanOrEqual(defaultFiltered.length);
  });
  
  test('rankByConfidence should return ranked items', () => {
    const validator = new ResearchValidator();
    const ranked = validator.rankByConfidence(researchItems);
    
    expect(Array.isArray(ranked)).toBe(true);
    expect(ranked.length).toBe(researchItems.length);
    
    // Items should be in descending order of confidence
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].confidence).toBeGreaterThanOrEqual(ranked[i].confidence);
    }
    
    // Each item should have required properties
    ranked.forEach(item => {
      expect(item).toHaveProperty('item');
      expect(item).toHaveProperty('confidence');
      expect(item).toHaveProperty('isValid');
      
      expect(typeof item.confidence).toBe('number');
      expect(typeof item.isValid).toBe('boolean');
    });
  });
  
  test('getValidationIssues should return issues for low quality items', () => {
    const validator = new ResearchValidator();
    
    // High quality item should have few or no issues
    const highQualityIssues = validator.getValidationIssues(highQualityItem);
    
    // Low quality item should have multiple issues
    const lowQualityIssues = validator.getValidationIssues(lowQualityItem);
    
    expect(lowQualityIssues.length).toBeGreaterThan(highQualityIssues.length);
    
    // Each issue should have required properties
    lowQualityIssues.forEach(issue => {
      expect(issue).toHaveProperty('category');
      expect(issue).toHaveProperty('message');
      expect(issue).toHaveProperty('score');
      expect(issue).toHaveProperty('threshold');
      
      expect(typeof issue.category).toBe('string');
      expect(typeof issue.message).toBe('string');
      expect(typeof issue.score).toBe('number');
      expect(typeof issue.threshold).toBe('number');
    });
  });
  
  test('suggestImprovements should return suggestions for low quality items', () => {
    const validator = new ResearchValidator();
    
    // Low quality item should have multiple suggestions
    const suggestions = validator.suggestImprovements(lowQualityItem);
    
    expect(suggestions.length).toBeGreaterThan(0);
    
    // Each suggestion should have required properties
    suggestions.forEach(suggestion => {
      expect(suggestion).toHaveProperty('issue');
      expect(suggestion).toHaveProperty('suggestion');
      
      expect(typeof suggestion.suggestion).toBe('string');
      expect(suggestion.issue).toHaveProperty('category');
    });
  });
});
