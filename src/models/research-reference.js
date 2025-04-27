/**
 * Research Reference Model
 * 
 * This model represents a reference to research in a blueprint.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Research Reference class
 */
export class ResearchReference {
  /**
   * Create a new research reference
   * @param {Object} data - Research reference data
   * @param {string} [data.id] - Reference ID (generated if not provided)
   * @param {string} data.researchId - ID of the referenced research
   * @param {string} data.type - Reference type (source, finding, concept, etc.)
   * @param {string} [data.context] - Context where the reference is used
   * @param {string} [data.content] - Referenced content
   * @param {Object} [data.metadata] - Reference metadata
   * @param {string} [data.createdAt] - Creation timestamp
   */
  constructor(data = {}) {
    this.id = data.id || `ref-${uuidv4()}`;
    this.researchId = data.researchId || '';
    this.type = data.type || 'source';
    this.context = data.context || '';
    this.content = data.content || '';
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date().toISOString();
  }
  
  /**
   * Validate the research reference
   * @returns {boolean} True if valid, throws error if invalid
   */
  validate() {
    if (!this.id) {
      throw new Error('Research reference ID is required');
    }
    
    if (!this.researchId) {
      throw new Error('Research ID is required');
    }
    
    if (!this.type) {
      throw new Error('Reference type is required');
    }
    
    return true;
  }
  
  /**
   * Convert the reference to a plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      researchId: this.researchId,
      type: this.type,
      context: this.context,
      content: this.content,
      metadata: this.metadata,
      createdAt: this.createdAt
    };
  }
  
  /**
   * Create a new research reference from a plain object
   * @param {Object} data - Plain object data
   * @returns {ResearchReference} New research reference instance
   */
  static fromObject(data) {
    return new ResearchReference(data);
  }
  
  /**
   * Create a source reference
   * @param {string} researchId - Research ID
   * @param {Object} [metadata] - Reference metadata
   * @returns {ResearchReference} New source reference
   */
  static createSourceReference(researchId, metadata = {}) {
    return new ResearchReference({
      researchId,
      type: 'source',
      metadata
    });
  }
  
  /**
   * Create a finding reference
   * @param {string} researchId - Research ID
   * @param {string} finding - Finding content
   * @param {Object} [metadata] - Reference metadata
   * @returns {ResearchReference} New finding reference
   */
  static createFindingReference(researchId, finding, metadata = {}) {
    return new ResearchReference({
      researchId,
      type: 'finding',
      content: finding,
      metadata
    });
  }
  
  /**
   * Create a concept reference
   * @param {string} researchId - Research ID
   * @param {string} concept - Concept name
   * @param {string} [description] - Concept description
   * @param {Object} [metadata] - Reference metadata
   * @returns {ResearchReference} New concept reference
   */
  static createConceptReference(researchId, concept, description = '', metadata = {}) {
    return new ResearchReference({
      researchId,
      type: 'concept',
      content: concept,
      context: description,
      metadata
    });
  }
}
