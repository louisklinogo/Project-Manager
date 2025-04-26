/**
 * MCP Server for Project Manager
 * 
 * This module exports the MCP server tools for Project Manager.
 */

import { initializeProjectTool } from './tools/initialize-project-tool.js';
import { researchProjectTool } from './tools/research-project-tool.js';
import { generateBlueprintTool } from './tools/generate-blueprint-tool.js';
import { listProjectsTool } from './tools/list-projects-tool.js';

/**
 * Register all Project Manager tools with the MCP server
 * @param {Object} mcp - MCP server instance
 */
export function registerTools(mcp) {
  if (!mcp) {
    throw new Error('MCP server instance is required');
  }
  
  // Register tools
  mcp.registerTool(initializeProjectTool);
  mcp.registerTool(researchProjectTool);
  mcp.registerTool(generateBlueprintTool);
  mcp.registerTool(listProjectsTool);
  
  console.log('Project Manager tools registered with MCP server');
}

/**
 * Get all Project Manager tools
 * @returns {Array} Array of tool objects
 */
export function getTools() {
  return [
    initializeProjectTool,
    researchProjectTool,
    generateBlueprintTool,
    listProjectsTool
  ];
}

export {
  initializeProjectTool,
  researchProjectTool,
  generateBlueprintTool,
  listProjectsTool
};
