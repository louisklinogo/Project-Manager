/**
 * Core functionality for Project Manager
 */

// Import utility functions
import { findProjectJsonPath } from './utils/path-utils.js';
import { 
  getAnthropicClientForMCP,
  getOpenAIClientForMCP,
  getGeminiClientForMCP,
  getPerplexityClientForMCP,
  getModelConfig,
  getBestAvailableAIModel,
  handleAIError
} from './utils/ai-client-utils.js';

// Import direct function implementations
import { initializeProjectDirect } from './direct-functions/initialize-project-direct.js';
import { researchProjectDirect } from './direct-functions/research-project-direct.js';
import { generateBlueprintDirect } from './direct-functions/generate-blueprint-direct.js';
import { listProjectsDirect } from './direct-functions/list-projects-direct.js';

// Re-export utility functions
export { findProjectJsonPath } from './utils/path-utils.js';

// Re-export AI client utilities
export {
  getAnthropicClientForMCP,
  getOpenAIClientForMCP,
  getGeminiClientForMCP,
  getPerplexityClientForMCP,
  getModelConfig,
  getBestAvailableAIModel,
  handleAIError
} from './utils/ai-client-utils.js';

// Re-export all direct function implementations
export {
  initializeProjectDirect,
  researchProjectDirect,
  generateBlueprintDirect,
  listProjectsDirect
};
