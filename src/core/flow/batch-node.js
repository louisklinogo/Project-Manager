/**
 * BatchNode class for processing multiple items
 * 
 * This is part of the PocketFlow implementation in JavaScript,
 * inspired by the original Python PocketFlow framework.
 */

import { Node } from './node.js';

/**
 * BatchNode for processing multiple items
 */
export class BatchNode extends Node {
  /**
   * Initialize the batch node
   * @param {Object} options - Node options
   */
  constructor(options = {}) {
    super(options);
    this.batchSize = options.batchSize || Infinity;
    this.itemsKey = options.itemsKey || 'items';
    this.resultsKey = options.resultsKey || 'results';
  }

  /**
   * Process a single item
   * @param {*} item - Item to process
   * @param {number} index - Item index
   * @returns {*} - Processed item
   */
  processItem(item, index) {
    // Default implementation just returns the item
    return item;
  }

  /**
   * Process multiple items
   * @param {Array} items - Items to process
   * @returns {Array} - Processed items
   */
  processItems(items) {
    return items.map((item, index) => this.processItem(item, index));
  }

  /**
   * Process items in batches
   * @param {Array} items - Items to process
   * @returns {Array} - Processed items
   */
  processBatches(items) {
    const results = [];
    
    // Process items in batches of the specified size
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const batchResults = this.processItems(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Execute the node's main functionality
   * @param {Object} data - Prepared data
   * @returns {Object} - Execution result
   */
  exec(data) {
    // If data contains items, process them
    if (data && Array.isArray(data[this.itemsKey])) {
      const items = data[this.itemsKey];
      const results = this.processBatches(items);
      
      // Create a new object with the results
      return {
        ...data,
        [this.resultsKey]: results
      };
    }
    
    // If data doesn't contain items, just pass it through
    return data;
  }
}

/**
 * Create a new batch node with the given options
 * @param {Object} options - Node options
 * @returns {BatchNode} - New batch node instance
 */
export function createBatchNode(options = {}) {
  return new BatchNode(options);
}

export default BatchNode;
