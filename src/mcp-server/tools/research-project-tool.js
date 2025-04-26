/**
 * MCP Tool for researching a project
 */

import { researchProjectDirect } from '../../core/direct-functions/research-project-direct.js';

/**
 * MCP Tool definition for researching a project
 */
export const researchProjectTool = {
  name: 'project-manager.research-project',
  description: 'Research a project using AI to gather domain knowledge, similar projects, and best practices',
  
  parameters: {
    type: 'object',
    properties: {
      projectRoot: {
        type: 'string',
        description: 'Root directory for the project. If not provided, the current workspace root will be used.'
      },
      requirements: {
        type: 'string',
        description: 'Project requirements to research. If not provided, the requirements from the project.json file will be used.'
      },
      researchDepth: {
        type: 'string',
        enum: ['basic', 'standard', 'comprehensive'],
        description: 'Depth of research to perform',
        default: 'standard'
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results to return per category',
        default: 5
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
      const result = await researchProjectDirect(args, log, context);
      
      if (result.success) {
        return {
          status: 'success',
          message: result.data.message,
          results: result.data.results
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
