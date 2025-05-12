/**
 * Initialize Project Direct Functions
 *
 * This module provides direct functions for initializing projects.
 */

import { v4 as uuidv4 } from 'uuid';
import logger from '../core/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the data directory
const DATA_DIR = path.resolve(__dirname, '../../data');
const PROJECTS_DIR = path.resolve(DATA_DIR, 'projects');

/**
 * Initialize a new project
 * @param {Object} options - Project options
 * @returns {Promise<Object>} - Result object
 */
export async function initializeProjectDirect(options) {
  try {
    // Ensure required options are provided
    const projectId = options.id || `project-${uuidv4()}`;
    const projectName = options.name || 'Unnamed Project';
    const description = options.description || '';
    const requirements = options.requirements || '';

    logger.info(`Initializing project: ${projectName} (${projectId})`);

    // Create the project object
    const project = {
      id: projectId,
      name: projectName,
      description,
      requirements,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    // Save the project
    await saveProject(project);

    logger.info(`Project initialized successfully: ${projectId}`);

    return {
      success: true,
      message: 'Project initialized successfully',
      project
    };
  } catch (error) {
    logger.error(`Error initializing project: ${error.message}`);

    return {
      success: false,
      message: `Error initializing project: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * Save a project to disk
 * @param {Object} project - Project to save
 * @returns {Promise<void>}
 */
export async function saveProject(project) {
  try {
    // Ensure the projects directory exists
    if (!fs.existsSync(PROJECTS_DIR)) {
      fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    }

    // Save the project
    const projectPath = path.resolve(PROJECTS_DIR, `${project.id}.json`);
    fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));

    logger.info(`Project saved to: ${projectPath}`);
  } catch (error) {
    logger.error(`Error saving project: ${error.message}`);
    throw error;
  }
}

/**
 * Load a project from disk
 * @param {String} projectId - Project ID
 * @returns {Promise<Object>} - Project object
 */
export async function loadProject(projectId) {
  try {
    // Check if the project exists
    const projectPath = path.resolve(PROJECTS_DIR, `${projectId}.json`);

    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project not found: ${projectId}`);
    }

    // Load the project
    const projectData = fs.readFileSync(projectPath, 'utf8');
    const project = JSON.parse(projectData);

    logger.info(`Project loaded from: ${projectPath}`);

    return {
      success: true,
      message: 'Project loaded successfully',
      project
    };
  } catch (error) {
    logger.error(`Error loading project: ${error.message}`);

    return {
      success: false,
      message: `Error loading project: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * List all projects
 * @returns {Promise<Object>} - Result object with projects
 */
export async function listProjects() {
  try {
    // Ensure the projects directory exists
    if (!fs.existsSync(PROJECTS_DIR)) {
      fs.mkdirSync(PROJECTS_DIR, { recursive: true });
      return {
        success: true,
        message: 'No projects found',
        projects: []
      };
    }

    // Get all project files
    const files = fs.readdirSync(PROJECTS_DIR)
      .filter(file => file.endsWith('.json'));

    // Load all projects
    const projects = [];

    for (const file of files) {
      try {
        const projectData = fs.readFileSync(path.resolve(PROJECTS_DIR, file), 'utf8');
        const project = JSON.parse(projectData);
        projects.push(project);
      } catch (error) {
        logger.warn(`Error loading project from file ${file}: ${error.message}`);
      }
    }

    logger.info(`Found ${projects.length} projects`);

    return {
      success: true,
      message: `Found ${projects.length} projects`,
      projects
    };
  } catch (error) {
    logger.error(`Error listing projects: ${error.message}`);

    return {
      success: false,
      message: `Error listing projects: ${error.message}`,
      error: error.message
    };
  }
}
