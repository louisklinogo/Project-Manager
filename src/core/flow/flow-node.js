/**
 * Flow Node
 *
 * This module provides the base class for flow nodes.
 */

import logger from '../utils/logger.js';
import { randomUUID } from 'crypto';

/**
 * Flow Node class
 */
export class FlowNode {
  /**
   * Constructor
   * @param {String} name - Node name
   * @param {Object} options - Node options
   */
  constructor(name, options = {}) {
    this.id = options.id || randomUUID();
    this.name = name;
    this.options = options;
    this.logger = logger;
  }

  /**
   * Process the input
   * @param {Object} input - Input data
   * @returns {Promise<Object>} - Output data
   */
  async process(input) {
    throw new Error('process() method must be implemented by subclass');
  }
}
