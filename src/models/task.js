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
   * @returns {boolean} - Whether the task has circular dependencies
   */
  hasCircularDependencies(allTasks) {
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

      const task = allTasks.find(t => t.id === taskId);
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

    return hasCycle(this.id);
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
}
