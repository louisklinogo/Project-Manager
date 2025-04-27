/**
 * Knowledge Node Model
 *
 * This model represents a node of extracted knowledge from research.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Knowledge Node class
 */
export class KnowledgeNode {
  /**
   * Create a new knowledge node
   * @param {Object} data - Knowledge node data
   * @param {string} [data.id] - Node ID (generated if not provided)
   * @param {string} data.type - Node type (concept, pattern, practice, etc.)
   * @param {string} data.name - Node name
   * @param {string} [data.description] - Node description
   * @param {string} [data.content] - Node content
   * @param {Array} [data.tags] - Node tags
   * @param {Array} [data.relations] - Node relations to other nodes
   * @param {Object} [data.metadata] - Node metadata
   * @param {Array} [data.sources] - Node sources
   * @param {string} [data.createdAt] - Creation timestamp
   * @param {string} [data.updatedAt] - Update timestamp
   * @param {number} [data.confidence] - Confidence score (0-1)
   * @param {string} [data.version] - Current version ID
   */
  constructor(data = {}) {
    this.id = data.id || `kn-${uuidv4()}`;
    this.type = data.type || 'concept';
    this.name = data.name || '';
    this.description = data.description || '';
    this.content = data.content || '';
    this.tags = data.tags || [];
    this.relations = data.relations || [];
    this.metadata = data.metadata || {};
    this.sources = data.sources || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || this.createdAt;
    this.confidence = data.confidence || 0.5;
    this.version = data.version || null;
  }

  /**
   * Validate the knowledge node
   * @returns {boolean} True if valid, throws error if invalid
   */
  validate() {
    if (!this.id) {
      throw new Error('Knowledge node ID is required');
    }

    if (!this.type) {
      throw new Error('Knowledge node type is required');
    }

    if (!this.name) {
      throw new Error('Knowledge node name is required');
    }

    return true;
  }

  /**
   * Add a relation to another node
   * @param {string} targetId - Target node ID
   * @param {string} type - Relation type
   * @param {Object} [metadata] - Relation metadata
   * @returns {Object} Added relation
   */
  addRelation(targetId, type, metadata = {}) {
    const relation = {
      targetId,
      type,
      metadata,
      createdAt: new Date().toISOString()
    };

    this.relations.push(relation);
    this.updatedAt = new Date().toISOString();

    return relation;
  }

  /**
   * Add a source to the node
   * @param {Object} source - Source data
   * @param {string} source.id - Source ID
   * @param {string} source.type - Source type
   * @param {string} [source.url] - Source URL
   * @param {Object} [source.metadata] - Source metadata
   * @returns {Object} Added source
   */
  addSource(source) {
    if (!source.id) {
      throw new Error('Source ID is required');
    }

    if (!source.type) {
      throw new Error('Source type is required');
    }

    const nodeSource = {
      ...source,
      addedAt: new Date().toISOString()
    };

    this.sources.push(nodeSource);
    this.updatedAt = new Date().toISOString();

    return nodeSource;
  }

  /**
   * Update the node content
   * @param {Object} data - Update data
   * @returns {KnowledgeNode} This node instance
   */
  update(data) {
    if (data.name) this.name = data.name;
    if (data.description) this.description = data.description;
    if (data.content) this.content = data.content;
    if (data.tags) this.tags = [...this.tags, ...data.tags.filter(t => !this.tags.includes(t))];
    if (data.metadata) this.metadata = { ...this.metadata, ...data.metadata };
    if (typeof data.confidence === 'number') this.confidence = data.confidence;
    if (data.version) this.version = data.version;

    this.updatedAt = new Date().toISOString();

    return this;
  }

  /**
   * Convert the node to a plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      content: this.content,
      tags: this.tags,
      relations: this.relations,
      metadata: this.metadata,
      sources: this.sources,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      confidence: this.confidence,
      version: this.version
    };
  }

  /**
   * Create a new knowledge node from a plain object
   * @param {Object} data - Plain object data
   * @returns {KnowledgeNode} New knowledge node instance
   */
  static fromObject(data) {
    return new KnowledgeNode(data);
  }

  /**
   * Create a new knowledge node with a relation to another node
   * @param {Object} data - Knowledge node data
   * @param {string} targetId - Target node ID
   * @param {string} relationType - Relation type
   * @param {Object} [metadata] - Relation metadata
   * @returns {KnowledgeNode} New knowledge node instance
   */
  static withRelation(data, targetId, relationType, metadata = {}) {
    const node = new KnowledgeNode(data);
    node.addRelation(targetId, relationType, metadata);
    return node;
  }
}
