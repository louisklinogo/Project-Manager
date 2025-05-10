# AI Service Infrastructure

This directory contains the AI service infrastructure for Project-Manager. It provides a flexible and extensible way to integrate with various AI providers.

## Architecture

The AI service infrastructure is built around the following components:

- **IAIService Interface**: Defines the common interface that all AI providers must implement.
- **Provider Implementations**: Concrete implementations of the IAIService interface for specific AI providers.
- **AIServiceFactory**: Factory for creating and managing AI service providers.
- **ResponseHandler**: Unified handler for normalizing responses from different AI providers.

## Components

### IAIService Interface

The IAIService interface defines the common methods and properties that all AI providers must implement:

- `sendMessage`: Send a message to the AI model and get a response.
- `sendMessageStream`: Send a message to the AI model and get a streaming response.
- `isAvailable`: Check if the service is available.
- `getName`: Get the service name.
- `getCapabilities`: Get the service capabilities.
- `handleError`: Handle an error from the service.

### Provider Implementations

The following provider implementations are available:

- **AnthropicService**: Implementation for Anthropic Claude.
- **OpenAIService**: Implementation for OpenAI (coming soon).
- **GeminiService**: Implementation for Google Gemini (coming soon).

### AIServiceFactory

The AIServiceFactory is responsible for creating and managing AI service providers:

- Register providers with different priorities.
- Get a provider instance by name.
- Get the best available provider based on requirements.
- Clear the provider cache.

### ResponseHandler

The ResponseHandler normalizes responses from different AI providers to a standard format:

- Normalize responses from different providers.
- Validate responses against requirements.
- Extract content from responses.

## Usage

### Basic Usage

```javascript
import { AIServiceFactory, AnthropicService } from "./ai/index.js";

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

// Get a provider
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
