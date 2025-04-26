/**
 * Knowledge Base Interface
 * 
 * This module defines the interface for knowledge base models.
 */

import { ModelInterface } from './model-interface.js';

/**
 * Knowledge Base model interface
 * @interface
 * @extends ModelInterface
 */
export class KnowledgeBaseInterface extends ModelInterface {
  /**
   * Get the domain
   * @returns {string} - Domain
   */
  getDomain() {
    return this.domain;
  }

  /**
   * Set the domain
   * @param {string} domain - Domain
   * @returns {void}
   */
  setDomain(domain) {
    this.domain = domain;
    this.updateTimestamp();
  }

  /**
   * Get the concepts
   * @returns {Array} - Concepts
   */
  getConcepts() {
    return this.concepts;
  }

  /**
   * Set the concepts
   * @param {Array} concepts - Concepts
   * @returns {void}
   */
  setConcepts(concepts) {
    this.concepts = concepts;
    this.updateTimestamp();
  }

  /**
   * Get the patterns
   * @returns {Array} - Patterns
   */
  getPatterns() {
    return this.patterns;
  }

  /**
   * Set the patterns
   * @param {Array} patterns - Patterns
   * @returns {void}
   */
  setPatterns(patterns) {
    this.patterns = patterns;
    this.updateTimestamp();
  }

  /**
   * Get the best practices
   * @returns {Array} - Best practices
   */
  getBestPractices() {
    return this.best_practices;
  }

  /**
   * Set the best practices
   * @param {Array} bestPractices - Best practices
   * @returns {void}
   */
  setBestPractices(bestPractices) {
    this.best_practices = bestPractices;
    this.updateTimestamp();
  }

  /**
   * Get the examples
   * @returns {Array} - Examples
   */
  getExamples() {
    return this.examples;
  }

  /**
   * Set the examples
   * @param {Array} examples - Examples
   * @returns {void}
   */
  setExamples(examples) {
    this.examples = examples;
    this.updateTimestamp();
  }

  /**
   * Add a concept
   * @param {object} concept - Concept
   * @returns {void}
   */
  addConcept(concept) {
    if (!this.concepts) {
      this.concepts = [];
    }
    this.concepts.push(concept);
    this.updateTimestamp();
  }

  /**
   * Add a pattern
   * @param {object} pattern - Pattern
   * @returns {void}
   */
  addPattern(pattern) {
    if (!this.patterns) {
      this.patterns = [];
    }
    this.patterns.push(pattern);
    this.updateTimestamp();
  }

  /**
   * Add a best practice
   * @param {object} bestPractice - Best practice
   * @returns {void}
   */
  addBestPractice(bestPractice) {
    if (!this.best_practices) {
      this.best_practices = [];
    }
    this.best_practices.push(bestPractice);
    this.updateTimestamp();
  }

  /**
   * Add an example
   * @param {object} example - Example
   * @returns {void}
   */
  addExample(example) {
    if (!this.examples) {
      this.examples = [];
    }
    this.examples.push(example);
    this.updateTimestamp();
  }

  /**
   * Get a concept by ID
   * @param {string} conceptId - Concept ID
   * @returns {object|null} - Concept or null if not found
   */
  getConceptById(conceptId) {
    return this.concepts.find(concept => concept.id === conceptId) || null;
  }

  /**
   * Get a pattern by ID
   * @param {string} patternId - Pattern ID
   * @returns {object|null} - Pattern or null if not found
   */
  getPatternById(patternId) {
    return this.patterns.find(pattern => pattern.id === patternId) || null;
  }

  /**
   * Get a best practice by ID
   * @param {string} bestPracticeId - Best practice ID
   * @returns {object|null} - Best practice or null if not found
   */
  getBestPracticeById(bestPracticeId) {
    return this.best_practices.find(bestPractice => bestPractice.id === bestPracticeId) || null;
  }

  /**
   * Get an example by ID
   * @param {string} exampleId - Example ID
   * @returns {object|null} - Example or null if not found
   */
  getExampleById(exampleId) {
    return this.examples.find(example => example.id === exampleId) || null;
  }
}
