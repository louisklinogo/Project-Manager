/**
 * Prompts Module
 * 
 * This module provides a centralized system for managing and using prompt templates
 * throughout the application.
 */

import { PromptTemplate, promptManager } from './prompt-template.js';
import * as templates from './templates/index.js';

// Register all templates with the prompt manager
Object.values(templates).forEach(template => {
  if (template instanceof PromptTemplate) {
    promptManager.register(template.name, template);
  }
});

/**
 * Get a prompt template by name
 * @param {string} name - Template name
 * @returns {PromptTemplate} - The template
 * @throws {Error} - If the template doesn't exist
 */
function getPromptTemplate(name) {
  const template = promptManager.get(name);
  if (!template) {
    throw new Error(`Prompt template not found: ${name}`);
  }
  return template;
}

/**
 * Render a prompt template with variables
 * @param {string} name - Template name
 * @param {object} variables - Variables to substitute
 * @returns {string} - Rendered template
 * @throws {Error} - If the template doesn't exist or variables are missing
 */
function renderPrompt(name, variables = {}) {
  return promptManager.render(name, variables);
}

/**
 * Create a new prompt template
 * @param {string} template - Template string
 * @param {object} options - Template options
 * @returns {PromptTemplate} - New template instance
 */
function createPromptTemplate(template, options = {}) {
  return new PromptTemplate(template, options);
}

/**
 * Register a new prompt template
 * @param {string} name - Template name
 * @param {string|PromptTemplate} template - Template string or instance
 * @param {object} options - Template options
 * @returns {PromptTemplate} - The registered template
 */
function registerPromptTemplate(name, template, options = {}) {
  return promptManager.register(name, template, options);
}

/**
 * Get all registered template names
 * @returns {string[]} - Array of template names
 */
function getPromptTemplateNames() {
  return promptManager.getTemplateNames();
}

// Export the prompt manager and utility functions
export {
  PromptTemplate,
  promptManager,
  getPromptTemplate,
  renderPrompt,
  createPromptTemplate,
  registerPromptTemplate,
  getPromptTemplateNames
};

// Export all templates
export * from './templates/index.js';
