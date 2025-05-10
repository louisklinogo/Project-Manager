/**
 * GeminiService.js
 * Implementation of IAIService for Google Gemini
 */

import IAIService from "../interfaces/IAIService.js";

/**
 * GeminiService
 * Implementation of IAIService for Google Gemini
 */
class GeminiService extends IAIService {
  /**
   * Initialize the Gemini service
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Google API key
   * @param {string} config.model - Model to use (default: 'gemini-1.5-pro')
   * @param {number} config.maxTokens - Maximum tokens (default: 8192)
   * @param {number} config.temperature - Temperature (default: 0.7)
   * @param {Object} config.logger - Logger object (default: console)
   */
  constructor(config) {
    super();
    this.config = {
      model: "gemini-1.5-pro",
      maxTokens: 8192,
      temperature: 0.7,
      logger: console,
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error("Google API key is required");
    }

    // Initialize Google Generative AI client
    this.initializeClient();

    this.logger = this.config.logger;
  }

  /**
   * Initialize the Google Generative AI client
   * This is done in a separate method to allow for dynamic import
   */
  async initializeClient() {
    try {
      // Dynamic import for Google Generative AI
      const { GoogleGenerativeAI } = await import("@google/generative-ai");

      // Initialize the client
      this.googleAI = new GoogleGenerativeAI(this.config.apiKey);

      // Get the model
      this.model = this.googleAI.getGenerativeModel({
        model: this.config.model,
      });

      this.initialized = true;
    } catch (error) {
      this.logger.error(
        `Failed to initialize Google Generative AI client: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Ensure the client is initialized
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeClient();
    }
  }

  /**
   * Send a message to Gemini and get a response
   * @param {Object} options - Message options
   * @param {string} options.prompt - The prompt to send
   * @param {string} options.systemPrompt - System prompt
   * @param {number} options.maxTokens - Maximum tokens for response
   * @param {number} options.temperature - Temperature for response generation
   * @returns {Promise<Object>} - Gemini's response
   */
  async sendMessage(options) {
    try {
      await this.ensureInitialized();

      const { prompt, systemPrompt, maxTokens, temperature } = options;

      // Create chat session
      const chat = this.model.startChat({
        generationConfig: {
          maxOutputTokens: maxTokens || this.config.maxTokens,
          temperature: temperature || this.config.temperature,
        },
      });

      // If system prompt is provided, prepend it to the user message
      const finalPrompt = systemPrompt
        ? `${systemPrompt}\n\n${prompt}`
        : prompt;

      // Send message
      const result = await chat.sendMessage(finalPrompt);

      // Format response
      return {
        content: result.response.text(),
        model: this.config.model,
        raw: result,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send a message to Gemini and get a streaming response
   * @param {Object} options - Message options
   * @param {string} options.prompt - The prompt to send
   * @param {string} options.systemPrompt - System prompt
   * @param {number} options.maxTokens - Maximum tokens for response
   * @param {number} options.temperature - Temperature for response generation
   * @param {Function} options.onProgress - Callback for streaming progress
   * @returns {Promise<Object>} - The complete Gemini response
   */
  async sendMessageStream(options) {
    try {
      await this.ensureInitialized();

      const { prompt, systemPrompt, maxTokens, temperature, onProgress } =
        options;

      // Create chat session with generation config
      const chat = this.model.startChat({
        generationConfig: {
          maxOutputTokens: maxTokens || this.config.maxTokens,
          temperature: temperature || this.config.temperature,
        },
      });

      // If system prompt is provided, prepend it to the user message
      const finalPrompt = systemPrompt
        ? `${systemPrompt}\n\n${prompt}`
        : prompt;

      // Send message with streaming
      const result = await chat.sendMessageStream(finalPrompt);

      let fullResponse = "";

      // Process stream
      for await (const chunk of result.stream) {
        const content = chunk.text();
        if (content) {
          fullResponse += content;
          if (onProgress) {
            onProgress(content, fullResponse);
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
      await this.ensureInitialized();

      // Simple ping to check if the service is available
      const chat = this.model.startChat();
      await chat.sendMessage("ping");

      return true;
    } catch (error) {
      this.logger.warn(`Gemini service not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the service name
   * @returns {string} - The service name
   */
  getName() {
    return "gemini";
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
      models: ["gemini-1.5-pro", "gemini-1.5-flash"],
      research: false,
      tools: true,
      vision: true,
    };
  }

  /**
   * Handle an error from Gemini
   * @param {Error} error - The error to handle
   * @returns {Error} - Standardized error object
   */
  handleError(error) {
    // Check for specific Google API errors
    if (error.status) {
      switch (error.status) {
        case 429:
          return new Error(
            "Gemini rate limit exceeded. Please try again later.",
          );
        case 401:
          return new Error("Authentication failed. Please check your API key.");
        case 400:
          return new Error(`Invalid request: ${error.message}`);
        case 500:
        case 503:
          return new Error(
            "Gemini service is currently unavailable. Please try again later.",
          );
        default:
          return new Error(
            `Gemini error (${error.status}): ${error.message || "Unknown error"}`,
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
    return new Error(`Gemini error: ${error.message || "Unknown error"}`);
  }
}

export default GeminiService;
