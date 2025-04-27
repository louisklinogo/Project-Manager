/**
 * Task Interface
 *
 * This module defines the interface for task models with hierarchical structure.
 */

import { ModelInterface } from './model-interface.js';

/**
 * Task model interface
 * @interface
 * @extends ModelInterface
 */
export class TaskInterface extends ModelInterface {
  /**
   * Get the task title
   * @returns {string} - Task title
   */
  getTitle() {
    return this.title;
  }

  /**
   * Set the task title
   * @param {string} title - Task title
   * @returns {void}
   */
  setTitle(title) {
    this.title = title;
    this.updateTimestamp();
  }

  /**
   * Get the task description
   * @returns {string} - Task description
   */
  getDescription() {
    return this.description;
  }

  /**
   * Set the task description
   * @param {string} description - Task description
   * @returns {void}
   */
  setDescription(description) {
    this.description = description;
    this.updateTimestamp();
  }

  /**
   * Get the task dependencies
   * @returns {Array} - Task dependencies
   */
  getDependencies() {
    return this.dependencies;
  }

  /**
   * Set the task dependencies
   * @param {Array} dependencies - Task dependencies
   * @returns {void}
   */
  setDependencies(dependencies) {
    this.dependencies = dependencies;
    this.updateTimestamp();
  }

  /**
   * Add a dependency to the task
   * @param {string} dependencyId - Dependency ID
   * @param {Array} allTasks - All tasks to check against for circular dependencies
   * @returns {boolean} - Whether the dependency was added
   */
  addDependency(dependencyId, allTasks = []) {
    // Don't allow self-dependencies
    if (dependencyId === this.id) {
      return false;
    }

    if (!this.dependencies) {
      this.dependencies = [];
    }

    // Check if the dependency already exists
    if (this.dependencies.includes(dependencyId)) {
      return true; // Already exists, no need to add
    }

    // Check for circular dependencies if allTasks is provided
    if (allTasks.length > 0) {
      // Create a temporary copy of the task with the new dependency
      const tempTask = {
        ...this,
        dependencies: [...this.dependencies, dependencyId]
      };

      // Check if this would create a circular dependency
      const visited = new Set();
      const recStack = new Set();

      const hasCycle = (taskId) => {
        if (recStack.has(taskId)) {
          return true;
        }

        if (visited.has(taskId)) {
          return false;
        }

        visited.add(taskId);
        recStack.add(taskId);

        const task = taskId === this.id ? tempTask : allTasks.find(t => t.id === taskId);
        if (task && task.dependencies) {
          for (const depId of task.dependencies) {
            if (hasCycle(depId)) {
              return true;
            }
          }
        }

        recStack.delete(taskId);
        return false;
      };

      // If adding this dependency would create a cycle, don't add it
      if (hasCycle(this.id)) {
        return false;
      }
    }

    // Add the dependency
    this.dependencies.push(dependencyId);
    this.updateTimestamp();
    return true;
  }

  /**
   * Remove a dependency from the task
   * @param {string} dependencyId - Dependency ID
   * @returns {boolean} - Whether the dependency was removed
   */
  removeDependency(dependencyId) {
    if (!this.dependencies) {
      return false;
    }
    const index = this.dependencies.indexOf(dependencyId);
    if (index === -1) {
      return false;
    }
    this.dependencies.splice(index, 1);
    this.updateTimestamp();
    return true;
  }

  /**
   * Get the task acceptance criteria
   * @returns {Array} - Task acceptance criteria
   */
  getAcceptanceCriteria() {
    return this.acceptance_criteria;
  }

  /**
   * Set the task acceptance criteria
   * @param {Array} criteria - Task acceptance criteria
   * @returns {void}
   */
  setAcceptanceCriteria(criteria) {
    this.acceptance_criteria = criteria;
    this.updateTimestamp();
  }

  /**
   * Add an acceptance criterion to the task
   * @param {string} criterion - Acceptance criterion
   * @returns {void}
   */
  addAcceptanceCriterion(criterion) {
    if (!this.acceptance_criteria) {
      this.acceptance_criteria = [];
    }
    this.acceptance_criteria.push(criterion);
    this.updateTimestamp();
  }

  /**
   * Get the task implementation guide
   * @returns {string} - Task implementation guide
   */
  getImplementationGuide() {
    return this.implementation_guide;
  }

  /**
   * Set the task implementation guide
   * @param {string} guide - Task implementation guide
   * @returns {void}
   */
  setImplementationGuide(guide) {
    this.implementation_guide = guide;
    this.updateTimestamp();
  }

  /**
   * Get the task status
   * @returns {string} - Task status
   */
  getStatus() {
    return this.status;
  }

