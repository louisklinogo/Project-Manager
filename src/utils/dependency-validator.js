/**
 * Dependency Validator
 *
 * This module provides utilities for validating task dependencies.
 */

/**
 * Dependency Validator class
 */
export class DependencyValidator {
  /**
   * Create a new dependency validator
   * @param {object} options - Validator options
   */
  constructor(options = {}) {
    this.options = {
      allowSelfDependencies: false,
      allowCircularDependencies: false,
      ...options
    };
  }

  /**
   * Validate dependencies for a list of tasks
   * @param {Array} tasks - Tasks to validate
   * @returns {object} - Validation result with valid flag and issues array
   */
  validateDependencies(tasks) {
    if (!tasks || tasks.length === 0) {
      return { valid: true, issues: [] };
    }

    const issues = [];

    // Check for missing dependencies
    const missingDependencyIssues = this.findMissingDependencies(tasks);
    issues.push(...missingDependencyIssues);

    // Check for self-dependencies
    if (!this.options.allowSelfDependencies) {
      const selfDependencyIssues = this.findSelfDependencies(tasks);
      issues.push(...selfDependencyIssues);
    }

    // Check for circular dependencies
    if (!this.options.allowCircularDependencies) {
      const circularDependencyIssues = this.findCircularDependencies(tasks);
      issues.push(...circularDependencyIssues);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Find missing dependencies
   * @param {Array} tasks - Tasks to check
   * @returns {Array} - Issues with missing dependencies
   */
  findMissingDependencies(tasks) {
    const issues = [];
    const taskIds = new Set(tasks.map(task => task.id));

    // Check each task's dependencies
    tasks.forEach(task => {
      if (!task.dependencies || task.dependencies.length === 0) {
        return;
      }

      task.dependencies.forEach(depId => {
        if (!taskIds.has(depId)) {
          issues.push({
            type: 'missing_dependency',
            taskId: task.id,
            dependencyId: depId,
            message: `Task ${task.id} depends on non-existent task ${depId}`
          });
        }
      });

      // Check subtasks if present
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          if (!subtask.dependencies || subtask.dependencies.length === 0) {
            return;
          }

          subtask.dependencies.forEach(depId => {
            // If the dependency is a string, it might be a reference to another task
            // If it's a number, it might be a reference to another subtask of the same parent
            if (typeof depId === 'string' && !taskIds.has(depId)) {
              issues.push({
                type: 'missing_dependency',
                taskId: `${task.id}.${subtask.id}`,
                dependencyId: depId,
                message: `Subtask ${task.id}.${subtask.id} depends on non-existent task ${depId}`
              });
            } else if (typeof depId === 'string' || typeof depId === 'number') {
              // Convert to string for comparison if needed
              const depIdStr = depId.toString();

              // Check if the subtask exists in the parent task
              const subtaskExists = task.subtasks.some(st =>
                st.id === depId || st.id === depIdStr || st.id.toString() === depIdStr
              );

              if (!subtaskExists) {
                issues.push({
                  type: 'missing_dependency',
                  taskId: `${task.id}.${subtask.id}`,
                  dependencyId: `${task.id}.${depId}`,
                  message: `Subtask ${task.id}.${subtask.id} depends on non-existent subtask ${task.id}.${depId}`
                });
              }
            }
          });
        });
      }
    });

