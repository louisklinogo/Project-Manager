# Provider System API Reference

This document provides a reference for the unified provider system in Project-Manager.

## Overview

The provider system provides a unified interface for working with AI providers like Anthropic, OpenAI, Google Gemini, and Perplexity. It includes a provider factory, provider configuration, and provider interface.

## Provider Interface

The `ProviderInterface` class defines the standard interface that all AI providers must implement. It provides default implementations for common methods and ensures consistent behavior across providers.

### Methods

#### Constructor

```javascript
constructor((options = {}));
```

Creates a new provider instance.

**Parameters:**

- `options` (Object): Provider options
  - `apiKey` (string): API key for the provider
  - `model` (string): Default model to use
  - `timeout` (number): Request timeout in milliseconds (default: 30000)
  - `maxRetries` (number): Maximum number of retries (default: 3)
  - `verbose` (boolean): Whether to log verbose output (default: false)

#### isConfigured

```javascript
isConfigured();
```

Checks if the provider is properly configured.

**Returns:** `boolean` - True if the provider is properly configured

#### getName

```javascript
getName();
```

Gets the provider name.

**Returns:** `string` - Provider name

#### getCapabilities

```javascript
getCapabilities();
```

Gets the provider capabilities.

**Returns:** `Object` - Provider capabilities

#### supportsCapability

```javascript
supportsCapability(capability);
```

Checks if the provider supports a specific capability.

**Parameters:**

- `capability` (string): Capability to check

**Returns:** `boolean` - True if the provider supports the capability

#### getClient

```javascript
getClient();
```

Gets the client for this provider.

**Returns:** `Object` - Provider client

**Throws:** `Error` - If the provider is not configured

#### generateChatCompletion

```javascript
async generateChatCompletion(params)
```

Generates a chat completion.

**Parameters:**

- `params` (Object): Chat completion parameters
  - `messages` (Array<Object>): Chat messages
  - `model` (string, optional): Model to use
  - `maxTokens` (number, optional): Maximum number of tokens to generate
  - `temperature` (number, optional): Temperature for sampling

**Returns:** `Promise<Object>` - Chat completion result

**Throws:** `Error` - If the provider does not support chat completions

#### generateTextCompletion

```javascript
async generateTextCompletion(params)
```

Generates a text completion.

**Parameters:**

- `params` (Object): Text completion parameters
  - `prompt` (string): Text prompt
  - `model` (string, optional): Model to use
  - `maxTokens` (number, optional): Maximum number of tokens to generate
  - `temperature` (number, optional): Temperature for sampling

**Returns:** `Promise<Object>` - Text completion result

**Throws:** `Error` - If the provider does not support text completions

#### generateEmbeddings

```javascript
async generateEmbeddings(params)
```

Generates embeddings for text.

**Parameters:**

- `params` (Object): Embedding parameters
  - `input` (string|Array<string>): Text to embed
  - `model` (string, optional): Model to use

**Returns:** `Promise<Object>` - Embedding result

**Throws:** `Error` - If the provider does not support embeddings

#### webSearch

```javascript
async webSearch(params)
```

Performs a web search.

**Parameters:**

- `params` (Object): Web search parameters
  - `query` (string): Search query
  - `limit` (number, optional): Maximum number of results (default: 10)

**Returns:** `Promise<Array<Object>>` - Search results

**Throws:** `Error` - If the provider does not support web search

#### answerQuestion

```javascript
async answerQuestion(params)
```

Answers a question.

**Parameters:**

- `params` (Object): Question answering parameters
  - `question` (string): Question to answer
  - `context` (string, optional): Context for the question

**Returns:** `Promise<Object>` - Answer result

**Throws:** `Error` - If the provider does not support question answering

#### summarizeText

```javascript
async summarizeText(params)
```

Summarizes text.

**Parameters:**

- `params` (Object): Summarization parameters
  - `text` (string): Text to summarize
  - `maxLength` (number, optional): Maximum length of the summary

