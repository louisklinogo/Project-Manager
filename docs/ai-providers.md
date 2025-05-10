# AI Provider Infrastructure

This document provides comprehensive documentation for the AI provider infrastructure in Project-Manager.

## Overview

The AI provider infrastructure provides a flexible and extensible way to integrate with various AI providers. It allows Project-Manager to use different AI models for different tasks, with automatic fallback and provider selection based on requirements.

## Architecture

The AI provider infrastructure is built around the following components:

- **IAIService Interface**: Defines the common interface that all AI providers must implement.
- **ResearchProvider Interface**: Extends IAIService with research-specific capabilities.
- **Provider Implementations**: Concrete implementations of the interfaces for specific AI providers.
- **AIServiceFactory**: Factory for creating and managing AI service providers.
- **ResponseHandler**: Unified handler for normalizing responses from different AI providers.

## Components

### IAIService Interface

The IAIService interface defines the common methods and properties that all AI providers must implement:

```javascript
class IAIService {
  constructor(config) { ... }
  async sendMessage(options) { ... }
  async sendMessageStream(options) { ... }
  async isAvailable() { ... }
  getName() { ... }
  getCapabilities() { ... }
  handleError(error) { ... }
}
```

### ResearchProvider Interface

The ResearchProvider interface extends IAIService with research-specific capabilities:

```javascript
class ResearchProvider extends IAIService {
  constructor(config) { ... }
  async research(options) { ... }
  async getSources(options) { ... }
  supportsFeature(feature) { ... }
  getResearchCapabilities() { ... }
}
```

### Provider Implementations

The following provider implementations are available:

- **AnthropicService**: Implementation for Anthropic Claude.
- **OpenAIService**: Implementation for OpenAI.
- **GeminiService**: Implementation for Google Gemini.
- **PerplexityService**: Implementation for Perplexity AI with research capabilities.

### AIServiceFactory

The AIServiceFactory is responsible for creating and managing AI service providers:

```javascript
class AIServiceFactory {
  constructor(config) { ... }
  registerProvider(name, providerClass, config, priority) { ... }
  getProvider(name) { ... }
  async getBestProvider(options) { ... }
  clearCache() { ... }
}
```

### ResponseHandler

The ResponseHandler normalizes responses from different AI providers to a standard format:

```javascript
class ResponseHandler {
  constructor(config) { ... }
  normalizeResponse(response, providerName) { ... }
  validateResponse(normalizedResponse, requirements) { ... }
}
```

## Usage

### Basic Usage

```javascript
import {
  AIServiceFactory,
  AnthropicService,
  OpenAIService,
} from "./ai/index.js";

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

// Send a message
const response = await provider.sendMessage({
  prompt: "Hello, how are you?",
  systemPrompt: "You are a helpful assistant",
});

// Process the response
console.log(response.content);
```

### Streaming Usage

```javascript
// Send a streaming message
const response = await provider.sendMessageStream({
  prompt: "Hello, how are you?",
  systemPrompt: "You are a helpful assistant",
  onProgress: (chunk, fullResponse) => {
    console.log("Chunk:", chunk);
  },
});

// Process the complete response
console.log(response.content);
```

### Research Usage

```javascript
import { AIServiceFactory, PerplexityService } from "./ai/index.js";

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

// Perform research
const research = await provider.research({
  query: "What is quantum computing?",
  maxResults: 5,
  depth: "comprehensive",
});

// Process the research results
console.log(research.content);
console.log("Sources:", research.sources);
```

### Response Handling

```javascript
import { ResponseHandler } from "./ai/index.js";

// Create a response handler
const handler = new ResponseHandler();

// Normalize a response
const normalized = handler.normalizeResponse(response, provider.getName());

// Validate the response
const isValid = handler.validateResponse(normalized, {
  minLength: 10,
  maxLength: 1000,
  requiredFields: ["content", "provider"],
});
```

## Provider Capabilities

### Anthropic Claude

- **Models**: claude-3-7-sonnet-20250219, claude-3-5-sonnet-20240620
- **Max Tokens**: 128,000
- **Streaming**: Yes
- **System Prompt**: Yes
- **Research**: No

### OpenAI

- **Models**: gpt-4o, gpt-4-turbo, gpt-3.5-turbo
- **Max Tokens**: 4,096
- **Streaming**: Yes
- **System Prompt**: Yes
- **Research**: No
- **Tools**: Yes
- **Vision**: Yes

### Google Gemini

- **Models**: gemini-1.5-pro, gemini-1.5-flash
- **Max Tokens**: 8,192
- **Streaming**: Yes
- **System Prompt**: Yes
- **Research**: No
- **Tools**: Yes
- **Vision**: Yes

### Perplexity AI

- **Models**: sonar-pro, sonar-medium-online, sonar-small-online
- **Max Tokens**: 4,096
- **Streaming**: Yes
- **System Prompt**: Yes
- **Research**: Yes
- **Research Capabilities**:
  - Online Search: Yes
  - Source Retrieval: Yes
  - Comprehensive Research: Yes
  - Real-Time Data: Yes

## Extending

To add a new AI provider, create a new class that implements the IAIService interface:

```javascript
import IAIService from "./interfaces/IAIService.js";

class NewProvider extends IAIService {
  constructor(config) {
    super();
    this.config = config;
    // Initialize provider-specific client
  }

  async sendMessage(options) {
    // Implement provider-specific message sending
  }

  async sendMessageStream(options) {
    // Implement provider-specific streaming
  }

  async isAvailable() {
    // Check if the provider is available
  }

  getName() {
    return "new-provider";
  }

  getCapabilities() {
    return {
      streaming: true,
      systemPrompt: true,
      maxTokens: 10000,
      models: ["model-1", "model-2"],
      research: false,
    };
  }

  handleError(error) {
    // Handle provider-specific errors
  }
}
```

Then register the new provider with the factory:

```javascript
factory.registerProvider(
  "new-provider",
  NewProvider,
  {
    apiKey: "your-api-key",
    // Other provider-specific config
  },
  30,
);
```

## Troubleshooting

### Common Issues

#### API Key Issues

If you encounter authentication errors, check that the API key is correctly set in the provider configuration.

```javascript
factory.registerProvider(
  "anthropic",
  AnthropicService,
  {
    apiKey: process.env.ANTHROPIC_API_KEY, // Make sure this is set
  },
  10,
);
```

#### Rate Limiting

If you encounter rate limit errors, consider implementing a retry mechanism or switching to a different provider.

```javascript
try {
  const response = await provider.sendMessage({ prompt: "Hello" });
} catch (error) {
  if (error.message.includes("rate limit")) {
    // Try a different provider
    const fallbackProvider = await factory.getBestProvider({
      preferredProviders: ["openai", "gemini"],
    });
    const fallbackResponse = await fallbackProvider.sendMessage({
      prompt: "Hello",
    });
  }
}
```

#### Provider Availability

If a provider is not available, the factory will automatically fall back to the next available provider.

```javascript
// Get the best available provider
const provider = await factory.getBestProvider();
```

### Debugging

To enable debugging, pass a logger to the factory and provider constructors:

```javascript
const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
};

const factory = new AIServiceFactory({ logger });

factory.registerProvider(
  "anthropic",
  AnthropicService,
  {
    apiKey: process.env.ANTHROPIC_API_KEY,
    logger,
  },
  10,
);
```
