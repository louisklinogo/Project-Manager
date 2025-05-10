/**
 * OpenAIService.js
 * Implementation of IAIService for OpenAI
 */

import OpenAI from "openai";
import IAIService from "../interfaces/IAIService.js";

/**
 * OpenAIService
 * Implementation of IAIService for OpenAI
 */
class OpenAIService extends IAIService {
  /**
   * Initialize the OpenAI service
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - OpenAI API key
   * @param {string} config.model - Model to use (default: 'gpt-4o')
   * @param {number} config.maxTokens - Maximum tokens (default: 4096)
   * @param {number} config.temperature - Temperature (default: 0.7)
   * @param {Object} config.logger - Logger object (default: console)
   */
  constructor(config) {
    super();
    this.config = {
      model: "gpt-4o",
      maxTokens: 4096,
      temperature: 0.7,
      logger: console,
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error("OpenAI API key is required");
    }

    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
    });

    this.logger = this.config.logger;
  }

  /**
   * Send a message to OpenAI and get a response
   * @param {Object} options - Message options
   * @param {string} options.prompt - The prompt to send
   * @param {string} options.systemPrompt - System prompt
   * @param {number} options.maxTokens - Maximum tokens for response
   * @param {number} options.temperature - Temperature for response generation
   * @returns {Promise<Object>} - OpenAI's response
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
   * Send a message to OpenAI and get a streaming response
   * @param {Object} options - Message options
   * @param {string} options.prompt - The prompt to send
   * @param {string} options.systemPrompt - System prompt
   * @param {number} options.maxTokens - Maximum tokens for response
   * @param {number} options.temperature - Temperature for response generation
   * @param {Function} options.onProgress - Callback for streaming progress
   * @returns {Promise<Object>} - The complete OpenAI response
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
      this.logger.warn(`OpenAI service not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the service name
   * @returns {string} - The service name
   */
  getName() {
    return "openai";
  }

  /**
   * Get the service capabilities
   * @returns {Object} - The service capabilities
   */
  getCapabilities() {
    return {
      streaming: true,
      systemPrompt: true,
      maxTokens: 4096,
      models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
      research: false,
      tools: true,
      vision: true,
    };
  }

  /**
   * Handle an error from OpenAI
   * @param {Error} error - The error to handle
   * @returns {Error} - Standardized error object
   */
  handleError(error) {
    // Check if it's an OpenAI API error
    if (error.status) {
      switch (error.status) {
        case 429:
          return new Error(
            "OpenAI rate limit exceeded. Please try again later.",
          );
        case 401:
          return new Error("Authentication failed. Please check your API key.");
        case 400:
          return new Error(`Invalid request: ${error.message}`);
        case 500:
        case 503:
          return new Error(
            "OpenAI service is currently unavailable. Please try again later.",
          );
        default:
          return new Error(
            `OpenAI error (${error.status}): ${error.message || "Unknown error"}`,
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
    return new Error(`OpenAI error: ${error.message || "Unknown error"}`);
  }
}

export default OpenAIService;
