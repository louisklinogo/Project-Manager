/**
 * Prompt Template System
 * 
 * This module provides a robust system for creating, managing, and using prompt templates
 * with XML-like variable substitution.
 */

/**
 * Represents a prompt template with variable substitution
 */
class PromptTemplate {
  /**
   * Create a new prompt template
   * @param {string} template - The template string with XML-like variables (e.g., "<var>name</var>")
   * @param {object} options - Template options
   * @param {string} options.name - Template name
   * @param {string} options.description - Template description
   * @param {object} options.metadata - Additional metadata
   */
  constructor(template, options = {}) {
    this.template = template;
    this.name = options.name || 'unnamed-template';
    this.description = options.description || '';
    this.metadata = options.metadata || {};
    
    // Extract variable names from the template
    this.variables = this._extractVariables(template);
  }

  /**
   * Extract variable names from a template string
   * @param {string} template - Template string
   * @returns {string[]} - Array of variable names
   * @private
   */
  _extractVariables(template) {
    const variableRegex = /<([a-zA-Z0-9_-]+)>(.*?)<\/\1>/g;
    const variables = new Set();
    let match;
    
    while ((match = variableRegex.exec(template)) !== null) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  }

  /**
   * Render the template with the provided variables
   * @param {object} variables - Variables to substitute in the template
   * @returns {string} - Rendered template
   * @throws {Error} - If required variables are missing
   */
  render(variables = {}) {
    // Check for missing variables
    const missingVariables = this.variables.filter(v => !(v in variables));
    if (missingVariables.length > 0) {
      throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
    }
    
    // Perform substitution
    let result = this.template;
    for (const [name, value] of Object.entries(variables)) {
      const regex = new RegExp(`<${name}>(.*?)<\/${name}>`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  /**
   * Create a new template by extending this one
   * @param {string} additionalTemplate - Additional template content
   * @param {object} options - New template options
   * @returns {PromptTemplate} - New template instance
   */
  extend(additionalTemplate, options = {}) {
    const combinedTemplate = `${this.template}\n\n${additionalTemplate}`;
    return new PromptTemplate(combinedTemplate, {
      name: options.name || `${this.name}-extended`,
      description: options.description || this.description,
      metadata: { ...this.metadata, ...(options.metadata || {}) }
    });
  }
}

/**
 * Manages a collection of prompt templates
 */
class PromptTemplateManager {
  constructor() {
    this.templates = new Map();
  }

  /**
   * Register a new template
   * @param {string} name - Template name
   * @param {string|PromptTemplate} template - Template string or instance
   * @param {object} options - Template options
   * @returns {PromptTemplate} - The registered template
   */
  register(name, template, options = {}) {
    const templateInstance = template instanceof PromptTemplate 
      ? template 
      : new PromptTemplate(template, { name, ...options });
    
    this.templates.set(name, templateInstance);
    return templateInstance;
  }

  /**
   * Get a template by name
   * @param {string} name - Template name
   * @returns {PromptTemplate|undefined} - The template or undefined if not found
   */
  get(name) {
    return this.templates.get(name);
  }

  /**
   * Check if a template exists
   * @param {string} name - Template name
   * @returns {boolean} - Whether the template exists
   */
  has(name) {
    return this.templates.has(name);
  }

  /**
   * Remove a template
   * @param {string} name - Template name
   * @returns {boolean} - Whether the template was removed
   */
  remove(name) {
    return this.templates.delete(name);
  }

  /**
   * Get all template names
   * @returns {string[]} - Array of template names
   */
  getTemplateNames() {
    return Array.from(this.templates.keys());
  }

  /**
   * Render a template with variables
   * @param {string} name - Template name
   * @param {object} variables - Variables to substitute
   * @returns {string} - Rendered template
   * @throws {Error} - If the template doesn't exist or variables are missing
   */
  render(name, variables = {}) {
    const template = this.get(name);
    if (!template) {
      throw new Error(`Template not found: ${name}`);
    }
    
    return template.render(variables);
  }
}

// Create a singleton instance
const promptManager = new PromptTemplateManager();

export { PromptTemplate, promptManager };
