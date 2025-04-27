/**
 * Step Breakdown tests
 */

import { jest } from '@jest/globals';
import { StepBreakdown } from '../../../src/blueprint/step-breakdown.js';

describe('StepBreakdown', () => {
  let stepBreakdown;

  beforeEach(() => {
    stepBreakdown = new StepBreakdown();
  });

  test('should create a new instance with default options', () => {
    expect(stepBreakdown).toBeInstanceOf(StepBreakdown);
    expect(stepBreakdown.options).toHaveProperty('maxStepComplexity');
    expect(stepBreakdown.options).toHaveProperty('minStepsPerTask');
    expect(stepBreakdown.options).toHaveProperty('maxStepsPerTask');
  });

  test('should break down a task into steps', () => {
    const task = {
      id: 'task-1',
      title: 'Implement user authentication',
      description: 'Implement user authentication using JWT tokens',
      acceptance_criteria: [
        'Users should be able to sign up',
        'Users should be able to log in',
        'Users should be able to log out'
      ]
    };

    const steps = stepBreakdown.breakdownTask(task);

    expect(steps).toBeInstanceOf(Array);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    
    // Check that each step has the required properties
    steps.forEach(step => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('name');
      expect(step).toHaveProperty('description');
      expect(step).toHaveProperty('task_id', task.id);
    });
  });

  test('should break down multiple tasks with dependencies', () => {
    const tasks = [
      {
        id: 'task-1',
        title: 'Set up database',
        description: 'Set up the database schema',
        dependencies: []
      },
      {
        id: 'task-2',
        title: 'Implement user model',
        description: 'Implement the user model',
        dependencies: ['task-1']
      },
      {
        id: 'task-3',
        title: 'Implement authentication',
        description: 'Implement user authentication',
        dependencies: ['task-2']
      }
    ];

    const result = stepBreakdown.breakdownTasks(tasks);

    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('dependencies');
    expect(result.steps).toBeInstanceOf(Array);
    expect(result.steps.length).toBeGreaterThan(0);
  });

  test('should throw an error for invalid input', () => {
    expect(() => stepBreakdown.breakdownTask(null)).toThrow();
    expect(() => stepBreakdown.breakdownTask({})).toThrow();
    expect(() => stepBreakdown.breakdownTasks(null)).toThrow();
    expect(() => stepBreakdown.breakdownTasks([])).toThrow();
  });

  test('should detect and resolve circular dependencies', () => {
    const steps = [
      { id: 'step-1', name: 'Step 1' },
      { id: 'step-2', name: 'Step 2' },
      { id: 'step-3', name: 'Step 3' }
    ];

    const dependencies = {
      'step-1': ['step-3'],
      'step-2': ['step-1'],
      'step-3': ['step-2']
    };

    const result = stepBreakdown.resolveCircularDependencies(steps, dependencies);

    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('dependencies');
    
    // Check that circular dependencies have been resolved
    const graph = new Map();
    Object.entries(result.dependencies).forEach(([stepId, deps]) => {
      graph.set(stepId, deps);
    });
    
    const visited = new Set();
    const recStack = new Set();
    
    const hasCycle = (node) => {
      if (!graph.has(node)) return false;
      
      if (recStack.has(node)) {
        return true;
      }
      
      if (visited.has(node)) return false;
      
      visited.add(node);
      recStack.add(node);
      
      const deps = graph.get(node) || [];
      for (const dep of deps) {
        if (hasCycle(dep)) {
          return true;
        }
      }
      
      recStack.delete(node);
      return false;
    };
    
    // Check that there are no cycles in the resolved dependencies
    for (const stepId of Object.keys(result.dependencies)) {
      expect(hasCycle(stepId)).toBe(false);
    }
  });
});
