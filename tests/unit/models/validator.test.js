import { validateProjectSchema, validateBlueprintSchema, validateKnowledgeBaseSchema } from '../../../src/models/validator.js';
import { jest } from '@jest/globals';

describe('Validator', () => {
  test('should validate a valid project', () => {
    const project = {
      id: 'test-project',
      name: 'Test Project',
      description: 'A test project',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      requirements: 'Test requirements',
      research: {
        domain_knowledge: [],
        similar_projects: [],
        best_practices: []
      },
      blueprint: 'test-blueprint'
    };
    
    expect(() => validateProjectSchema(project)).not.toThrow();
  });
  
  test('should throw an error for an invalid project', () => {
    const project = {
      // Missing required fields
      description: 'A test project'
    };
    
    expect(() => validateProjectSchema(project)).toThrow();
  });
  
  test('should validate a valid blueprint', () => {
    const blueprint = {
      id: 'test-blueprint',
      project_id: 'test-project',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      architecture: {
        components: [],
        relationships: []
      },
      tasks: [],
      workflow: {
        steps: [],
        checkpoints: []
      }
    };
    
    expect(() => validateBlueprintSchema(blueprint)).not.toThrow();
  });
  
  test('should throw an error for an invalid blueprint', () => {
    const blueprint = {
      // Missing required fields
      architecture: {
        components: [],
        relationships: []
      }
    };
    
    expect(() => validateBlueprintSchema(blueprint)).toThrow();
  });
  
  test('should validate a valid knowledge base', () => {
    const knowledgeBase = {
      id: 'test-kb',
      domain: 'Test Domain',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      concepts: [],
      patterns: [],
      best_practices: [],
      examples: []
    };
    
    expect(() => validateKnowledgeBaseSchema(knowledgeBase)).not.toThrow();
  });
  
  test('should throw an error for an invalid knowledge base', () => {
    const knowledgeBase = {
      // Missing required fields
      concepts: [],
      patterns: []
    };
    
    expect(() => validateKnowledgeBaseSchema(knowledgeBase)).toThrow();
  });
});
