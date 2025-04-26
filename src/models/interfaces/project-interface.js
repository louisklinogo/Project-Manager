/**
 * Project Interface
 * 
 * This module defines the interface for project models.
 */

import { ModelInterface } from './model-interface.js';

/**
 * Project model interface
 * @interface
 * @extends ModelInterface
 */
export class ProjectInterface extends ModelInterface {
  /**
   * Get the project name
   * @returns {string} - Project name
   */
  getName() {
    return this.name;
  }

  /**
   * Set the project name
   * @param {string} name - Project name
   * @returns {void}
   */
  setName(name) {
    this.name = name;
    this.updateTimestamp();
  }

  /**
   * Get the project description
   * @returns {string} - Project description
   */
  getDescription() {
    return this.description;
  }

  /**
   * Set the project description
   * @param {string} description - Project description
   * @returns {void}
   */
  setDescription(description) {
    this.description = description;
    this.updateTimestamp();
  }

  /**
   * Get the project requirements
   * @returns {string} - Project requirements
   */
  getRequirements() {
    return this.requirements;
  }

  /**
   * Set the project requirements
   * @param {string} requirements - Project requirements
   * @returns {void}
   */
  setRequirements(requirements) {
    this.requirements = requirements;
    this.updateTimestamp();
  }

  /**
   * Get the project research
   * @returns {object} - Project research
   */
  getResearch() {
    return this.research;
  }

  /**
   * Set the project research
   * @param {object} research - Project research
   * @returns {void}
   */
  setResearch(research) {
    this.research = research;
    this.updateTimestamp();
  }

  /**
   * Get the project blueprint ID
   * @returns {string|null} - Blueprint ID
   */
  getBlueprintId() {
    return this.blueprint;
  }

  /**
   * Set the project blueprint ID
   * @param {string} blueprintId - Blueprint ID
   * @returns {void}
   */
  setBlueprintId(blueprintId) {
    this.blueprint = blueprintId;
    this.updateTimestamp();
  }

  /**
   * Add domain knowledge to the project research
   * @param {object} knowledge - Domain knowledge
   * @returns {void}
   */
  addDomainKnowledge(knowledge) {
    if (!this.research.domain_knowledge) {
      this.research.domain_knowledge = [];
    }
    this.research.domain_knowledge.push(knowledge);
    this.updateTimestamp();
  }

  /**
   * Add a similar project to the project research
   * @param {object} project - Similar project
   * @returns {void}
   */
  addSimilarProject(project) {
    if (!this.research.similar_projects) {
      this.research.similar_projects = [];
    }
    this.research.similar_projects.push(project);
    this.updateTimestamp();
  }

  /**
   * Add a best practice to the project research
   * @param {object} practice - Best practice
   * @returns {void}
   */
  addBestPractice(practice) {
    if (!this.research.best_practices) {
      this.research.best_practices = [];
    }
    this.research.best_practices.push(practice);
    this.updateTimestamp();
  }
}
