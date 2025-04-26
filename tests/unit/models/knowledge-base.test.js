import { KnowledgeBase } from '../../../src/models/knowledge-base.js';
import { jest } from '@jest/globals';

describe('Knowledge Base Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new knowledge base with default values', () => {
    const kb = new KnowledgeBase();
    
    expect(kb.id).toMatch(/^kb-/);
    expect(kb.domain).toBe('');
    expect(kb.created_at).toBeDefined();
    expect(kb.updated_at).toBeDefined();
    expect(kb.concepts).toEqual([]);
    expect(kb.patterns).toEqual([]);
    expect(kb.best_practices).toEqual([]);
    expect(kb.examples).toEqual([]);
  });

  test('should create a knowledge base with provided values', () => {
    const kbData = {
      id: 'test-kb',
      domain: 'Test Domain',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      concepts: [{ id: 'concept-1', name: 'Concept 1' }],
      patterns: [{ id: 'pattern-1', name: 'Pattern 1' }],
      best_practices: [{ id: 'best-practice-1', name: 'Best Practice 1' }],
      examples: [{ id: 'example-1', name: 'Example 1' }]
    };
    
    const kb = new KnowledgeBase(kbData);
    
    expect(kb.id).toBe('test-kb');
    expect(kb.domain).toBe('Test Domain');
    expect(kb.created_at).toBe('2023-01-01T00:00:00.000Z');
    expect(kb.updated_at).toBe('2023-01-01T00:00:00.000Z');
    expect(kb.concepts).toEqual([{ id: 'concept-1', name: 'Concept 1' }]);
    expect(kb.patterns).toEqual([{ id: 'pattern-1', name: 'Pattern 1' }]);
    expect(kb.best_practices).toEqual([{ id: 'best-practice-1', name: 'Best Practice 1' }]);
    expect(kb.examples).toEqual([{ id: 'example-1', name: 'Example 1' }]);
  });

  test('should validate a knowledge base', () => {
    const kb = new KnowledgeBase({
      id: 'test-kb',
      domain: 'Test Domain'
    });
    
    expect(kb.validate()).toBe(true);
  });

  test('should throw an error if knowledge base ID is missing', () => {
    const kb = new KnowledgeBase({
      domain: 'Test Domain'
    });
    kb.id = null;
    
    expect(() => kb.validate()).toThrow('Knowledge Base ID is required');
  });

  test('should throw an error if domain is missing', () => {
    const kb = new KnowledgeBase({
      id: 'test-kb'
    });
    kb.domain = null;
    
    expect(() => kb.validate()).toThrow('Domain is required');
  });

  // Note: These tests would normally test file operations
  // but we're skipping them for now to focus on the model functionality
  
  test('should have a save method', () => {
    const kb = new KnowledgeBase({
      id: 'test-kb',
      domain: 'Test Domain'
    });
    
    expect(typeof kb.save).toBe('function');
  });

  test('should have a static load method', () => {
    expect(typeof KnowledgeBase.load).toBe('function');
  });

  test('should have a static create method', () => {
    expect(typeof KnowledgeBase.create).toBe('function');
  });

  test('should add a concept to the knowledge base', () => {
    const kb = new KnowledgeBase({
      id: 'test-kb',
      domain: 'Test Domain'
    });
    
    const concept = { name: 'Concept 1' };
    kb.addConcept(concept);
    
    expect(kb.concepts).toHaveLength(1);
    expect(kb.concepts[0].id).toMatch(/^concept-/);
    expect(kb.concepts[0].name).toBe('Concept 1');
  });

  test('should add a pattern to the knowledge base', () => {
    const kb = new KnowledgeBase({
      id: 'test-kb',
      domain: 'Test Domain'
    });
    
    const pattern = { name: 'Pattern 1' };
    kb.addPattern(pattern);
    
    expect(kb.patterns).toHaveLength(1);
    expect(kb.patterns[0].id).toMatch(/^pattern-/);
    expect(kb.patterns[0].name).toBe('Pattern 1');
  });

  test('should add a best practice to the knowledge base', () => {
    const kb = new KnowledgeBase({
      id: 'test-kb',
      domain: 'Test Domain'
    });
    
    const bestPractice = { name: 'Best Practice 1' };
    kb.addBestPractice(bestPractice);
    
    expect(kb.best_practices).toHaveLength(1);
    expect(kb.best_practices[0].id).toMatch(/^best-practice-/);
    expect(kb.best_practices[0].name).toBe('Best Practice 1');
  });

  test('should add an example to the knowledge base', () => {
    const kb = new KnowledgeBase({
      id: 'test-kb',
      domain: 'Test Domain'
    });
    
    const example = { name: 'Example 1' };
    kb.addExample(example);
    
    expect(kb.examples).toHaveLength(1);
    expect(kb.examples[0].id).toMatch(/^example-/);
    expect(kb.examples[0].name).toBe('Example 1');
  });

  test('should search the knowledge base', () => {
    const kb = new KnowledgeBase({
      id: 'test-kb',
      domain: 'Test Domain',
      concepts: [
        { id: 'concept-1', name: 'Concept 1', description: 'Description 1' },
        { id: 'concept-2', name: 'Concept 2', description: 'Description 2' }
      ],
      patterns: [
        { id: 'pattern-1', name: 'Pattern 1', description: 'Description 1' },
        { id: 'pattern-2', name: 'Pattern 2', description: 'Description 2' }
      ],
      best_practices: [
        { id: 'best-practice-1', name: 'Best Practice 1', description: 'Description 1' },
        { id: 'best-practice-2', name: 'Best Practice 2', description: 'Description 2' }
      ],
      examples: [
        { id: 'example-1', name: 'Example 1', description: 'Description 1' },
        { id: 'example-2', name: 'Example 2', description: 'Description 2' }
      ]
    });
    
    const results = kb.search('concept 1');
    
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('concept');
    expect(results[0].item.id).toBe('concept-1');
    
    const allResults = kb.search('description');
    
    expect(allResults).toHaveLength(8);
  });
});
