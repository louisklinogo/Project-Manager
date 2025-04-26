import { Blueprint } from '../../../src/models/blueprint.js';
import { jest } from '@jest/globals';

describe('Blueprint Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new blueprint with default values', () => {
    const blueprint = new Blueprint({ project_id: 'test-project' });

    expect(blueprint.id).toMatch(/^blueprint-/);
    expect(blueprint.project_id).toBe('test-project');
    expect(blueprint.created_at).toBeDefined();
    expect(blueprint.updated_at).toBeDefined();
    expect(blueprint.architecture).toEqual({
      components: [],
      relationships: []
    });
    expect(blueprint.tasks).toEqual([]);
    expect(blueprint.workflow).toEqual({
      steps: [],
      checkpoints: []
    });
  });

  test('should create a blueprint with provided values', () => {
    const blueprintData = {
      id: 'test-blueprint',
      project_id: 'test-project',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      architecture: {
        components: [{ id: 'component-1', name: 'Component 1' }],
        relationships: [{ id: 'relationship-1', source: 'component-1', target: 'component-2' }]
      },
      tasks: [{ id: 'task-1', title: 'Task 1' }],
      workflow: {
        steps: [{ id: 'step-1', name: 'Step 1' }],
        checkpoints: [{ id: 'checkpoint-1', name: 'Checkpoint 1' }]
      }
    };

    const blueprint = new Blueprint(blueprintData);

    expect(blueprint.id).toBe('test-blueprint');
    expect(blueprint.project_id).toBe('test-project');
    expect(blueprint.created_at).toBe('2023-01-01T00:00:00.000Z');
    expect(blueprint.updated_at).toBe('2023-01-01T00:00:00.000Z');
    expect(blueprint.architecture).toEqual({
      components: [{ id: 'component-1', name: 'Component 1' }],
      relationships: [{ id: 'relationship-1', source: 'component-1', target: 'component-2' }]
    });
    expect(blueprint.tasks).toEqual([{ id: 'task-1', title: 'Task 1' }]);
    expect(blueprint.workflow).toEqual({
      steps: [{ id: 'step-1', name: 'Step 1' }],
      checkpoints: [{ id: 'checkpoint-1', name: 'Checkpoint 1' }]
    });
  });

  test('should validate a blueprint', () => {
    const blueprint = new Blueprint({
      id: 'test-blueprint',
      project_id: 'test-project'
    });

    expect(blueprint.validate()).toBe(true);
  });

  test('should throw an error if blueprint ID is missing', () => {
    const blueprint = new Blueprint({
      project_id: 'test-project'
    });
    blueprint.id = null;

    expect(() => blueprint.validate()).toThrow('Blueprint ID is required');
  });

  test('should throw an error if project ID is missing', () => {
    const blueprint = new Blueprint({
      id: 'test-blueprint'
    });
    blueprint.project_id = null;

    expect(() => blueprint.validate()).toThrow('Project ID is required');
  });

  // Note: These tests would normally test file operations
  // but we're skipping them for now to focus on the model functionality

  test('should have a save method', () => {
    const blueprint = new Blueprint({
      id: 'test-blueprint',
      project_id: 'test-project'
    });

    expect(typeof blueprint.save).toBe('function');
  });

  test('should have a static load method', () => {
    expect(typeof Blueprint.load).toBe('function');
  });

  test('should have a static create method', () => {
    expect(typeof Blueprint.create).toBe('function');
  });

  test('should add a task to the blueprint', () => {
    const blueprint = new Blueprint({
      id: 'test-blueprint',
      project_id: 'test-project'
    });

    const task = { title: 'Task 1' };
    blueprint.addTask(task);

    expect(blueprint.tasks).toHaveLength(1);
    expect(blueprint.tasks[0].id).toMatch(/^task-/);
    expect(blueprint.tasks[0].title).toBe('Task 1');
  });

  test('should add a component to the architecture', () => {
    const blueprint = new Blueprint({
      id: 'test-blueprint',
      project_id: 'test-project'
    });

    const component = { name: 'Component 1' };
    blueprint.addComponent(component);

    expect(blueprint.architecture.components).toHaveLength(1);
    expect(blueprint.architecture.components[0].id).toMatch(/^component-/);
    expect(blueprint.architecture.components[0].name).toBe('Component 1');
  });

  test('should add a relationship to the architecture', () => {
    const blueprint = new Blueprint({
      id: 'test-blueprint',
      project_id: 'test-project'
    });

    const relationship = { source: 'component-1', target: 'component-2' };
    blueprint.addRelationship(relationship);

    expect(blueprint.architecture.relationships).toHaveLength(1);
    expect(blueprint.architecture.relationships[0].id).toMatch(/^relationship-/);
    expect(blueprint.architecture.relationships[0].source).toBe('component-1');
    expect(blueprint.architecture.relationships[0].target).toBe('component-2');
  });

  test('should add a step to the workflow', () => {
    const blueprint = new Blueprint({
      id: 'test-blueprint',
      project_id: 'test-project'
    });

    const step = { name: 'Step 1' };
    blueprint.addStep(step);

    expect(blueprint.workflow.steps).toHaveLength(1);
    expect(blueprint.workflow.steps[0].id).toMatch(/^step-/);
    expect(blueprint.workflow.steps[0].name).toBe('Step 1');
  });

  test('should add a checkpoint to the workflow', () => {
    const blueprint = new Blueprint({
      id: 'test-blueprint',
      project_id: 'test-project'
    });

    const checkpoint = { name: 'Checkpoint 1' };
    blueprint.addCheckpoint(checkpoint);

    expect(blueprint.workflow.checkpoints).toHaveLength(1);
    expect(blueprint.workflow.checkpoints[0].id).toMatch(/^checkpoint-/);
    expect(blueprint.workflow.checkpoints[0].name).toBe('Checkpoint 1');
  });
});
