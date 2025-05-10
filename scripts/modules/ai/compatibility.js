/**
 * compatibility.js
 * Backward compatibility layer for the AI provider infrastructure
 */

import {
  AnthropicService,
  OpenAIService,
  GeminiService,
  PerplexityService,
  AIServiceFactory,
  ResponseHandler,
} from "./index.js";

/**
 * Legacy API compatibility layer
 * This provides backward compatibility with the old AI services API
 */
class LegacyAPIAdapter {
  /**
   * Initialize the adapter
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = config;
    this.factory = new AIServiceFactory();
    this.handler = new ResponseHandler();

    // Initialize providers based on available API keys
    this.initializeProviders();
  }

  /**
   * Initialize providers based on available API keys
   */
  initializeProviders() {
    // Register Anthropic if API key is available
    if (process.env.ANTHROPIC_API_KEY) {
      this.factory.registerProvider(
        "anthropic",
        AnthropicService,
        {
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: process.env.ANTHROPIC_MODEL || "claude-3-7-sonnet-20250219",
        },
        10,
      );
    }

    // Register OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.factory.registerProvider(
        "openai",
        OpenAIService,
        {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || "gpt-4o",
        },
        20,
      );
    }

    // Register Gemini if API key is available
    if (process.env.GEMINI_API_KEY) {
      this.factory.registerProvider(
        "gemini",
        GeminiService,
        {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || "gemini-1.5-pro",
        },
        30,
      );
    }

    // Register Perplexity if API key is available
    if (process.env.PERPLEXITY_API_KEY) {
      this.factory.registerProvider(
        "perplexity",
        PerplexityService,
        {
          apiKey: process.env.PERPLEXITY_API_KEY,
          model: process.env.PERPLEXITY_MODEL || "sonar-pro",
        },
        40,
      );
    }
  }

  /**
   * Get the Anthropic client (legacy method)
   * @returns {Object} - Anthropic client
   */
  getAnthropicClient() {
    try {
      return this.factory.getProvider("anthropic");
    } catch (error) {
      throw new Error(
        "Anthropic client not available. Make sure ANTHROPIC_API_KEY is set.",
      );
    }
  }

  /**
   * Get the Perplexity client (legacy method)
   * @returns {Object} - Perplexity client
   */
  getPerplexityClient() {
    try {
      return this.factory.getProvider("perplexity");
    } catch (error) {
      throw new Error(
        "Perplexity client not available. Make sure PERPLEXITY_API_KEY is set.",
      );
    }
  }

  /**
   * Get the best available AI model (legacy method)
   * @param {Object} options - Options for model selection
   * @param {boolean} options.claudeOverloaded - Whether Claude is currently overloaded
   * @param {boolean} options.requiresResearch - Whether the operation requires research capabilities
   * @returns {Promise<Object>} - Selected model info with type and client
   */
  async getAvailableAIModel(options = {}) {
    const { claudeOverloaded = false, requiresResearch = false } = options;

    try {
      // Get the best provider based on requirements
      const provider = await this.factory.getBestProvider({
        requiresResearch,
        preferredProviders: claudeOverloaded
          ? ["perplexity", "openai", "gemini"]
          : ["anthropic"],
      });

      // Return in the legacy format
      return {
        type: provider.getName(),
        client: provider,
      };
    } catch (error) {
      throw new Error(`No AI models available: ${error.message}`);
    }
  }

  /**
   * Call Claude to generate tasks (legacy method)
   * @param {string} prdContent - PRD content
   * @param {string} prdPath - Path to the PRD file
   * @param {number} numTasks - Number of tasks to generate
   * @param {number} retryCount - Retry count
   * @param {Object} options - Options object
   * @param {Object} aiClient - AI client instance (optional)
   * @param {Object} modelConfig - Model configuration (optional)
   * @returns {Promise<Object>} - Claude's response
   */
  async callClaude(
    prdContent,
    prdPath,
    numTasks,
    retryCount = 0,
    options = {},
    aiClient = null,
    modelConfig = null,
  ) {
    try {
      // Get the provider
      const provider =
        aiClient ||
        (await this.getAvailableAIModel().then((model) => model.client));

      // Build the system prompt
      const systemPrompt = `You are an AI assistant tasked with breaking down a Product Requirements Document (PRD) into a set of sequential development tasks. Your goal is to create exactly <num_tasks>${numTasks}</num_tasks> well-structured, actionable development tasks based on the PRD provided.`;

      // Send the message
      const response = await provider.sendMessage({
        prompt: `Here's the Product Requirements Document (PRD) to break down into ${numTasks} tasks:\n\n${prdContent}`,
        systemPrompt,
        maxTokens: modelConfig?.maxTokens || 64000,
        temperature: modelConfig?.temperature || 0.2,
      });

      // Normalize the response
      const normalized = this.handler.normalizeResponse(
        response,
        provider.getName(),
      );

      // Parse the response to extract tasks
      // This would need to be implemented based on the specific format expected by the legacy code

      return response;
    } catch (error) {
      // Implement retry logic for certain errors
      if (
        retryCount < 2 &&
        (error.message.includes("rate limit") ||
          error.message.includes("overloaded") ||
          error.message.includes("timeout") ||
          error.message.includes("network"))
      ) {
        const waitTime = (retryCount + 1) * 5000; // 5s, then 10s
        console.log(
          `Waiting ${waitTime / 1000} seconds before retry ${retryCount + 1}/2...`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return await this.callClaude(
          prdContent,
          prdPath,
          numTasks,
          retryCount + 1,
          options,
          aiClient,
          modelConfig,
        );
      } else {
        throw error;
      }
    }
  }

  /**
   * Handle Claude API errors with user-friendly messages (legacy method)
   * @param {Error} error - The error from Claude API
   * @returns {string} - User-friendly error message
   */
  handleClaudeError(error) {
    try {
      const provider = this.factory.getProvider("anthropic");
      return provider.handleError(error).message;
    } catch (providerError) {
      // Fallback error handling
      if (
        error.message?.includes("rate limit") ||
        error.message?.includes("overloaded")
      ) {
        return "The AI service is currently overloaded. Please try again later.";
      }
      if (
        error.message?.includes("authentication") ||
        error.message?.includes("api key")
      ) {
        return "Authentication failed. Please check your API key.";
      }
      return `Error: ${error.message || "Unknown error"}`;
    }
  }
}

// Export the adapter
export default LegacyAPIAdapter;
