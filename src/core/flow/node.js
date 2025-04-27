/**
 * @fileoverview Base Node class for processing data in a flow
 *
 * This is part of the PocketFlow implementation in JavaScript,
 * inspired by the original Python PocketFlow framework.
 *
 * The Node class is the fundamental building block of PocketFlow.
 * It processes data through three phases: prep, exec, and post.
 *
 * @module core/flow/node
 */

import { randomUUID } from 'crypto';

/**
 * Base Node class for processing data
 *
 * @class Node
 * @classdesc A node in a flow that processes data through prep, exec, and post phases
 */
export class Node {
  /**
   * Initialize the node
   *
   * @param {Object} options - Node configuration options
   * @param {string} [options.id] - Unique identifier for the node (generated if not provided)
   * @param {string} [options.name] - Name of the node (defaults to class name)
   * @param {string} [options.description] - Description of the node's purpose
   * @param {Object} [options.metadata] - Additional metadata for the node
   */
  constructor(options = {}) {
    this.options = options;
    this.id = options.id || randomUUID();
    this.name = options.name || this.constructor.name;
    this.description = options.description || '';
    this.metadata = options.metadata || {};
  }

  /**
   * Prepare data for execution
   *
   * This method is called before exec() and can be used to transform
   * or validate the input data before processing.
   *
   * @param {*} data - Input data
   * @returns {*} - Prepared data ready for execution
   */
  prep(data) {
    // Default implementation just passes data through
    return data;
  }

  /**
   * Execute the node's main functionality
   *
   * This is where the main processing logic should be implemented.
   *
   * @param {*} data - Prepared data from prep()
   * @returns {*} - Execution result
   */
  exec(data) {
    // Default implementation just passes data through
    return data;
  }

  /**
   * Post-process execution result
   *
   * This method is called after exec() and can be used to transform
   * the result before passing it to the next node.
   *
   * @param {*} result - Execution result from exec()
   * @returns {*} - Post-processed result
   */
  post(result) {
    // Default implementation just passes result through
    return result;
  }

  /**
   * Process data through the node
   *
   * This method orchestrates the data flow through prep, exec, and post phases.
   * In most cases, you should override prep(), exec(), or post() rather than this method.
   *
   * @param {*} data - Input data
   * @returns {*} - Processed data
   */
  process(data) {
    const prepared = this.prep(data);
    const result = this.exec(prepared);
    return this.post(result);
  }

  /**
   * Get a string representation of the node
   *
   * @returns {string} - String representation
   */
  toString() {
    return `${this.name} (${this.id})`;
  }
}

/**
 * Create a new node with the given options
 *
 * This is a convenience function for creating nodes without using the 'new' keyword.
 *
 * @param {Object} options - Node options
 * @returns {Node} - New node instance
 */
export function createNode(options = {}) {
  return new Node(options);
}

export default Node;
