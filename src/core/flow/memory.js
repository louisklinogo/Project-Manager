/**
 * @fileoverview Memory class for storing and retrieving data in a flow
 *
 * This is part of the PocketFlow implementation in JavaScript,
 * inspired by the original Python PocketFlow framework.
 *
 * The Memory class provides a shared state mechanism for nodes in a flow,
 * allowing them to store and retrieve data across the flow execution.
 *
 * @module core/flow/memory
 */

/**
 * Memory class for storing and retrieving data
 *
 * @class Memory
 * @classdesc A key-value store for sharing data between nodes in a flow
 */
export class Memory {
  /**
   * Initialize memory
   *
   * @param {Object} initialData - Initial data to store
   */
  constructor(initialData = {}) {
    this.store = new Map();

    // Initialize with any provided data
    Object.entries(initialData).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * Set a value in memory
   *
   * @param {string} key - Key to store value under
   * @param {*} value - Value to store
   * @returns {Memory} - This memory instance for chaining
   */
  set(key, value) {
    this.store.set(key, value);
    return this;
  }

  /**
   * Get a value from memory
   *
   * @param {string} key - Key to retrieve value for
   * @param {*} defaultValue - Default value to return if key doesn't exist
   * @returns {*} - Stored value or default value
   */
  get(key, defaultValue = undefined) {
    return this.has(key) ? this.store.get(key) : defaultValue;
  }

  /**
   * Check if a key exists in memory
   *
   * @param {string} key - Key to check
   * @returns {boolean} - Whether key exists
   */
  has(key) {
    return this.store.has(key);
  }

  /**
   * Delete a value from memory
   *
   * @param {string} key - Key to delete
   * @returns {boolean} - Whether deletion was successful
   */
  delete(key) {
    return this.store.delete(key);
  }

  /**
   * Clear all values from memory
   *
   * @returns {Memory} - This memory instance for chaining
   */
  clear() {
    this.store.clear();
    return this;
  }

  /**
   * Get all keys in memory
   *
   * @returns {Array<string>} - Array of keys
   */
  keys() {
    return Array.from(this.store.keys());
  }

  /**
   * Get all values in memory
   *
   * @returns {Array<*>} - Array of values
   */
  values() {
    return Array.from(this.store.values());
  }

  /**
   * Get all entries in memory
   *
   * @returns {Array<Array<string, *>>} - Array of [key, value] pairs
   */
  entries() {
    return Array.from(this.store.entries());
  }

  /**
   * Get the number of items in memory
   *
   * @returns {number} - Number of items
   */
  size() {
    return this.store.size;
  }

  /**
   * Convert memory to a plain object
   *
   * @returns {Object} - Plain object representation of memory
   */
  toObject() {
    return Object.fromEntries(this.store);
  }

  /**
   * Set multiple values at once
   *
   * @param {Object} data - Object containing key-value pairs to set
   * @returns {Memory} - This memory instance for chaining
   */
  setAll(data) {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value);
    });
    return this;
  }

  /**
   * Get multiple values at once
   *
   * @param {Array<string>} keys - Array of keys to retrieve
   * @returns {Object} - Object containing key-value pairs
   */
  getAll(keys) {
    return keys.reduce((result, key) => {
      result[key] = this.get(key);
      return result;
    }, {});
  }

  /**
   * Delete multiple values at once
   *
   * @param {Array<string>} keys - Array of keys to delete
   * @returns {Memory} - This memory instance for chaining
   */
  deleteAll(keys) {
    keys.forEach(key => this.delete(key));
    return this;
  }

  /**
   * Get a string representation of the memory
   *
   * @returns {string} - String representation
   */
  toString() {
    return JSON.stringify(this.toObject(), null, 2);
  }
}

/**
 * Create a new memory instance with the given initial data
 *
 * This is a convenience function for creating memory instances without using the 'new' keyword.
 *
 * @param {Object} initialData - Initial data to store
 * @returns {Memory} - New memory instance
 */
export function createMemory(initialData = {}) {
  return new Memory(initialData);
}

export default Memory;
