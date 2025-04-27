/**
 * Research module for Project-Manager
 *
 * This module provides utilities for researching project requirements,
 * domain knowledge, best practices, and similar projects, as well as
 * validation, extraction, synthesis, integration, and versioning of research.
 */

// Core research components
export { ResearchManager } from './research-manager.js';
export { ResearchQuery } from './research-query.js';
export { ResearchResult } from './research-result.js';
export {
  generateProjectPlan,
  generateArchitectureRecommendations,
  generateTaskBreakdown
} from './planning-utils.js';

// Validation components
export * from './validation/index.js';

// Extraction components
export * from './extraction/index.js';

// Synthesis components
export * from './synthesis/index.js';

// Integration components
export * from './integration/index.js';

// Versioning components
export * from './versioning/index.js';
