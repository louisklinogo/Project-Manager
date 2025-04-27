/**
 * Blueprint model
 */

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { validateBlueprintSchema } from './validator.js';
import { BlueprintInterface } from './interfaces/index.js';
import {
  StepBreakdown,
  ContextPackager,
  ValidationGenerator,
  BlueprintFormatter
} from '../blueprint/index.js';

/**
 * Blueprint class
 * @implements {BlueprintInterface}
 */
export class Blueprint extends BlueprintInterface {
  /**
   * Create a new blueprint
   * @param {object} data - Blueprint data
   */
  constructor(data = {}) {
    super();
    this.id = data.id || `blueprint-${uuidv4()}`;
    this.project_id = data.project_id;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.architecture = data.architecture || {
      components: [],
      relationships: []
    };
    this.tasks = data.tasks || [];
    this.workflow = data.workflow || {
      steps: [],
      checkpoints: []
    };

    // Initialize blueprint structure utilities
    this.stepBreakdown = new StepBreakdown();
    this.contextPackager = new ContextPackager();
    this.validationGenerator = new ValidationGenerator();
    this.blueprintFormatter = new BlueprintFormatter();
  }

  /**
   * Validate the blueprint
   * @returns {boolean} - Whether the blueprint is valid
   * @throws {Error} - If the blueprint is invalid
   */
  validate() {
    // Basic validation
    if (!this.id) {
      throw new Error('Blueprint ID is required');
    }
    if (!this.project_id) {
      throw new Error('Project ID is required');
    }

    // Schema validation
    try {
      validateBlueprintSchema(this);
    } catch (error) {
      throw error;
    }

    return true;
  }

