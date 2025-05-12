/**
 * AsyncFlow class for orchestrating async nodes
 * 
 * This is part of the PocketFlow implementation in JavaScript,
 * inspired by the original Python PocketFlow framework.
 */

import { Flow } from './flow.js';

/**
 * AsyncFlow for orchestrating async nodes
 */
export class AsyncFlow extends Flow {
  /**
   * Run the flow with input data asynchronously
   * @param {Object} data - Input data
   * @returns {Promise<Object>} - Flow result
   */
  async run(data) {
    // Store input data in memory if enabled
    if (this.storeIntermediateResults) {
      this.memory.set('input', data);
    }

    let result = data;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      
      try {
        // Process data through the node
        result = await node.process(result);
        
        // Store intermediate results in memory if enabled
        if (this.storeIntermediateResults) {
          this.memory.set(`node_${i}_${node.id}_result`, result);
        }
      } catch (error) {
        // Handle errors
        console.error(`Error in node ${node.name} (${node.id}):`, error);
        
        // Store error in memory if enabled
        if (this.storeIntermediateResults) {
          this.memory.set(`node_${i}_${node.id}_error`, error);
        }
        
        // Re-throw the error if not configured to continue on error
        if (!this.options.continueOnError) {
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
}

/**
 * Create a new async flow with the given options
 * @param {Object} options - Flow options
 * @returns {AsyncFlow} - New async flow instance
 */
export function createAsyncFlow(options = {}) {
  return new AsyncFlow(options);
}

export default AsyncFlow;
