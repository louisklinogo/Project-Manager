/**
 * Task Hierarchy Manager tests
 */

import { jest } from '@jest/globals';
import { TaskHierarchyManager } from '../../../src/utils/task-hierarchy-manager.js';

describe('TaskHierarchyManager', () => {
  let manager;
  let tasks;

  beforeEach(() => {
    manager = new TaskHierarchyManager();

    tasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        status: 'pending',
        subtasks: []
      },
      {
        id: 'task-2',
        title: 'Task 2',
        status: 'pending',
        parent_id: 'task-1',
        subtasks: []
      },
      {
        id: 'task-3',
        title: 'Task 3',
        status: 'pending',
        parent_id: 'task-1',
        subtasks: []
      },
      {
        id: 'task-4',
        title: 'Task 4',
        status: 'pending',
        subtasks: []
      },
      {
        id: 'task-5',
        title: 'Task 5',
        status: 'pending',
        parent_id: 'task-4',
        subtasks: []
      }
    ];
  });

  test('should create a new instance with default options', () => {
    expect(manager).toBeInstanceOf(TaskHierarchyManager);
    expect(manager.options).toHaveProperty('autoUpdateStatus', true);
    expect(manager.options).toHaveProperty('autoUpdateCompletion', true);
    expect(manager.options).toHaveProperty('completedStatus', 'done');
    expect(manager.options).toHaveProperty('inProgressStatus', 'in-progress');
  });

  test('should build a task hierarchy from a flat list', () => {
    const hierarchy = manager.buildHierarchy(tasks);

    expect(hierarchy).toHaveLength(2); // Two root tasks

    // Check first root task
    expect(hierarchy[0]).toHaveProperty('id', 'task-1');
    expect(hierarchy[0]).toHaveProperty('subtasks');
    expect(hierarchy[0].subtasks).toHaveLength(2);
    expect(hierarchy[0].subtasks[0]).toHaveProperty('id', 'task-2');
    expect(hierarchy[0].subtasks[1]).toHaveProperty('id', 'task-3');

    // Check second root task
    expect(hierarchy[1]).toHaveProperty('id', 'task-4');
    expect(hierarchy[1]).toHaveProperty('subtasks');
    expect(hierarchy[1].subtasks).toHaveLength(1);
    expect(hierarchy[1].subtasks[0]).toHaveProperty('id', 'task-5');
  });

  test('should flatten a task hierarchy', () => {
    // Build hierarchy first
    const hierarchy = manager.buildHierarchy(tasks);

    // Then flatten it
    const flattened = manager.flattenHierarchy(hierarchy);

    expect(flattened).toHaveLength(5); // All tasks

    // Check that all tasks are present
    expect(flattened).toContainEqual(expect.objectContaining({ id: 'task-1' }));
    expect(flattened).toContainEqual(expect.objectContaining({ id: 'task-2' }));
    expect(flattened).toContainEqual(expect.objectContaining({ id: 'task-3' }));
    expect(flattened).toContainEqual(expect.objectContaining({ id: 'task-4' }));
    expect(flattened).toContainEqual(expect.objectContaining({ id: 'task-5' }));
  });

  test('should update task statuses based on subtasks', () => {
    // Create a hierarchy with subtasks
    const hierarchyTasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        status: 'pending',
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Subtask 1',
            status: 'done'
          },
          {
            id: 'subtask-2',
            title: 'Subtask 2',
            status: 'pending'
          }
        ]
      },
      {
        id: 'task-2',
        title: 'Task 2',
        status: 'pending',
        subtasks: [
          {
            id: 'subtask-3',
            title: 'Subtask 3',
            status: 'done'
          },
          {
            id: 'subtask-4',
            title: 'Subtask 4',
            status: 'done'
          }
        ]
      }
    ];

    const updated = manager.updateTaskStatuses(hierarchyTasks);

    // Check that statuses were updated
    expect(updated[0]).toHaveProperty('status', 'in-progress'); // One subtask done, one pending
    expect(updated[1]).toHaveProperty('status', 'done'); // All subtasks done
  });

  test('should update task completion percentages based on subtasks', () => {
    // Create a hierarchy with subtasks
    const hierarchyTasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        status: 'pending',
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Subtask 1',
            status: 'done'
          },
          {
            id: 'subtask-2',
            title: 'Subtask 2',
            status: 'pending'
          }
        ]
      },
      {
        id: 'task-2',
        title: 'Task 2',
        status: 'pending',
        subtasks: [
          {
            id: 'subtask-3',
            title: 'Subtask 3',
            status: 'done'
          },
          {
            id: 'subtask-4',
            title: 'Subtask 4',
            status: 'done'
          }
        ]
      }
    ];

    const updated = manager.updateTaskCompletionPercentages(hierarchyTasks);

    // Check that completion percentages were updated
    expect(updated[0]).toHaveProperty('completion_percentage', 50); // One out of two subtasks done
    expect(updated[1]).toHaveProperty('completion_percentage', 100); // All subtasks done
  });

  test('should find tasks by criteria', () => {
    const found = manager.findTasks(tasks, { status: 'pending', parent_id: 'task-1' });

    expect(found).toHaveLength(2);
    expect(found).toContainEqual(expect.objectContaining({ id: 'task-2' }));
    expect(found).toContainEqual(expect.objectContaining({ id: 'task-3' }));
  });

  test('should find a task by ID', () => {
    const found = manager.findTaskById(tasks, 'task-3');

    expect(found).toHaveProperty('id', 'task-3');
    expect(found).toHaveProperty('title', 'Task 3');

    // Test not found
    const notFound = manager.findTaskById(tasks, 'non-existent');
    expect(notFound).toBeNull();
  });

  test('should move a task to a new parent', () => {
    const updated = manager.moveTask(tasks, 'task-3', 'task-4');

    // Build hierarchy to check the result
    const hierarchy = manager.buildHierarchy(updated);

    // Check that task-3 is now under task-4
    expect(hierarchy).toHaveLength(2); // Still two root tasks

    // Check first root task
    expect(hierarchy[0]).toHaveProperty('id', 'task-1');
    expect(hierarchy[0].subtasks).toHaveLength(1); // Now only one subtask
    expect(hierarchy[0].subtasks[0]).toHaveProperty('id', 'task-2');

    // Check second root task
    expect(hierarchy[1]).toHaveProperty('id', 'task-4');
    expect(hierarchy[1].subtasks).toHaveLength(2); // Now two subtasks
    expect(hierarchy[1].subtasks).toContainEqual(expect.objectContaining({ id: 'task-5' }));
    expect(hierarchy[1].subtasks).toContainEqual(expect.objectContaining({ id: 'task-3' }));
  });

  test('should reorder subtasks', () => {
    // Create a hierarchy with subtasks
    const hierarchyTasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Subtask 1'
          },
          {
            id: 'subtask-2',
            title: 'Subtask 2'
          },
          {
            id: 'subtask-3',
            title: 'Subtask 3'
          }
        ]
      }
    ];

    // Reorder subtasks
    const updated = manager.reorderSubtasks(hierarchyTasks, 'task-1', ['subtask-3', 'subtask-1', 'subtask-2']);

    // Check the new order
    expect(updated[0].subtasks[0]).toHaveProperty('id', 'subtask-3');
    expect(updated[0].subtasks[1]).toHaveProperty('id', 'subtask-1');
    expect(updated[0].subtasks[2]).toHaveProperty('id', 'subtask-2');
  });

  test('should find circular dependencies', () => {
    // Create tasks with circular dependencies
    const circularTasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        dependencies: ['task-3']
      },
      {
        id: 'task-2',
        title: 'Task 2',
        dependencies: ['task-1']
      },
      {
        id: 'task-3',
        title: 'Task 3',
        dependencies: ['task-2']
      }
    ];

    const circular = manager.findCircularDependencies(circularTasks);

    expect(circular).toHaveLength(3);
    // The return format has changed to include more information
    expect(circular.some(item => item.taskId === 'task-1')).toBe(true);
    expect(circular.some(item => item.taskId === 'task-2')).toBe(true);
    expect(circular.some(item => item.taskId === 'task-3')).toBe(true);
  });

  test('should get the critical path', () => {
    // Create tasks with dependencies
    const dependencyTasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        dependencies: []
      },
      {
        id: 'task-2',
        title: 'Task 2',
        dependencies: ['task-1']
      },
      {
        id: 'task-3',
        title: 'Task 3',
        dependencies: ['task-2']
      },
      {
        id: 'task-4',
        title: 'Task 4',
        dependencies: ['task-1']
      }
    ];

    const criticalPath = manager.getCriticalPath(dependencyTasks);

    expect(criticalPath).toHaveLength(3);
    expect(criticalPath[0]).toHaveProperty('id', 'task-1');
    expect(criticalPath[1]).toHaveProperty('id', 'task-2');
    expect(criticalPath[2]).toHaveProperty('id', 'task-3');
  });

  test('should get task depth', () => {
    // Build hierarchy first
    const hierarchy = manager.buildHierarchy(tasks);

    // Get depths
    const rootDepth = manager.getTaskDepth(tasks[0], tasks);
    const childDepth = manager.getTaskDepth(tasks[1], tasks);

    expect(rootDepth).toBe(0);
    expect(childDepth).toBe(1);
  });

  test('should get task ancestors', () => {
    const ancestors = manager.getTaskAncestors(tasks[1], tasks);

    expect(ancestors).toHaveLength(1);
    expect(ancestors[0]).toHaveProperty('id', 'task-1');
  });

  test('should get task descendants', () => {
    const descendants = manager.getTaskDescendants(tasks[0], tasks);

    expect(descendants).toHaveLength(2);
    expect(descendants).toContainEqual(expect.objectContaining({ id: 'task-2' }));
    expect(descendants).toContainEqual(expect.objectContaining({ id: 'task-3' }));
  });

  test('should get task path', () => {
    const path = manager.getTaskPath(tasks[1], tasks);

    expect(path).toHaveLength(2);
    expect(path[0]).toHaveProperty('id', 'task-1');
    expect(path[1]).toHaveProperty('id', 'task-2');
  });

  test('should get task path as string', () => {
    const pathString = manager.getTaskPathString(tasks[1], tasks);

    expect(pathString).toBe('Task 1 > Task 2');
  });
});
