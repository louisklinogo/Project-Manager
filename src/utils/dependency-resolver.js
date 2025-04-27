/**
 * Dependency Resolver
 *
 * This module provides utilities for resolving task dependency issues.
 */

import { DependencyValidator } from './dependency-validator.js';

/**
 * Dependency Resolver class
 */
export class DependencyResolver {
  /**
   * Create a new dependency resolver
   * @param {object} options - Resolver options
   */
  constructor(options = {}) {
    this.options = {
      removeCircularDependencies: true,
      removeSelfDependencies: true,
      removeMissingDependencies: true,
      ...options
    };
    
    this.validator = new DependencyValidator();
  }

  /**
   * Resolve dependency issues in a list of tasks
   * @param {Array} tasks - Tasks to resolve
   * @returns {object} - Resolution result with tasks and changes
   */
  resolveDependencyIssues(tasks) {
    if (!tasks || tasks.length === 0) {
      return { tasks: [], changes: [] };
    }

    // Create a deep copy of the tasks to avoid modifying the original
    const tasksCopy = JSON.parse(JSON.stringify(tasks));
    const changes = [];

    // Validate dependencies
    const validationResult = this.validator.validateDependencies(tasksCopy);
    
    // If there are no issues, return the original tasks
    if (validationResult.valid) {
      return { tasks: tasksCopy, changes: [] };
    }

    // Resolve issues
    validationResult.issues.forEach(issue => {
      switch (issue.type) {
        case 'missing_dependency':
          if (this.options.removeMissingDependencies) {
            this.removeMissingDependency(tasksCopy, issue, changes);
          }
          break;
        case 'self_dependency':
          if (this.options.removeSelfDependencies) {
            this.removeSelfDependency(tasksCopy, issue, changes);
          }
          break;
        case 'circular_dependency':
          if (this.options.removeCircularDependencies) {
            this.removeCircularDependency(tasksCopy, issue, changes);
          }
          break;
      }
    });

    return { tasks: tasksCopy, changes };
  }

  /**
   * Remove a missing dependency
   * @param {Array} tasks - Tasks to modify
   * @param {object} issue - Issue to resolve
   * @param {Array} changes - Array to track changes
   * @private
   */
  removeMissingDependency(tasks, issue, changes) {
    const { taskId, dependencyId } = issue;
    
    // Check if this is a subtask
    if (taskId.includes('.')) {
      const [parentId, subtaskId] = taskId.split('.');
      const parentTask = tasks.find(t => t.id === parentId);
      
      if (parentTask && parentTask.subtasks) {
        const subtask = parentTask.subtasks.find(st => st.id === subtaskId || st.id === Number(subtaskId));
        
        if (subtask && subtask.dependencies) {
          // Remove the dependency
          const index = subtask.dependencies.indexOf(dependencyId);
          if (index !== -1) {
            subtask.dependencies.splice(index, 1);
            changes.push({
              type: 'remove_missing_dependency',
              taskId,
              dependencyId,
              message: `Removed missing dependency ${dependencyId} from subtask ${taskId}`
            });
          }
        }
      }
    } else {
      // This is a main task
      const task = tasks.find(t => t.id === taskId);
      
      if (task && task.dependencies) {
        // Remove the dependency
        const index = task.dependencies.indexOf(dependencyId);
        if (index !== -1) {
          task.dependencies.splice(index, 1);
          changes.push({
            type: 'remove_missing_dependency',
            taskId,
            dependencyId,
            message: `Removed missing dependency ${dependencyId} from task ${taskId}`
          });
        }
      }
    }
  }

