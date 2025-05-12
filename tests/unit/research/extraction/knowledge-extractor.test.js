/**
 * Tests for knowledge extractor
 */

import { KnowledgeExtractor } from '../../../../src/research/extraction/knowledge-extractor.js';
import { TechnologyExtractor } from '../../../../src/research/extraction/domain-extractors/technology-extractor.js';
import { KnowledgeNode } from '../../../../src/models/knowledge-node.js';
import { jest } from '@jest/globals';

// Mock the getBestAvailableProvider function
jest.mock('../../../../src/providers/index.js', () => ({
  getBestAvailableProvider: jest.fn().mockResolvedValue({
    name: 'mock',
    generateChatCompletion: jest.fn().mockResolvedValue({
      message: {
        concepts: [
          {
            name: 'Mock Concept',
            description: 'A mock concept for testing',
            content: 'Mock content',
            tags: ['mock', 'test'],
            confidence: 0.8
          }
        ],
        patterns: [
          {
            name: 'Mock Pattern',
            description: 'A mock pattern for testing',
            content: 'Mock pattern content',
            tags: ['mock', 'pattern'],
            confidence: 0.7
          }
        ],
        practices: [
          {
            name: 'Mock Practice',
            description: 'A mock practice for testing',
            content: 'Mock practice content',
            tags: ['mock', 'practice'],
            confidence: 0.9
          }
        ],
        relationships: [
          {
            sourceType: 'concept',
            sourceName: 'Mock Concept',
            targetType: 'pattern',
            targetName: 'Mock Pattern',
            relationType: 'implements',
            description: 'Mock Concept implements Mock Pattern',
            confidence: 0.7
          }
        ]
      }
    })
  })
}));

