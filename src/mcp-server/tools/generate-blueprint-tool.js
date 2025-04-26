/**
 * MCP Tool for generating a blueprint
 */

import { generateBlueprintDirect } from '../../core/direct-functions/generate-blueprint-direct.js';

/**
 * MCP Tool definition for generating a blueprint
 */
export const generateBlueprintTool = {
  name: 'project-manager.generate-blueprint',
  description: 'Generate a blueprint for a project using AI',
  
  parameters: {
    type: 'object',
    properties: {
      projectRoot: {
        type: 'string',
        description: 'Root directory for the project. If not provided, the current workspace root will be used.'
      },
      blueprintName: {
        type: 'string',
        description: 'Name of the blueprint to generate',
        default: 'default'
      },
      force: {
        type: 'boolean',
        description: 'Whether to overwrite an existing blueprint with the same name',
        default: false
      },
      options: {
        type: 'object',
        description: 'Additional options for blueprint generation',
        properties: {
          includeArchitecture: {
            type: 'boolean',
            description: 'Whether to include architecture in the blueprint',
            default: true
          },
          includeTasks: {
            type: 'boolean',
            description: 'Whether to include tasks in the blueprint',
            default: true
          },
          includeWorkflow: {
            type: 'boolean',
            description: 'Whether to include workflow in the blueprint',
            default: true
          }
        }
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
      const result = await generateBlueprintDirect(args, log, context);
      
      if (result.success) {
        return {
          status: 'success',
          message: result.data.message,
          blueprintPath: result.data.blueprintPath
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
