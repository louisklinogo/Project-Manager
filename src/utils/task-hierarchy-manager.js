/**
 * Task Hierarchy Manager
 *
 * This module provides utilities for managing task hierarchies.
 */

import { Task } from '../models/task.js';

/**
 * Task Hierarchy Manager class
 */
export class TaskHierarchyManager {
  /**
   * Create a new task hierarchy manager
   * @param {object} options - Manager options
   */
  constructor(options = {}) {
    this.options = {
      autoUpdateStatus: options.autoUpdateStatus !== false,
      autoUpdateCompletion: options.autoUpdateCompletion !== false,
      completedStatus: options.completedStatus || 'done',
      inProgressStatus: options.inProgressStatus || 'in-progress',
      ...options
    };
  }

  /**
   * Build a task hierarchy from a flat list of tasks
   * @param {Array} tasks - Flat list of tasks
   * @returns {Array} - Hierarchical list of tasks
   */
  buildHierarchy(tasks) {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    // Create a deep copy of tasks to avoid modifying the original
    const tasksCopy = JSON.parse(JSON.stringify(tasks));

    // Create a map of tasks by ID
    const taskMap = new Map();
    tasksCopy.forEach(task => {
      // Initialize subtasks array if it doesn't exist
      if (!task.subtasks) {
        task.subtasks = [];
      }
      taskMap.set(task.id, task);
    });

    // Build the hierarchy
    const rootTasks = [];

    // First pass: identify root tasks
    tasksCopy.forEach(task => {
      if (!task.parent_id) {
        rootTasks.push(task);
      }
    });

    // Second pass: add subtasks to their parents
    tasksCopy.forEach(task => {
      if (task.parent_id) {
        const parent = taskMap.get(task.parent_id);
        if (parent) {
          // Add this task as a subtask of its parent
          // Make sure we don't add duplicates
          if (!parent.subtasks.some(subtask => subtask.id === task.id)) {
            parent.subtasks.push(task);
          }
        } else {
          // Parent not found, treat as root task
          if (!rootTasks.some(rootTask => rootTask.id === task.id)) {
            rootTasks.push(task);
          }
        }
      }
    });

    return rootTasks;
  }

  /**
   * Flatten a task hierarchy
   * @param {Array} tasks - Hierarchical list of tasks
   * @returns {Array} - Flat list of tasks
   */
  flattenHierarchy(tasks) {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    const result = [];

    const flattenTask = (task) => {
      const { subtasks, ...taskWithoutSubtasks } = task;
      result.push(taskWithoutSubtasks);

      if (subtasks && subtasks.length > 0) {
        subtasks.forEach(subtask => flattenTask(subtask));
      }
    };

    tasks.forEach(task => flattenTask(task));

    return result;
  }

  /**
   * Update task statuses based on subtasks
   * @param {Array} tasks - Tasks to update
   * @returns {Array} - Updated tasks
   */
  updateTaskStatuses(tasks) {
    if (!tasks || tasks.length === 0) {
      return tasks;
    }

    // Create task instances
    const taskInstances = tasks.map(task => new Task(task));

    // Update statuses
    taskInstances.forEach(task => {
      task.updateStatusBasedOnSubtasks(
        this.options.completedStatus,
        this.options.inProgressStatus
      );
    });

    return taskInstances.map(task => ({
      ...task,
      subtasks: task.subtasks
    }));
  }

  /**
   * Update task completion percentages based on subtasks
   * @param {Array} tasks - Tasks to update
   * @returns {Array} - Updated tasks
   */
  updateTaskCompletionPercentages(tasks) {
    if (!tasks || tasks.length === 0) {
      return tasks;
    }

    // Create task instances
    const taskInstances = tasks.map(task => new Task(task));

    // Update completion percentages
    taskInstances.forEach(task => {
      task.updateCompletionPercentage(this.options.completedStatus);
    });

    return taskInstances.map(task => ({
      ...task,
      subtasks: task.subtasks
    }));
  }