  /**
   * Remove a self-dependency
   * @param {Array} tasks - Tasks to modify
   * @param {object} issue - Issue to resolve
   * @param {Array} changes - Array to track changes
   * @private
   */
  removeSelfDependency(tasks, issue, changes) {
    const { taskId } = issue;
    
    // Check if this is a subtask
    if (taskId.includes('.')) {
      const [parentId, subtaskId] = taskId.split('.');
      const parentTask = tasks.find(t => t.id === parentId);
      
      if (parentTask && parentTask.subtasks) {
        const subtask = parentTask.subtasks.find(st => st.id === subtaskId || st.id === Number(subtaskId));
        
        if (subtask && subtask.dependencies) {
          // Remove the self-dependency
          const index = subtask.dependencies.indexOf(subtask.id);
          if (index !== -1) {
            subtask.dependencies.splice(index, 1);
            changes.push({
              type: 'remove_self_dependency',
              taskId,
              message: `Removed self-dependency from subtask ${taskId}`
            });
          }
        }
      }
    } else {
      // This is a main task
      const task = tasks.find(t => t.id === taskId);
      
      if (task && task.dependencies) {
        // Remove the self-dependency
        const index = task.dependencies.indexOf(task.id);
        if (index !== -1) {
          task.dependencies.splice(index, 1);
          changes.push({
            type: 'remove_self_dependency',
            taskId,
            message: `Removed self-dependency from task ${taskId}`
          });
        }
      }
    }
  }

  /**
   * Remove a circular dependency
   * @param {Array} tasks - Tasks to modify
   * @param {object} issue - Issue to resolve
   * @param {Array} changes - Array to track changes
   * @private
   */
  removeCircularDependency(tasks, issue, changes) {
    const { path } = issue;
    
    if (!path || path.length < 2) {
      return;
    }
    
    // Find the last dependency in the cycle
    const lastTaskId = path[path.length - 1];
    const secondLastTaskId = path[path.length - 2];
    
    // Find the task with the dependency
    const task = tasks.find(t => t.id === secondLastTaskId);
    
    if (task && task.dependencies) {
      // Remove the dependency that creates the cycle
      const index = task.dependencies.indexOf(lastTaskId);
      if (index !== -1) {
        task.dependencies.splice(index, 1);
        changes.push({
          type: 'remove_circular_dependency',
          taskId: secondLastTaskId,
          dependencyId: lastTaskId,
          path,
          message: `Removed circular dependency ${lastTaskId} from task ${secondLastTaskId}`
        });
      }
    }
  }

  /**
   * Suggest alternative dependencies
   * @param {Array} tasks - All tasks
   * @param {string} taskId - ID of the task to suggest for
   * @param {string} dependencyId - ID of the problematic dependency
   * @returns {Array} - Suggested alternative dependencies
   */
  suggestAlternativeDependencies(tasks, taskId, dependencyId) {
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return [];
    }
    
    // Find all tasks that the dependency depends on
    const dependency = tasks.find(t => t.id === dependencyId);
    if (!dependency || !dependency.dependencies || dependency.dependencies.length === 0) {
      return [];
    }
    
    // Suggest the dependencies of the dependency
    const suggestions = [];
    
    for (const depId of dependency.dependencies) {
      // Skip if it would create a circular dependency
      if (this.validator.wouldCreateCircularDependency(tasks, taskId, depId)) {
        continue;
      }
      
      // Skip if it's already a dependency
      if (task.dependencies && task.dependencies.includes(depId)) {
        continue;
      }
      
      // Add to suggestions
      suggestions.push({
        id: depId,
        task: tasks.find(t => t.id === depId)
      });
    }
    
