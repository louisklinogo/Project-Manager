/**
 * Direct function for listing projects
 */

import fs from 'fs';
import path from 'path';
import { findProjectJsonPath } from '../utils/path-utils.js';

/**
 * Read project.json file
 * @param {string} projectPath - Path to project.json
 * @returns {Object} Project data
 */
function readProjectFile(projectPath) {
  try {
    const content = fs.readFileSync(projectPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read project file: ${error.message}`);
  }
}

/**
 * Find all project.json files in a directory and its subdirectories
 * @param {string} directory - Directory to search
 * @param {number} maxDepth - Maximum depth to search
 * @returns {Array<string>} Array of project.json paths
 */
function findProjectFiles(directory, maxDepth = 3) {
  const projectFiles = [];
  
  function searchDirectory(dir, depth) {
    if (depth > maxDepth) return;
    
    try {
      const files = fs.readdirSync(dir);
      
      // Check if project.json exists in this directory
      if (files.includes('project.json')) {
        projectFiles.push(path.join(dir, 'project.json'));
      }
      
      // Recursively search subdirectories
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory() && !file.startsWith('.')) {
          searchDirectory(filePath, depth + 1);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  searchDirectory(directory, 0);
  return projectFiles;
}

/**
 * Direct function wrapper for listing projects
 * @param {Object} args - Arguments for the function
 * @param {string} args.directory - Directory to search for projects
 * @param {number} args.maxDepth - Maximum depth to search
 * @param {boolean} args.detailed - Whether to include detailed project information
 * @param {Object} log - Logger object
 * @param {Object} context - Context object
 * @returns {Promise<Object>} Result object
 */
export async function listProjectsDirect(args, log, context = {}) {
  try {
    // Determine search directory
    const searchDirectory = args.directory || process.cwd();
    
    // Find project files
    const projectFiles = findProjectFiles(searchDirectory, args.maxDepth || 3);
    
    if (projectFiles.length === 0) {
      return {
        success: true,
        data: {
          message: `No projects found in ${searchDirectory}`,
          projects: []
        }
      };
    }
    
    // Read project data
    const projects = [];
    for (const projectFile of projectFiles) {
      try {
        const projectData = readProjectFile(projectFile);
        
        // Add project data to list
        if (args.detailed) {
          // Include full project data
          projects.push({
            ...projectData,
            path: projectFile,
            directory: path.dirname(projectFile)
          });
        } else {
          // Include only basic project data
          projects.push({
            name: projectData.name,
            description: projectData.description,
            created_at: projectData.created_at,
            updated_at: projectData.updated_at,
            path: projectFile,
            directory: path.dirname(projectFile)
          });
        }
      } catch (error) {
        log.warn(`Failed to read project file ${projectFile}: ${error.message}`);
      }
    }
    
    return {
      success: true,
      data: {
        message: `Found ${projects.length} projects`,
        projects
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'LIST_PROJECTS_FAILED',
        message: `Failed to list projects: ${error.message}`,
        details: error.stack
      }
    };
  }
}
