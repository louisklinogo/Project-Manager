/**
 * Simple Blueprint Direct Functions for MVP
 *
 * This module provides direct functions for generating and managing simple blueprints
 * that can be used while the full implementation is being developed.
 */

import { v4 as uuidv4 } from 'uuid';
import { generateSimpleBlueprint } from './simple-blueprint-generator.js';
import { researchProjectDirect } from '../direct/research-project-direct.js';
import logger from '../core/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the data directory
const DATA_DIR = path.resolve(__dirname, '../../data');
const BLUEPRINTS_DIR = path.resolve(DATA_DIR, 'blueprints');

/**
 * Generate a simple blueprint for a project
 * @param {Object} options - Blueprint generation options
 * @returns {Promise<Object>} - Result object
 */
export async function generateSimpleBlueprintDirect(options) {
  try {
    logger.info(`Generating simple blueprint for project: ${options.projectName}`);

    // Ensure required options are provided
    const projectId = options.projectId || `project-${uuidv4()}`;
    const projectName = options.projectName || 'Unnamed Project';
    const description = options.description || '';
    const requirements = options.requirements || '';

    // Research the project if research results are not provided
    let researchResults = options.researchResults;

    if (!researchResults) {
      logger.info(`Researching project: ${projectName}`);

      const researchResult = await researchProjectDirect({
        projectId,
        query: `${projectName}: ${description}. Requirements: ${requirements}`
      });

      if (!researchResult.success) {
        logger.warn(`Research failed: ${researchResult.message}. Continuing with empty research.`);
        researchResults = { result: { summary: { keyPoints: [] } } };
      } else {
        researchResults = researchResult.result;
      }
    }

    // Generate the blueprint
    const blueprint = await generateSimpleBlueprint({
      projectId,
      projectName,
      description,
      requirements,
      researchResults
    });

    // Save the blueprint
    await saveBlueprint(blueprint);

    logger.info(`Blueprint generated and saved successfully: ${blueprint.id}`);

    return {
      success: true,
      message: 'Blueprint generated successfully',
      blueprint
    };
  } catch (error) {
    logger.error(`Error generating blueprint: ${error.message}`);

    return {
      success: false,
      message: `Error generating blueprint: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * Save a blueprint to disk
 * @param {Object} blueprint - Blueprint to save
 * @returns {Promise<void>}
 */
export async function saveBlueprint(blueprint) {
  try {
    // Ensure the blueprints directory exists
    if (!fs.existsSync(BLUEPRINTS_DIR)) {
      fs.mkdirSync(BLUEPRINTS_DIR, { recursive: true });
    }

    // Save the blueprint
    const blueprintPath = path.resolve(BLUEPRINTS_DIR, `${blueprint.id}.json`);
    fs.writeFileSync(blueprintPath, JSON.stringify(blueprint, null, 2));

    logger.info(`Blueprint saved to: ${blueprintPath}`);
  } catch (error) {
    logger.error(`Error saving blueprint: ${error.message}`);
    throw error;
  }
}

/**
 * Load a blueprint from disk
 * @param {String} blueprintId - Blueprint ID
 * @returns {Promise<Object>} - Blueprint object
 */
export async function loadBlueprint(blueprintId) {
  try {
    // Check if the blueprint exists
    const blueprintPath = path.resolve(BLUEPRINTS_DIR, `${blueprintId}.json`);

    if (!fs.existsSync(blueprintPath)) {
      throw new Error(`Blueprint not found: ${blueprintId}`);
    }

    // Load the blueprint
    const blueprintData = fs.readFileSync(blueprintPath, 'utf8');
    const blueprint = JSON.parse(blueprintData);

    logger.info(`Blueprint loaded from: ${blueprintPath}`);

    return {
      success: true,
      message: 'Blueprint loaded successfully',
      blueprint
    };
  } catch (error) {
    logger.error(`Error loading blueprint: ${error.message}`);

    return {
      success: false,
      message: `Error loading blueprint: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * List all blueprints
 * @returns {Promise<Object>} - Result object with blueprints
 */
export async function listBlueprints() {
  try {
    // Ensure the blueprints directory exists
    if (!fs.existsSync(BLUEPRINTS_DIR)) {
      fs.mkdirSync(BLUEPRINTS_DIR, { recursive: true });
      return {
        success: true,
        message: 'No blueprints found',
        blueprints: []
      };
    }

    // Get all blueprint files
    const files = fs.readdirSync(BLUEPRINTS_DIR)
      .filter(file => file.endsWith('.json'));

    // Load all blueprints
    const blueprints = [];

    for (const file of files) {
      try {
        const blueprintData = fs.readFileSync(path.resolve(BLUEPRINTS_DIR, file), 'utf8');
        const blueprint = JSON.parse(blueprintData);
        blueprints.push({
          id: blueprint.id,
          projectId: blueprint.projectId,
          name: blueprint.name,
          description: blueprint.description,
          createdAt: blueprint.createdAt,
          updatedAt: blueprint.updatedAt,
          taskCount: blueprint.tasks.length
        });
      } catch (error) {
        logger.warn(`Error loading blueprint from file ${file}: ${error.message}`);
      }
    }

    logger.info(`Found ${blueprints.length} blueprints`);

    return {
      success: true,
      message: `Found ${blueprints.length} blueprints`,
      blueprints
    };
  } catch (error) {
    logger.error(`Error listing blueprints: ${error.message}`);

    return {
      success: false,
      message: `Error listing blueprints: ${error.message}`,
      error: error.message
    };
  }
}
