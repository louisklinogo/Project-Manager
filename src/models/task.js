/**
 * Task model
 */

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { validateTaskSchema, validateSubtaskSchema } from './validator.js';
import { TaskInterface } from './interfaces/index.js';

/**
 * Task class
 * @implements {TaskInterface}
 */
export class Task extends TaskInterface {
  /**
   * Create a new task
   * @param {object} data - Task data
   */
  constructor(data = {}) {
    super();
    this.id = data.id || `task-${uuidv4()}`;
    this.title = data.title || 'New Task';
    this.description = data.description || '';
    this.status = data.status || 'pending';
    this.priority = data.priority || 'medium';
    this.dependencies = data.dependencies || [];
    this.acceptance_criteria = data.acceptance_criteria || [];
    this.implementation_guide = data.implementation_guide || '';
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.subtasks = data.subtasks || [];
    this.validation_plan = data.validation_plan || null;
    this.parent_id = data.parent_id || null;
    this.completion_percentage = data.completion_percentage || 0;

    // Work preservation properties
    this.completion_history = data.completion_history || [];
    this.version = data.version || 1;
    this.locked = data.locked || false;
    this.locked_at = data.locked_at || null;
    this.notes = data.notes || [];
  }

  /**
   * Validate the task
   * @returns {boolean} - Whether the task is valid
   * @throws {Error} - If the task is invalid
   */
  validate() {
    // Basic validation
    if (!this.id) {
      throw new Error('Task ID is required');
    }
    if (!this.title) {
      throw new Error('Task title is required');
    }

    // Schema validation
    try {
      validateTaskSchema(this);
    } catch (error) {
      throw error;
    }

    // Validate subtasks if present
    if (this.subtasks && this.subtasks.length > 0) {
      this.subtasks.forEach(subtask => {
        try {
          validateSubtaskSchema(subtask);
        } catch (error) {
          throw new Error(`Invalid subtask (${subtask.id}): ${error.message}`);
        }
      });
    }

    return true;
  }

  /**
   * Save the task to a file
   * @param {string} filePath - File path
   * @returns {Promise<void>}
   */
  async save(filePath) {
    this.updated_at = new Date().toISOString();
    this.validate();

    const data = JSON.stringify(this, null, 2);
    await fs.promises.writeFile(filePath, data, 'utf8');
  }

