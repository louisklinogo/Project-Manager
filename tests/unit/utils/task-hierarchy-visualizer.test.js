/**
 * Task Hierarchy Visualizer tests
 */

import { jest } from '@jest/globals';
import { TaskHierarchyVisualizer } from '../../../src/utils/task-hierarchy-visualizer.js';

describe('TaskHierarchyVisualizer', () => {
  let visualizer;
  let tasks;

  beforeEach(() => {
    visualizer = new TaskHierarchyVisualizer();
    
    tasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        description: 'Task 1 Description',
        status: 'pending',
        priority: 'high',
        completion_percentage: 50,
        dependencies: [],
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Subtask 1',
            description: 'Subtask 1 Description',
            status: 'done',
            priority: 'medium',
            completion_percentage: 100
          },
          {
            id: 'subtask-2',
            title: 'Subtask 2',
            description: 'Subtask 2 Description',
            status: 'pending',
            priority: 'low',
            completion_percentage: 0
          }
        ]
      },
      {
        id: 'task-2',
        title: 'Task 2',
        description: 'Task 2 Description',
        status: 'in-progress',
        priority: 'medium',
        completion_percentage: 25,
        dependencies: ['task-1'],
        subtasks: []
      }
    ];
  });

  test('should create a new instance with default options', () => {
    expect(visualizer).toBeInstanceOf(TaskHierarchyVisualizer);
    expect(visualizer.options).toHaveProperty('indentSize', 2);
    expect(visualizer.options).toHaveProperty('showStatus', true);
    expect(visualizer.options).toHaveProperty('showPriority', true);
    expect(visualizer.options).toHaveProperty('showCompletionPercentage', true);
    expect(visualizer.options).toHaveProperty('showDependencies', true);
    expect(visualizer.options).toHaveProperty('format', 'text');
  });

  test('should generate a text hierarchy', () => {
    const text = visualizer.generateTextHierarchy(tasks);
    
    expect(text).toContain('Task 1');
    expect(text).toContain('Subtask 1');
    expect(text).toContain('Subtask 2');
    expect(text).toContain('Task 2');
    expect(text).toContain('[pending]');
    expect(text).toContain('[done]');
    expect(text).toContain('(high)');
    expect(text).toContain('(medium)');
    expect(text).toContain('50%');
    expect(text).toContain('Dependencies:');
  });

  test('should generate a Markdown hierarchy', () => {
    visualizer.options.format = 'markdown';
    const markdown = visualizer.generateMarkdownHierarchy(tasks);
    
    expect(markdown).toContain('# Task Hierarchy');
    expect(markdown).toContain('## Task 1');
    expect(markdown).toContain('### Subtask 1');
    expect(markdown).toContain('### Subtask 2');
    expect(markdown).toContain('## Task 2');
    expect(markdown).toContain('`pending`');
    expect(markdown).toContain('`done`');
    expect(markdown).toContain('*high*');
    expect(markdown).toContain('*medium*');
    expect(markdown).toContain('**Completion:** 50%');
    expect(markdown).toContain('**Dependencies:**');
  });

  test('should generate an HTML hierarchy', () => {
    visualizer.options.format = 'html';
    const html = visualizer.generateHTMLHierarchy(tasks);
    
    expect(html).toContain('<div class="task-hierarchy">');
    expect(html).toContain('<ul class="task-list">');
    expect(html).toContain('<li class="task-item">');
    expect(html).toContain('<span class="task-title">Task 1</span>');
    expect(html).toContain('<span class="task-status pending">pending</span>');
    expect(html).toContain('<span class="task-priority high">high</span>');
    expect(html).toContain('<div class="progress-bar" style="width: 50%"></div>');
    expect(html).toContain('<span class="progress-text">50%</span>');
    expect(html).toContain('<div class="task-description">Task 1 Description</div>');
    expect(html).toContain('<ul class="subtask-list">');
    expect(html).toContain('<span class="task-title">Subtask 1</span>');
    expect(html).toContain('<div class="task-dependencies">');
  });

  test('should generate a JSON hierarchy', () => {
    visualizer.options.format = 'json';
    const json = visualizer.generateJSONHierarchy(tasks);
    
    expect(json).toHaveProperty('tasks');
    expect(json.tasks).toHaveLength(2);
    
    // Check first task
    expect(json.tasks[0]).toHaveProperty('id', 'task-1');
    expect(json.tasks[0]).toHaveProperty('title', 'Task 1');
    expect(json.tasks[0]).toHaveProperty('description', 'Task 1 Description');
    expect(json.tasks[0]).toHaveProperty('status', 'pending');
    expect(json.tasks[0]).toHaveProperty('priority', 'high');
    expect(json.tasks[0]).toHaveProperty('completion_percentage', 50);
    expect(json.tasks[0]).toHaveProperty('subtasks');
    expect(json.tasks[0].subtasks).toHaveLength(2);
    
    // Check second task
    expect(json.tasks[1]).toHaveProperty('id', 'task-2');
    expect(json.tasks[1]).toHaveProperty('title', 'Task 2');
    expect(json.tasks[1]).toHaveProperty('dependencies');
    expect(json.tasks[1].dependencies).toHaveLength(1);
    expect(json.tasks[1].dependencies[0]).toHaveProperty('id', 'task-1');
  });

  test('should visualize tasks in the specified format', () => {
    // Test text format
    visualizer.options.format = 'text';
    let result = visualizer.visualize(tasks);
    expect(typeof result).toBe('string');
    expect(result).toContain('Task 1');
    
    // Test markdown format
    visualizer.options.format = 'markdown';
    result = visualizer.visualize(tasks);
    expect(typeof result).toBe('string');
    expect(result).toContain('# Task Hierarchy');
    
    // Test HTML format
    visualizer.options.format = 'html';
    result = visualizer.visualize(tasks);
    expect(typeof result).toBe('string');
    expect(result).toContain('<div class="task-hierarchy">');
    
    // Test JSON format
    visualizer.options.format = 'json';
    result = visualizer.visualize(tasks);
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('tasks');
  });

  test('should handle empty task list', () => {
    // Test text format
    visualizer.options.format = 'text';
    let result = visualizer.visualize([]);
    expect(result).toBe('No tasks');
    
    // Test markdown format
    visualizer.options.format = 'markdown';
    result = visualizer.visualize([]);
    expect(result).toBe('# No tasks');
    
    // Test HTML format
    visualizer.options.format = 'html';
    result = visualizer.visualize([]);
    expect(result).toBe('<div class="task-hierarchy"><p>No tasks</p></div>');
    
    // Test JSON format
    visualizer.options.format = 'json';
    result = visualizer.visualize([]);
    expect(result).toHaveProperty('tasks');
    expect(result.tasks).toHaveLength(0);
  });

  test('should respect visualization options', () => {
    // Create visualizer with custom options
    const customVisualizer = new TaskHierarchyVisualizer({
      indentSize: 4,
      showStatus: false,
      showPriority: false,
      showCompletionPercentage: false,
      showDependencies: false,
      format: 'text'
    });
    
    const text = customVisualizer.generateTextHierarchy(tasks);
    
    // Check that options are respected
    expect(text).toContain('Task 1');
    expect(text).not.toContain('[pending]');
    expect(text).not.toContain('(high)');
    expect(text).not.toContain('50%');
    expect(text).not.toContain('Dependencies:');
  });
});
