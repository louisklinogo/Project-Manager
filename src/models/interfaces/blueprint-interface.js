/**
 * Blueprint Interface
 * 
 * This module defines the interface for blueprint models.
 */

import { ModelInterface } from './model-interface.js';

/**
 * Blueprint model interface
 * @interface
 * @extends ModelInterface
 */
export class BlueprintInterface extends ModelInterface {
  /**
   * Get the project ID
   * @returns {string} - Project ID
   */
  getProjectId() {
    return this.project_id;
  }

  /**
   * Set the project ID
   * @param {string} projectId - Project ID
   * @returns {void}
   */
  setProjectId(projectId) {
    this.project_id = projectId;
    this.updateTimestamp();
  }

  /**
   * Get the architecture
   * @returns {object} - Architecture
   */
  getArchitecture() {
    return this.architecture;
  }

  /**
   * Set the architecture
   * @param {object} architecture - Architecture
   * @returns {void}
   */
  setArchitecture(architecture) {
    this.architecture = architecture;
    this.updateTimestamp();
  }

  /**
   * Get the tasks
   * @returns {Array} - Tasks
   */
  getTasks() {
    return this.tasks;
  }

  /**
   * Set the tasks
   * @param {Array} tasks - Tasks
   * @returns {void}
   */
  setTasks(tasks) {
    this.tasks = tasks;
    this.updateTimestamp();
  }

  /**
   * Get the workflow
   * @returns {object} - Workflow
   */
  getWorkflow() {
    return this.workflow;
  }

  /**
   * Set the workflow
   * @param {object} workflow - Workflow
   * @returns {void}
   */
  setWorkflow(workflow) {
    this.workflow = workflow;
    this.updateTimestamp();
  }

  /**
   * Add a component to the architecture
   * @param {object} component - Component
   * @returns {void}
   */
  addComponent(component) {
    if (!this.architecture.components) {
      this.architecture.components = [];
    }
    this.architecture.components.push(component);
    this.updateTimestamp();
  }

  /**
   * Add a relationship to the architecture
   * @param {object} relationship - Relationship
   * @returns {void}
   */
  addRelationship(relationship) {
    if (!this.architecture.relationships) {
      this.architecture.relationships = [];
    }
    this.architecture.relationships.push(relationship);
    this.updateTimestamp();
  }

  /**
   * Add a task
   * @param {object} task - Task
   * @returns {void}
   */
  addTask(task) {
    if (!this.tasks) {
      this.tasks = [];
    }
    this.tasks.push(task);
    this.updateTimestamp();
  }

  /**
   * Get a task by ID
   * @param {string} taskId - Task ID
   * @returns {object|null} - Task or null if not found
   */
  getTaskById(taskId) {
    return this.tasks.find(task => task.id === taskId) || null;
  }

  /**
   * Update a task
   * @param {string} taskId - Task ID
   * @param {object} updates - Task updates
   * @returns {boolean} - Whether the task was updated
   */
  updateTask(taskId, updates) {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return false;
    }
    
    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    this.updateTimestamp();
    return true;
  }

  /**
   * Remove a task
   * @param {string} taskId - Task ID
   * @returns {boolean} - Whether the task was removed
   */
  removeTask(taskId) {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return false;
    }
    
    this.tasks.splice(taskIndex, 1);
    this.updateTimestamp();
    return true;
  }

  /**
   * Add a step to the workflow
   * @param {object} step - Step
   * @returns {void}
   */
  addStep(step) {
    if (!this.workflow.steps) {
      this.workflow.steps = [];
    }
    this.workflow.steps.push(step);
    this.updateTimestamp();
  }

  /**
   * Add a checkpoint to the workflow
   * @param {object} checkpoint - Checkpoint
   * @returns {void}
   */
  addCheckpoint(checkpoint) {
    if (!this.workflow.checkpoints) {
      this.workflow.checkpoints = [];
    }
    this.workflow.checkpoints.push(checkpoint);
    this.updateTimestamp();
  }
}
