/**
 * AI Provider Examples
 * This file contains examples of how to use the AI provider infrastructure.
 */

import {
  IAIService,
  ResearchProvider,
  AnthropicService,
  OpenAIService,
  GeminiService,
  PerplexityService,
  AIServiceFactory,
  ResponseHandler,
} from "../../scripts/modules/ai/index.js";

/**
 * Basic Usage Example
 * This example shows how to use the AI provider infrastructure for basic message sending.
 */
async function basicUsageExample() {
  // Create a factory
  const factory = new AIServiceFactory();

  // Register providers
  factory.registerProvider(
    "anthropic",
    AnthropicService,
    {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-7-sonnet-20250219",
    },
    10,
  );

  factory.registerProvider(
    "openai",
    OpenAIService,
    {
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
    },
    20,
  );

  // Get the best available provider
  const provider = await factory.getBestProvider();
  console.log(`Using provider: ${provider.getName()}`);

  // Send a message
  const response = await provider.sendMessage({
    prompt: "Hello, how are you?",
    systemPrompt: "You are a helpful assistant",
  });

  // Process the response
  console.log("Response:", response);

  // Normalize the response
  const handler = new ResponseHandler();
  const normalized = handler.normalizeResponse(response, provider.getName());
  console.log("Normalized response:", normalized.content);
}

/**
 * Streaming Example
 * This example shows how to use streaming responses.
 */
async function streamingExample() {
  // Create a factory
  const factory = new AIServiceFactory();

  // Register providers
  factory.registerProvider(
    "anthropic",
    AnthropicService,
    {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-7-sonnet-20250219",
    },
    10,
  );

  // Get the provider
  const provider = factory.getProvider("anthropic");

  // Send a streaming message
  let fullText = "";
  const response = await provider.sendMessageStream({
    prompt: "Write a short poem about AI",
    systemPrompt: "You are a helpful assistant",
    onProgress: (chunk, fullResponse) => {
      process.stdout.write(chunk); // Print each chunk as it arrives
      fullText = fullResponse;
    },
  });

  console.log("\nFull response:", fullText);
}

/**
 * Research Example
 * This example shows how to use research capabilities.
 */
async function researchExample() {
  // Create a factory
  const factory = new AIServiceFactory();

  // Register research provider
  factory.registerProvider(
    "perplexity",
    PerplexityService,
    {
      apiKey: process.env.PERPLEXITY_API_KEY,
      model: "sonar-pro",
    },
    10,
  );

  // Get a provider with research capabilities
  const provider = await factory.getBestProvider({
    requiresResearch: true,
  });
  console.log(`Using research provider: ${provider.getName()}`);

  // Perform research
  const research = await provider.research({
    query: "What is quantum computing?",
    maxResults: 5,
    depth: "comprehensive",
  });

  // Process the research results
  console.log("Research results:", research.content);
  console.log("Sources:");
  research.sources.forEach((source, index) => {
    console.log(`${index + 1}. ${source.title} - ${source.url}`);
  });
}

/**
 * Provider Selection Example
 * This example shows how to select providers based on requirements.
 */
async function providerSelectionExample() {
  // Create a factory
  const factory = new AIServiceFactory();

  // Register providers
  factory.registerProvider(
    "anthropic",
    AnthropicService,
    {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-7-sonnet-20250219",
    },
    10,
  );

  factory.registerProvider(
    "openai",
    OpenAIService,
    {
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
    },
    20,
  );

  factory.registerProvider(
    "gemini",
    GeminiService,
    {
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-1.5-pro",
    },
    30,
  );

  factory.registerProvider(
    "perplexity",
    PerplexityService,
    {
      apiKey: process.env.PERPLEXITY_API_KEY,
      model: "sonar-pro",
    },
    40,
  );

  // Get provider by name
  const anthropic = factory.getProvider("anthropic");
  console.log(`Provider by name: ${anthropic.getName()}`);

  // Get provider by priority
  const bestProvider = await factory.getBestProvider();
  console.log(`Best provider by priority: ${bestProvider.getName()}`);

  // Get provider with research capabilities
  const researchProvider = await factory.getBestProvider({
    requiresResearch: true,
  });
  console.log(`Research provider: ${researchProvider.getName()}`);

  // Get provider with preferred order
  const preferredProvider = await factory.getBestProvider({
    preferredProviders: ["gemini", "openai"],
  });
  console.log(`Preferred provider: ${preferredProvider.getName()}`);
}

/**
 * Error Handling Example
 * This example shows how to handle errors from AI providers.
 */
async function errorHandlingExample() {
  // Create a factory
  const factory = new AIServiceFactory();

  // Register providers
  factory.registerProvider(
    "anthropic",
    AnthropicService,
    {
      apiKey: "invalid-key", // Invalid key to trigger an error
      model: "claude-3-7-sonnet-20250219",
    },
    10,
  );

  factory.registerProvider(
    "openai",
    OpenAIService,
    {
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
    },
    20,
  );

  try {
    // Try to use Anthropic with invalid key
    const provider = factory.getProvider("anthropic");
    await provider.sendMessage({
      prompt: "Hello",
    });
  } catch (error) {
    console.error("Error with Anthropic:", error.message);

    // Fall back to OpenAI
    try {
      const fallbackProvider = factory.getProvider("openai");
      const response = await fallbackProvider.sendMessage({
        prompt: "Hello",
      });
      console.log("Fallback response:", response);
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError.message);
    }
  }
}

/**
 * Response Handling Example
 * This example shows how to handle responses from different providers.
 */
async function responseHandlingExample() {
  // Create a factory and response handler
  const factory = new AIServiceFactory();
  const handler = new ResponseHandler();

  // Register providers
  factory.registerProvider(
    "anthropic",
    AnthropicService,
    {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-7-sonnet-20250219",
    },
    10,
  );

  factory.registerProvider(
    "openai",
    OpenAIService,
    {
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
    },
    20,
  );

  // Get responses from different providers
  const anthropic = factory.getProvider("anthropic");
  const openai = factory.getProvider("openai");

  const anthropicResponse = await anthropic.sendMessage({
    prompt: "What is the capital of France?",
  });

  const openaiResponse = await openai.sendMessage({
    prompt: "What is the capital of France?",
  });

  // Normalize responses
  const normalizedAnthropic = handler.normalizeResponse(
    anthropicResponse,
    "anthropic",
  );

  const normalizedOpenAI = handler.normalizeResponse(openaiResponse, "openai");

  // Compare responses
  console.log("Anthropic:", normalizedAnthropic.content);
  console.log("OpenAI:", normalizedOpenAI.content);

  // Validate responses
  const isValidAnthropic = handler.validateResponse(normalizedAnthropic, {
    minLength: 5,
    requiredFields: ["content", "provider"],
  });

  const isValidOpenAI = handler.validateResponse(normalizedOpenAI, {
    minLength: 5,
    requiredFields: ["content", "provider"],
  });

  console.log("Anthropic response valid:", isValidAnthropic);
  console.log("OpenAI response valid:", isValidOpenAI);
}

// Export examples
export {
  basicUsageExample,
  streamingExample,
  researchExample,
  providerSelectionExample,
  errorHandlingExample,
  responseHandlingExample,
};
