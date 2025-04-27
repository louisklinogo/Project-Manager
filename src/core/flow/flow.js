/**
 * @fileoverview Flow class for orchestrating nodes
 *
 * This is part of the PocketFlow implementation in JavaScript,
 * inspired by the original Python PocketFlow framework.
 *
 * The Flow class orchestrates the execution of nodes in a sequence,
 * passing data from one node to the next and managing shared memory.
 *
 * @module core/flow/flow
 */

import { randomUUID } from 'crypto';
import { Memory } from './memory.js';
import { Node } from './node.js';

/**
 * Flow class for orchestrating nodes
 *
 * @class Flow
 * @classdesc A flow that orchestrates the execution of nodes in a sequence
 */
export class Flow {
  /**
   * Initialize the flow
   *
   * @param {Object} options - Flow configuration options
   * @param {string} [options.id] - Unique identifier for the flow (generated if not provided)
   * @param {string} [options.name] - Name of the flow (defaults to 'Flow')
   * @param {string} [options.description] - Description of the flow's purpose
   * @param {Memory} [options.memory] - Memory instance to use (created if not provided)
   * @param {boolean} [options.storeIntermediateResults] - Whether to store intermediate results in memory
   * @param {boolean} [options.continueOnError] - Whether to continue execution when a node throws an error
   * @param {Object} [options.metadata] - Additional metadata for the flow
   * @param {Function} [options.errorHandler] - Custom error handler function (node, error, index) => void
   */
  constructor(options = {}) {
    this.options = options;
    this.id = options.id || randomUUID();
    this.name = options.name || 'Flow';
    this.description = options.description || '';
    this.nodes = [];
    this.memory = options.memory || new Memory();
    this.storeIntermediateResults = options.storeIntermediateResults || false;
    this.continueOnError = options.continueOnError || false;
    this.metadata = options.metadata || {};
    this.errorHandler = options.errorHandler || this._defaultErrorHandler;
  }

  /**
   * Default error handler
   *
   * @param {Node} node - Node that threw the error
   * @param {Error} error - Error that was thrown
   * @param {number} _index - Index of the node in the flow (unused in default handler)
   * @private
   */
  _defaultErrorHandler(node, error, _index) {
    console.error(`Error in node ${node.name} (${node.id}):`, error);
  }

  /**
   * Add a node to the flow
   *
   * @param {Node} node - Node to add
   * @returns {Flow} - This flow for chaining
   * @throws {Error} If node is not an instance of Node
   */
  add(node) {
    if (!(node instanceof Node)) {
      throw new Error('Node must be an instance of Node class');
    }
    this.nodes.push(node);
    return this;
  }

  /**
   * Add multiple nodes to the flow
   *
   * @param {Array<Node>} nodes - Nodes to add
   * @returns {Flow} - This flow for chaining
   * @throws {Error} If any node is not an instance of Node
   */
  addAll(nodes) {
    nodes.forEach(node => this.add(node));
    return this;
  }

  /**
   * Insert a node at a specific position in the flow
   *
   * @param {number} index - Index to insert the node at
   * @param {Node} node - Node to insert
   * @returns {Flow} - This flow for chaining
   * @throws {Error} If node is not an instance of Node or index is out of bounds
   */
  insert(index, node) {
    if (!(node instanceof Node)) {
      throw new Error('Node must be an instance of Node class');
    }

    if (index < 0 || index > this.nodes.length) {
      throw new Error(`Index ${index} out of bounds`);
    }

    this.nodes.splice(index, 0, node);
    return this;
  }

  /**
   * Remove a node from the flow
   *
   * @param {Node|string} nodeOrId - Node or node ID to remove
   * @returns {Flow} - This flow for chaining
   */
  remove(nodeOrId) {
    const id = nodeOrId instanceof Node ? nodeOrId.id : nodeOrId;
    const index = this.nodes.findIndex(node => node.id === id);

    if (index !== -1) {
      this.nodes.splice(index, 1);
    }

    return this;
  }

  /**
   * Run the flow with input data
   *
   * @param {*} data - Input data
   * @returns {*} - Flow result
   * @throws {Error} If a node throws an error and continueOnError is false
   */
  run(data) {
    // Store input data in memory if enabled
    if (this.storeIntermediateResults) {
      this.memory.set('input', data);
    }

    let result = data;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      try {
        // Process data through the node
        result = node.process(result);

        // Store intermediate results in memory if enabled
        if (this.storeIntermediateResults) {
          this.memory.set(`node_${i}_${node.id}_result`, result);
        }
      } catch (error) {
        // Handle errors
        this.errorHandler(node, error, i);

        // Store error in memory if enabled
        if (this.storeIntermediateResults) {
          this.memory.set(`node_${i}_${node.id}_error`, error);
        }

        // Re-throw the error if not configured to continue on error
        if (!this.continueOnError) {
          throw error;
        }
      }
    }

    // Store final result in memory if enabled
    if (this.storeIntermediateResults) {
      this.memory.set('output', result);
    }

    return result;
  }

  /**
   * Get a node by index
   *
   * @param {number} index - Node index
   * @returns {Node} - Node at the given index
   * @throws {Error} If index is out of bounds
   */
  getNode(index) {
    if (index < 0 || index >= this.nodes.length) {
      throw new Error(`Node index ${index} out of bounds`);
    }
    return this.nodes[index];
  }

  /**
   * Get a node by ID
   *
   * @param {string} id - Node ID
   * @returns {Node} - Node with the given ID
   * @throws {Error} If node with ID is not found
   */
  getNodeById(id) {
    const node = this.nodes.find(node => node.id === id);
    if (!node) {
      throw new Error(`Node with ID ${id} not found`);
    }
    return node;
  }

  /**
   * Get nodes by name
   *
   * @param {string} name - Node name
   * @returns {Array<Node>} - Nodes with the given name
   */
  getNodesByName(name) {
    return this.nodes.filter(node => node.name === name);
  }

  /**
   * Clear all nodes from the flow
   *
   * @returns {Flow} - This flow for chaining
   */
  clear() {
    this.nodes = [];
    return this;
  }

  /**
   * Get the number of nodes in the flow
   *
   * @returns {number} - Number of nodes
   */
  size() {
    return this.nodes.length;
  }

  /**
   * Get a string representation of the flow
   *
   * @returns {string} - String representation
   */
  toString() {
    return `${this.name} (${this.id}) with ${this.nodes.length} nodes`;
  }

  /**
   * Get a detailed description of the flow
   *
   * @returns {string} - Detailed description
   */
  describe() {
    let description = `Flow: ${this.name} (${this.id})\n`;
    description += `Description: ${this.description || 'No description'}\n`;
    description += `Nodes: ${this.nodes.length}\n`;

    this.nodes.forEach((node, index) => {
      description += `  ${index + 1}. ${node.name} (${node.id})\n`;
      if (node.description) {
        description += `     ${node.description}\n`;
      }
    });

    return description;
  }
}

/**
 * Create a new flow with the given options
 *
 * This is a convenience function for creating flows without using the 'new' keyword.
 *
 * @param {Object} options - Flow options
 * @returns {Flow} - New flow instance
 */
export function createFlow(options = {}) {
  return new Flow(options);
}

export default Flow;