    return suggestions;
  }

  /**
   * Optimize dependency chains
   * @param {Array} tasks - Tasks to optimize
   * @returns {object} - Optimization result with tasks and changes
   */
  optimizeDependencyChains(tasks) {
    if (!tasks || tasks.length === 0) {
      return { tasks: [], changes: [] };
    }

    // Create a deep copy of the tasks to avoid modifying the original
    const tasksCopy = JSON.parse(JSON.stringify(tasks));
    const changes = [];

    // Build a dependency graph
    const graph = new Map();
    tasksCopy.forEach(task => {
      graph.set(task.id, task.dependencies || []);
    });

    // Find transitive dependencies for each task
    tasksCopy.forEach(task => {
      if (!task.dependencies || task.dependencies.length === 0) {
        return;
      }

      const transitiveDeps = new Set();
      
      // Helper function to find all transitive dependencies
      const findTransitiveDeps = (depId) => {
        const deps = graph.get(depId) || [];
        deps.forEach(id => {
          if (!transitiveDeps.has(id)) {
            transitiveDeps.add(id);
            findTransitiveDeps(id);
          }
        });
      };
      
      // Find all transitive dependencies
      task.dependencies.forEach(depId => {
        findTransitiveDeps(depId);
      });
      
      // Remove redundant dependencies
      const originalDeps = [...task.dependencies];
      task.dependencies = task.dependencies.filter(depId => {
        // Keep if it's not a transitive dependency of another dependency
        return !transitiveDeps.has(depId);
      });
      
      // Record changes
      if (task.dependencies.length !== originalDeps.length) {
        const removedDeps = originalDeps.filter(depId => !task.dependencies.includes(depId));
        changes.push({
          type: 'optimize_dependencies',
          taskId: task.id,
          removedDependencies: removedDeps,
          message: `Removed redundant dependencies from task ${task.id}: ${removedDeps.join(', ')}`
        });
      }
    });

    return { tasks: tasksCopy, changes };
  }

  /**
   * Analyze dependency impact
   * @param {Array} tasks - All tasks
   * @param {string} taskId - ID of the task to analyze
   * @returns {object} - Impact analysis result
   */
  analyzeDependencyImpact(tasks, taskId) {
    if (!tasks || tasks.length === 0) {
      return {
        task: null,
        dependsOn: [],
        dependedOnBy: [],
        criticalPath: [],
        impactScore: 0
      };
    }

    // Find the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return {
        task: null,
        dependsOn: [],
        dependedOnBy: [],
        criticalPath: [],
        impactScore: 0
      };
    }

    // Find tasks that this task depends on
    const dependsOn = task.dependencies
      ? task.dependencies.map(depId => tasks.find(t => t.id === depId)).filter(Boolean)
      : [];

    // Find tasks that depend on this task
    const dependedOnBy = tasks.filter(t => 
      t.dependencies && t.dependencies.includes(taskId)
    );

    // Calculate the critical path
    const criticalPath = this.calculateCriticalPath(tasks, taskId);

    // Calculate impact score (higher means more impact)
    const impactScore = dependedOnBy.length * 2 + (criticalPath.length > 0 ? 5 : 0);

    return {
      task,
      dependsOn,
      dependedOnBy,
      criticalPath,
      impactScore
    };
  }

  /**
   * Calculate the critical path through a task
   * @param {Array} tasks - All tasks
   * @param {string} taskId - ID of the task to analyze
   * @returns {Array} - Critical path
   * @private
   */
  calculateCriticalPath(tasks, taskId) {
    // Build a dependency graph
    const graph = new Map();
    tasks.forEach(task => {
      graph.set(task.id, task.dependencies || []);
    });

    // Find all paths from start nodes to end nodes
    const paths = [];
    
    // Find start nodes (tasks with no dependencies)
    const startNodes = tasks.filter(task => 
      !task.dependencies || task.dependencies.length === 0
    );
    
    // Find end nodes (tasks that no other tasks depend on)
    const endNodes = tasks.filter(task => 
      !tasks.some(t => t.dependencies && t.dependencies.includes(task.id))
    );
    
    // Helper function to find all paths
    const findPaths = (currentId, targetId, path = []) => {
      path.push(currentId);
      
      if (currentId === targetId) {
        // Found a path to the target
        paths.push([...path]);
      } else {
        // Continue traversing
        const deps = tasks.filter(t => 
          t.dependencies && t.dependencies.includes(currentId)
        );
        
        deps.forEach(dep => {
          if (!path.includes(dep.id)) {
            findPaths(dep.id, targetId, [...path]);
          }
        });
      }
    };
    
    // Find all paths that include the task
    startNodes.forEach(start => {
      endNodes.forEach(end => {
        findPaths(start.id, end.id);
      });
    });
    
    // Filter paths that include the task
    const pathsWithTask = paths.filter(path => path.includes(taskId));
    
    // Find the longest path
    let criticalPath = [];
    let maxLength = 0;
    
    pathsWithTask.forEach(path => {
      if (path.length > maxLength) {
        maxLength = path.length;
        criticalPath = path;
      }
    });
    
    // Return the critical path as task objects
    return criticalPath.map(id => tasks.find(t => t.id === id)).filter(Boolean);
  }
}
