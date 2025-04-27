/**
 * Blueprint Formatter tests
 */

import { jest } from '@jest/globals';
import { BlueprintFormatter } from '../../../src/blueprint/blueprint-formatter.js';

describe('BlueprintFormatter', () => {
  let blueprintFormatter;
  let blueprint;
  let project;

  beforeEach(() => {
    blueprintFormatter = new BlueprintFormatter();
    
    blueprint = {
      id: 'blueprint-1',
      project_id: 'project-1',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      architecture: {
        components: [
          {
            id: 'component-1',
            name: 'User Service',
            description: 'Service for managing users',
            type: 'service'
          },
          {
            id: 'component-2',
            name: 'Authentication Service',
            description: 'Service for handling authentication',
            type: 'service'
          }
        ],
        relationships: [
          {
            id: 'relationship-1',
            source: 'component-1',
            target: 'component-2',
            type: 'depends-on'
          }
        ]
      },
      tasks: [
        {
          id: 'task-1',
          title: 'Implement user service',
          description: 'Implement the user service',
          dependencies: [],
          acceptance_criteria: [
            'Service should handle user creation',
            'Service should handle user retrieval'
          ],
          implementation_guide: 'Implement using Node.js and Express'
        },
        {
          id: 'task-2',
          title: 'Implement authentication service',
          description: 'Implement the authentication service',
          dependencies: ['task-1'],
          acceptance_criteria: [
            'Service should handle user authentication',
            'Service should issue JWT tokens'
          ],
          implementation_guide: 'Implement using Node.js and Express with JWT'
        }
      ],
      workflow: {
        steps: [
          {
            id: 'step-1',
            name: 'Set up project structure',
            description: 'Set up the initial project structure',
            tasks: []
          },
          {
            id: 'step-2',
            name: 'Implement core services',
            description: 'Implement the core services',
            tasks: ['task-1', 'task-2']
          }
        ],
        checkpoints: [
          {
            id: 'checkpoint-1',
            name: 'Initial setup complete',
            description: 'Verify that the initial setup is complete',
            criteria: [
              'Project structure is set up',
              'Dependencies are installed'
            ]
          },
          {
            id: 'checkpoint-2',
            name: 'Core services complete',
            description: 'Verify that the core services are complete',
            criteria: [
              'User service is implemented',
              'Authentication service is implemented'
            ]
          }
        ]
      }
    };
    
    project = {
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      requirements: 'The project should have user authentication'
    };
  });

  test('should create a new instance with default options', () => {
    expect(blueprintFormatter).toBeInstanceOf(BlueprintFormatter);
    expect(blueprintFormatter.options).toHaveProperty('format', 'markdown');
    expect(blueprintFormatter.options).toHaveProperty('includeArchitecture', true);
    expect(blueprintFormatter.options).toHaveProperty('includeWorkflow', true);
    expect(blueprintFormatter.options).toHaveProperty('includeTasks', true);
    expect(blueprintFormatter.options).toHaveProperty('includeValidation', true);
  });

  test('should format a blueprint as Markdown', () => {
    const formatted = blueprintFormatter.formatBlueprint(blueprint, project);

    expect(formatted).toContain('# Project: Test Project');
    expect(formatted).toContain('# Architecture');
    expect(formatted).toContain('## Components');
    expect(formatted).toContain('### User Service');
    expect(formatted).toContain('## Relationships');
    expect(formatted).toContain('# Implementation Workflow');
    expect(formatted).toContain('## Steps');
    expect(formatted).toContain('### Step 1: Set up project structure');
    expect(formatted).toContain('## Checkpoints');
    expect(formatted).toContain('### Checkpoint 1: Initial setup complete');
    expect(formatted).toContain('# Tasks');
    expect(formatted).toContain('## Task 1: Implement user service');
    expect(formatted).toContain('### Acceptance Criteria');
    expect(formatted).toContain('# Validation Guidelines');
  });

  test('should format a blueprint as JSON', () => {
    const jsonFormatter = new BlueprintFormatter({ format: 'json' });
    const formatted = jsonFormatter.formatBlueprint(blueprint, project);
    
    // Parse the JSON to verify it's valid
    const parsed = JSON.parse(formatted);
    
    expect(parsed).toHaveProperty('project');
    expect(parsed).toHaveProperty('blueprint');
    expect(parsed).toHaveProperty('architecture');
    expect(parsed).toHaveProperty('workflow');
    expect(parsed).toHaveProperty('tasks');
    
    expect(parsed.project).toHaveProperty('id', project.id);
    expect(parsed.project).toHaveProperty('name', project.name);
    expect(parsed.blueprint).toHaveProperty('id', blueprint.id);
    expect(parsed.architecture).toHaveProperty('components');
    expect(parsed.architecture.components).toHaveLength(2);
    expect(parsed.workflow).toHaveProperty('steps');
    expect(parsed.workflow.steps).toHaveLength(2);
    expect(parsed.tasks).toHaveLength(2);
  });

  test('should format a blueprint as XML', () => {
    const xmlFormatter = new BlueprintFormatter({ format: 'xml' });
    const formatted = xmlFormatter.formatBlueprint(blueprint, project);
    
    expect(formatted).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(formatted).toContain('<Blueprint>');
    expect(formatted).toContain('<Project>');
    expect(formatted).toContain(`<Name>${project.name}</Name>`);
    expect(formatted).toContain('<Architecture>');
    expect(formatted).toContain('<Components>');
    expect(formatted).toContain('<Component>');
    expect(formatted).toContain('<Name>User Service</Name>');
    expect(formatted).toContain('<Relationships>');
    expect(formatted).toContain('<Relationship>');
    expect(formatted).toContain('<Tasks>');
    expect(formatted).toContain('<Task>');
    expect(formatted).toContain('<Title>Implement user service</Title>');
    expect(formatted).toContain('<Workflow>');
    expect(formatted).toContain('<Steps>');
    expect(formatted).toContain('<Step>');
    expect(formatted).toContain('<Name>Set up project structure</Name>');
    expect(formatted).toContain('<Checkpoints>');
    expect(formatted).toContain('<Checkpoint>');
    expect(formatted).toContain('<Name>Initial setup complete</Name>');
    expect(formatted).toContain('</Blueprint>');
  });

  test('should format a task for LLM consumption', () => {
    const task = blueprint.tasks[0];
    const formatted = blueprintFormatter.formatTask(task, blueprint, project);
    
    expect(formatted).toContain(`# Task: ${task.title}`);
    expect(formatted).toContain(`## Description\n${task.description}`);
    expect(formatted).toContain('## Project Context');
    expect(formatted).toContain(`**Project:** ${project.name}`);
    expect(formatted).toContain('## Acceptance Criteria');
    expect(formatted).toContain('1. Service should handle user creation');
    expect(formatted).toContain('## Implementation Guide');
    expect(formatted).toContain('Implement using Node.js and Express');
  });

  test('should format a step for LLM consumption', () => {
    const step = blueprint.workflow.steps[0];
    const formatted = blueprintFormatter.formatStep(step, null, blueprint, project);
    
    expect(formatted).toContain(`# Step: ${step.name}`);
    expect(formatted).toContain(`## Description\n${step.description}`);
    expect(formatted).toContain('## Project Context');
    expect(formatted).toContain(`**Project:** ${project.name}`);
    expect(formatted).toContain('## Implementation Guidance');
    expect(formatted).toContain('1. Understand the requirements for this step');
  });

  test('should respect format options', () => {
    // Test with includeArchitecture = false
    const noArchitectureFormatter = new BlueprintFormatter({ includeArchitecture: false });
    const noArchitectureFormatted = noArchitectureFormatter.formatBlueprint(blueprint, project);
    expect(noArchitectureFormatted).not.toContain('# Architecture');
    
    // Test with includeWorkflow = false
    const noWorkflowFormatter = new BlueprintFormatter({ includeWorkflow: false });
    const noWorkflowFormatted = noWorkflowFormatter.formatBlueprint(blueprint, project);
    expect(noWorkflowFormatted).not.toContain('# Implementation Workflow');
    
    // Test with includeTasks = false
    const noTasksFormatter = new BlueprintFormatter({ includeTasks: false });
    const noTasksFormatted = noTasksFormatter.formatBlueprint(blueprint, project);
    expect(noTasksFormatted).not.toContain('# Tasks');
    
    // Test with includeValidation = false
    const noValidationFormatter = new BlueprintFormatter({ includeValidation: false });
    const noValidationFormatted = noValidationFormatter.formatBlueprint(blueprint, project);
    expect(noValidationFormatted).not.toContain('# Validation Guidelines');
  });

  test('should throw an error for invalid input', () => {
    expect(() => blueprintFormatter.formatBlueprint(null)).toThrow();
    expect(() => blueprintFormatter.formatTask(null)).toThrow();
    expect(() => blueprintFormatter.formatStep(null)).toThrow();
  });
});
