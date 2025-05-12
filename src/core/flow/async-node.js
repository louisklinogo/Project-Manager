/**
 * AsyncNode class for asynchronous processing
 * 
 * This is part of the PocketFlow implementation in JavaScript,
 * inspired by the original Python PocketFlow framework.
 */

import { Node } from './node.js';

/**
 * AsyncNode for asynchronous processing
 */
export class AsyncNode extends Node {
  /**
   * Initialize the async node
   * @param {Object} options - Node options
   */
  constructor(options = {}) {
    super(options);
    this.timeout = options.timeout || 30000; // Default timeout: 30 seconds
  }

  /**
   * Prepare data for execution asynchronously
   * @param {Object} data - Input data
   * @returns {Promise<Object>} - Prepared data
   */
  async prep(data) {
    // Default implementation just passes data through
    return data;
  }

  /**
   * Execute the node's main functionality asynchronously
   * @param {Object} data - Prepared data
   * @returns {Promise<Object>} - Execution result
   */
  async exec(data) {
    // Default implementation just passes data through
    return data;
  }

  /**
   * Post-process execution result asynchronously
   * @param {Object} result - Execution result
   * @returns {Promise<Object>} - Post-processed result
   */
  async post(result) {
    // Default implementation just passes result through
    return result;
  }

  /**
   * Process data through the node asynchronously
   * @param {Object} data - Input data
   * @returns {Promise<Object>} - Processed data
   */
  async process(data) {
    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`AsyncNode ${this.name} (${this.id}) timed out after ${this.timeout}ms`));
      }, this.timeout);
    });

    // Create a promise for the actual processing
    const processingPromise = (async () => {
      const prepared = await this.prep(data);
      const result = await this.exec(prepared);
      return this.post(result);
    })();

    // Race the processing promise against the timeout promise
    return Promise.race([processingPromise, timeoutPromise]);
  }
}

/**
 * Create a new async node with the given options
 * @param {Object} options - Node options
 * @returns {AsyncNode} - New async node instance
 */
export function createAsyncNode(options = {}) {
  return new AsyncNode(options);
}

export default AsyncNode;
