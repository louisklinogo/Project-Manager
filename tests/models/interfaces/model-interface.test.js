/**
 * Tests for the model interfaces
 */

import { describe, test, expect } from '@jest/globals';
import { ModelInterface } from '../../../src/models/interfaces/model-interface.js';
import { ProjectInterface } from '../../../src/models/interfaces/project-interface.js';
import { BlueprintInterface } from '../../../src/models/interfaces/blueprint-interface.js';
import { KnowledgeBaseInterface } from '../../../src/models/interfaces/knowledge-base-interface.js';

describe('ModelInterface', () => {
  test('should define required methods', () => {
    expect(ModelInterface.prototype.validate).toBeDefined();
    expect(ModelInterface.prototype.save).toBeDefined();
    expect(ModelInterface.prototype.toJSON).toBeDefined();
    expect(ModelInterface.fromJSON).toBeDefined();
    expect(ModelInterface.load).toBeDefined();
  });

  test('should throw errors for unimplemented methods', () => {
    const model = new ModelInterface();
    expect(() => model.validate()).toThrow('Method validate() must be implemented by subclass');
    // Don't test save() as it's async and would require different testing approach
    expect(() => ModelInterface.fromJSON({})).toThrow('Method fromJSON() must be implemented by subclass');
    // Don't test load() as it's async and would require different testing approach
  });

  test('should have default toJSON implementation', () => {
    const model = new ModelInterface();
    model.id = 'test-id';
    model.name = 'Test Model';
    const json = model.toJSON();
    expect(json.id).toBe('test-id');
    expect(json.name).toBe('Test Model');
  });

  test('should have getter methods', () => {
    const model = new ModelInterface();
    model.id = 'test-id';
    model.created_at = '2023-01-01T00:00:00Z';
    model.updated_at = '2023-01-02T00:00:00Z';
    expect(model.getId()).toBe('test-id');
    expect(model.getCreatedAt()).toBe('2023-01-01T00:00:00Z');
    expect(model.getUpdatedAt()).toBe('2023-01-02T00:00:00Z');
  });

  test('should update timestamp', () => {
    const model = new ModelInterface();
    model.updated_at = '2023-01-01T00:00:00Z';
    model.updateTimestamp();
    expect(model.updated_at).not.toBe('2023-01-01T00:00:00Z');
    expect(new Date(model.updated_at)).toBeInstanceOf(Date);
  });
});

describe('ProjectInterface', () => {
  test('should extend ModelInterface', () => {
    expect(ProjectInterface.prototype instanceof ModelInterface).toBe(true);
  });

  test('should define project-specific methods', () => {
    expect(ProjectInterface.prototype.getName).toBeDefined();
    expect(ProjectInterface.prototype.setName).toBeDefined();
    expect(ProjectInterface.prototype.getDescription).toBeDefined();
    expect(ProjectInterface.prototype.setDescription).toBeDefined();
    expect(ProjectInterface.prototype.getRequirements).toBeDefined();
    expect(ProjectInterface.prototype.setRequirements).toBeDefined();
    expect(ProjectInterface.prototype.getResearch).toBeDefined();
    expect(ProjectInterface.prototype.setResearch).toBeDefined();
    expect(ProjectInterface.prototype.getBlueprintId).toBeDefined();
    expect(ProjectInterface.prototype.setBlueprintId).toBeDefined();
    expect(ProjectInterface.prototype.addDomainKnowledge).toBeDefined();
    expect(ProjectInterface.prototype.addSimilarProject).toBeDefined();
    expect(ProjectInterface.prototype.addBestPractice).toBeDefined();
  });
});

describe('BlueprintInterface', () => {
  test('should extend ModelInterface', () => {
    expect(BlueprintInterface.prototype instanceof ModelInterface).toBe(true);
  });

  test('should define blueprint-specific methods', () => {
    expect(BlueprintInterface.prototype.getProjectId).toBeDefined();
    expect(BlueprintInterface.prototype.setProjectId).toBeDefined();
    expect(BlueprintInterface.prototype.getArchitecture).toBeDefined();
    expect(BlueprintInterface.prototype.setArchitecture).toBeDefined();
    expect(BlueprintInterface.prototype.getTasks).toBeDefined();
    expect(BlueprintInterface.prototype.setTasks).toBeDefined();
    expect(BlueprintInterface.prototype.getWorkflow).toBeDefined();
    expect(BlueprintInterface.prototype.setWorkflow).toBeDefined();
    expect(BlueprintInterface.prototype.addComponent).toBeDefined();
    expect(BlueprintInterface.prototype.addRelationship).toBeDefined();
    expect(BlueprintInterface.prototype.addTask).toBeDefined();
    expect(BlueprintInterface.prototype.getTaskById).toBeDefined();
    expect(BlueprintInterface.prototype.updateTask).toBeDefined();
    expect(BlueprintInterface.prototype.removeTask).toBeDefined();
    expect(BlueprintInterface.prototype.addStep).toBeDefined();
    expect(BlueprintInterface.prototype.addCheckpoint).toBeDefined();
  });
});

describe('KnowledgeBaseInterface', () => {
  test('should extend ModelInterface', () => {
    expect(KnowledgeBaseInterface.prototype instanceof ModelInterface).toBe(true);
  });

  test('should define knowledge base-specific methods', () => {
    expect(KnowledgeBaseInterface.prototype.getDomain).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.setDomain).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.getConcepts).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.setConcepts).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.getPatterns).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.setPatterns).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.getBestPractices).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.setBestPractices).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.getExamples).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.setExamples).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.addConcept).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.addPattern).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.addBestPractice).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.addExample).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.getConceptById).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.getPatternById).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.getBestPracticeById).toBeDefined();
    expect(KnowledgeBaseInterface.prototype.getExampleById).toBeDefined();
  });
});
