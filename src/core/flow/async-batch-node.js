/**
 * AsyncBatchNode class for asynchronous batch processing
 * 
 * This is part of the PocketFlow implementation in JavaScript,
 * inspired by the original Python PocketFlow framework.
 */

import { AsyncNode } from './async-node.js';

/**
 * AsyncBatchNode for asynchronous batch processing
 */
export class AsyncBatchNode extends AsyncNode {
  /**
   * Initialize the async batch node
   * @param {Object} options - Node options
   */
  constructor(options = {}) {
    super(options);
    this.batchSize = options.batchSize || Infinity;
    this.itemsKey = options.itemsKey || 'items';
    this.resultsKey = options.resultsKey || 'results';
    this.concurrency = options.concurrency || Infinity;
  }

  /**
   * Process a single item asynchronously
   * @param {*} item - Item to process
   * @param {number} index - Item index
   * @returns {Promise<*>} - Processed item
   */
  async processItem(item, index) {
    // Default implementation just returns the item
    return item;
  }

  /**
   * Process multiple items with limited concurrency
   * @param {Array} items - Items to process
   * @returns {Promise<Array>} - Processed items
   */
  async processItemsWithConcurrency(items) {
    const results = new Array(items.length);
    const inProgress = new Set();
    let nextIndex = 0;

    // Helper function to process the next item
    const processNext = async () => {
      if (nextIndex >= items.length) return;
      
      const index = nextIndex++;
      const item = items[index];
      
      inProgress.add(index);
      try {
        results[index] = await this.processItem(item, index);
      } catch (error) {
        console.error(`Error processing item ${index}:`, error);
        throw error;
      } finally {
        inProgress.delete(index);
      }
      
      // Process the next item
      return processNext();
    };

    // Start processing items with limited concurrency
    const initialBatch = Math.min(this.concurrency, items.length);
    const initialPromises = Array.from({ length: initialBatch }, () => processNext());
    
    // Wait for all items to be processed
    await Promise.all(initialPromises);
    
    return results;
  }

  /**
   * Process items in batches asynchronously
   * @param {Array} items - Items to process
   * @returns {Promise<Array>} - Processed items
   */
  async processBatches(items) {
    const results = [];
    
    // Process items in batches of the specified size
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const batchResults = await this.processItemsWithConcurrency(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Execute the node's main functionality asynchronously
   * @param {Object} data - Prepared data
   * @returns {Promise<Object>} - Execution result
   */
  async exec(data) {
    // If data contains items, process them
    if (data && Array.isArray(data[this.itemsKey])) {
      const items = data[this.itemsKey];
      const results = await this.processBatches(items);
      
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
 * Create a new async batch node with the given options
 * @param {Object} options - Node options
 * @returns {AsyncBatchNode} - New async batch node instance
 */
export function createAsyncBatchNode(options = {}) {
  return new AsyncBatchNode(options);
}

export default AsyncBatchNode;
