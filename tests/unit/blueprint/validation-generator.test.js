/**
 * Validation Generator tests
 */

import { jest } from '@jest/globals';
import { ValidationGenerator } from '../../../src/blueprint/validation-generator.js';

describe('ValidationGenerator', () => {
  let validationGenerator;

  beforeEach(() => {
    validationGenerator = new ValidationGenerator();
  });

  test('should create a new instance with default options', () => {
    expect(validationGenerator).toBeInstanceOf(ValidationGenerator);
    expect(validationGenerator.options).toHaveProperty('minCriteria');
    expect(validationGenerator.options).toHaveProperty('maxCriteria');
    expect(validationGenerator.options).toHaveProperty('includeTestCriteria');
    expect(validationGenerator.options).toHaveProperty('includePerformanceCriteria');
  });

  test('should generate validation criteria for a task', () => {
    const task = {
      id: 'task-1',
      title: 'Implement user authentication',
      description: 'Implement user authentication using JWT tokens'
    };

    const project = {
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      requirements: 'The project should have secure user authentication'
    };

    const criteria = validationGenerator.generateTaskCriteria(task, project);

    expect(criteria).toBeInstanceOf(Array);
    expect(criteria.length).toBeGreaterThanOrEqual(validationGenerator.options.minCriteria);
    expect(criteria.length).toBeLessThanOrEqual(validationGenerator.options.maxCriteria);
    
    // Check that criteria include expected types
    expect(criteria.some(c => c.toLowerCase().includes('implement'))).toBe(true);
    expect(criteria.some(c => c.toLowerCase().includes('test'))).toBe(true);
    expect(criteria.some(c => c.toLowerCase().includes('document'))).toBe(true);
    expect(criteria.some(c => c.toLowerCase().includes('error'))).toBe(true);
    
    // Check that project-specific criteria are included
    expect(criteria.some(c => c.toLowerCase().includes('secur'))).toBe(true);
  });

  test('should generate validation criteria for a step', () => {
    const step = {
      id: 'step-1',
      name: 'Implement login functionality',
      description: 'Implement the login functionality'
    };

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

    const criteria = validationGenerator.generateStepCriteria(step, task);

    expect(criteria).toBeInstanceOf(Array);
    expect(criteria.length).toBeGreaterThan(0);
    
    // Check that criteria include expected types
    expect(criteria.some(c => c.toLowerCase().includes(step.name.toLowerCase()))).toBe(true);
    expect(criteria.some(c => c.toLowerCase().includes('document'))).toBe(true);
    expect(criteria.some(c => c.toLowerCase().includes('quality'))).toBe(true);
  });

  test('should format criteria for LLM consumption', () => {
    const criteria = [
      'The implementation must fully address the requirements',
      'The implementation must include unit tests',
      'The implementation must include proper error handling'
    ];

    const formatted = validationGenerator.formatCriteriaForLLM(criteria);

    expect(formatted).toContain('# Validation Criteria');
    expect(formatted).toContain('1. The implementation must fully address the requirements');
    expect(formatted).toContain('2. The implementation must include unit tests');
    expect(formatted).toContain('3. The implementation must include proper error handling');
  });

  test('should generate a validation plan', () => {
    const task = {
      id: 'task-1',
      title: 'Implement user authentication'
    };

    const criteria = [
      'The implementation must fully address the requirements',
      'The implementation must include unit tests',
      'The implementation must include proper error handling'
    ];

    const plan = validationGenerator.generateValidationPlan(task, criteria);

    expect(plan).toHaveProperty('item_id', task.id);
    expect(plan).toHaveProperty('item_type', 'task');
    expect(plan).toHaveProperty('item_name', task.title);
    expect(plan).toHaveProperty('criteria', criteria);
    expect(plan).toHaveProperty('validation_steps');
    expect(plan.validation_steps).toBeInstanceOf(Array);
    expect(plan.validation_steps.length).toBeGreaterThan(0);
    
    // Check that validation steps include expected types
    expect(plan.validation_steps.some(s => s.name === 'Preparation')).toBe(true);
    expect(plan.validation_steps.some(s => s.name.includes('Final Verification'))).toBe(true);
    
    // Check that each criterion has a validation step
    criteria.forEach((criterion, index) => {
      expect(plan.validation_steps.some(s => s.name === `Validate Criterion ${index + 1}`)).toBe(true);
    });
  });

  test('should throw an error for invalid input', () => {
    expect(() => validationGenerator.generateTaskCriteria(null)).toThrow();
    expect(() => validationGenerator.generateTaskCriteria({})).toThrow();
    
    expect(() => validationGenerator.generateStepCriteria(null)).toThrow();
    expect(() => validationGenerator.generateStepCriteria({})).toThrow();
    
    expect(() => validationGenerator.generateValidationPlan(null, [])).toThrow();
    expect(() => validationGenerator.generateValidationPlan({}, null)).toThrow();
    expect(() => validationGenerator.generateValidationPlan({}, [])).toThrow();
  });

  test('should respect minCriteria and maxCriteria options', () => {
    const task = {
      id: 'task-1',
      title: 'Implement user authentication',
      description: 'Implement user authentication using JWT tokens'
    };

    const project = {
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      requirements: 'The project should have secure user authentication'
    };

    // Test with custom minCriteria
    const minGenerator = new ValidationGenerator({ minCriteria: 5 });
    const minCriteria = minGenerator.generateTaskCriteria(task, project);
    expect(minCriteria.length).toBeGreaterThanOrEqual(5);
    
    // Test with custom maxCriteria
    const maxGenerator = new ValidationGenerator({ maxCriteria: 3 });
    const maxCriteria = maxGenerator.generateTaskCriteria(task, project);
    expect(maxCriteria.length).toBeLessThanOrEqual(3);
  });

  test('should include or exclude test criteria based on options', () => {
    const task = {
      id: 'task-1',
      title: 'Implement user authentication',
      description: 'Implement user authentication using JWT tokens'
    };

    // Test with includeTestCriteria = false
    const noTestGenerator = new ValidationGenerator({ includeTestCriteria: false });
    const noTestCriteria = noTestGenerator.generateTaskCriteria(task);
    expect(noTestCriteria.some(c => c.toLowerCase().includes('test'))).toBe(false);
    
    // Test with includeTestCriteria = true
    const withTestGenerator = new ValidationGenerator({ includeTestCriteria: true });
    const withTestCriteria = withTestGenerator.generateTaskCriteria(task);
    expect(withTestCriteria.some(c => c.toLowerCase().includes('test'))).toBe(true);
  });
});