  /**
   * Save the blueprint to a file
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
   * Load a blueprint from a file
   * @param {string} filePath - File path
   * @returns {Promise<Blueprint>} - Loaded blueprint
   * @static
   */
  static async load(filePath) {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      const json = JSON.parse(data);
      return new Blueprint(json);
    } catch (error) {
      throw new Error(`Failed to load blueprint from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Create a blueprint from a JSON object
   * @param {object} json - JSON object
   * @returns {Blueprint} - Blueprint instance
   * @static
   */
  static fromJSON(json) {
    return new Blueprint(json);
  }

  /**
   * Load a blueprint from a file
   * @param {string} filePath - File path
   * @returns {Promise<Blueprint>}
   */
  static async load(filePath) {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const blueprintData = JSON.parse(data);
    return new Blueprint(blueprintData);
  }

  /**
   * Create a new blueprint
   * @param {object} data - Blueprint data
   * @param {string} filePath - File path
   * @returns {Promise<Blueprint>}
   */
  static async create(data, filePath) {
    const blueprint = new Blueprint(data);
    await blueprint.save(filePath);
    return blueprint;
  }

  /**
   * Add a task to the blueprint
   * @param {object} task - Task data
   * @returns {Blueprint} - The blueprint instance
   */
  addTask(task) {
    if (!task.id) {
      task.id = `task-${uuidv4()}`;
    }
    this.tasks.push(task);
    return this;
  }

  /**
   * Add a component to the architecture
   * @param {object} component - Component data
   * @returns {Blueprint} - The blueprint instance
   */
  addComponent(component) {
    if (!component.id) {
      component.id = `component-${uuidv4()}`;
    }
    this.architecture.components.push(component);
    return this;
  }

  /**
   * Add a relationship to the architecture
   * @param {object} relationship - Relationship data
   * @returns {Blueprint} - The blueprint instance
   */
  addRelationship(relationship) {
    if (!relationship.id) {
      relationship.id = `relationship-${uuidv4()}`;
    }
    this.architecture.relationships.push(relationship);
    return this;
  }

  /**
   * Add a step to the workflow
   * @param {object} step - Step data
   * @returns {Blueprint} - The blueprint instance
   */
  addStep(step) {
    if (!step.id) {
      step.id = `step-${uuidv4()}`;
    }
    this.workflow.steps.push(step);
    return this;
  }

  /**
   * Add a checkpoint to the workflow
   * @param {object} checkpoint - Checkpoint data
   * @returns {Blueprint} - The blueprint instance
   */
  addCheckpoint(checkpoint) {
    if (!checkpoint.id) {
      checkpoint.id = `checkpoint-${uuidv4()}`;
    }
    this.workflow.checkpoints.push(checkpoint);
    return this;
  }

  /**
   * Generate steps for tasks in the blueprint
   * @returns {Blueprint} - The blueprint instance
   */
  generateSteps() {
    if (!this.tasks || this.tasks.length === 0) {
      return this;
    }

    const result = this.stepBreakdown.breakdownTasks(this.tasks);

    // Update the workflow steps
    this.workflow.steps = result.steps;

    // Store dependencies in task metadata
    result.steps.forEach(step => {
      const dependencies = result.dependencies[step.id] || [];
      step.dependencies = dependencies;
    });

    return this;
  }

  /**
   * Generate validation criteria for tasks in the blueprint
   * @param {object} project - Project containing the blueprint
   * @returns {Blueprint} - The blueprint instance
   */
  generateValidationCriteria(project) {
    if (!this.tasks || this.tasks.length === 0) {
      return this;
    }

    // Generate criteria for each task
    this.tasks.forEach(task => {
      if (!task.acceptance_criteria || task.acceptance_criteria.length === 0) {
        task.acceptance_criteria = this.validationGenerator.generateTaskCriteria(task, project);
      }
    });

    // Generate criteria for each step
    if (this.workflow.steps && this.workflow.steps.length > 0) {
      this.workflow.steps.forEach(step => {
        const task = this.tasks.find(t => t.id === step.task_id);
        if (!step.validation_criteria || step.validation_criteria.length === 0) {
          step.validation_criteria = this.validationGenerator.generateStepCriteria(step, task);
        }
      });
    }

    return this;
  }

  /**
   * Generate validation plans for tasks and steps
   * @returns {Blueprint} - The blueprint instance
   */
  generateValidationPlans() {
    // Generate validation plans for tasks
    if (this.tasks && this.tasks.length > 0) {
      this.tasks.forEach(task => {
        if (task.acceptance_criteria && task.acceptance_criteria.length > 0) {
          task.validation_plan = this.validationGenerator.generateValidationPlan(
            task,
            task.acceptance_criteria
          );
        }
      });
    }

    // Generate validation plans for steps
    if (this.workflow.steps && this.workflow.steps.length > 0) {
      this.workflow.steps.forEach(step => {
        if (step.validation_criteria && step.validation_criteria.length > 0) {
          step.validation_plan = this.validationGenerator.generateValidationPlan(
            step,
            step.validation_criteria
          );
        }
      });
    }

    return this;
  }

  /**
   * Package context for a task
   * @param {string} taskId - ID of the task to package context for
   * @param {object} project - Project containing the blueprint
   * @returns {object} - Packaged context
   */
  packageTaskContext(taskId, project) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    return this.contextPackager.packageTaskContext(task, this, project);
  }

  /**
   * Package context for a step
   * @param {string} stepId - ID of the step to package context for
   * @param {object} project - Project containing the blueprint
   * @returns {object} - Packaged context
   */
  packageStepContext(stepId, project) {
    const step = this.workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step with ID ${stepId} not found`);
    }

    return this.contextPackager.packageStepContext(
      step,
      this.workflow.steps,
      this._getStepDependencies(),
      this,
      project
    );
  }

  /**
   * Format the blueprint for LLM consumption
   * @param {object} project - Project containing the blueprint
   * @param {object} options - Formatting options
   * @returns {string} - Formatted blueprint
   */
  formatForLLM(project, options = {}) {
    return this.blueprintFormatter.formatBlueprint(this, project, options);
  }

  /**
   * Format a task for LLM consumption
   * @param {string} taskId - ID of the task to format
   * @param {object} project - Project containing the blueprint
   * @returns {string} - Formatted task
   */
  formatTaskForLLM(taskId, project) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    return this.blueprintFormatter.formatTask(task, this, project);
  }

  /**
   * Format a step for LLM consumption
   * @param {string} stepId - ID of the step to format
   * @param {object} project - Project containing the blueprint
   * @returns {string} - Formatted step
   */
  formatStepForLLM(stepId, project) {
    const step = this.workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step with ID ${stepId} not found`);
    }

    const task = step.task_id ? this.tasks.find(t => t.id === step.task_id) : null;

    return this.blueprintFormatter.formatStep(step, task, this, project);
  }

  /**
   * Get dependencies between steps
   * @private
   * @returns {object} - Dependencies between steps
   */
  _getStepDependencies() {
    const dependencies = {};

    this.workflow.steps.forEach(step => {
      if (step.dependencies && step.dependencies.length > 0) {
        dependencies[step.id] = step.dependencies;
      }
    });

    return dependencies;
  }
}
