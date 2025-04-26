/**
 * Validator utility for data models
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { projectSchema, blueprintSchema, knowledgeBaseSchema } from './schemas/index.js';

// Create Ajv instance
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Compile schemas
const validateProject = ajv.compile(projectSchema);
const validateBlueprint = ajv.compile(blueprintSchema);
const validateKnowledgeBase = ajv.compile(knowledgeBaseSchema);

/**
 * Validate a project against the schema
 * @param {object} project - Project data
 * @returns {boolean} - Whether the project is valid
 * @throws {Error} - If the project is invalid
 */
export function validateProjectSchema(project) {
  const valid = validateProject(project);
  if (!valid) {
    const errors = validateProject.errors.map(error => {
      return `${error.instancePath} ${error.message}`;
    }).join(', ');
    throw new Error(`Invalid project: ${errors}`);
  }
  return true;
}

/**
 * Validate a blueprint against the schema
 * @param {object} blueprint - Blueprint data
 * @returns {boolean} - Whether the blueprint is valid
 * @throws {Error} - If the blueprint is invalid
 */
export function validateBlueprintSchema(blueprint) {
  const valid = validateBlueprint(blueprint);
  if (!valid) {
    const errors = validateBlueprint.errors.map(error => {
      return `${error.instancePath} ${error.message}`;
    }).join(', ');
    throw new Error(`Invalid blueprint: ${errors}`);
  }
  return true;
}

/**
 * Validate a knowledge base against the schema
 * @param {object} knowledgeBase - Knowledge base data
 * @returns {boolean} - Whether the knowledge base is valid
 * @throws {Error} - If the knowledge base is invalid
 */
export function validateKnowledgeBaseSchema(knowledgeBase) {
  const valid = validateKnowledgeBase(knowledgeBase);
  if (!valid) {
    const errors = validateKnowledgeBase.errors.map(error => {
      return `${error.instancePath} ${error.message}`;
    }).join(', ');
    throw new Error(`Invalid knowledge base: ${errors}`);
  }
  return true;
}