  /**
   * Set the task status
   * @param {string} status - Task status
   * @returns {void}
   */
  setStatus(status) {
    this.status = status;
    this.updateTimestamp();
  }

  /**
   * Get the task priority
   * @returns {string} - Task priority
   */
  getPriority() {
    return this.priority;
  }

  /**
   * Set the task priority
   * @param {string} priority - Task priority
   * @returns {void}
   */
  setPriority(priority) {
    this.priority = priority;
    this.updateTimestamp();
  }

  /**
   * Get the task subtasks
   * @returns {Array} - Task subtasks
   */
  getSubtasks() {
    return this.subtasks;
  }

  /**
   * Set the task subtasks
   * @param {Array} subtasks - Task subtasks
   * @returns {void}
   */
  setSubtasks(subtasks) {
    this.subtasks = subtasks;
    this.updateTimestamp();
  }

  /**
   * Add a subtask to the task
   * @param {object} subtask - Subtask
   * @returns {object} - The added subtask
   */
  addSubtask(subtask) {
    if (!this.subtasks) {
      this.subtasks = [];
    }

    // Ensure the subtask has a parent_id
    subtask.parent_id = this.id;

    // Add the subtask
    this.subtasks.push(subtask);
    this.updateTimestamp();

    return subtask;
  }

  /**
   * Get a subtask by ID
   * @param {string|number} subtaskId - Subtask ID
   * @returns {object|null} - Subtask or null if not found
   */
  getSubtaskById(subtaskId) {
    if (!this.subtasks) {
      return null;
    }
    return this.subtasks.find(subtask =>
      subtask.id === subtaskId || subtask.id === Number(subtaskId)
    ) || null;
  }

  /**
   * Update a subtask
   * @param {string|number} subtaskId - Subtask ID
   * @param {object} updates - Subtask updates
   * @returns {boolean} - Whether the subtask was updated
   */
  updateSubtask(subtaskId, updates) {
    if (!this.subtasks) {
      return false;
    }
    const subtaskIndex = this.subtasks.findIndex(subtask =>
      subtask.id === subtaskId || subtask.id === Number(subtaskId)
    );
    if (subtaskIndex === -1) {
      return false;
    }

    this.subtasks[subtaskIndex] = { ...this.subtasks[subtaskIndex], ...updates };
    this.updateTimestamp();
    return true;
  }

  /**
   * Remove a subtask
   * @param {string|number} subtaskId - Subtask ID
   * @returns {boolean} - Whether the subtask was removed
   */
  removeSubtask(subtaskId) {
    if (!this.subtasks) {
      return false;
    }
    const subtaskIndex = this.subtasks.findIndex(subtask =>
      subtask.id === subtaskId || subtask.id === Number(subtaskId)
    );
    if (subtaskIndex === -1) {
      return false;
    }

    this.subtasks.splice(subtaskIndex, 1);
    this.updateTimestamp();
    return true;
  }

  /**
   * Update the status of all subtasks
   * @param {string} status - Status to set
   * @returns {number} - Number of subtasks updated
   */
  updateSubtasksStatus(status) {
    if (!this.subtasks || this.subtasks.length === 0) {
      return 0;
    }

    let count = 0;
    this.subtasks.forEach(subtask => {
      if (subtask.status !== status) {
        subtask.status = status;
        count++;
      }
    });

    if (count > 0) {
      this.updateTimestamp();
    }

    return count;
  }

  /**
   * Check if all subtasks have a specific status
   * @param {string} status - Status to check
   * @returns {boolean} - Whether all subtasks have the status
   */
  areAllSubtasksInStatus(status) {
    if (!this.subtasks || this.subtasks.length === 0) {
      return true;
    }

    return this.subtasks.every(subtask => subtask.status === status);
  }

  /**
   * Get the count of subtasks with a specific status
   * @param {string} status - Status to count
   * @returns {number} - Number of subtasks with the status
   */
  getSubtaskCountByStatus(status) {
    if (!this.subtasks || this.subtasks.length === 0) {
      return 0;
    }

    return this.subtasks.filter(subtask => subtask.status === status).length;
  }

  /**
   * Calculate the completion percentage of subtasks
   * @param {string} completedStatus - Status considered as completed
   * @returns {number} - Completion percentage (0-100)
   */
  getSubtasksCompletionPercentage(completedStatus = 'done') {
    if (!this.subtasks || this.subtasks.length === 0) {
      return 0;
    }

    const completedCount = this.getSubtaskCountByStatus(completedStatus);
    return Math.round((completedCount / this.subtasks.length) * 100);
  }

  /**
   * Update the timestamp
   * @private
   */
  updateTimestamp() {
    this.updated_at = new Date().toISOString();
  }
}
