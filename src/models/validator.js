/**
 * Validator utility for data models
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  projectSchema,
  blueprintSchema,
  knowledgeBaseSchema,
  taskSchema,
  subtaskSchema
} from './schemas/index.js';

// Create Ajv instance
const ajv = new Ajv({
  allErrors: true,
  strictTypes: false,
  allowUnionTypes: true
});
addFormats(ajv);

// Compile schemas
const validateProject = ajv.compile(projectSchema);
const validateBlueprint = ajv.compile(blueprintSchema);
const validateKnowledgeBase = ajv.compile(knowledgeBaseSchema);
const validateTask = ajv.compile(taskSchema);
const validateSubtask = ajv.compile(subtaskSchema);

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

/**
 * Validate a task against the schema
 * @param {object} task - Task data
 * @returns {boolean} - Whether the task is valid
 * @throws {Error} - If the task is invalid
 */
export function validateTaskSchema(task) {
  const valid = validateTask(task);
  if (!valid) {
    const errors = validateTask.errors.map(error => {
      return `${error.instancePath} ${error.message}`;
    }).join(', ');
    throw new Error(`Invalid task: ${errors}`);
  }
  return true;
}

/**
 * Validate a subtask against the schema
 * @param {object} subtask - Subtask data
 * @returns {boolean} - Whether the subtask is valid
 * @throws {Error} - If the subtask is invalid
 */
export function validateSubtaskSchema(subtask) {
  const valid = validateSubtask(subtask);
  if (!valid) {
    const errors = validateSubtask.errors.map(error => {
      return `${error.instancePath} ${error.message}`;
    }).join(', ');
    throw new Error(`Invalid subtask: ${errors}`);
  }
  return true;
}