**Returns:** `Promise<Object>` - Summarization result

**Throws:** `Error` - If the provider does not support summarization

#### codeSearch

```javascript
async codeSearch(params)
```

Searches for code.

**Parameters:**

- `params` (Object): Code search parameters
  - `query` (string): Search query
  - `limit` (number, optional): Maximum number of results (default: 5)

**Returns:** `Promise<Array<Object>>` - Search results

**Throws:** `Error` - If the provider does not support code search

#### generateCode

```javascript
async generateCode(params)
```

Generates code.

**Parameters:**

- `params` (Object): Code generation parameters
  - `prompt` (string): Code generation prompt
  - `language` (string, optional): Programming language

**Returns:** `Promise<Object>` - Code generation result

**Throws:** `Error` - If the provider does not support code generation

#### generateImage

```javascript
async generateImage(params)
```

Generates an image.

**Parameters:**

- `params` (Object): Image generation parameters
  - `prompt` (string): Image generation prompt
  - `size` (string, optional): Image size

**Returns:** `Promise<Object>` - Image generation result

**Throws:** `Error` - If the provider does not support image generation

#### researchTopic

```javascript
async researchTopic(params)
```

Performs research on a topic.

**Parameters:**

- `params` (Object): Research parameters
  - `topic` (string): Research topic
  - `questions` (Array<string>, optional): Specific questions to research
  - `domain` (string, optional): Domain to focus research on

**Returns:** `Promise<Object>` - Research results

## Provider Factory

The `providerFactory` is a singleton instance of the `ProviderFactory` class, which provides methods for creating and managing provider instances.

### Methods

#### registerProviderClass

```javascript
registerProviderClass(name, ProviderClass);
```

Registers a provider class.

**Parameters:**

- `name` (string): Provider name
- `ProviderClass` (Class): Provider class

#### getProvider

```javascript
getProvider(name, (options = {}));
```

Gets a provider instance.

**Parameters:**

- `name` (string): Provider name
- `options` (Object, optional): Provider options

**Returns:** `ProviderInterface` - Provider instance

**Throws:** `Error` - If the provider is not registered

#### getClient

```javascript
getClient(name, (options = {}));
```

Gets a client for a specific provider.

**Parameters:**

- `name` (string): Provider name
- `options` (Object, optional): Client options

**Returns:** `Object` - Provider client

**Throws:** `Error` - If the provider is not available

#### getProvidersByCapability

```javascript
getProvidersByCapability(capability);
```

Gets providers by capability.

**Parameters:**

- `capability` (string): Capability to filter by

**Returns:** `Array<ProviderInterface>` - Providers with the capability

#### getBestAvailableProvider

```javascript
getBestAvailableProvider((options = {}));
```

Gets the best available provider for a task.

**Parameters:**

- `options` (Object, optional): Provider options
  - `task` (string, optional): Task type (default: 'general')
  - `preferredProvider` (string, optional): Preferred provider
  - `forceProvider` (boolean, optional): Whether to force using the preferred provider (default: false)

**Returns:** `ProviderInterface` - Best provider for the task

**Throws:** `Error` - If no providers are available

## Provider Configuration

The `providerConfig` is a singleton instance of the `ProviderConfig` class, which provides methods for managing provider configuration.

### Methods

#### getProviderConfig

```javascript
getProviderConfig(provider);
```

Gets the configuration for a specific provider.

**Parameters:**

- `provider` (string): Provider name

**Returns:** `Object` - Provider configuration

#### setProviderConfig

```javascript
setProviderConfig(provider, config);
```

Sets the configuration for a specific provider.

**Parameters:**

- `provider` (string): Provider name
- `config` (Object): Provider configuration

#### get

```javascript
get(path, (defaultValue = undefined));
```

Gets a specific configuration value.

**Parameters:**

