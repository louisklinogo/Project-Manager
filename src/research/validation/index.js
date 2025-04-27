/**
 * Research Validation Module
 * 
 * This module provides utilities for validating research materials.
 */

export { ResearchValidator } from './research-validator.js';
export { calculateConfidenceScore } from './confidence-scorer.js';
export { 
  DEFAULT_VALIDATION_CRITERIA, 
  DOMAIN_VALIDATION_CRITERIA, 
  getValidationCriteria 
} from './validation-criteria.js';
