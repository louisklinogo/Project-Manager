/**
 * AnthropicService.js
 * Implementation of IAIService for Anthropic Claude
 */

import { Anthropic } from "@anthropic-ai/sdk";
import IAIService from "../interfaces/IAIService.js";

/**
 * AnthropicService
 * Implementation of IAIService for Anthropic Claude
 */
class AnthropicService extends IAIService {
  /**
   * Initialize the Anthropic service
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Anthropic API key
   * @param {string} config.model - Model to use (default: 'claude-3-7-sonnet-20250219')
   * @param {number} config.maxTokens - Maximum tokens (default: 64000)
   * @param {number} config.temperature - Temperature (default: 0.2)
   * @param {Object} config.logger - Logger object (default: console)
   */
  constructor(config) {
    super();
    this.config = {
      model: "claude-3-7-sonnet-20250219",
      maxTokens: 64000,
      temperature: 0.2,
      logger: console,
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error("Anthropic API key is required");
    }

    // Initialize Anthropic client
    this.client = new Anthropic({
      apiKey: this.config.apiKey,
      defaultHeaders: {
        "anthropic-beta": "output-128k-2025-02-19",
      },
    });

    this.logger = this.config.logger;
  }

  /**
   * Send a message to Claude and get a response
   * @param {Object} options - Message options
   * @param {string} options.prompt - The prompt to send
   * @param {string} options.systemPrompt - System prompt
   * @param {number} options.maxTokens - Maximum tokens for response
   * @param {number} options.temperature - Temperature for response generation
   * @returns {Promise<Object>} - Claude's response
   */
  async sendMessage(options) {
    try {
      const { prompt, systemPrompt, maxTokens, temperature } = options;

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: maxTokens || this.config.maxTokens,
        temperature: temperature || this.config.temperature,
        system: systemPrompt || "",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send a message to Claude and get a streaming response
   * @param {Object} options - Message options
   * @param {string} options.prompt - The prompt to send
   * @param {string} options.systemPrompt - System prompt
   * @param {number} options.maxTokens - Maximum tokens for response
   * @param {number} options.temperature - Temperature for response generation
   * @param {Function} options.onProgress - Callback for streaming progress
   * @returns {Promise<Object>} - The complete Claude response
   */
  async sendMessageStream(options) {
    try {
      const { prompt, systemPrompt, maxTokens, temperature, onProgress } =
        options;

      const stream = await this.client.messages.create({
        model: this.config.model,
        max_tokens: maxTokens || this.config.maxTokens,
        temperature: temperature || this.config.temperature,
        system: systemPrompt || "",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.text) {
          fullResponse += chunk.delta.text;
          if (onProgress) {
            onProgress(chunk.delta.text, fullResponse);
          }
        }
      }

      return { content: fullResponse };
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
      await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        temperature: 0,
        system: 'Respond with "pong"',
        messages: [
          {
            role: "user",
            content: "ping",
          },
        ],
      });
      return true;
    } catch (error) {
      this.logger.warn(`Anthropic service not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the service name
   * @returns {string} - The service name
   */
  getName() {
    return "anthropic";
  }

  /**
   * Get the service capabilities
   * @returns {Object} - The service capabilities
   */
  getCapabilities() {
    return {
      streaming: true,
      systemPrompt: true,
      maxTokens: 128000,
      models: ["claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20240620"],
      research: false,
    };
  }

  /**
   * Handle an error from Claude
   * @param {Error} error - The error to handle
   * @returns {Error} - Standardized error object
   */
  handleError(error) {
    // Check if it's a structured error response
    if (error.type === "error" && error.error) {
      switch (error.error.type) {
        case "overloaded_error":
          return new Error(
            "Claude is currently overloaded. Try again later or use a different provider.",
          );
        case "rate_limit_error":
          return new Error("Rate limit exceeded. Please try again later.");
        case "authentication_error":
          return new Error("Authentication failed. Please check your API key.");
        case "invalid_request_error":
          return new Error(`Invalid request: ${error.error.message}`);
        default:
          return new Error(
            `Claude error: ${error.error.message || "Unknown error"}`,
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
    return new Error(`Claude error: ${error.message || "Unknown error"}`);
  }
}

export default AnthropicService;
