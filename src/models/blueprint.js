/**
 * Blueprint model
 */

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { validateBlueprintSchema } from './validator.js';
import { BlueprintInterface } from './interfaces/index.js';

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
}
