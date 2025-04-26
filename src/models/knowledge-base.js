/**
 * Knowledge Base model
 */

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { validateKnowledgeBaseSchema } from './validator.js';
import { KnowledgeBaseInterface } from './interfaces/index.js';

/**
 * Knowledge Base class
 * @implements {KnowledgeBaseInterface}
 */
export class KnowledgeBase extends KnowledgeBaseInterface {
  /**
   * Create a new knowledge base
   * @param {object} data - Knowledge base data
   */
  constructor(data = {}) {
    super();
    this.id = data.id || `kb-${uuidv4()}`;
    this.domain = data.domain || '';
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.concepts = data.concepts || [];
    this.patterns = data.patterns || [];
    this.best_practices = data.best_practices || [];
    this.examples = data.examples || [];
  }

  /**
   * Validate the knowledge base
   * @returns {boolean} - Whether the knowledge base is valid
   * @throws {Error} - If the knowledge base is invalid
   */
  validate() {
    // Basic validation
    if (!this.id) {
      throw new Error('Knowledge Base ID is required');
    }
    if (!this.domain) {
      throw new Error('Domain is required');
    }

    // Schema validation
    try {
      validateKnowledgeBaseSchema(this);
    } catch (error) {
      throw error;
    }

    return true;
  }

  /**
   * Save the knowledge base to a file
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
   * Load a knowledge base from a file
   * @param {string} filePath - File path
   * @returns {Promise<KnowledgeBase>}
   */
  static async load(filePath) {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      const kbData = JSON.parse(data);
      return new KnowledgeBase(kbData);
    } catch (error) {
      throw new Error(`Failed to load knowledge base from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Create a knowledge base from a JSON object
   * @param {object} json - JSON object
   * @returns {KnowledgeBase} - Knowledge base instance
   * @static
   */
  static fromJSON(json) {
    return new KnowledgeBase(json);
  }

  /**
   * Create a new knowledge base
   * @param {object} data - Knowledge base data
   * @param {string} filePath - File path
   * @returns {Promise<KnowledgeBase>}
   */
  static async create(data, filePath) {
    const kb = new KnowledgeBase(data);
    await kb.save(filePath);
    return kb;
  }

  /**
   * Add a concept to the knowledge base
   * @param {object} concept - Concept data
   * @returns {KnowledgeBase} - The knowledge base instance
   */
  addConcept(concept) {
    if (!concept.id) {
      concept.id = `concept-${uuidv4()}`;
    }
    this.concepts.push(concept);
    return this;
  }

  /**
   * Add a pattern to the knowledge base
   * @param {object} pattern - Pattern data
   * @returns {KnowledgeBase} - The knowledge base instance
   */
  addPattern(pattern) {
    if (!pattern.id) {
      pattern.id = `pattern-${uuidv4()}`;
    }
    this.patterns.push(pattern);
    return this;
  }

  /**
   * Add a best practice to the knowledge base
   * @param {object} bestPractice - Best practice data
   * @returns {KnowledgeBase} - The knowledge base instance
   */
  addBestPractice(bestPractice) {
    if (!bestPractice.id) {
      bestPractice.id = `best-practice-${uuidv4()}`;
    }
    this.best_practices.push(bestPractice);
    return this;
  }

  /**
   * Add an example to the knowledge base
   * @param {object} example - Example data
   * @returns {KnowledgeBase} - The knowledge base instance
   */
  addExample(example) {
    if (!example.id) {
      example.id = `example-${uuidv4()}`;
    }
    this.examples.push(example);
    return this;
  }

  /**
   * Search the knowledge base
   * @param {string} query - Search query
   * @returns {Array} - Search results
   */
  search(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    // Search concepts
    this.concepts.forEach(concept => {
      if (concept.name?.toLowerCase().includes(lowerQuery) ||
          concept.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'concept',
          item: concept
        });
      }
    });

    // Search patterns
    this.patterns.forEach(pattern => {
      if (pattern.name?.toLowerCase().includes(lowerQuery) ||
          pattern.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'pattern',
          item: pattern
        });
      }
    });

    // Search best practices
    this.best_practices.forEach(bestPractice => {
      if (bestPractice.name?.toLowerCase().includes(lowerQuery) ||
          bestPractice.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'best_practice',
          item: bestPractice
        });
      }
    });

    // Search examples
    this.examples.forEach(example => {
      if (example.name?.toLowerCase().includes(lowerQuery) ||
          example.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'example',
          item: example
        });
      }
    });

    return results;
  }
}
