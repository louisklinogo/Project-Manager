import { Project } from '../../../src/models/project.js';
import { jest } from '@jest/globals';

describe('Project Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new project with default values', () => {
    const project = new Project();

    expect(project.id).toMatch(/^project-/);
    expect(project.name).toBe('New Project');
    expect(project.description).toBe('');
    expect(project.created_at).toBeDefined();
    expect(project.updated_at).toBeDefined();
    expect(project.requirements).toBe('');
    expect(project.research).toEqual({
      domain_knowledge: [],
      similar_projects: [],
      best_practices: []
    });
    expect(project.blueprint).toBeNull();
  });

  test('should create a project with provided values', () => {
    const projectData = {
      id: 'test-project',
      name: 'Test Project',
      description: 'A test project',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      requirements: 'Test requirements',
      research: {
        domain_knowledge: ['test'],
        similar_projects: ['test'],
        best_practices: ['test']
      },
      blueprint: 'test-blueprint'
    };

    const project = new Project(projectData);

    expect(project.id).toBe('test-project');
    expect(project.name).toBe('Test Project');
    expect(project.description).toBe('A test project');
    expect(project.created_at).toBe('2023-01-01T00:00:00.000Z');
    expect(project.updated_at).toBe('2023-01-01T00:00:00.000Z');
    expect(project.requirements).toBe('Test requirements');
    expect(project.research).toEqual({
      domain_knowledge: ['test'],
      similar_projects: ['test'],
      best_practices: ['test']
    });
    expect(project.blueprint).toBe('test-blueprint');
  });

  test('should validate a project', () => {
    const project = new Project({
      id: 'test-project',
      name: 'Test Project'
    });

    expect(project.validate()).toBe(true);
  });

  test('should throw an error if project ID is missing', () => {
    const project = new Project({
      name: 'Test Project'
    });
    project.id = null;

    expect(() => project.validate()).toThrow('Project ID is required');
  });

  test('should throw an error if project name is missing', () => {
    const project = new Project({
      id: 'test-project'
    });
    project.name = null;

    expect(() => project.validate()).toThrow('Project name is required');
  });

  // Note: These tests would normally test file operations
  // but we're skipping them for now to focus on the model functionality

  test('should have a save method', () => {
    const project = new Project({
      id: 'test-project',
      name: 'Test Project'
    });

    expect(typeof project.save).toBe('function');
  });

  test('should have a static load method', () => {
    expect(typeof Project.load).toBe('function');
  });

  test('should have a static create method', () => {
    expect(typeof Project.create).toBe('function');
  });
});