  /**
   * Find tasks by criteria
   * @param {Array} tasks - Tasks to search
   * @param {object} criteria - Search criteria
   * @returns {Array} - Matching tasks
   */
  findTasks(tasks, criteria) {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    // Flatten the hierarchy for easier searching
    const flatTasks = this.flattenHierarchy(tasks);

    // Filter tasks by criteria
    return flatTasks.filter(task => {
      for (const [key, value] of Object.entries(criteria)) {
        if (task[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Find a task by ID
   * @param {Array} tasks - Tasks to search
   * @param {string} id - Task ID
   * @returns {object|null} - Task or null if not found
   */
  findTaskById(tasks, id) {
    if (!tasks || tasks.length === 0) {
      return null;
    }

    // Flatten the hierarchy for easier searching
    const flatTasks = this.flattenHierarchy(tasks);

    // Find the task by ID
    return flatTasks.find(task => task.id === id) || null;
  }

  /**
   * Move a task to a new parent
   * @param {Array} tasks - Tasks to update
   * @param {string} taskId - ID of the task to move
   * @param {string|null} newParentId - ID of the new parent (null for root)
   * @returns {Array} - Updated tasks
   */
  moveTask(tasks, taskId, newParentId) {
    if (!tasks || tasks.length === 0) {
      return tasks;
    }

    // Create a deep copy of the tasks to avoid modifying the original
    const tasksCopy = JSON.parse(JSON.stringify(tasks));

    // Flatten the hierarchy for easier manipulation
    const flatTasks = this.flattenHierarchy(tasksCopy);

    // Find the task to move
    const taskToMove = flatTasks.find(task => task.id === taskId);
    if (!taskToMove) {
      return tasksCopy;
    }

    // Update the parent ID
    taskToMove.parent_id = newParentId;

    // Rebuild the hierarchy
    return this.buildHierarchy(flatTasks);
  }

  /**
   * Reorder subtasks
   * @param {Array} tasks - Tasks to update
   * @param {string} parentId - ID of the parent task
   * @param {Array} subtaskIds - New order of subtask IDs
   * @returns {Array} - Updated tasks
   */
  reorderSubtasks(tasks, parentId, subtaskIds) {
    if (!tasks || tasks.length === 0) {
      return tasks;
    }

    // Create a deep copy of the tasks to avoid modifying the original
    const tasksCopy = JSON.parse(JSON.stringify(tasks));

    // Find the parent task directly (no need to flatten for this operation)
    const parentTask = tasksCopy.find(task => task.id === parentId);
    if (!parentTask || !parentTask.subtasks || parentTask.subtasks.length === 0) {
      return tasksCopy;
    }

    // Create a map of subtasks by ID
    const subtaskMap = new Map();
    parentTask.subtasks.forEach(subtask => {
      subtaskMap.set(subtask.id, subtask);
    });

    // Reorder subtasks
    parentTask.subtasks = subtaskIds
      .map(id => subtaskMap.get(id))
      .filter(Boolean);

    return tasksCopy;
  }

  /**
   * Check for circular dependencies in a task hierarchy
   * @param {Array} tasks - Tasks to check
   * @returns {Array} - Tasks with circular dependencies
   */
  findCircularDependencies(tasks) {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    // Flatten the hierarchy for easier checking
    const flatTasks = this.flattenHierarchy(tasks);

    // Create task instances
    const taskInstances = flatTasks.map(task => new Task(task));

    // Find tasks with circular dependencies
    return taskInstances
      .filter(task => task.hasCircularDependencies(taskInstances))
      .map(task => task.id);
  }

  /**
   * Get the critical path of tasks
   * @param {Array} tasks - Tasks to analyze
   * @returns {Array} - Tasks on the critical path
   */
  getCriticalPath(tasks) {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    // Flatten the hierarchy for easier analysis
    const flatTasks = this.flattenHierarchy(tasks);

    // Create a graph of task dependencies
    const graph = new Map();
    flatTasks.forEach(task => {
      graph.set(task.id, task.dependencies || []);
    });

    // Find all paths
    const paths = [];

    const findPaths = (taskId, path = []) => {
      path.push(taskId);

      const dependencies = graph.get(taskId) || [];
      if (dependencies.length === 0) {
        // This is a start node, save the path
        paths.push([...path].reverse());
      } else {
        // Continue traversing
        dependencies.forEach(depId => {
          if (!path.includes(depId)) {
            findPaths(depId, [...path]);
          }
        });
      }
    };

    // Find end nodes (tasks that no other tasks depend on)
    const endNodes = flatTasks.filter(task => {
      return !flatTasks.some(t =>
        t.dependencies && t.dependencies.includes(task.id)
      );
    });

    // Find paths from each end node
    endNodes.forEach(task => {
      findPaths(task.id);
    });

    // Find the longest path
    let criticalPath = [];
    let maxLength = 0;

    paths.forEach(path => {
      if (path.length > maxLength) {
        maxLength = path.length;
        criticalPath = path;
      }
    });

    // Return the tasks on the critical path
    return criticalPath.map(taskId =>
      flatTasks.find(task => task.id === taskId)
    ).filter(Boolean);
  }

  /**
   * Get the task depth in the hierarchy
   * @param {object} task - Task to check
   * @param {Array} allTasks - All tasks
   * @returns {number} - Depth (0 for root tasks)
   */
  getTaskDepth(task, allTasks) {
    if (!task) {
      return -1;
    }

    let depth = 0;
    let currentTask = task;

    while (currentTask.parent_id) {
      depth++;
      currentTask = allTasks.find(t => t.id === currentTask.parent_id);
      if (!currentTask) {
        break;
      }
    }

    return depth;
  }

  /**
   * Get all ancestors of a task
   * @param {object} task - Task to check
   * @param {Array} allTasks - All tasks
   * @returns {Array} - Ancestor tasks
   */
  getTaskAncestors(task, allTasks) {
    if (!task || !task.parent_id) {
      return [];
    }

    const ancestors = [];
    let currentTask = task;

    while (currentTask.parent_id) {
      const parent = allTasks.find(t => t.id === currentTask.parent_id);
      if (!parent) {
        break;
      }
      ancestors.push(parent);
      currentTask = parent;
    }

    return ancestors;
  }

  /**
   * Get all descendants of a task
   * @param {object} task - Task to check
   * @param {Array} allTasks - All tasks
   * @returns {Array} - Descendant tasks
   */
  getTaskDescendants(task, allTasks) {
    if (!task) {
      return [];
    }

    const descendants = [];

    // Find direct subtasks
    const subtasks = allTasks.filter(t => t.parent_id === task.id);

    // Add subtasks and their descendants
    subtasks.forEach(subtask => {
      descendants.push(subtask);
      descendants.push(...this.getTaskDescendants(subtask, allTasks));
    });

    return descendants;
  }

  /**
   * Get the task path in the hierarchy
   * @param {object} task - Task to check
   * @param {Array} allTasks - All tasks
   * @returns {Array} - Path from root to task
   */
  getTaskPath(task, allTasks) {
    if (!task) {
      return [];
    }

    const path = [task];
    const ancestors = this.getTaskAncestors(task, allTasks);

    return [...ancestors.reverse(), ...path];
  }

  /**
   * Get the task path as a string
   * @param {object} task - Task to check
   * @param {Array} allTasks - All tasks
   * @param {string} separator - Path separator
   * @returns {string} - Path string
   */
  getTaskPathString(task, allTasks, separator = ' > ') {
    const path = this.getTaskPath(task, allTasks);
    return path.map(t => t.title).join(separator);
  }
}