- `path` (string): Configuration path (e.g., 'anthropic.apiKey')
- `defaultValue` (any, optional): Default value if path not found

**Returns:** `any` - Configuration value

#### set

```javascript
set(path, value);
```

Sets a specific configuration value.

**Parameters:**

- `path` (string): Configuration path (e.g., 'anthropic.apiKey')
- `value` (any): Value to set

#### isProviderConfigured

```javascript
isProviderConfigured(provider);
```

Checks if a provider is configured.

**Parameters:**

- `provider` (string): Provider name

**Returns:** `boolean` - True if the provider is configured

#### getDefaultProvider

```javascript
getDefaultProvider();
```

Gets the default provider.

**Returns:** `string` - Default provider name

#### getBestProviderForTask

```javascript
getBestProviderForTask(task);
```

Gets the best provider for a specific task.

**Parameters:**

- `task` (string): Task type

**Returns:** `string` - Best provider for the task

## Exported Functions

The providers module exports the following functions:

### getProvider

```javascript
getProvider(name, (options = {}));
```

Gets a provider instance.

**Parameters:**

- `name` (string): Provider name
- `options` (Object, optional): Provider options

**Returns:** `ProviderInterface` - Provider instance

### getClient

```javascript
getClient(name, (options = {}));
```

Gets a client for a specific provider.

**Parameters:**

- `name` (string): Provider name
- `options` (Object, optional): Client options

**Returns:** `Object` - Provider client

### getBestAvailableProvider

```javascript
getBestAvailableProvider((options = {}));
```

Gets the best available provider for a task.

**Parameters:**

- `options` (Object, optional): Provider options
  - `task` (string, optional): Task type (default: 'general')
  - `preferredProvider` (string, optional): Preferred provider
  - `forceProvider` (boolean, optional): Whether to force using the preferred provider (default: false)
  - `allowMock` (boolean, optional): Whether to allow using a mock provider if no real providers are available

**Returns:** `ProviderInterface` - Best provider for the task

### getProviderByName (Legacy)

```javascript
getProviderByName(name, (options = {}));
```

Gets a provider by name (legacy method).

**Parameters:**

- `name` (string): Provider name
- `options` (Object, optional): Provider options

**Returns:** `AIProvider` - Provider instance

### getProvidersByCapability

```javascript
getProvidersByCapability(capability);
```

Gets providers by capability.

**Parameters:**

- `capability` (string): Capability to filter by

**Returns:** `Array<ProviderInterface>` - Providers with the capability

### getProviderConfig

```javascript
getProviderConfig(provider);
```

Gets the configuration for a specific provider.

**Parameters:**

- `provider` (string): Provider name

**Returns:** `Object` - Provider configuration

### setProviderConfig

```javascript
setProviderConfig(provider, config);
```

Sets the configuration for a specific provider.

**Parameters:**

- `provider` (string): Provider name
- `config` (Object): Provider configuration

### getConfig

```javascript
getConfig(path, (defaultValue = undefined));
```

Gets a specific configuration value.

**Parameters:**

- `path` (string): Configuration path (e.g., 'anthropic.apiKey')
- `defaultValue` (any, optional): Default value if path not found

**Returns:** `any` - Configuration value

### setConfig

```javascript
setConfig(path, value);
```

Sets a specific configuration value.

**Parameters:**

- `path` (string): Configuration path (e.g., 'anthropic.apiKey')
- `value` (any): Value to set

### isProviderConfigured

```javascript
isProviderConfigured(provider);
```

Checks if a provider is configured.

**Parameters:**

- `provider` (string): Provider name

**Returns:** `boolean` - True if the provider is configured

### getDefaultProvider

```javascript
getDefaultProvider();
```

Gets the default provider.

**Returns:** `string` - Default provider name

### getBestProviderForTask

```javascript
getBestProviderForTask(task);
```

Gets the best provider for a specific task.

**Parameters:**

- `task` (string): Task type

**Returns:** `string` - Best provider for the task
