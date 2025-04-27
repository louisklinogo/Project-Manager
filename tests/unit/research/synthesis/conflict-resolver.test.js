/**
 * Tests for conflict resolver
 */

import { ConflictResolver } from '../../../../src/research/synthesis/conflict-resolver.js';
import { PriorityRanker } from '../../../../src/research/synthesis/priority-ranker.js';
import { jest } from '@jest/globals';

describe('ConflictResolver', () => {
  // Sample research items with conflicts
  const item1 = {
    id: 'item-1',
    title: 'JavaScript Version History',
    content: 'JavaScript ES6 was released in 2015. It introduced many new features like arrow functions and let/const declarations.',
    url: 'https://example.com/js-history',
    metadata: {
      publishedDate: new Date().toISOString(),
      confidence: 0.9
    }
  };
  
  const item2 = {
    id: 'item-2',
    title: 'ECMAScript 6 Release',
    content: 'ECMAScript 6 (ES6) was released in 2016. It was a major update to JavaScript.',
    url: 'https://example.com/es6-release',
    metadata: {
      publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days old
      confidence: 0.7
    }
  };
  
  const item3 = {
    id: 'item-3',
    title: 'JavaScript Performance',
    content: 'JavaScript performance improved by 30% in recent browsers.',
    url: 'https://example.com/js-performance',
    metadata: {
      publishedDate: new Date().toISOString(),
      confidence: 0.8
    }
  };
  
  const item4 = {
    id: 'item-4',
    title: 'Browser JavaScript Performance',
    content: 'JavaScript performance improved by 50% in recent browsers.',
    url: 'https://example.com/browser-performance',
    metadata: {
      publishedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days old
      confidence: 0.6
    }
  };
  
  const researchItems = [item1, item2, item3, item4];
  
  test('should create a conflict resolver with default options', () => {
    const resolver = new ConflictResolver();
    
    expect(resolver).toBeInstanceOf(ConflictResolver);
    expect(resolver.ranker).toBeInstanceOf(PriorityRanker);
    expect(resolver.confidenceThreshold).toBe(0.7);
  });
  
  test('should create a conflict resolver with custom options', () => {
    const ranker = new PriorityRanker();
    const resolver = new ConflictResolver({
      ranker,
      confidenceThreshold: 0.8
    });
    
    expect(resolver).toBeInstanceOf(ConflictResolver);
    expect(resolver.ranker).toBe(ranker);
    expect(resolver.confidenceThreshold).toBe(0.8);
  });
  
  test('detectConflicts should identify conflicts between items', () => {
    const resolver = new ConflictResolver();
    
    const conflicts = resolver.detectConflicts(researchItems);
    
    expect(Array.isArray(conflicts)).toBe(true);
    expect(conflicts.length).toBeGreaterThan(0);
    
    // Should detect conflict between item1 and item2 (ES6 release date)
    const es6Conflict = conflicts.find(conflict => 
      conflict.items.some(item => item.id === item1.id) && 
      conflict.items.some(item => item.id === item2.id)
    );
    
    expect(es6Conflict).toBeDefined();
    
    // Should detect conflict between item3 and item4 (performance improvement percentage)
    const performanceConflict = conflicts.find(conflict => 
      conflict.items.some(item => item.id === item3.id) && 
      conflict.items.some(item => item.id === item4.id)
    );
    
    expect(performanceConflict).toBeDefined();
  });
  
  test('groupItemsByTopic should group related items', () => {
    const resolver = new ConflictResolver();
    
    const groups = resolver.groupItemsByTopic(researchItems);
    
    expect(groups).toBeInstanceOf(Map);
    expect(groups.size).toBeGreaterThan(0);
    
    // Should group ES6-related items together
    const jsGroup = Array.from(groups.entries()).find(([topic]) => 
      topic.toLowerCase().includes('javascript')
    );
    
    expect(jsGroup).toBeDefined();
    expect(jsGroup[1].length).toBeGreaterThan(1);
    
    // Should group performance-related items together
    const performanceGroup = Array.from(groups.entries()).find(([topic]) => 
      topic.toLowerCase().includes('performance')
    );
    
    expect(performanceGroup).toBeDefined();
    expect(performanceGroup[1].length).toBeGreaterThan(1);
  });
  
  test('extractTopics should extract topics from an item', () => {
    const resolver = new ConflictResolver();
    
    const topics1 = resolver.extractTopics(item1);
    
    expect(Array.isArray(topics1)).toBe(true);
    expect(topics1.length).toBeGreaterThan(0);
    expect(topics1.some(topic => topic.includes('javascript'))).toBe(true);
    
    const topics2 = resolver.extractTopics(item3);
    
    expect(Array.isArray(topics2)).toBe(true);
    expect(topics2.length).toBeGreaterThan(0);
    expect(topics2.some(topic => topic.includes('performance'))).toBe(true);
  });
  
  test('detectConflictBetweenItems should identify specific conflicts', () => {
    const resolver = new ConflictResolver();
    
    // Test with items that have a conflict
    const conflict1 = resolver.detectConflictBetweenItems(item3, item4);
    
    expect(conflict1).not.toBeNull();
    expect(conflict1).toHaveProperty('key');
    expect(conflict1).toHaveProperty('value1');
    expect(conflict1).toHaveProperty('value2');
    expect(conflict1).toHaveProperty('severity');
    
    // Test with items that don't have a conflict
    const conflict2 = resolver.detectConflictBetweenItems(item1, item3);
    
    expect(conflict2).toBeNull();
  });
  
  test('resolveConflicts should resolve detected conflicts', () => {
    const resolver = new ConflictResolver();
    
    const conflicts = resolver.detectConflicts(researchItems);
    const resolutionResults = resolver.resolveConflicts(conflicts);
    
    expect(resolutionResults).toHaveProperty('resolvedConflicts');
    expect(resolutionResults).toHaveProperty('unresolvedConflicts');
    
    expect(Array.isArray(resolutionResults.resolvedConflicts)).toBe(true);
    expect(Array.isArray(resolutionResults.unresolvedConflicts)).toBe(true);
    
    // Should resolve at least some conflicts
    expect(resolutionResults.resolvedConflicts.length).toBeGreaterThan(0);
    
    // Each resolved conflict should have required properties
    resolutionResults.resolvedConflicts.forEach(result => {
      expect(result).toHaveProperty('conflict');
      expect(result).toHaveProperty('resolution');
      
      expect(result.resolution).toHaveProperty('resolved');
      expect(result.resolution).toHaveProperty('method');
      expect(result.resolution).toHaveProperty('value');
      expect(result.resolution).toHaveProperty('confidence');
      
      expect(result.resolution.resolved).toBe(true);
    });
  });
  
  test('resolveConflict should resolve a single conflict', () => {
    const resolver = new ConflictResolver();
    
    // Create a sample conflict
    const conflict = {
      topic: 'performance',
      items: [item3, item4],
      conflict: {
        key: 'performance_improvement',
        value1: '30%',
        value2: '50%',
        severity: 0.4
      }
    };
    
    // Resolve with default options
    const resolution1 = resolver.resolveConflict(conflict);
    
    expect(resolution1).toHaveProperty('resolved');
    expect(resolution1).toHaveProperty('method');
    expect(resolution1).toHaveProperty('value');
    expect(resolution1).toHaveProperty('confidence');
    
    // Resolve with preference for recency
    const resolution2 = resolver.resolveConflict(conflict, { preferRecent: true });
    
    expect(resolution2).toHaveProperty('resolved');
    
    // Resolve with preference for confidence
    const resolution3 = resolver.resolveConflict(conflict, { preferConfident: true });
    
    expect(resolution3).toHaveProperty('resolved');
  });
  
  test('applyResolutions should update research items with resolutions', () => {
    const resolver = new ConflictResolver();
    
    const conflicts = resolver.detectConflicts(researchItems);
    const resolutionResults = resolver.resolveConflicts(conflicts);
    
    const updatedItems = resolver.applyResolutions(researchItems, resolutionResults);
    
    expect(Array.isArray(updatedItems)).toBe(true);
    expect(updatedItems.length).toBe(researchItems.length);
    
    // Updated items should have resolution metadata
    const hasResolutionMetadata = updatedItems.some(item => 
      item.metadata && Object.keys(item.metadata).some(key => key.startsWith('resolved_'))
    );
    
    expect(hasResolutionMetadata).toBe(true);
  });
  
  test('calculateConflictSeverity should return appropriate severity', () => {
    const resolver = new ConflictResolver();
    
    // Test with numbers
    expect(resolver.calculateConflictSeverity(10, 20)).toBe(0.5);
    expect(resolver.calculateConflictSeverity(100, 200)).toBe(0.5);
    expect(resolver.calculateConflictSeverity(10, 11)).toBe(0.1);
    expect(resolver.calculateConflictSeverity(0, 0)).toBe(0);
    
    // Test with strings
    expect(resolver.calculateConflictSeverity('hello', 'hello')).toBe(0);
    expect(resolver.calculateConflictSeverity('hello', 'Hello')).toBe(0.2);
    expect(resolver.calculateConflictSeverity('hello', 'world')).toBe(1);
    
    // Test with different types
    expect(resolver.calculateConflictSeverity('10', 10)).toBe(1);
  });
});
