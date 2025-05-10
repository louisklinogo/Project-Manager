# Migrating to the Unified Provider System

This guide explains how to migrate from the legacy provider system to the new unified provider system.

## Overview

The new unified provider system provides a more consistent and flexible way to work with AI providers. It includes a provider factory, provider configuration, and provider interface, which make it easier to add new providers and switch between them.

## Migration Steps

### 1. Update Imports

Replace imports from individual provider files with imports from the providers module:

**Before:**

```javascript
import { ClaudeProvider } from "../providers/claude-provider.js";
import { OpenAIProvider } from "../providers/openai-provider.js";
```

**After:**

```javascript
import { getProvider, getBestAvailableProvider } from "../providers/index.js";
```

### 2. Replace Provider Instantiation

Replace direct provider instantiation with calls to the provider factory:

**Before:**

```javascript
const claudeProvider = new ClaudeProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

**After:**

```javascript
const claudeProvider = getProvider("anthropic", {
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### 3. Replace Provider Selection

Replace custom provider selection logic with calls to `getBestAvailableProvider`:

**Before:**

```javascript
let provider;
if (process.env.ANTHROPIC_API_KEY) {
  provider = new ClaudeProvider({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
} else if (process.env.OPENAI_API_KEY) {
  provider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  throw new Error("No AI providers available");
}
```

**After:**

```javascript
const provider = getBestAvailableProvider({
  task: "general",
  preferredProvider: "anthropic",
});
```

### 4. Replace Provider Configuration

Replace custom provider configuration with calls to the provider configuration module:

**Before:**

```javascript
const providerConfig = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-7-sonnet-20250219",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
  },
};
```

**After:**

```javascript
import { setProviderConfig, getProviderConfig } from "../providers/index.js";

// Set configuration
setProviderConfig("anthropic", {
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultModel: "claude-3-7-sonnet-20250219",
});

// Get configuration
const anthropicConfig = getProviderConfig("anthropic");
```

### 5. Replace Provider Capability Checks

Replace custom provider capability checks with calls to the provider interface:

**Before:**

```javascript
if (provider instanceof ClaudeProvider || provider instanceof OpenAIProvider) {
  // Provider supports chat completions
}
```

**After:**

```javascript
if (provider.supportsCapability("chat")) {
  // Provider supports chat completions
}
```

## Example: Before and After

### Before

```javascript
import { ClaudeProvider } from "../providers/claude-provider.js";
import { OpenAIProvider } from "../providers/openai-provider.js";
import { GeminiProvider } from "../providers/gemini-provider.js";

async function getAIProvider() {
  // Try each provider in order of preference
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const claudeProvider = new ClaudeProvider({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      return claudeProvider;
    } catch (error) {
      console.warn("Claude provider not available:", error.message);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const openaiProvider = new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
      });
      return openaiProvider;
    } catch (error) {
      console.warn("OpenAI provider not available:", error.message);
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiProvider = new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
      });
      return geminiProvider;
    } catch (error) {
      console.warn("Gemini provider not available:", error.message);
    }
  }

  throw new Error("No AI providers available");
}

async function generateText(prompt) {
  const provider = await getAIProvider();

  if (provider instanceof ClaudeProvider) {
    return provider.generateCompletion({
      prompt,
      model: "claude-3-7-sonnet-20250219",
      maxTokens: 1000,
    });
  } else if (provider instanceof OpenAIProvider) {
    return provider.generateCompletion({
      prompt,
      model: "gpt-4o",
      maxTokens: 1000,
    });
  } else if (provider instanceof GeminiProvider) {
    return provider.generateCompletion({
      prompt,
      model: "gemini-2.5-pro",
      maxTokens: 1000,
    });
  } else {
    throw new Error("Unsupported provider");
  }
}
```

### After

```javascript
import { getBestAvailableProvider } from "../providers/index.js";

async function generateText(prompt) {
  const provider = getBestAvailableProvider({
    task: "general",
    preferredProvider: "anthropic",
  });

  return provider.generateTextCompletion({
    prompt,
    maxTokens: 1000,
  });
}
```

## Benefits of the New System

- **Consistency**: All providers implement the same interface, making it easier to switch between them.
- **Flexibility**: The provider factory makes it easy to add new providers and select the best one for a task.
- **Configuration**: The provider configuration module provides a centralized way to manage provider configuration.
- **Capability-based**: Providers declare their capabilities, making it easy to check if a provider supports a specific feature.
- **Backward Compatibility**: The new system is backward compatible with the legacy system, allowing for a gradual migration.

## Troubleshooting

### Provider Not Found

If you get an error like `Provider X not available`, make sure the provider is registered with the provider factory. You can check the available providers by calling `providerFactory.providerClasses`.

### Provider Not Configured

If you get an error like `Provider X is not configured`, make sure the provider's API key is set in the environment variables or passed in the options.

### Capability Not Supported

If you get an error like `Provider X does not support capability Y`, make sure the provider supports the capability you're trying to use. You can check a provider's capabilities by calling `provider.getCapabilities()`.

## Conclusion

The new unified provider system provides a more consistent and flexible way to work with AI providers. By following this migration guide, you can update your code to use the new system and take advantage of its benefits.
