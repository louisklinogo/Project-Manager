/**
 * Context Packager tests
 */

import { jest } from '@jest/globals';
import { ContextPackager } from '../../../src/blueprint/context-packager.js';

describe('ContextPackager', () => {
  let contextPackager;

  beforeEach(() => {
    contextPackager = new ContextPackager();
  });

  test('should create a new instance with default options', () => {
    expect(contextPackager).toBeInstanceOf(ContextPackager);
    expect(contextPackager.options).toHaveProperty('maxContextSize');
    expect(contextPackager.options).toHaveProperty('prioritizeRecent');
    expect(contextPackager.options).toHaveProperty('includeDependencies');
  });

  test('should package context for a task', () => {
    const task = {
      id: 'task-1',
      title: 'Implement user authentication',
      description: 'Implement user authentication using JWT tokens',
      acceptance_criteria: [
        'Users should be able to sign up',
        'Users should be able to log in',
        'Users should be able to log out'
      ],
      dependencies: ['task-2']
    };

    const blueprint = {
      id: 'blueprint-1',
      project_id: 'project-1',
      tasks: [
        task,
        {
          id: 'task-2',
          title: 'Set up database',
          description: 'Set up the database schema'
        },
        {
          id: 'task-3',
          title: 'Implement user model',
          description: 'Implement the user model',
          dependencies: ['task-1']
        }
      ]
    };

    const project = {
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      requirements: 'The project should have user authentication',
      research: {
        domain_knowledge: ['JWT is a standard for authentication'],
        similar_projects: ['Auth0'],
        best_practices: ['Use bcrypt for password hashing']
      }
    };

    const context = contextPackager.packageTaskContext(task, blueprint, project);

    expect(context).toHaveProperty('task');
    expect(context).toHaveProperty('project');
    expect(context).toHaveProperty('dependencies');
    expect(context).toHaveProperty('relatedTasks');
    expect(context).toHaveProperty('research');

    expect(context.task).toHaveProperty('id', task.id);
    expect(context.task).toHaveProperty('title', task.title);
    expect(context.project).toHaveProperty('id', project.id);
    expect(context.project).toHaveProperty('name', project.name);
    expect(context.dependencies).toHaveLength(1);
    expect(context.relatedTasks).toHaveLength(1);
    expect(context.research).toHaveProperty('domain_knowledge');
  });

  test('should package context for a step', () => {
    const step = {
      id: 'step-1',
      name: 'Implement login functionality',
      description: 'Implement the login functionality',
      task_id: 'task-1'
    };

    const steps = [
      step,
      {
        id: 'step-2',
        name: 'Implement signup functionality',
        description: 'Implement the signup functionality',
        task_id: 'task-1'
      },
      {
        id: 'step-3',
        name: 'Implement logout functionality',
        description: 'Implement the logout functionality',
        task_id: 'task-1'
      }
    ];

    const dependencies = {
      'step-2': ['step-1'],
      'step-3': ['step-2']
    };

    const blueprint = {
      id: 'blueprint-1',
      project_id: 'project-1',
      tasks: [
        {
          id: 'task-1',
          title: 'Implement user authentication',
          description: 'Implement user authentication using JWT tokens',
          acceptance_criteria: [
            'Users should be able to sign up',
            'Users should be able to log in',
            'Users should be able to log out'
          ]
        }
      ]
    };

    const project = {
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      requirements: 'The project should have user authentication'
    };

    const context = contextPackager.packageStepContext(step, steps, dependencies, blueprint, project);

    expect(context).toHaveProperty('step');
    expect(context).toHaveProperty('project');
    expect(context).toHaveProperty('task');
    expect(context).toHaveProperty('dependencies');
    expect(context).toHaveProperty('nextSteps');

    expect(context.step).toHaveProperty('id', step.id);
    expect(context.step).toHaveProperty('name', step.name);
    expect(context.project).toHaveProperty('id', project.id);
    expect(context.project).toHaveProperty('name', project.name);
    expect(context.task).toHaveProperty('id', 'task-1');
    expect(context.nextSteps).toHaveLength(1);
  });

  test('should format context for LLM consumption', () => {
    const context = {
      project: {
        name: 'Test Project',
        description: 'A test project',
        requirements: 'The project should have user authentication'
      },
      task: {
        title: 'Implement user authentication',
        description: 'Implement user authentication using JWT tokens',
        acceptance_criteria: [
          'Users should be able to sign up',
          'Users should be able to log in',
          'Users should be able to log out'
        ]
      },
      dependencies: [
        {
          title: 'Set up database',
          description: 'Set up the database schema'
        }
      ],
      research: {
        domain_knowledge: ['JWT is a standard for authentication'],
        best_practices: ['Use bcrypt for password hashing']
      }
    };

    const formatted = contextPackager.formatContextForLLM(context);

    expect(formatted).toContain('# Project: Test Project');
    expect(formatted).toContain('# Task: Implement user authentication');
    expect(formatted).toContain('## Acceptance Criteria');
    expect(formatted).toContain('# Dependencies');
    expect(formatted).toContain('# Research Information');
  });

  test('should throw an error for invalid input', () => {
    expect(() => contextPackager.packageTaskContext(null, {}, {})).toThrow();
    expect(() => contextPackager.packageTaskContext({}, null, {})).toThrow();
    expect(() => contextPackager.packageTaskContext({}, {}, null)).toThrow();

    expect(() => contextPackager.packageStepContext(null, [], {}, {}, {})).toThrow();
    expect(() => contextPackager.packageStepContext({}, null, {}, {}, {})).toThrow();
    expect(() => contextPackager.packageStepContext({}, [], null, {}, {})).toThrow();
    expect(() => contextPackager.packageStepContext({}, [], {}, null, {})).toThrow();
    expect(() => contextPackager.packageStepContext({}, [], {}, {}, null)).toThrow();
  });

  test('should trim context to fit within size limits', () => {
    // Create a large context that exceeds the size limit
    const task = {
      id: 'task-1',
      title: 'Implement user authentication',
      description: 'A'.repeat(500), // Large description
      acceptance_criteria: [
        'Users should be able to sign up',
        'Users should be able to log in',
        'Users should be able to log out'
      ],
      dependencies: ['task-2']
    };

    const blueprint = {
      id: 'blueprint-1',
      project_id: 'project-1',
      tasks: [
        task,
        {
          id: 'task-2',
          title: 'Set up database',
          description: 'B'.repeat(500) // Large description
        },
        {
          id: 'task-3',
          title: 'Implement user model',
          description: 'C'.repeat(500), // Large description
          dependencies: ['task-1']
        }
      ]
    };

    const project = {
      id: 'project-1',
      name: 'Test Project',
      description: 'D'.repeat(500), // Large description
      requirements: 'E'.repeat(500), // Large requirements
      research: {
        domain_knowledge: Array(5).fill('F'.repeat(100)), // Large domain knowledge
        similar_projects: Array(5).fill('G'.repeat(100)), // Large similar projects
        best_practices: Array(5).fill('H'.repeat(100)) // Large best practices
      }
    };

    // Set a small context size limit
    const smallContextPackager = new ContextPackager({ maxContextSize: 1000 });

    const context = smallContextPackager.packageTaskContext(task, blueprint, project);

    // Convert to string to measure size
    const contextString = JSON.stringify(context);

    // Verify that trimming was performed
    expect(context.research.domain_knowledge.length).toBeLessThanOrEqual(3);
    expect(context.research.similar_projects.length).toBeLessThanOrEqual(1);
    expect(context.research.best_practices.length).toBeLessThanOrEqual(3);

    // Check that the context was trimmed (may not be exactly within the limit)
    expect(contextString.length).toBeLessThan(JSON.stringify({
      task,
      project,
      dependencies: blueprint.tasks.filter(t => task.dependencies.includes(t.id)),
      relatedTasks: blueprint.tasks.filter(t => t.dependencies && t.dependencies.includes(task.id))
    }).length);
  });
});
