/**
 * MCP Tool for initializing a project
 */

import { initializeProjectDirect } from '../../core/direct-functions/initialize-project-direct.js';

/**
 * MCP Tool definition for initializing a project
 */
export const initializeProjectTool = {
  name: 'project-manager.initialize-project',
  description: 'Initialize a new project with Project Manager',
  
  parameters: {
    type: 'object',
    properties: {
      projectRoot: {
        type: 'string',
        description: 'Root directory for the project. If not provided, the current workspace root will be used.'
      },
      addAliases: {
        type: 'boolean',
        description: 'Whether to add aliases to the project',
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
      const result = await initializeProjectDirect(args, log, context);
      
      if (result.success) {
        return {
          status: 'success',
          message: result.data.message,
          projectRoot: result.data.projectRoot
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
