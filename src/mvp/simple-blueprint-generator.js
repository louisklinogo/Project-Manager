/**
 * Simple Blueprint Generator for MVP
 *
 * This module provides a simplified implementation of blueprint generation
 * that can be used while the full implementation is being developed.
 */

import { v4 as uuidv4 } from 'uuid';
import logger from '../core/utils/logger.js';
import { DependencyVisualizer } from '../utils/dependency-visualizer.js';

/**
 * Generate a simple blueprint for a project
 * @param {Object} options - Blueprint generation options
 * @returns {Promise<Object>} - Generated blueprint
 */
export async function generateSimpleBlueprint(options) {
  try {
    const { projectId, projectName, description, requirements, researchResults } = options;

    logger.info(`Generating simple blueprint for project: ${projectName}`);

    // Create a blueprint ID if not provided
    const blueprintId = options.blueprintId || `blueprint-${uuidv4()}`;

    // Create main tasks based on research or requirements
    const mainTasks = createTasksFromResearch(researchResults, requirements);

    // Create dependencies between tasks
    const dependencies = createSimpleDependencies(mainTasks);

    // Generate a dependency graph
    const dependencyGraph = DependencyVisualizer.generateMermaidDiagram(mainTasks, dependencies);

    // Create the blueprint
    const blueprint = {
      id: blueprintId,
      projectId,
      name: `Blueprint for ${projectName}`,
      description: `Generated blueprint for ${projectName}: ${description}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: mainTasks,
      dependencies,
      visualizations: {
        dependencyGraph
      },
      research: researchResults
    };

    logger.info(`Blueprint generated successfully: ${blueprintId}`);

    return blueprint;
  } catch (error) {
    logger.error(`Error generating simple blueprint: ${error.message}`);
    throw error;
  }
}

/**
 * Create tasks from research results
 * @param {Object} research - Research results
 * @param {String} requirements - Project requirements
 * @returns {Array} - Array of tasks
 */
function createTasksFromResearch(research, requirements) {
  try {
    // Extract key points from research
    const keyPoints = research?.result?.summary?.keyPoints || [];

    // If no key points, create tasks from requirements
    if (keyPoints.length === 0) {
      return createTasksFromRequirements(requirements);
    }

    // Create tasks from key points
    return keyPoints.map((point, index) => ({
      id: `task-${uuidv4()}`,
      title: `Task ${index + 1}: ${truncateString(point, 50)}`,
      description: point,
      status: 'pending',
      priority: 'medium',
      dependencies: [],
      subtasks: []
    }));
  } catch (error) {
    logger.error(`Error creating tasks from research: ${error.message}`);
    return createTasksFromRequirements(requirements);
  }
}

/**
 * Create tasks from requirements
 * @param {String} requirements - Project requirements
 * @returns {Array} - Array of tasks
 */
function createTasksFromRequirements(requirements) {
  try {
    // Split requirements by periods or line breaks
    const reqPoints = requirements
      .split(/[.\n]/)
      .map(point => point.trim())
      .filter(point => point.length > 0);

    // If no requirements, create a default task
    if (reqPoints.length === 0) {
      return [{
        id: `task-${uuidv4()}`,
        title: 'Implement project requirements',
        description: 'Implement the core functionality of the project based on requirements.',
        status: 'pending',
        priority: 'high',
        dependencies: [],
        subtasks: []
      }];
    }

    // Create tasks from requirement points
    return reqPoints.map((point, index) => ({
      id: `task-${uuidv4()}`,
      title: `Task ${index + 1}: ${truncateString(point, 50)}`,
      description: point,
      status: 'pending',
      priority: 'medium',
      dependencies: [],
      subtasks: []
    }));
  } catch (error) {
    logger.error(`Error creating tasks from requirements: ${error.message}`);

    // Return a default task
    return [{
      id: `task-${uuidv4()}`,
      title: 'Implement project requirements',
      description: 'Implement the core functionality of the project based on requirements.',
      status: 'pending',
      priority: 'high',
      dependencies: [],
      subtasks: []
    }];
  }
}

/**
 * Create simple dependencies between tasks
 * @param {Array} tasks - Array of tasks
 * @returns {Array} - Array of dependencies
 */
function createSimpleDependencies(tasks) {
  try {
    const dependencies = [];

    // Create a simple linear dependency chain for the first few tasks
    for (let i = 1; i < Math.min(tasks.length, 4); i++) {
      dependencies.push({
        id: `dependency-${uuidv4()}`,
        source: tasks[i - 1].id,
        target: tasks[i].id,
        type: 'finish-to-start'
      });
    }

    // If we have more than 4 tasks, create some parallel tasks
    if (tasks.length > 4) {
      for (let i = 4; i < tasks.length; i++) {
        // Connect to a random previous task
        const randomPrevIndex = Math.floor(Math.random() * 4);

        dependencies.push({
          id: `dependency-${uuidv4()}`,
          source: tasks[randomPrevIndex].id,
          target: tasks[i].id,
          type: 'finish-to-start'
        });
      }
    }

    return dependencies;
  } catch (error) {
    logger.error(`Error creating dependencies: ${error.message}`);
    return [];
  }
}

/**
 * Truncate a string to a specified length
 * @param {String} str - String to truncate
 * @param {Number} length - Maximum length
 * @returns {String} - Truncated string
 */
function truncateString(str, length) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}
