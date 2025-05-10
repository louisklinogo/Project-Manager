/**
 * index.js
 * Entry point for AI service infrastructure
 */

import IAIService from "./interfaces/IAIService.js";
import ResearchProvider from "./interfaces/ResearchProvider.js";
import AnthropicService from "./providers/AnthropicService.js";
import OpenAIService from "./providers/OpenAIService.js";
import GeminiService from "./providers/GeminiService.js";
import PerplexityService from "./providers/PerplexityService.js";
import AIServiceFactory from "./AIServiceFactory.js";
import ResponseHandler from "./ResponseHandler.js";
import LegacyAPIAdapter from "./compatibility.js";
import AIProviderMonitor from "./monitoring.js";
import AIFeatureFlags from "./feature-flags.js";

// Export all components
export {
  IAIService,
  ResearchProvider,
  AnthropicService,
  OpenAIService,
  GeminiService,
  PerplexityService,
  AIServiceFactory,
  ResponseHandler,
  LegacyAPIAdapter,
  AIProviderMonitor,
  AIFeatureFlags,
};

// Create and export a singleton factory instance
const factory = new AIServiceFactory();

// Export factory instance
export default factory;
