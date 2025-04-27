/**
 * Tests for research synthesizer
 */

import { ResearchSynthesizer } from '../../../../src/research/synthesis/research-synthesizer.js';
import { PriorityRanker } from '../../../../src/research/synthesis/priority-ranker.js';
import { ConflictResolver } from '../../../../src/research/synthesis/conflict-resolver.js';
import { jest } from '@jest/globals';

// Mock the getBestAvailableProvider function
jest.mock('../../../../src/providers/index.js', () => ({
  getBestAvailableProvider: jest.fn().mockResolvedValue({
    name: 'mock',
    generateChatCompletion: jest.fn().mockResolvedValue({
      message: {
        summary: 'This is a synthesized summary of the research.',
        keyFindings: [
          'Key finding 1',
          'Key finding 2',
          'Key finding 3'
        ]
      }
    })
  })
}));

describe('ResearchSynthesizer', () => {
  // Sample research items for testing
  const item1 = {
    id: 'item-1',
    title: 'JavaScript Best Practices',
    content: 'Use const and let instead of var. Arrow functions are preferred for better this binding. Always use strict mode.\n\n- Use descriptive variable names\n- Keep functions small and focused\n- Use modern ES6+ features',
    url: 'https://example.com/js-best-practices',
    metadata: {
      publishedDate: new Date().toISOString(),
      confidence: 0.9
    }
  };
  
  const item2 = {
    id: 'item-2',
    title: 'Modern JavaScript Development',
    content: 'Modern JavaScript development relies on tools like webpack, Babel, and ESLint. Use npm or yarn for package management.\n\n- Set up proper tooling\n- Use a consistent code style\n- Implement automated testing',
    url: 'https://example.com/modern-js',
    metadata: {
      publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days old
      confidence: 0.8
    }
  };
  
  const item3 = {
    id: 'item-3',
    title: 'JavaScript Performance Tips',
    content: 'Optimize loops by caching array length. Use requestAnimationFrame for animations. Avoid excessive DOM manipulation.\n\n- Minimize DOM operations\n- Use efficient data structures\n- Implement proper error handling',
    url: 'https://example.com/js-performance',
    metadata: {
      publishedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days old
      confidence: 0.7
    }
  };
  
  const researchItems = [item1, item2, item3];
  
  test('should create a research synthesizer with default options', () => {
    const synthesizer = new ResearchSynthesizer();
    
    expect(synthesizer).toBeInstanceOf(ResearchSynthesizer);
    expect(synthesizer.ranker).toBeInstanceOf(PriorityRanker);
    expect(synthesizer.conflictResolver).toBeInstanceOf(ConflictResolver);
    expect(synthesizer.useAI).toBe(true);
  });
  
  test('should create a research synthesizer with custom options', () => {
    const ranker = new PriorityRanker();
    const conflictResolver = new ConflictResolver();
    
    const synthesizer = new ResearchSynthesizer({
      ranker,
      conflictResolver,
      useAI: false
    });
    
    expect(synthesizer).toBeInstanceOf(ResearchSynthesizer);
    expect(synthesizer.ranker).toBe(ranker);
    expect(synthesizer.conflictResolver).toBe(conflictResolver);
    expect(synthesizer.useAI).toBe(false);
  });
  
  test('synthesizeResearch should synthesize research items using AI', async () => {
    const synthesizer = new ResearchSynthesizer();
    
    const synthesis = await synthesizer.synthesizeResearch(researchItems);
    
    expect(synthesis).toHaveProperty('summary');
    expect(synthesis).toHaveProperty('keyFindings');
    expect(synthesis).toHaveProperty('sources');
    
    expect(typeof synthesis.summary).toBe('string');
    expect(Array.isArray(synthesis.keyFindings)).toBe(true);
    expect(Array.isArray(synthesis.sources)).toBe(true);
    
    expect(synthesis.summary.length).toBeGreaterThan(0);
    expect(synthesis.keyFindings.length).toBeGreaterThan(0);
    expect(synthesis.sources.length).toBe(researchItems.length);
    
    // Sources should include all research items
    researchItems.forEach(item => {
      expect(synthesis.sources.some(source => source.id === item.id)).toBe(true);
    });
  });
  
  test('synthesizeResearch should synthesize research items using rules when AI is disabled', async () => {
    const synthesizer = new ResearchSynthesizer({ useAI: false });
    
    const synthesis = await synthesizer.synthesizeResearch(researchItems);
    
    expect(synthesis).toHaveProperty('summary');
    expect(synthesis).toHaveProperty('keyFindings');
    expect(synthesis).toHaveProperty('sources');
    
    expect(typeof synthesis.summary).toBe('string');
    expect(Array.isArray(synthesis.keyFindings)).toBe(true);
    expect(Array.isArray(synthesis.sources)).toBe(true);
    
    expect(synthesis.summary.length).toBeGreaterThan(0);
    expect(synthesis.keyFindings.length).toBeGreaterThan(0);
    expect(synthesis.sources.length).toBe(researchItems.length);
  });
  
  test('synthesizeResearch should handle empty input', async () => {
    const synthesizer = new ResearchSynthesizer();
    
    const synthesis = await synthesizer.synthesizeResearch([]);
    
    expect(synthesis).toHaveProperty('summary');
    expect(synthesis).toHaveProperty('keyFindings');
    expect(synthesis).toHaveProperty('sources');
    
    expect(synthesis.summary).toBe('');
    expect(synthesis.keyFindings).toEqual([]);
    expect(synthesis.sources).toEqual([]);
  });
  
  test('synthesizeResearch should resolve conflicts when enabled', async () => {
    const synthesizer = new ResearchSynthesizer();
    
    // Create items with conflicts
    const conflictItem1 = {
      id: 'conflict-1',
      title: 'JavaScript ES6 Release',
      content: 'ES6 was released in 2015.',
      url: 'https://example.com/es6-2015',
      metadata: {
        publishedDate: new Date().toISOString(),
        confidence: 0.9
      }
    };
    
    const conflictItem2 = {
      id: 'conflict-2',
      title: 'ECMAScript 6 History',
      content: 'ECMAScript 6 was released in 2016.',
      url: 'https://example.com/es6-2016',
      metadata: {
        publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.7
      }
    };
    
    // Spy on conflict resolver methods
    const detectConflictsSpy = jest.spyOn(synthesizer.conflictResolver, 'detectConflicts');
    const resolveConflictsSpy = jest.spyOn(synthesizer.conflictResolver, 'resolveConflicts');
    
    // Synthesize with conflict resolution enabled
    await synthesizer.synthesizeResearch([conflictItem1, conflictItem2], { resolveConflicts: true });
    
    expect(detectConflictsSpy).toHaveBeenCalled();
    expect(resolveConflictsSpy).toHaveBeenCalled();
    
    // Synthesize with conflict resolution disabled
    detectConflictsSpy.mockClear();
    resolveConflictsSpy.mockClear();
    
    await synthesizer.synthesizeResearch([conflictItem1, conflictItem2], { resolveConflicts: false });
    
    expect(detectConflictsSpy).not.toHaveBeenCalled();
    expect(resolveConflictsSpy).not.toHaveBeenCalled();
  });
  
  test('createSynthesisPrompt should generate a valid prompt', () => {
    const synthesizer = new ResearchSynthesizer();
    
    // Mock ranked items
    const rankedItems = [
      { item: item1, weightedScore: 0.9 },
      { item: item2, weightedScore: 0.8 },
      { item: item3, weightedScore: 0.7 }
    ];
    
    // Mock conflict resolution
    const conflictResolution = {
      resolvedConflicts: [
        {
          conflict: {
            topic: 'release_date',
            conflict: {
              key: 'date',
              value1: '2015',
              value2: '2016'
            }
          },
          resolution: {
            value: '2015',
            method: 'higher_score',
            confidence: 0.9
          }
        }
      ]
    };
    
    const prompt = synthesizer.createSynthesisPrompt(rankedItems, conflictResolution, { query: 'JavaScript best practices', domain: 'technology' });
    
    expect(prompt).toContain('JavaScript best practices');
    expect(prompt).toContain('technology');
    expect(prompt).toContain(item1.title);
    expect(prompt).toContain(item2.title);
    expect(prompt).toContain(item3.title);
    expect(prompt).toContain('Resolved Conflicts');
    expect(prompt).toContain('release_date');
    expect(prompt).toContain('2015');
    expect(prompt).toContain('2016');
    expect(prompt).toContain('higher_score');
  });
  
  test('parseSynthesisResult should handle various formats', () => {
    const synthesizer = new ResearchSynthesizer();
    
    // Test with object
    const objectResult = {
      summary: 'Summary text',
      keyFindings: ['Finding 1', 'Finding 2']
    };
    
    const parsed1 = synthesizer.parseSynthesisResult(objectResult);
    expect(parsed1.summary).toBe(objectResult.summary);
    expect(parsed1.keyFindings).toEqual(objectResult.keyFindings);
    
    // Test with JSON string in code block
    const jsonBlockResult = '```json\n{"summary":"Summary text","keyFindings":["Finding 1","Finding 2"]}\n```';
    
    const parsed2 = synthesizer.parseSynthesisResult(jsonBlockResult);
    expect(parsed2.summary).toBe('Summary text');
    expect(parsed2.keyFindings).toEqual(['Finding 1', 'Finding 2']);
    
    // Test with plain text
    const textResult = 'Summary: This is a summary.\n\nKey Findings:\n- Finding 1\n- Finding 2';
    
    const parsed3 = synthesizer.parseSynthesisResult(textResult);
    expect(parsed3.summary).toContain('This is a summary');
    expect(parsed3.keyFindings.length).toBeGreaterThan(0);
  });
  
  test('extractKeyFindings should extract findings from content', () => {
    const synthesizer = new ResearchSynthesizer();
    
    const findings = synthesizer.extractKeyFindings([item1, item2, item3]);
    
    expect(Array.isArray(findings)).toBe(true);
    expect(findings.length).toBeGreaterThan(0);
    
    // Should extract bullet points
    expect(findings.some(finding => finding.includes('descriptive variable names'))).toBe(true);
    expect(findings.some(finding => finding.includes('consistent code style'))).toBe(true);
  });
  
  test('generateSummary should create a summary from items', () => {
    const synthesizer = new ResearchSynthesizer();
    
    const keyFindings = ['Finding 1', 'Finding 2'];
    const summary = synthesizer.generateSummary([item1, item2, item3], keyFindings);
    
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(0);
  });
  
  test('groupByTopic should group items by topic', () => {
    const synthesizer = new ResearchSynthesizer();
    
    const groups = synthesizer.groupByTopic(researchItems);
    
    expect(typeof groups).toBe('object');
    expect(Object.keys(groups).length).toBeGreaterThan(0);
    
    // Should group JavaScript-related items together
    const jsGroup = Object.entries(groups).find(([topic]) => 
      topic.toLowerCase().includes('javascript')
    );
    
    expect(jsGroup).toBeDefined();
    expect(jsGroup[1].length).toBeGreaterThan(1);
  });
});
