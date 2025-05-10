# Provider System Architecture

This document provides a visual representation of the provider system architecture.

## Provider System Overview

```mermaid
graph TD
    A[Client Code] --> B[providers/index.js]
    B --> C[provider-factory.js]
    B --> D[provider-config.js]
    B --> E[provider-interface.js]
    B --> F[provider-init.js]

    C --> G[ClaudeProvider]
    C --> H[OpenAIProvider]
    C --> I[GeminiProvider]
    C --> J[PerplexityProvider]
    C --> K[MockProvider]

    G --> L[Anthropic API]
    H --> M[OpenAI API]
    I --> N[Google Gemini API]
    J --> O[Perplexity API]

    E --> G
    E --> H
    E --> I
    E --> J
    E --> K

    F --> C

    D --> C
```

## Provider Factory Flow

```mermaid
sequenceDiagram
    participant Client as Client Code
    participant Index as providers/index.js
    participant Factory as provider-factory.js
    participant Config as provider-config.js
    participant Provider as Provider Implementation
    participant API as External API

    Client->>Index: getBestAvailableProvider()
    Index->>Factory: getBestAvailableProvider()
    Factory->>Config: getBestProviderForTask()
    Config-->>Factory: bestProviderName
    Factory->>Factory: getProvider(bestProviderName)
    Factory->>Provider: new Provider()
    Provider->>API: Initialize client
    API-->>Provider: Client instance
    Provider-->>Factory: Provider instance
    Factory-->>Index: Provider instance
    Index-->>Client: Provider instance
```

## Provider Interface Hierarchy

```mermaid
classDiagram
    class ProviderInterface {
        +constructor(options)
        +isConfigured()
        +getName()
        +getCapabilities()
        +supportsCapability(capability)
        +getClient()
        +generateChatCompletion(params)
        +generateTextCompletion(params)
        +generateEmbeddings(params)
        +webSearch(params)
        +answerQuestion(params)
        +summarizeText(params)
        +codeSearch(params)
        +generateCode(params)
        +generateImage(params)
        +researchTopic(params)
    }

    class ClaudeProvider {
        +constructor(options)
        +isConfigured()
        +getName()
        +getClient()
        +generateChatCompletion(params)
        +generateTextCompletion(params)
    }

    class OpenAIProvider {
        +constructor(options)
        +isConfigured()
        +getName()
        +getClient()
        +generateChatCompletion(params)
        +generateTextCompletion(params)
        +generateEmbeddings(params)
        +generateImage(params)
    }

    class GeminiProvider {
        +constructor(options)
        +isConfigured()
        +getName()
        +getClient()
        +generateChatCompletion(params)
        +generateTextCompletion(params)
    }

    class PerplexityProvider {
        +constructor(options)
        +isConfigured()
        +getName()
        +getClient()
        +generateChatCompletion(params)
        +webSearch(params)
        +answerQuestion(params)
    }

    class MockProvider {
        +constructor(options)
        +isConfigured()
        +getName()
        +getClient()
        +generateChatCompletion(params)
        +generateTextCompletion(params)
    }

    ProviderInterface <|-- ClaudeProvider
    ProviderInterface <|-- OpenAIProvider
    ProviderInterface <|-- GeminiProvider
    ProviderInterface <|-- PerplexityProvider
    ProviderInterface <|-- MockProvider
```

## Provider Configuration Structure

```mermaid
graph TD
    A[providerConfig] --> B[anthropic]
    A --> C[openai]
    A --> D[gemini]
    A --> E[perplexity]
    A --> F[tavily]
    A --> G[exa]
    A --> H[defaultProvider]
    A --> I[research]

    B --> B1[apiKey]
    B --> B2[defaultModel]
    B --> B3[fallbackModel]
    B --> B4[maxTokens]
    B --> B5[temperature]

    C --> C1[apiKey]
    C --> C2[defaultModel]
    C --> C3[fallbackModel]
    C --> C4[maxTokens]
    C --> C5[temperature]

    D --> D1[apiKey]
    D --> D2[defaultModel]
    D --> D3[fallbackModel]
    D --> D4[maxTokens]
    D --> D5[temperature]

    E --> E1[apiKey]
    E --> E2[defaultModel]
    E --> E3[fallbackModel]
    E --> E4[maxTokens]
    E --> E5[temperature]

    F --> F1[apiKey]
    F --> F2[maxResults]

    G --> G1[apiKey]
    G --> G2[maxResults]

    I --> I1[depth]
    I --> I2[maxResults]
    I --> I3[minConfidenceScore]
    I --> I4[defaultTimeout]
```
