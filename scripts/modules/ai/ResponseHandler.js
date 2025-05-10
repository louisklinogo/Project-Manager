/**
 * ResponseHandler.js
 * Unified handler for AI service responses
 */

/**
 * ResponseHandler
 * Handles and normalizes responses from different AI providers
 */
class ResponseHandler {
  /**
   * Initialize the response handler
   * @param {Object} config - Configuration options
   * @param {Object} config.logger - Logger object (default: console)
   */
  constructor(config = {}) {
    this.config = {
      logger: console,
      ...config,
    };

    this.logger = this.config.logger;
  }

  /**
   * Normalize a response from any AI provider to a standard format
   * @param {Object} response - The raw response from an AI provider
   * @param {string} providerName - The name of the provider
   * @returns {Object} - Normalized response
   */
  normalizeResponse(response, providerName) {
    try {
      // Handle different provider response formats
      switch (providerName) {
        case "anthropic":
          return this.normalizeAnthropicResponse(response);
        case "openai":
          return this.normalizeOpenAIResponse(response);
        case "gemini":
          return this.normalizeGeminiResponse(response);
        case "perplexity":
          return this.normalizePerplexityResponse(response);
        default:
          this.logger.warn(
            `Unknown provider: ${providerName}, returning raw response`,
          );
          return {
            content: JSON.stringify(response),
            provider: providerName,
            raw: response,
          };
      }
    } catch (error) {
      this.logger.error(`Error normalizing response: ${error.message}`);
      return {
        content: "",
        provider: providerName,
        error: error.message,
        raw: response,
      };
    }
  }

  /**
   * Normalize an Anthropic Claude response
   * @param {Object} response - The raw response from Anthropic
   * @returns {Object} - Normalized response
   */
  normalizeAnthropicResponse(response) {
    // Handle streaming response format (already processed)
    if (typeof response.content === "string") {
      return {
        content: response.content,
        provider: "anthropic",
        model: "claude",
        raw: response,
      };
    }

    // Handle standard response format
    if (response.content && Array.isArray(response.content)) {
      // Extract text content from content blocks
      const textContent = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");

      return {
        content: textContent,
        provider: "anthropic",
        model: response.model,
        usage: response.usage,
        raw: response,
      };
    }

    // Fallback for unexpected response format
    return {
      content: JSON.stringify(response),
      provider: "anthropic",
      raw: response,
    };
  }

  /**
   * Normalize an OpenAI response
   * @param {Object} response - The raw response from OpenAI
   * @returns {Object} - Normalized response
   */
  normalizeOpenAIResponse(response) {
    // Handle streaming response format (already processed)
    if (typeof response.content === "string") {
      return {
        content: response.content,
        provider: "openai",
        model: response.model || "gpt-4o",
        raw: response,
      };
    }

    // Handle standard response format
    if (response.choices && response.choices.length > 0) {
      // Extract content from the first choice
      const content = response.choices[0].message?.content || "";

      return {
        content,
        provider: "openai",
        model: response.model,
        usage: response.usage,
        finishReason: response.choices[0].finish_reason,
        raw: response,
      };
    }

    // Fallback for unexpected response format
    return {
      content: JSON.stringify(response),
      provider: "openai",
      raw: response,
    };
  }

  /**
   * Normalize a Google Gemini response
   * @param {Object} response - The raw response from Gemini
   * @returns {Object} - Normalized response
   */
  normalizeGeminiResponse(response) {
    // Handle streaming response format (already processed)
    if (typeof response.content === "string") {
      return {
        content: response.content,
        provider: "gemini",
        model: response.model || "gemini-1.5-pro",
        raw: response,
      };
    }

    // Handle standard response format
    if (response.raw && response.raw.response) {
      // Extract text content
      const content = response.content || "";

      return {
        content,
        provider: "gemini",
        model: response.model,
        raw: response.raw,
      };
    }

    // Fallback for unexpected response format
    return {
      content: JSON.stringify(response),
      provider: "gemini",
      raw: response,
    };
  }

  /**
   * Normalize a Perplexity response
   * @param {Object} response - The raw response from Perplexity
   * @returns {Object} - Normalized response
   */
  normalizePerplexityResponse(response) {
    // Handle Perplexity response format (using OpenAI client)
    if (response.choices && response.choices.length > 0) {
      return {
        content: response.choices[0].message.content,
        provider: "perplexity",
        model: response.model,
        usage: response.usage,
        raw: response,
      };
    }

    // Fallback for unexpected response format
    return {
      content: JSON.stringify(response),
      provider: "perplexity",
      raw: response,
    };
  }

  /**
   * Validate a response to ensure it meets requirements
   * @param {Object} normalizedResponse - The normalized response
   * @param {Object} requirements - Validation requirements
   * @returns {boolean} - Whether the response is valid
   */
  validateResponse(normalizedResponse, requirements = {}) {
    const {
      minLength = 0,
      maxLength = Infinity,
      requiredFields = [],
    } = requirements;

    // Check content length
    if (normalizedResponse.content.length < minLength) {
      this.logger.warn(
        `Response content too short: ${normalizedResponse.content.length} < ${minLength}`,
      );
      return false;
    }

    if (normalizedResponse.content.length > maxLength) {
      this.logger.warn(
        `Response content too long: ${normalizedResponse.content.length} > ${maxLength}`,
      );
      return false;
    }

    // Check required fields
    for (const field of requiredFields) {
      if (!normalizedResponse[field]) {
        this.logger.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    return true;
  }
}

export default ResponseHandler;
