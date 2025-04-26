/**
 * Project model
 */

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { validateProjectSchema } from './validator.js';
import { ProjectInterface } from './interfaces/index.js';

/**
 * Project class
 * @implements {ProjectInterface}
 */
export class Project extends ProjectInterface {
  /**
   * Create a new project
   * @param {object} data - Project data
   */
  constructor(data = {}) {
    super();
    this.id = data.id || `project-${uuidv4()}`;
    this.name = data.name || 'New Project';
    this.description = data.description || '';
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.requirements = data.requirements || '';
    this.research = data.research || {
      domain_knowledge: [],
      similar_projects: [],
      best_practices: []
    };
    this.blueprint = data.blueprint || null;
  }

  /**
   * Validate the project
   * @returns {boolean} - Whether the project is valid
   * @throws {Error} - If the project is invalid
   */
  validate() {
    // Basic validation
    if (!this.id) {
      throw new Error('Project ID is required');
    }
    if (!this.name) {
      throw new Error('Project name is required');
    }

    // Schema validation
    try {
      validateProjectSchema(this);
    } catch (error) {
      throw error;
    }

    return true;
  }

  /**
   * Save the project to a file
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
   * Load a project from a file
   * @param {string} filePath - File path
   * @returns {Promise<Project>} - Loaded project
   * @static
   */
  static async load(filePath) {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      const json = JSON.parse(data);
      return new Project(json);
    } catch (error) {
      throw new Error(`Failed to load project from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Create a project from a JSON object
   * @param {object} json - JSON object
   * @returns {Project} - Project instance
   * @static
   */
  static fromJSON(json) {
    return new Project(json);
  }

  /**
   * Load a project from a file
   * @param {string} filePath - File path
   * @returns {Promise<Project>}
   */
  static async load(filePath) {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const projectData = JSON.parse(data);
    return new Project(projectData);
  }

  /**
   * Create a new project
   * @param {object} data - Project data
   * @param {string} filePath - File path
   * @returns {Promise<Project>}
   */
  static async create(data, filePath) {
    const project = new Project(data);
    await project.save(filePath);
    return project;
  }
}