    return issues;
  }

  /**
   * Find self-dependencies
   * @param {Array} tasks - Tasks to check
   * @returns {Array} - Issues with self-dependencies
   */
  findSelfDependencies(tasks) {
    const issues = [];

    // Check each task for self-dependencies
    tasks.forEach(task => {
      if (!task.dependencies || task.dependencies.length === 0) {
        return;
      }

      if (task.dependencies.includes(task.id)) {
        issues.push({
          type: 'self_dependency',
          taskId: task.id,
          message: `Task ${task.id} depends on itself`
        });
      }

      // Check subtasks if present
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          if (!subtask.dependencies || subtask.dependencies.length === 0) {
            return;
          }

          // Check for self-dependencies in subtasks
          const subtaskId = subtask.id;
          const hasSelfDependency = subtask.dependencies.some(depId => {
            if (typeof depId === 'string' && typeof subtaskId === 'string') {
              return depId === subtaskId;
            } else if (typeof depId === 'number' && typeof subtaskId === 'number') {
              return depId === subtaskId;
            } else {
              // Convert to string for comparison
              return depId.toString() === subtaskId.toString();
            }
          });

          if (hasSelfDependency) {
            issues.push({
              type: 'self_dependency',
              taskId: `${task.id}.${subtask.id}`,
              message: `Subtask ${task.id}.${subtask.id} depends on itself`
            });
          }
        });
      }
    });

    return issues;
  }

  /**
   * Find circular dependencies
   * @param {Array} tasks - Tasks to check
   * @returns {Array} - Issues with circular dependencies
   */
  findCircularDependencies(tasks) {
    const issues = [];
    const visited = new Map();
    const recStack = new Map();

    // Helper function to check for cycles using DFS
    const hasCycle = (taskId, path = []) => {
      // If we've already determined this task doesn't have cycles, return false
      if (visited.get(taskId) === true) {
        return false;
      }

      // If we're already visiting this task in the current path, we found a cycle
      if (recStack.get(taskId) === true) {
        return { cycle: true, path: [...path, taskId] };
      }

      // Mark the current task as being visited
      visited.set(taskId, false);
      recStack.set(taskId, true);
      path.push(taskId);

      // Find the task
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        // Task not found, can't have cycles
        visited.set(taskId, true);
        recStack.set(taskId, false);
        path.pop();
        return false;
      }

      // Check each dependency
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          const result = hasCycle(depId, [...path]);
          if (result && result.cycle) {
            // We found a cycle
            visited.set(taskId, true);
            recStack.set(taskId, false);
            return result;
          }
        }
      }

      // No cycles found for this task
      visited.set(taskId, true);
      recStack.set(taskId, false);
      path.pop();
      return false;
    };

    // Check each task for circular dependencies
    tasks.forEach(task => {
      const result = hasCycle(task.id);
      if (result && result.cycle) {
        // Format the cycle path for the error message
        const cyclePath = result.path.join(' -> ');

        issues.push({
          type: 'circular_dependency',
          taskId: task.id,
          path: result.path,
          message: `Task ${task.id} is part of a circular dependency chain: ${cyclePath}`
        });
      }
    });

    return issues;
  }

  /**
   * Check if a task has circular dependencies
   * @param {Array} tasks - All tasks
   * @param {string} taskId - ID of the task to check
   * @returns {boolean|object} - False if no circular dependencies, or object with cycle info
   */
  hasCircularDependencies(tasks, taskId) {
    const visited = new Map();
    const recStack = new Map();
    const path = [];

    // Helper function to check for cycles using DFS
    const hasCycle = (currentId) => {
      // If we've already determined this task doesn't have cycles, return false
      if (visited.get(currentId) === true) {
        return false;
      }

      // If we're already visiting this task in the current path, we found a cycle
      if (recStack.get(currentId) === true) {
        return { cycle: true, path: [...path, currentId] };
      }

      // Mark the current task as being visited
      visited.set(currentId, false);
      recStack.set(currentId, true);
      path.push(currentId);

      // Find the task
      const task = tasks.find(t => t.id === currentId);
      if (!task) {
        // Task not found, can't have cycles
        visited.set(currentId, true);
        recStack.set(currentId, false);
        path.pop();
        return false;
      }

      // Check each dependency
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          const result = hasCycle(depId);
          if (result && result.cycle) {
            // We found a cycle
            visited.set(currentId, true);
            recStack.set(currentId, false);
            return result;
          }
        }
      }

      // No cycles found for this task
      visited.set(currentId, true);
      recStack.set(currentId, false);
      path.pop();
      return false;
    };

    return hasCycle(taskId);
  }

  /**
   * Check if adding a dependency would create a circular dependency
   * @param {Array} tasks - All tasks
   * @param {string} taskId - ID of the task to add dependency to
   * @param {string} dependencyId - ID of the dependency to add
   * @returns {boolean|object} - False if no circular dependencies, or object with cycle info
   */
  wouldCreateCircularDependency(tasks, taskId, dependencyId) {
    // Create a copy of the tasks to avoid modifying the original
    const tasksCopy = JSON.parse(JSON.stringify(tasks));

    // Find the task to modify
    const taskToModify = tasksCopy.find(t => t.id === taskId);
    if (!taskToModify) {
      return false;
    }

    // Add the dependency
    if (!taskToModify.dependencies) {
      taskToModify.dependencies = [];
    }

    // If the dependency already exists, no need to check
    if (taskToModify.dependencies.includes(dependencyId)) {
      return false;
    }

    // Add the dependency temporarily
    taskToModify.dependencies.push(dependencyId);

    // Check for circular dependencies
    return this.hasCircularDependencies(tasksCopy, taskId);
  }
}
