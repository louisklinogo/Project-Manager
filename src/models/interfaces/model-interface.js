/**
 * Model Interface
 * 
 * This module defines the common interface that all data models should implement.
 */

/**
 * Base model interface
 * @interface
 */
export class ModelInterface {
  /**
   * Validate the model
   * @returns {boolean} - Whether the model is valid
   * @throws {Error} - If the model is invalid
   */
  validate() {
    throw new Error('Method validate() must be implemented by subclass');
  }

  /**
   * Save the model to a file
   * @param {string} filePath - File path
   * @returns {Promise<void>}
   * @throws {Error} - If the model cannot be saved
   */
  async save(filePath) {
    throw new Error('Method save() must be implemented by subclass');
  }

  /**
   * Load the model from a file
   * @param {string} filePath - File path
   * @returns {Promise<ModelInterface>} - Loaded model
   * @throws {Error} - If the model cannot be loaded
   */
  static async load(filePath) {
    throw new Error('Method load() must be implemented by subclass');
  }

  /**
   * Convert the model to a JSON object
   * @returns {object} - JSON representation of the model
   */
  toJSON() {
    // Default implementation returns all properties
    return { ...this };
  }

  /**
   * Create a model from a JSON object
   * @param {object} json - JSON object
   * @returns {ModelInterface} - Model instance
   */
  static fromJSON(json) {
    throw new Error('Method fromJSON() must be implemented by subclass');
  }

  /**
   * Get the model's unique identifier
   * @returns {string} - Model ID
   */
  getId() {
    return this.id;
  }

  /**
   * Get the model's creation timestamp
   * @returns {string} - Creation timestamp
   */
  getCreatedAt() {
    return this.created_at;
  }

  /**
   * Get the model's last update timestamp
   * @returns {string} - Last update timestamp
   */
  getUpdatedAt() {
    return this.updated_at;
  }

  /**
   * Update the model's last update timestamp
   * @returns {void}
   */
  updateTimestamp() {
    this.updated_at = new Date().toISOString();
  }
}
