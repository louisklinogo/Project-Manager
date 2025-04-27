/**
 * Dependency Visualizer Tests
 */

import { DependencyVisualizer } from '../../../src/utils/dependency-visualizer.js';

describe('DependencyVisualizer', () => {
  let visualizer;

  beforeEach(() => {
    visualizer = new DependencyVisualizer();
  });

  describe('visualizeDependencies', () => {
    test('should handle empty tasks', () => {
      const result = visualizer.visualizeDependencies([]);

      expect(result).toContain('No tasks');
    });

    test('should visualize dependencies in text format', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: [] }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      expect(result).toContain('Task 1');
      expect(result).toContain('Task 2');
      expect(result).toContain('Depends on');
    });

    test('should highlight circular dependencies', () => {
      visualizer = new DependencyVisualizer({ highlightCircularDependencies: true });

      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-1'] }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      expect(result).toContain('!');
      expect(result).toContain('circular dependency');
    });
  });

  describe('visualizeDependencies', () => {
    test('should generate a text dependency graph', () => {
      // Set the visualizer to show dependency graph
      visualizer = new DependencyVisualizer({
        format: 'text',
        showDependencyGraph: true
      });

      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: [] }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      // Check for task IDs and dependency relationships
      expect(result).toContain('task-1: Task 1');
      expect(result).toContain('task-2: Task 2');
      expect(result).toContain('Depends on');
    });

    test('should show dependent tasks', () => {
      // Set the visualizer to show dependency graph
      visualizer = new DependencyVisualizer({
        format: 'text',
        showDependencyGraph: true
      });

      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: [] }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      expect(result).toContain('Required by');
      expect(result).toContain('task-1');
    });
  });

  describe('visualizeDependencies with HTML format', () => {
    test('should generate an HTML dependency graph', () => {
      // Set the visualizer to show dependency graph with HTML format
      visualizer = new DependencyVisualizer({
        format: 'html',
        showDependencyGraph: true
      });

      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: [] }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      // Check for task IDs and HTML structure
      expect(result).toContain('<h1>Task Dependencies</h1>');
      expect(result).toContain('task-1');
      expect(result).toContain('task-2');
      expect(result).toContain('<div class="dependencies">');
      expect(result).toContain('<div class="dependents">');
    });

    test('should highlight circular dependencies in HTML', () => {
      // Set the visualizer to show dependency graph with HTML format and highlight circular dependencies
      visualizer = new DependencyVisualizer({
        format: 'html',
        showDependencyGraph: true,
        highlightCircularDependencies: true
      });

      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-1'] }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      expect(result).toContain('circular-dependency');
      expect(result).toContain('<div class="legend">');
    });
  });

  describe('visualizeDependencies with JSON format', () => {
    test('should generate a JSON representation', () => {
      // Set the visualizer to use JSON format
      visualizer = new DependencyVisualizer({
        format: 'json'
      });

      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: [] }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      // Parse the JSON result if it's a string
      const jsonResult = typeof result === 'string' ? JSON.parse(result) : result;

      // Check that it returns a valid JSON object with tasks
      expect(jsonResult).toHaveProperty('tasks');
      expect(jsonResult.tasks).toHaveLength(2);
      expect(jsonResult.tasks[0]).toHaveProperty('id', 'task-1');
      expect(jsonResult.tasks[1]).toHaveProperty('id', 'task-2');
      expect(jsonResult.tasks[0]).toHaveProperty('dependencies');
      expect(jsonResult.tasks[0].dependencies).toContain('task-2');
    });

    test('should include circular dependencies info in JSON', () => {
      // Set the visualizer to use JSON format with circular dependency highlighting
      visualizer = new DependencyVisualizer({
        format: 'json',
        highlightCircularDependencies: true
      });

      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-1'] }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      // Parse the JSON result if it's a string
      const jsonResult = typeof result === 'string' ? JSON.parse(result) : result;

      // Check that it includes circular dependency information
      expect(jsonResult).toHaveProperty('circular_dependencies');
      expect(jsonResult.tasks[0]).toHaveProperty('has_circular_dependency');
      expect(jsonResult.tasks[1]).toHaveProperty('has_circular_dependency');
    });
  });

  // We'll skip the private method tests since they're implementation details
  // and we're already testing the public API that uses them
  describe('internal implementation', () => {
    test('should handle task hierarchies correctly', () => {
      // Set the visualizer to use text format
      visualizer = new DependencyVisualizer({
        format: 'text'
      });

      const tasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          subtasks: [
            { id: 'subtask-1', title: 'Subtask 1' },
            { id: 'subtask-2', title: 'Subtask 2' }
          ]
        },
        { id: 'task-2', title: 'Task 2' }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      // Just check that it includes the parent task IDs
      expect(result).toContain('task-1');
      expect(result).toContain('task-2');
    });

    test('should detect circular dependencies correctly', () => {
      // Set the visualizer to show dependency graph with circular dependency highlighting
      visualizer = new DependencyVisualizer({
        format: 'text',
        showDependencyGraph: true,
        highlightCircularDependencies: true
      });

      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-1'] }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      // Check that it highlights circular dependencies
      expect(result).toContain('!');
      expect(result).toContain('circular dependency');
    });

    test('should detect longer circular dependency chains', () => {
      // Set the visualizer to show dependency graph with circular dependency highlighting
      visualizer = new DependencyVisualizer({
        format: 'text',
        showDependencyGraph: true,
        highlightCircularDependencies: true
      });

      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-3'] },
        { id: 'task-3', title: 'Task 3', dependencies: ['task-1'] }
      ];

      const result = visualizer.visualizeDependencies(tasks);

      // Check that it highlights circular dependencies
      expect(result).toContain('!');
      expect(result).toContain('circular dependency');
      expect(result).toContain('task-1');
      expect(result).toContain('task-2');
      expect(result).toContain('task-3');
    });
  });
});
