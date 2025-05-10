/**
 * test-ai-providers.js
 * Test script for the AI provider infrastructure
 *
 * Usage:
 * node scripts/test-ai-providers.js
 */

import dotenv from "dotenv";
import {
  AnthropicService,
  OpenAIService,
  GeminiService,
  PerplexityService,
  AIServiceFactory,
  ResponseHandler,
} from "./modules/ai/index.js";

// Load environment variables
dotenv.config();

// Create a response handler
const handler = new ResponseHandler();

// Test a specific provider
async function testProvider(name, provider) {
  console.log(`\n=== Testing ${name} Provider ===`);

  try {
    console.log("Checking availability...");
    const available = await provider.isAvailable();
    console.log(`Available: ${available}`);

    if (available) {
      console.log("Sending test message...");
      const response = await provider.sendMessage({
        prompt: "What is the capital of France?",
        systemPrompt: "You are a helpful assistant. Keep your answer brief.",
      });

      console.log("Raw response received");

      // Normalize the response
      const normalized = handler.normalizeResponse(response, name);
      console.log(`Response: "${normalized.content}"`);

      // Test streaming
      console.log("Testing streaming...");
      let streamingContent = "";
      const streamingResponse = await provider.sendMessageStream({
        prompt: "Name three famous landmarks in Paris.",
        systemPrompt: "You are a helpful assistant. Keep your answer brief.",
        onProgress: (chunk) => {
          process.stdout.write(chunk);
          streamingContent += chunk;
        },
      });

      console.log("\nStreaming complete");
      console.log(
        `Full streaming content length: ${streamingContent.length} characters`,
      );

      return true;
    }
  } catch (error) {
    console.error(`Error testing ${name}:`, error.message);
  }

  return false;
}

// Test all providers
async function testAllProviders() {
  console.log("=== AI Provider Test ===");

  // Create a factory
  const factory = new AIServiceFactory();

  // Register providers if API keys are available
  const providers = [];

  if (process.env.ANTHROPIC_API_KEY) {
    console.log("Registering Anthropic provider...");
    factory.registerProvider(
      "anthropic",
      AnthropicService,
      {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      10,
    );
    providers.push("anthropic");
  } else {
    console.log("Skipping Anthropic (no API key)");
  }

  if (process.env.OPENAI_API_KEY) {
    console.log("Registering OpenAI provider...");
    factory.registerProvider(
      "openai",
      OpenAIService,
      {
        apiKey: process.env.OPENAI_API_KEY,
      },
      20,
    );
    providers.push("openai");
  } else {
    console.log("Skipping OpenAI (no API key)");
  }

  if (process.env.GEMINI_API_KEY) {
    console.log("Registering Gemini provider...");
    factory.registerProvider(
      "gemini",
      GeminiService,
      {
        apiKey: process.env.GEMINI_API_KEY,
      },
      30,
    );
    providers.push("gemini");
  } else {
    console.log("Skipping Gemini (no API key)");
  }

  if (process.env.PERPLEXITY_API_KEY) {
    console.log("Registering Perplexity provider...");
    factory.registerProvider(
      "perplexity",
      PerplexityService,
      {
        apiKey: process.env.PERPLEXITY_API_KEY,
      },
      40,
    );
    providers.push("perplexity");
  } else {
    console.log("Skipping Perplexity (no API key)");
  }

  if (providers.length === 0) {
    console.log(
      "No API keys found. Please set at least one API key in your .env file.",
    );
    return;
  }

  // Test each provider
  const results = {};
  for (const name of providers) {
    const provider = factory.getProvider(name);
    results[name] = await testProvider(name, provider);
  }

  // Test provider selection
  console.log("\n=== Testing Provider Selection ===");
  try {
    const bestProvider = await factory.getBestProvider();
    console.log(`Best provider: ${bestProvider.getName()}`);

    // If Perplexity is available, test research
    if (providers.includes("perplexity")) {
      console.log("\n=== Testing Research Capabilities ===");
      const researchProvider = await factory.getBestProvider({
        requiresResearch: true,
      });

      console.log(`Research provider: ${researchProvider.getName()}`);

      if (researchProvider.getName() === "perplexity") {
        console.log("Testing research...");
        const research = await researchProvider.research({
          query: "What is the tallest building in the world?",
          maxResults: 2,
        });

        console.log(
          `Research result: "${research.content.substring(0, 100)}..."`,
        );
        console.log(`Sources: ${research.sources.length}`);
        if (research.sources.length > 0) {
          console.log(`First source: ${research.sources[0].title}`);
        }
      }
    }
  } catch (error) {
    console.error("Error testing provider selection:", error.message);
  }

  // Summary
  console.log("\n=== Test Summary ===");
  for (const [name, success] of Object.entries(results)) {
    console.log(`${name}: ${success ? "PASSED" : "FAILED"}`);
  }
}

// Run the test
testAllProviders().catch((error) => {
  console.error("Test failed:", error);
});
