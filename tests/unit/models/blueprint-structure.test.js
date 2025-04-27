/**
 * Blueprint Structure tests
 */

import { jest } from '@jest/globals';
import { Blueprint } from '../../../src/models/blueprint.js';
import fs from 'fs';

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(JSON.stringify({
      id: 'test-blueprint',
      project_id: 'test-project',
      tasks: [
        {
          id: 'task-1',
          title: 'Test Task 1',
          description: 'Test Description 1'
        }
      ]
    }))
  }
}));

describe('Blueprint Structure', () => {
  let blueprint;
  let project;

  beforeEach(() => {
    blueprint = new Blueprint({
      id: 'test-blueprint',
      project_id: 'test-project',
      tasks: [
        {
          id: 'task-1',
          title: 'Implement user authentication',
          description: 'Implement user authentication using JWT tokens',
          dependencies: []
        },
        {
          id: 'task-2',
          title: 'Implement user profile',
          description: 'Implement user profile functionality',
          dependencies: ['task-1']
        }
      ]
    });

    project = {
      id: 'test-project',
      name: 'Test Project',
      description: 'A test project',
      requirements: 'The project should have user authentication and profiles'
    };
  });

  test('should initialize blueprint structure utilities', () => {
    expect(blueprint.stepBreakdown).toBeDefined();
    expect(blueprint.contextPackager).toBeDefined();
    expect(blueprint.validationGenerator).toBeDefined();
    expect(blueprint.blueprintFormatter).toBeDefined();
  });

  test('should generate steps for tasks', () => {
    blueprint.generateSteps();
    
    expect(blueprint.workflow.steps.length).toBeGreaterThan(0);
    
    // Check that steps have the required properties
    blueprint.workflow.steps.forEach(step => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('name');
      expect(step).toHaveProperty('description');
      expect(step).toHaveProperty('dependencies');
    });
  });

  test('should generate validation criteria for tasks', () => {
    blueprint.generateValidationCriteria(project);
    
    // Check that tasks have acceptance criteria
    blueprint.tasks.forEach(task => {
      expect(task).toHaveProperty('acceptance_criteria');
      expect(task.acceptance_criteria.length).toBeGreaterThan(0);
    });
  });

  test('should generate validation criteria for steps', () => {
    blueprint.generateSteps();
    blueprint.generateValidationCriteria(project);
    
    // Check that steps have validation criteria
    blueprint.workflow.steps.forEach(step => {
      if (step.task_id) {
        expect(step).toHaveProperty('validation_criteria');
        expect(step.validation_criteria.length).toBeGreaterThan(0);
      }
    });
  });

  test('should generate validation plans', () => {
    blueprint.generateSteps();
    blueprint.generateValidationCriteria(project);
    blueprint.generateValidationPlans();
    
    // Check that tasks have validation plans
    blueprint.tasks.forEach(task => {
      expect(task).toHaveProperty('validation_plan');
      expect(task.validation_plan).toHaveProperty('validation_steps');
      expect(task.validation_plan.validation_steps.length).toBeGreaterThan(0);
    });
    
    // Check that steps have validation plans
    blueprint.workflow.steps.forEach(step => {
      if (step.validation_criteria) {
        expect(step).toHaveProperty('validation_plan');
        expect(step.validation_plan).toHaveProperty('validation_steps');
        expect(step.validation_plan.validation_steps.length).toBeGreaterThan(0);
      }
    });
  });

  test('should package context for a task', () => {
    const context = blueprint.packageTaskContext('task-1', project);
    
    expect(context).toHaveProperty('task');
    expect(context).toHaveProperty('project');
    expect(context).toHaveProperty('dependencies');
    expect(context).toHaveProperty('relatedTasks');
    
    expect(context.task).toHaveProperty('id', 'task-1');
    expect(context.project).toHaveProperty('id', 'test-project');
    expect(context.relatedTasks.length).toBe(1);
  });

  test('should package context for a step', () => {
    blueprint.generateSteps();
    
    const stepId = blueprint.workflow.steps[0].id;
    const context = blueprint.packageStepContext(stepId, project);
    
    expect(context).toHaveProperty('step');
    expect(context).toHaveProperty('project');
    expect(context).toHaveProperty('dependencies');
    expect(context).toHaveProperty('nextSteps');
    
    expect(context.step).toHaveProperty('id', stepId);
    expect(context.project).toHaveProperty('id', 'test-project');
  });

  test('should format the blueprint for LLM consumption', () => {
    const formatted = blueprint.formatForLLM(project);
    
    expect(formatted).toContain(`# Project: ${project.name}`);
    expect(formatted).toContain('# Tasks');
    expect(formatted).toContain('## Task 1: Implement user authentication');
    expect(formatted).toContain('## Task 2: Implement user profile');
  });

  test('should format a task for LLM consumption', () => {
    const formatted = blueprint.formatTaskForLLM('task-1', project);
    
    expect(formatted).toContain('# Task: Implement user authentication');
    expect(formatted).toContain('## Description');
    expect(formatted).toContain('## Project Context');
    expect(formatted).toContain(`**Project:** ${project.name}`);
  });

  test('should format a step for LLM consumption', () => {
    blueprint.generateSteps();
    
    const stepId = blueprint.workflow.steps[0].id;
    const formatted = blueprint.formatStepForLLM(stepId, project);
    
    expect(formatted).toContain('# Step:');
    expect(formatted).toContain('## Description');
    expect(formatted).toContain('## Project Context');
    expect(formatted).toContain(`**Project:** ${project.name}`);
    expect(formatted).toContain('## Implementation Guidance');
  });

  test('should throw an error for invalid task ID', () => {
    expect(() => blueprint.packageTaskContext('invalid-task', project)).toThrow();
    expect(() => blueprint.formatTaskForLLM('invalid-task', project)).toThrow();
  });

  test('should throw an error for invalid step ID', () => {
    expect(() => blueprint.packageStepContext('invalid-step', project)).toThrow();
    expect(() => blueprint.formatStepForLLM('invalid-step', project)).toThrow();
  });
});