  /**
   * Load a task from a file
   * @param {string} filePath - File path
   * @returns {Promise<Task>} - Loaded task
   * @static
   */
  static async load(filePath) {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      const json = JSON.parse(data);
      return new Task(json);
    } catch (error) {
      throw new Error(`Failed to load task from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Create a task from a JSON object
   * @param {object} json - JSON object
   * @returns {Task} - Task instance
   * @static
   */
  static fromJSON(json) {
    return new Task(json);
  }

  /**
   * Create a new task
   * @param {object} data - Task data
   * @param {string} filePath - File path
   * @returns {Promise<Task>}
   * @static
   */
  static async create(data, filePath) {
    const task = new Task(data);
    await task.save(filePath);
    return task;
  }

  /**
   * Create a new subtask
   * @param {object} data - Subtask data
   * @returns {object} - Subtask object
   */
  createSubtask(data = {}) {
    const subtaskId = data.id || this.subtasks.length + 1;
    const subtask = {
      id: subtaskId,
      title: data.title || `Subtask ${subtaskId}`,
      description: data.description || '',
      status: data.status || 'pending',
      dependencies: data.dependencies || [],
      acceptance_criteria: data.acceptance_criteria || [],
      implementation_guide: data.implementation_guide || '',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      parent_id: this.id
    };

    // Validate the subtask
    validateSubtaskSchema(subtask);

    // Add the subtask to the task
    this.addSubtask(subtask);

    return subtask;
  }

  /**
   * Update the completion percentage based on subtasks
   * @param {string} completedStatus - Status considered as completed
   * @returns {number} - Updated completion percentage
   */
  updateCompletionPercentage(completedStatus = 'done') {
    if (!this.subtasks || this.subtasks.length === 0) {
      // If there are no subtasks, use the task status
      this.completion_percentage = this.status === completedStatus ? 100 : 0;
    } else {
      // Calculate based on subtasks
      this.completion_percentage = this.getSubtasksCompletionPercentage(completedStatus);
    }

    this.updateTimestamp();
    return this.completion_percentage;
  }

  /**
   * Update the task status based on subtasks
   * @param {string} completedStatus - Status considered as completed
   * @param {string} inProgressStatus - Status considered as in progress
   * @returns {string} - Updated status
   */
  updateStatusBasedOnSubtasks(completedStatus = 'done', inProgressStatus = 'in-progress') {
    if (!this.subtasks || this.subtasks.length === 0) {
      return this.status;
    }

    // Check if any subtask is in progress
    const hasInProgressSubtasks = this.subtasks.some(subtask =>
      subtask.status !== completedStatus && subtask.status !== 'pending'
    );

    // Check if all subtasks are completed
    const allSubtasksCompleted = this.subtasks.every(subtask =>
      subtask.status === completedStatus
    );

    if (allSubtasksCompleted) {
      this.status = completedStatus;
    } else if (hasInProgressSubtasks) {
      this.status = inProgressStatus;
    } else {
      // If some subtasks are pending but none are in progress
      const hasCompletedSubtasks = this.subtasks.some(subtask =>
        subtask.status === completedStatus
      );

      if (hasCompletedSubtasks) {
        this.status = inProgressStatus;
      }
      // Otherwise keep current status
    }

    this.updateTimestamp();
    return this.status;
  }

  /**
   * Check if the task has circular dependencies
   * @param {Array} allTasks - All tasks to check against
   * @returns {boolean|object} - False if no circular dependencies, or object with cycle info
   */
  hasCircularDependencies(allTasks) {
    const visited = new Set();
    const recStack = new Set();
    const path = [];

    const hasCycle = (taskId) => {
      // If we're already visiting this task in the current path, we found a cycle
      if (recStack.has(taskId)) {
        return {
          cycle: true,
          path: [...path, taskId],
          message: `Circular dependency detected: ${[...path, taskId].join(' -> ')}`
        };
      }

      // If we've already determined this task doesn't have cycles, return false
      if (visited.has(taskId)) {
        return false;
      }

      // Mark the current task as being visited
      visited.add(taskId);
      recStack.add(taskId);
      path.push(taskId);

      // Find the task
      const task = allTasks.find(t => t.id === taskId);
      if (!task) {
        // Task not found, can't have cycles
        visited.delete(taskId);
        recStack.delete(taskId);
        path.pop();
        return false;
      }

      // Check each dependency
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          const result = hasCycle(depId);
          if (result && result.cycle) {
            // We found a cycle
            visited.delete(taskId);
            recStack.delete(taskId);
            return result;
          }
        }
      }

      // No cycles found for this task
      recStack.delete(taskId);
      path.pop();
      return false;
    };

    return hasCycle(this.id);
  }

  /**
   * Validate the task's dependencies
   * @param {Array} allTasks - All tasks to check against
   * @returns {object} - Validation result with valid flag and issues array
   */
  validateDependencies(allTasks) {
    const issues = [];

    // Check for missing dependencies
    if (this.dependencies && this.dependencies.length > 0) {
      this.dependencies.forEach(depId => {
        // Check for self-dependencies
        if (depId === this.id) {
          issues.push({
            type: 'self_dependency',
            message: `Task ${this.id} depends on itself`
          });
          return;
        }

        // Check if the dependency exists
        const depTask = allTasks.find(t => t.id === depId);
        if (!depTask) {
          issues.push({
            type: 'missing_dependency',
            dependencyId: depId,
            message: `Task ${this.id} depends on non-existent task ${depId}`
          });
        }
      });
    }

    // Check for circular dependencies
    const circularResult = this.hasCircularDependencies(allTasks);
    if (circularResult && circularResult.cycle) {
      issues.push({
        type: 'circular_dependency',
        path: circularResult.path,
        message: circularResult.message
      });
    }

    // Check subtasks if present
    if (this.subtasks && this.subtasks.length > 0) {
      this.subtasks.forEach(subtask => {
        if (!subtask.dependencies || subtask.dependencies.length === 0) {
          return;
        }

        subtask.dependencies.forEach(depId => {
          // Check for self-dependencies in subtasks
          if (depId === subtask.id) {
            issues.push({
              type: 'self_dependency',
              taskId: `${this.id}.${subtask.id}`,
              message: `Subtask ${this.id}.${subtask.id} depends on itself`
            });
            return;
          }

          // If the dependency is a string, it might be a reference to another task
          if (typeof depId === 'string') {
            const depTask = allTasks.find(t => t.id === depId);
            if (!depTask) {
              issues.push({
                type: 'missing_dependency',
                taskId: `${this.id}.${subtask.id}`,
                dependencyId: depId,
                message: `Subtask ${this.id}.${subtask.id} depends on non-existent task ${depId}`
              });
            }
          }
          // If it's a number, it might be a reference to another subtask of the same parent
          else if (typeof depId === 'number') {
            const subtaskExists = this.subtasks.some(st => st.id === depId);
            if (!subtaskExists) {
              issues.push({
                type: 'missing_dependency',
                taskId: `${this.id}.${subtask.id}`,
                dependencyId: `${this.id}.${depId}`,
                message: `Subtask ${this.id}.${subtask.id} depends on non-existent subtask ${this.id}.${depId}`
              });
            }
          }
        });
      });
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Get all dependent tasks
   * @param {Array} allTasks - All tasks to check against
   * @returns {Array} - Tasks that depend on this task
   */
  getDependentTasks(allTasks) {
    return allTasks.filter(task =>
      task.dependencies && task.dependencies.includes(this.id)
    );
  }

  /**
   * Get all dependency tasks
   * @param {Array} allTasks - All tasks to check against
   * @returns {Array} - Tasks that this task depends on
   */
  getDependencyTasks(allTasks) {
    return allTasks.filter(task =>
      this.dependencies && this.dependencies.includes(task.id)
    );
  }

  /**
   * Convert the task to a hierarchical structure
   * @returns {object} - Hierarchical task structure
   */
  toHierarchy() {
    const result = { ...this };

    // Convert subtasks to hierarchical structure
    if (this.subtasks && this.subtasks.length > 0) {
      result.subtasks = this.subtasks.map(subtask => {
        return {
          ...subtask,
          parent: {
            id: this.id,
            title: this.title
          }
        };
      });
    }

    return result;
  }

  /**
   * Get the task depth in the hierarchy
   * @returns {number} - Depth (0 for top-level tasks, 1+ for subtasks)
   */
  getDepth() {
    return this.parent_id ? 1 : 0;
  }

  /**
   * Check if the task is a subtask
   * @returns {boolean} - Whether the task is a subtask
   */
  isSubtask() {
    return !!this.parent_id;
  }

  /**
   * Check if the task is a parent task
   * @returns {boolean} - Whether the task is a parent task
   */
  isParentTask() {
    return !this.parent_id && this.subtasks && this.subtasks.length > 0;
  }

  /**
   * Check if the task is a leaf task (no subtasks)
   * @returns {boolean} - Whether the task is a leaf task
   */
  isLeafTask() {
    return !this.subtasks || this.subtasks.length === 0;
  }

  /**
   * Get the task path in the hierarchy
   * @param {Array} allTasks - All tasks to check against
   * @returns {Array} - Path from root to this task
   */
  getPath(allTasks) {
    const path = [this];

    if (this.parent_id) {
      const parent = allTasks.find(t => t.id === this.parent_id);
      if (parent) {
        const parentPath = new Task(parent).getPath(allTasks);
        return [...parentPath, ...path];
      }
    }

    return path;
  }

  /**
   * Get the task path as a string
   * @param {Array} allTasks - All tasks to check against
   * @returns {string} - Path string (e.g., "Root > Parent > Task")
   */
  getPathString(allTasks) {
    const path = this.getPath(allTasks);
    return path.map(t => t.title).join(' > ');
  }

  /**
   * Add a completion history entry
   * @param {string} status - Status at the time of recording
   * @param {number} completionPercentage - Completion percentage
   * @param {object} metadata - Additional metadata
   * @returns {object} - The created history entry
   */
  addCompletionHistoryEntry(status = this.status, completionPercentage = this.completion_percentage, metadata = {}) {
    // Create the history entry
    const entry = {
      timestamp: new Date().toISOString(),
      status,
      completion_percentage: completionPercentage,
      version: this.version,
      metadata: { ...metadata }
    };

    // Initialize history array if it doesn't exist
    if (!this.completion_history) {
      this.completion_history = [];
    }

    // Add the entry
    this.completion_history.push(entry);

    // Increment version
    this.version += 1;

    // Update timestamp
    this.updateTimestamp();

    return entry;
  }

  /**
   * Get the completion history
   * @returns {Array} - Completion history entries
   */
  getCompletionHistory() {
    return this.completion_history || [];
  }

  /**
   * Check if the task is locked
   * @returns {boolean} - Whether the task is locked
   */
  isLocked() {
    return this.locked === true;
  }

  /**
   * Lock the task to prevent modifications
   * @param {string} reason - Reason for locking
   * @returns {Task} - This task instance
   */
  lock(reason = 'Task completed') {
    this.locked = true;
    this.locked_at = new Date().toISOString();

    // Add a note about locking
    this.addNote('task_locked', reason);

    return this;
  }

  /**
   * Unlock the task to allow modifications
   * @param {string} reason - Reason for unlocking
   * @returns {Task} - This task instance
   */
  unlock(reason = 'Manual unlock') {
    this.locked = false;
    this.locked_at = null;

    // Add a note about unlocking
    this.addNote('task_unlocked', reason);

    return this;
  }

  /**
   * Add a note to the task
   * @param {string} type - Note type
   * @param {string} message - Note message
   * @param {object} metadata - Additional metadata
   * @returns {object} - The created note
   */
  addNote(type, message, metadata = {}) {
    // Initialize notes array if it doesn't exist
    if (!this.notes) {
      this.notes = [];
    }

    // Create the note
    const note = {
      type,
      message,
      timestamp: new Date().toISOString(),
      metadata: { ...metadata }
    };

    // Add the note
    this.notes.push(note);

    // Update timestamp
    this.updateTimestamp();

    return note;
  }

  /**
   * Get notes of a specific type
   * @param {string} type - Note type
   * @returns {Array} - Notes of the specified type
   */
  getNotesByType(type) {
    if (!this.notes) return [];

    return this.notes.filter(note => note.type === type);
  }

  /**
   * Update the task timestamp
   * @returns {string} - Updated timestamp
   */
  updateTimestamp() {
    this.updated_at = new Date().toISOString();
    return this.updated_at;
  }
}
