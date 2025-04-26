/**
 * MCP Tool for listing projects
 */

import { listProjectsDirect } from '../../core/direct-functions/list-projects-direct.js';

/**
 * MCP Tool definition for listing projects
 */
export const listProjectsTool = {
  name: 'project-manager.list-projects',
  description: 'List all projects managed by Project Manager',
  
  parameters: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        description: 'Directory to search for projects. If not provided, the current workspace root will be used.'
      },
      maxDepth: {
        type: 'number',
        description: 'Maximum depth to search for projects',
        default: 3
      },
      detailed: {
        type: 'boolean',
        description: 'Whether to include detailed information about each project',
        default: false
      }
    }
  },
  
  /**
   * Execute the tool
   * @param {Object} args - Tool arguments
   * @param {Object} context - MCP context
   * @returns {Promise<Object>} Tool result
   */
  execute: async (args, context) => {
    try {
      // Create a logger that uses the MCP context
      const log = {
        info: (message) => context.reportProgress(message),
        warn: (message) => context.reportProgress(`WARNING: ${message}`),
        error: (message) => context.reportProgress(`ERROR: ${message}`)
      };
      
      // Execute the direct function
      const result = await listProjectsDirect(args, log, context);
      
      if (result.success) {
        return {
          status: 'success',
          message: result.data.message,
          projects: result.data.projects
        };
      } else {
        return {
          status: 'error',
          code: result.error.code,
          message: result.error.message
        };
      }
    } catch (error) {
      return {
        status: 'error',
        code: 'UNKNOWN_ERROR',
        message: error.message
      };
    }
  }
};