describe('KnowledgeExtractor', () => {
  // Sample research item for testing
  const researchItem = {
    id: 'research-1',
    title: 'Test Research',
    content: `# JavaScript Best Practices

This guide covers best practices for JavaScript development.

## Variables

Use **const** and **let** instead of var. This helps prevent scope issues.

\`\`\`javascript
// Good
const name = 'John';
let age = 30;

// Bad
var name = 'John';
var age = 30;
\`\`\`

## Functions

Use arrow functions for better this binding.

\`\`\`javascript
// Good
const add = (a, b) => a + b;

// Bad
function add(a, b) {
  return a + b;
}
\`\`\`

## API Endpoints

The API provides the following endpoints:

GET /api/users - Get all users
POST /api/users - Create a new user
`,
    url: 'https://example.com/javascript-best-practices',
    metadata: {
      publishedDate: new Date().toISOString()
    }
  };
  
  test('should create a knowledge extractor with default options', () => {
    const extractor = new KnowledgeExtractor();
    
    expect(extractor).toBeInstanceOf(KnowledgeExtractor);
    expect(extractor.domain).toBeUndefined();
    expect(extractor.useAI).toBe(true);
    expect(extractor.domainExtractors).toBeInstanceOf(Map);
    expect(extractor.domainExtractors.size).toBe(0);
  });
  
  test('should create a knowledge extractor with custom options', () => {
    const extractor = new KnowledgeExtractor({
      domain: 'technology',
      useAI: false
    });
    
    expect(extractor).toBeInstanceOf(KnowledgeExtractor);
    expect(extractor.domain).toBe('technology');
    expect(extractor.useAI).toBe(false);
  });
  
  test('should register and retrieve domain-specific extractors', () => {
    const extractor = new KnowledgeExtractor();
    const techExtractor = new TechnologyExtractor();
    
    extractor.registerDomainExtractor('technology', techExtractor);
    
    expect(extractor.domainExtractors.size).toBe(1);
    expect(extractor.getDomainExtractor('technology')).toBe(techExtractor);
    expect(extractor.getDomainExtractor('Technology')).toBe(techExtractor); // Case-insensitive
    expect(extractor.getDomainExtractor('business')).toBeNull();
  });
  
  test('extractKnowledge should extract knowledge using AI', async () => {
    const extractor = new KnowledgeExtractor();
    
    const nodes = await extractor.extractKnowledge(researchItem);
    
    expect(Array.isArray(nodes)).toBe(true);
    expect(nodes.length).toBeGreaterThan(0);
    
    // Check that nodes are KnowledgeNode instances
    nodes.forEach(node => {
      expect(node).toBeInstanceOf(KnowledgeNode);
      expect(node.id).toBeDefined();
      expect(node.type).toBeDefined();
      expect(node.name).toBeDefined();
      expect(node.sources).toContainEqual(expect.objectContaining({
        id: researchItem.id
      }));
    });
    
    // Check for expected node types
    const conceptNodes = nodes.filter(node => node.type === 'concept');
    const patternNodes = nodes.filter(node => node.type === 'pattern');
    const practiceNodes = nodes.filter(node => node.type === 'practice');
    
    expect(conceptNodes.length).toBeGreaterThan(0);
    expect(patternNodes.length).toBeGreaterThan(0);
    expect(practiceNodes.length).toBeGreaterThan(0);
    
    // Check for relationships
    const hasRelations = nodes.some(node => node.relations.length > 0);
    expect(hasRelations).toBe(true);
  });
  
  test('extractKnowledgeWithRules should extract knowledge using rules', async () => {
    const extractor = new KnowledgeExtractor({ useAI: false });
    
    const nodes = await extractor.extractKnowledgeWithRules(researchItem);
    
    expect(Array.isArray(nodes)).toBe(true);
    expect(nodes.length).toBeGreaterThan(0);
    
    // Check that nodes are KnowledgeNode instances
    nodes.forEach(node => {
      expect(node).toBeInstanceOf(KnowledgeNode);
      expect(node.id).toBeDefined();
      expect(node.type).toBeDefined();
      expect(node.name).toBeDefined();
      expect(node.sources).toContainEqual(expect.objectContaining({
        id: researchItem.id
      }));
    });
    
    // Check for expected node types based on rule-based extraction
    const conceptNodes = nodes.filter(node => node.type === 'concept');
    const patternNodes = nodes.filter(node => node.type === 'pattern');
    
    // Rule-based extraction should find concepts from headings and bold text
    expect(conceptNodes.some(node => node.name.includes('Variables') || node.name.includes('Functions'))).toBe(true);
    
    // Rule-based extraction should find patterns from code blocks
    expect(patternNodes.length).toBeGreaterThan(0);
  });
  
  test('extractKnowledgeFromMultiple should extract and deduplicate knowledge', async () => {
    const extractor = new KnowledgeExtractor();
    
    // Create duplicate research items with slight variations
    const researchItem2 = {
      ...researchItem,
      id: 'research-2',
      title: 'JavaScript Best Practices (Updated)'
    };
    
    const nodes = await extractor.extractKnowledgeFromMultiple([researchItem, researchItem2]);
    
    expect(Array.isArray(nodes)).toBe(true);
    expect(nodes.length).toBeGreaterThan(0);
    
    // Check for deduplication (should have fewer nodes than extracting separately)
    const nodes1 = await extractor.extractKnowledge(researchItem);
    const nodes2 = await extractor.extractKnowledge(researchItem2);
    
    expect(nodes.length).toBeLessThan(nodes1.length + nodes2.length);
    
    // Check that deduplicated nodes have multiple sources
    const nodesWithMultipleSources = nodes.filter(node => node.sources.length > 1);
    expect(nodesWithMultipleSources.length).toBeGreaterThan(0);
  });
  
  test('should use domain-specific extractor when available', async () => {
    const extractor = new KnowledgeExtractor();
    const techExtractor = new TechnologyExtractor();
    
    // Mock the extractKnowledge method of the technology extractor
    techExtractor.extractKnowledge = jest.fn().mockResolvedValue([
      new KnowledgeNode({
        type: 'technology',
        name: 'JavaScript',
        description: 'A programming language',
        tags: ['language']
      })
    ]);
    
    extractor.registerDomainExtractor('technology', techExtractor);
    
    const nodes = await extractor.extractKnowledge(researchItem, { domain: 'technology' });
    
    expect(techExtractor.extractKnowledge).toHaveBeenCalledWith(researchItem, { domain: 'technology' });
    expect(nodes[0].type).toBe('technology');
    expect(nodes[0].name).toBe('JavaScript');
  });
  
  test('createExtractionPrompt should generate a valid prompt', () => {
    const extractor = new KnowledgeExtractor();
    
    const prompt = extractor.createExtractionPrompt('Test Title', 'Test Content', { domain: 'technology' });
    
    expect(prompt).toContain('Test Title');
    expect(prompt).toContain('Test Content');
    expect(prompt).toContain('Domain: technology');
    expect(prompt).toContain('concepts');
    expect(prompt).toContain('patterns');
    expect(prompt).toContain('practices');
    expect(prompt).toContain('relationships');
  });
  
  test('parseExtractionResult should handle various formats', () => {
    const extractor = new KnowledgeExtractor();
    
    // Test with object
    const objectResult = {
      concepts: [{ name: 'Test' }],
      patterns: [],
      practices: [],
      relationships: []
    };
    expect(extractor.parseExtractionResult(objectResult)).toEqual(objectResult);
    
    // Test with JSON string in code block
    const jsonBlockResult = '```json\n{"concepts":[{"name":"Test"}],"patterns":[],"practices":[],"relationships":[]}\n```';
    expect(extractor.parseExtractionResult(jsonBlockResult)).toEqual({
      concepts: [{ name: 'Test' }],
      patterns: [],
      practices: [],
      relationships: []
    });
    
    // Test with plain JSON string
    const jsonResult = '{"concepts":[{"name":"Test"}],"patterns":[],"practices":[],"relationships":[]}';
    expect(extractor.parseExtractionResult(jsonResult)).toEqual({
      concepts: [{ name: 'Test' }],
      patterns: [],
      practices: [],
      relationships: []
    });
    
    // Test with invalid input
    const invalidResult = 'Not JSON';
    expect(extractor.parseExtractionResult(invalidResult)).toEqual({
      concepts: [],
      patterns: [],
      practices: [],
      relationships: []
    });
  });
});
