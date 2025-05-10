/**
 * PerplexityService.js
 * Implementation of ResearchProvider for Perplexity AI
 */

import OpenAI from "openai";
import ResearchProvider from "../interfaces/ResearchProvider.js";

/**
 * PerplexityService
 * Implementation of ResearchProvider for Perplexity AI
 */
class PerplexityService extends ResearchProvider {
  /**
   * Initialize the Perplexity service
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Perplexity API key
   * @param {string} config.model - Model to use (default: 'sonar-pro')
   * @param {number} config.maxTokens - Maximum tokens (default: 4096)
   * @param {number} config.temperature - Temperature (default: 0.7)
   * @param {Object} config.logger - Logger object (default: console)
   */
  constructor(config) {
    super();
    this.config = {
      model: "sonar-pro",
      maxTokens: 8192, // sonar-pro has 8k max output tokens
      temperature: 0.7,
      logger: console,
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error("Perplexity API key is required");
    }

    // Initialize OpenAI client with Perplexity API
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: "https://api.perplexity.ai",
    });

    this.logger = this.config.logger;
  }

  /**
   * Send a message to Perplexity and get a response
   * @param {Object} options - Message options
   * @param {string} options.prompt - The prompt to send
   * @param {string} options.systemPrompt - System prompt
   * @param {number} options.maxTokens - Maximum tokens for response
   * @param {number} options.temperature - Temperature for response generation
   * @returns {Promise<Object>} - Perplexity's response
   */
  async sendMessage(options) {
    try {
      const { prompt, systemPrompt, maxTokens, temperature } = options;

      const messages = [];

      // Add system message if provided
      if (systemPrompt) {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      // Add user message
      messages.push({
        role: "user",
        content: prompt,
      });

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        max_tokens: maxTokens || this.config.maxTokens,
        temperature: temperature || this.config.temperature,
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send a message to Perplexity and get a streaming response
   * @param {Object} options - Message options
   * @param {string} options.prompt - The prompt to send
   * @param {string} options.systemPrompt - System prompt
   * @param {number} options.maxTokens - Maximum tokens for response
   * @param {number} options.temperature - Temperature for response generation
   * @param {Function} options.onProgress - Callback for streaming progress
   * @returns {Promise<Object>} - The complete Perplexity response
   */
  async sendMessageStream(options) {
    try {
      const { prompt, systemPrompt, maxTokens, temperature, onProgress } =
        options;

      const messages = [];

      // Add system message if provided
      if (systemPrompt) {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      // Add user message
      messages.push({
        role: "user",
        content: prompt,
      });

      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        max_tokens: maxTokens || this.config.maxTokens,
        temperature: temperature || this.config.temperature,
        stream: true,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullResponse += content;
            if (onProgress) {
              onProgress(content, fullResponse);
            }
          }
        }
      }

      return {
        content: fullResponse,
        model: this.config.model,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Perform research on a topic
   * @param {Object} options - Research options
   * @param {string} options.query - The research query
   * @param {number} options.maxResults - Maximum number of results
   * @param {string} options.depth - Research depth ('basic' or 'comprehensive')
   * @param {Function} options.onProgress - Callback for research progress
   * @returns {Promise<Object>} - Research results
   */
  async research(options) {
    try {
      const { query, maxResults = 5, depth = "basic", onProgress } = options;

      // Determine model based on depth
      const model = depth === "comprehensive" ? "sonar-pro" : "sonar";

      // Create system prompt for research
      const systemPrompt = `You are a research assistant. Provide a detailed, well-researched answer to the following query. Include relevant facts, data, and citations where possible. ${depth === "comprehensive" ? "Be thorough and comprehensive in your research." : "Provide a concise but informative answer."}`;

      // Add online search flag for online models
      const messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: query,
        },
      ];

      // Add search options for research
      const extraParams = {
        search_options: { include_citations: true },
      };

      // Send request
      const response = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        ...extraParams,
      });

      // Extract sources from citations if available
      const content = response.choices[0].message.content;
      const sources = response.citations || [];

      return {
        content: content,
        sources: sources.slice(0, maxResults).map((citation) => ({
          title: citation.title || "Source",
          url: citation.url || "",
          snippet: citation.snippet || "",
        })),
        model,
        raw: response,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get sources for the research
   * @param {Object} options - Source options
   * @param {string} options.query - The research query
   * @param {number} options.maxSources - Maximum number of sources
   * @returns {Promise<Array>} - List of sources
   */
  async getSources(options) {
    try {
      const { query, maxSources = 5 } = options;

      // Use model for sources
      const model = "sonar";

      // Create system prompt for sources
      const systemPrompt =
        "You are a research assistant. Find relevant sources for the following query. Only return the sources, not the content.";

      // Send request
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: query,
          },
        ],
        max_tokens: 1024,
        temperature: 0.2,
        search_options: { include_citations: true },
      });

      // Extract sources from citations if available
      const sources = response.citations || [];

      return sources.slice(0, maxSources).map((citation) => ({
        title: citation.title || "Source",
        url: citation.url || "",
        snippet: citation.snippet || "",
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if the service is available
   * @returns {Promise<boolean>} - Whether the service is available
   */
  async isAvailable() {
    try {
      // Simple ping to check if the service is available
      await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: "user",
            content: "ping",
          },
        ],
        max_tokens: 5,
        temperature: 0,
      });
      return true;
    } catch (error) {
      this.logger.warn(`Perplexity service not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the service name
   * @returns {string} - The service name
   */
  getName() {
    return "perplexity";
  }

  /**
   * Get the service capabilities
   * @returns {Object} - The service capabilities
   */
  getCapabilities() {
    return {
      streaming: true,
      systemPrompt: true,
      maxTokens: 8192,
      models: [
        "sonar-pro",
        "sonar",
        "sonar-deep-research",
        "sonar-reasoning-pro",
        "sonar-reasoning",
      ],
      research: true,
    };
  }

  /**
   * Check if the provider supports a specific research feature
   * @param {string} feature - The feature to check
   * @returns {boolean} - Whether the feature is supported
   */
  supportsFeature(feature) {
    const supportedFeatures = {
      "online-search": true,
      "source-retrieval": true,
      "comprehensive-research": true,
      "real-time-data": true,
    };

    return !!supportedFeatures[feature];
  }

  /**
   * Get the research capabilities
   * @returns {Object} - The research capabilities
   */
  getResearchCapabilities() {
    return {
      maxSources: 10,
      supportedDepths: ["basic", "comprehensive"],
      realTimeData: true,
      webAccess: true,
    };
  }

  /**
   * Handle an error from Perplexity
   * @param {Error} error - The error to handle
   * @returns {Error} - Standardized error object
   */
  handleError(error) {
    // Check if it's an API error
    if (error.status) {
      switch (error.status) {
        case 429:
          return new Error(
            "Perplexity rate limit exceeded. Please try again later.",
          );
        case 401:
          return new Error("Authentication failed. Please check your API key.");
        case 400:
          return new Error(`Invalid request: ${error.message}`);
        case 500:
        case 503:
          return new Error(
            "Perplexity service is currently unavailable. Please try again later.",
          );
        default:
          return new Error(
            `Perplexity error (${error.status}): ${error.message || "Unknown error"}`,
          );
      }
    }

    // Handle network or timeout errors
    if (error.message?.toLowerCase().includes("timeout")) {
      return new Error("Request timed out. Please try again.");
    }
    if (error.message?.toLowerCase().includes("network")) {
      return new Error("Network error. Please check your connection.");
    }

    // Default error handling
    return new Error(`Perplexity error: ${error.message || "Unknown error"}`);
  }
}

export default PerplexityService;
