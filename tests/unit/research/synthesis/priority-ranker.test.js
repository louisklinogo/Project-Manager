/**
 * Tests for priority ranker
 */

import { PriorityRanker } from '../../../../src/research/synthesis/priority-ranker.js';
import { jest } from '@jest/globals';

describe('PriorityRanker', () => {
  // Sample research items for testing
  const highQualityItem = {
    id: 'high-quality',
    title: 'High Quality Research',
    content: 'This is a comprehensive guide to JavaScript best practices. \n\n## Section 1\n\nHere are some examples:\n\n```javascript\nconst example = () => {\n  return "Hello World";\n};\n```\n\nAccording to the latest research from 2023, this approach is 25% more efficient.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    metadata: {
      publishedDate: new Date().toISOString(),
      confidence: 0.9,
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
      confidence: 0.6,
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
      confidence: 0.3,
      relevance: 0.4
    }
  };
  
  const researchItems = [highQualityItem, mediumQualityItem, lowQualityItem];
  
  test('should create a priority ranker with default weights', () => {
    const ranker = new PriorityRanker();
    
    expect(ranker).toBeInstanceOf(PriorityRanker);
    expect(ranker.weights).toHaveProperty('confidence');
    expect(ranker.weights).toHaveProperty('relevance');
    expect(ranker.weights).toHaveProperty('recency');
    expect(ranker.weights).toHaveProperty('specificity');
  });
  
  test('should create a priority ranker with custom weights', () => {
    const customWeights = {
      confidence: 0.5,
      relevance: 0.3,
      recency: 0.1,
      specificity: 0.1
    };
    
    const ranker = new PriorityRanker({ weights: customWeights });
    
    expect(ranker).toBeInstanceOf(PriorityRanker);
    expect(ranker.weights.confidence).toBe(customWeights.confidence);
    expect(ranker.weights.relevance).toBe(customWeights.relevance);
    expect(ranker.weights.recency).toBe(customWeights.recency);
    expect(ranker.weights.specificity).toBe(customWeights.specificity);
  });
  
  test('rankItems should return ranked items with scores', () => {
    const ranker = new PriorityRanker();
    
    const rankedItems = ranker.rankItems(researchItems);
    
    expect(Array.isArray(rankedItems)).toBe(true);
    expect(rankedItems.length).toBe(researchItems.length);
    
    // Items should be in descending order of weighted score
    for (let i = 1; i < rankedItems.length; i++) {
      expect(rankedItems[i - 1].weightedScore).toBeGreaterThanOrEqual(rankedItems[i].weightedScore);
    }
    
    // Each item should have required properties
    rankedItems.forEach(item => {
      expect(item).toHaveProperty('item');
      expect(item).toHaveProperty('scores');
      expect(item).toHaveProperty('weightedScore');
      
      expect(item.scores).toHaveProperty('confidence');
      expect(item.scores).toHaveProperty('relevance');
      expect(item.scores).toHaveProperty('recency');
      expect(item.scores).toHaveProperty('specificity');
      
      expect(typeof item.weightedScore).toBe('number');
      expect(item.weightedScore).toBeGreaterThanOrEqual(0);
      expect(item.weightedScore).toBeLessThanOrEqual(1);
    });
    
    // High quality item should be ranked first
    expect(rankedItems[0].item.id).toBe(highQualityItem.id);
    
    // Low quality item should be ranked last
    expect(rankedItems[rankedItems.length - 1].item.id).toBe(lowQualityItem.id);
  });
  
  test('rankItems should use query for relevance calculation', () => {
    const ranker = new PriorityRanker();
    
    // Rank with query that matches high quality item
    const rankedItems1 = ranker.rankItems(researchItems, { query: 'JavaScript best practices' });
    
    // Rank with query that matches medium quality item
    const rankedItems2 = ranker.rankItems(researchItems, { query: 'const var' });
    
    // Queries should affect relevance scores
    expect(rankedItems1[0].scores.relevance).not.toEqual(rankedItems2[0].scores.relevance);
  });
  
  test('calculateConfidenceScore should return appropriate confidence score', () => {
    const ranker = new PriorityRanker();
    
    // Item with confidence property
    const item1 = { confidence: 0.8 };
    expect(ranker.calculateConfidenceScore(item1)).toBe(0.8);
    
    // Item with confidence in metadata
    const item2 = { metadata: { confidence: 0.7 } };
    expect(ranker.calculateConfidenceScore(item2)).toBe(0.7);
    
    // Item with reputable URL
    const item3 = { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' };
    expect(ranker.calculateConfidenceScore(item3)).toBe(0.8);
    
    // Item with .edu URL
    const item4 = { url: 'https://cs.stanford.edu/course/cs101' };
    expect(ranker.calculateConfidenceScore(item4)).toBe(0.8);
    
    // Item with no confidence indicators
    const item5 = { url: 'https://example.com' };
    expect(ranker.calculateConfidenceScore(item5)).toBe(0.5);
  });
  
  test('calculateRecencyScore should return appropriate recency score', () => {
    const ranker = new PriorityRanker();
    
    // Recent item
    const recentDate = new Date().toISOString();
    const item1 = { metadata: { publishedDate: recentDate } };
    expect(ranker.calculateRecencyScore(item1)).toBeGreaterThanOrEqual(0.9);
    
    // One year old item
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const item2 = { metadata: { publishedDate: oneYearAgo } };
    expect(ranker.calculateRecencyScore(item2)).toBeCloseTo(0.5, 1);
    
    // Three year old item
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString();
    const item3 = { metadata: { publishedDate: threeYearsAgo } };
    expect(ranker.calculateRecencyScore(item3)).toBeLessThanOrEqual(0.2);
    
    // Item with no date
    const item4 = {};
    expect(ranker.calculateRecencyScore(item4)).toBe(0.5);
  });
  
  test('calculateSpecificityScore should return appropriate specificity score', () => {
    const ranker = new PriorityRanker();
    
    // Item with code blocks, numbers, and lists
    const item1 = {
      content: '```javascript\nconst x = 42;\n```\n\n- Item 1\n- Item 2\n\nThe value is 99%.'
    };
    expect(ranker.calculateSpecificityScore(item1)).toBeGreaterThanOrEqual(0.8);
    
    // Item with just text
    const item2 = {
      content: 'This is a simple text with no special formatting or specific details.'
    };
    expect(ranker.calculateSpecificityScore(item2)).toBe(0.5);
    
    // Item with specificity in metadata
    const item3 = { metadata: { specificity: 0.7 } };
    expect(ranker.calculateSpecificityScore(item3)).toBe(0.7);
  });
  
  test('getTopItems should return top N items', () => {
    const ranker = new PriorityRanker();
    
    // Get top 2 items
    const topItems = ranker.getTopItems(researchItems, 2);
    
    expect(Array.isArray(topItems)).toBe(true);
    expect(topItems.length).toBe(2);
    
    // Should include high and medium quality items
    expect(topItems.some(item => item.id === highQualityItem.id)).toBe(true);
    expect(topItems.some(item => item.id === mediumQualityItem.id)).toBe(true);
    
    // Should not include low quality item
    expect(topItems.some(item => item.id === lowQualityItem.id)).toBe(false);
  });
  
  test('filterByMinScore should filter items by minimum score', () => {
    const ranker = new PriorityRanker();
    
    // Filter with high threshold
    const highThresholdItems = ranker.filterByMinScore(researchItems, 0.8);
    
    // Should only include high quality item
    expect(highThresholdItems.length).toBe(1);
    expect(highThresholdItems[0].id).toBe(highQualityItem.id);
    
    // Filter with low threshold
    const lowThresholdItems = ranker.filterByMinScore(researchItems, 0.5);
    
    // Should include high and medium quality items
    expect(lowThresholdItems.length).toBe(2);
    expect(lowThresholdItems.some(item => item.id === highQualityItem.id)).toBe(true);
    expect(lowThresholdItems.some(item => item.id === mediumQualityItem.id)).toBe(true);
  });
});
