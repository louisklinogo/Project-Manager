# AI Providers Troubleshooting Guide

This guide provides solutions for common issues you might encounter when using the AI provider infrastructure.

## Authentication Issues

### Problem: API Key Invalid or Missing

**Symptoms:**

- Error message: "Authentication failed. Please check your API key."
- Error message: "[Provider] API key is required"

**Solutions:**

1. Check that the API key is correctly set in the provider configuration:

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

2. Verify that the environment variable is correctly set in your `.env` file:

   ```
   ANTHROPIC_API_KEY=your-api-key-here
   ```

3. Test the API key directly with the provider's API to confirm it's valid.

## Rate Limiting

### Problem: Rate Limit Exceeded

**Symptoms:**

- Error message: "[Provider] rate limit exceeded. Please try again later."
- Frequent failures during high-volume operations

**Solutions:**

1. Implement a retry mechanism with exponential backoff:

   ```javascript
   async function sendWithRetry(provider, options, maxRetries = 3) {
     let retries = 0;
     while (retries < maxRetries) {
       try {
         return await provider.sendMessage(options);
       } catch (error) {
         if (error.message.includes("rate limit") && retries < maxRetries - 1) {
           const delay = Math.pow(2, retries) * 1000; // Exponential backoff
           console.log(`Rate limited, retrying in ${delay}ms...`);
           await new Promise((resolve) => setTimeout(resolve, delay));
           retries++;
         } else {
           throw error;
         }
       }
     }
   }
   ```

2. Switch to a different provider when rate limited:

   ```javascript
   try {
     const response = await provider.sendMessage({ prompt: "Hello" });
     return response;
   } catch (error) {
     if (error.message.includes("rate limit")) {
       console.log("Rate limited, switching provider...");
       const fallbackProvider = await factory.getBestProvider({
         preferredProviders: ["openai", "gemini"],
       });
       return await fallbackProvider.sendMessage({ prompt: "Hello" });
     }
     throw error;
   }
   ```

3. Implement a token bucket rate limiter to prevent hitting the limits:

   ```javascript
   class TokenBucket {
     constructor(capacity, fillRate) {
       this.capacity = capacity;
       this.fillRate = fillRate;
       this.tokens = capacity;
       this.lastFill = Date.now();
     }

     async take(count) {
       // Refill tokens based on time passed
       const now = Date.now();
       const elapsed = (now - this.lastFill) / 1000;
       this.tokens = Math.min(
         this.capacity,
         this.tokens + elapsed * this.fillRate,
       );
       this.lastFill = now;

       if (this.tokens < count) {
         // Not enough tokens, wait for refill
         const waitTime = ((count - this.tokens) / this.fillRate) * 1000;
         await new Promise((resolve) => setTimeout(resolve, waitTime));
         this.tokens = count;
         this.lastFill = Date.now();
       }

       this.tokens -= count;
       return true;
     }
   }

   // Usage
   const rateLimiter = new TokenBucket(60, 1); // 60 tokens, refill 1 per second

   async function sendWithRateLimit(provider, options) {
     await rateLimiter.take(1);
     return await provider.sendMessage(options);
   }
   ```

## Provider Availability

### Problem: No Available Providers

**Symptoms:**

- Error message: "No available AI providers found that meet the requirements"
- All providers failing to initialize

**Solutions:**

1. Check that at least one provider is correctly configured:

   ```javascript
   // Register multiple providers for redundancy
   factory.registerProvider(
     "anthropic",
     AnthropicService,
     {
       apiKey: process.env.ANTHROPIC_API_KEY,
     },
     10,
   );

   factory.registerProvider(
     "openai",
     OpenAIService,
     {
       apiKey: process.env.OPENAI_API_KEY,
     },
     20,
   );
   ```

2. Implement a health check to verify provider availability:

   ```javascript
   async function checkProviderHealth(factory) {
     const providers = ["anthropic", "openai", "gemini", "perplexity"];
     const results = {};

     for (const name of providers) {
       if (factory.providers.has(name)) {
         try {
           const provider = factory.getProvider(name);
           results[name] = await provider.isAvailable();
         } catch (error) {
           results[name] = false;
         }
       } else {
         results[name] = "not registered";
       }
     }

     return results;
   }
   ```

3. Add a fallback to a local model or cached responses when all providers are unavailable.

## Response Formatting

### Problem: Inconsistent Response Format

**Symptoms:**

- Different response structures from different providers
- Missing fields in normalized responses
- Errors when accessing response properties

**Solutions:**

1. Always use the ResponseHandler to normalize responses:

   ```javascript
   const handler = new ResponseHandler();
   const normalized = handler.normalizeResponse(response, provider.getName());

   // Now you can safely access normalized.content
   console.log(normalized.content);
   ```

2. Validate responses before using them:

   ```javascript
   const isValid = handler.validateResponse(normalized, {
     minLength: 10,
     requiredFields: ["content", "provider"],
   });

   if (isValid) {
     // Use the response
     console.log(normalized.content);
   } else {
     // Handle invalid response
     console.error("Invalid response received");
   }
   ```

3. Add custom normalization for specific providers if needed:
   ```javascript
   // Extend ResponseHandler with custom normalization
   class CustomResponseHandler extends ResponseHandler {
     normalizeCustomProviderResponse(response) {
       // Custom normalization logic
       return {
         content: response.specialField || "",
         provider: "custom-provider",
         raw: response,
       };
     }
   }
   ```

## Research Provider Issues

### Problem: Research Results Missing Sources

**Symptoms:**

- Research results don't include sources
- Empty sources array in research response

**Solutions:**

1. Make sure you're using a provider that supports research:

   ```javascript
   const provider = await factory.getBestProvider({
     requiresResearch: true,
   });

   if (!provider.getCapabilities().research) {
     throw new Error("Selected provider does not support research");
   }
   ```

2. Use an online model for Perplexity:

   ```javascript
   factory.registerProvider(
     "perplexity",
     PerplexityService,
     {
       apiKey: process.env.PERPLEXITY_API_KEY,
       model: "sonar-medium-online", // Use an online model
     },
     10,
   );
   ```

3. Explicitly request sources:
   ```javascript
   const sources = await provider.getSources({
     query: "What is quantum computing?",
     maxSources: 5,
   });
   ```

## Streaming Issues

### Problem: Streaming Not Working

**Symptoms:**

- No incremental updates during streaming
- onProgress callback not being called
- Only getting the final response

**Solutions:**

1. Make sure the provider supports streaming:

   ```javascript
   const capabilities = provider.getCapabilities();
   if (!capabilities.streaming) {
     console.warn(
       "Provider does not support streaming, falling back to regular request",
     );
     return await provider.sendMessage(options);
   }
   ```

2. Check that the onProgress callback is correctly implemented:

   ```javascript
   const response = await provider.sendMessageStream({
     prompt: "Write a story",
     onProgress: (chunk, fullResponse) => {
       // This should be called for each chunk
       console.log("Received chunk:", chunk);
     },
   });
   ```

3. Try a different provider that is known to support streaming:
   ```javascript
   const streamingProvider = await factory.getBestProvider({
     preferredProviders: ["anthropic", "openai"], // Both support streaming
   });
   ```

## Performance Issues

### Problem: Slow Response Times

**Symptoms:**

- Requests taking a long time to complete
- Timeouts during high-volume operations

**Solutions:**

1. Use a faster model when speed is more important than quality:

   ```javascript
   factory.registerProvider(
     "gemini",
     GeminiService,
     {
       apiKey: process.env.GEMINI_API_KEY,
       model: "gemini-1.5-flash", // Faster model
     },
     10,
   );
   ```

2. Implement request caching for common queries:

   ```javascript
   const cache = new Map();

   async function sendWithCache(provider, options) {
     const cacheKey = JSON.stringify(options);

     if (cache.has(cacheKey)) {
       return cache.get(cacheKey);
     }

     const response = await provider.sendMessage(options);
     cache.set(cacheKey, response);

     return response;
   }
   ```

3. Use smaller max token limits for faster responses:
   ```javascript
   const response = await provider.sendMessage({
     prompt: "Hello",
     maxTokens: 100, // Limit response length
   });
   ```

## Integration Issues

### Problem: Difficulty Integrating with Existing Code

**Symptoms:**

- Errors when trying to use the AI provider infrastructure with existing code
- Incompatible response formats

**Solutions:**

1. Create an adapter for your existing code:

   ```javascript
   // Adapter for legacy code expecting a different format
   function legacyAdapter(provider) {
     return {
       async generateResponse(prompt) {
         const response = await provider.sendMessage({ prompt });
         const handler = new ResponseHandler();
         const normalized = handler.normalizeResponse(
           response,
           provider.getName(),
         );

         // Convert to legacy format
         return {
           text: normalized.content,
           model: normalized.model,
           metadata: {
             provider: normalized.provider,
             usage: normalized.usage,
           },
         };
       },
     };
   }

   // Usage
   const legacyClient = legacyAdapter(provider);
   const legacyResponse = await legacyClient.generateResponse("Hello");
   ```

2. Use the factory as a drop-in replacement:

   ```javascript
   // Instead of initializing each provider separately
   const factory = new AIServiceFactory();

   factory.registerProvider(
     "anthropic",
     AnthropicService,
     {
       apiKey: process.env.ANTHROPIC_API_KEY,
     },
     10,
   );

   // Get the provider you need
   const provider = factory.getProvider("anthropic");

   // Use it just like you would use the direct client
   const response = await provider.sendMessage({
     prompt: "Hello",
   });
   ```

3. Create a simple wrapper for common operations:

   ```javascript
   class AIClient {
     constructor() {
       this.factory = new AIServiceFactory();
       this.handler = new ResponseHandler();

       // Register providers
       this.factory.registerProvider(
         "anthropic",
         AnthropicService,
         {
           apiKey: process.env.ANTHROPIC_API_KEY,
         },
         10,
       );

       this.factory.registerProvider(
         "openai",
         OpenAIService,
         {
           apiKey: process.env.OPENAI_API_KEY,
         },
         20,
       );
     }

     async generate(prompt, options = {}) {
       const provider = await this.factory.getBestProvider(options);
       const response = await provider.sendMessage({ prompt, ...options });
       return this.handler.normalizeResponse(response, provider.getName())
         .content;
     }

     async research(query, options = {}) {
       const provider = await this.factory.getBestProvider({
         requiresResearch: true,
         ...options,
       });

       const research = await provider.research({
         query,
         ...options,
       });

       return {
         content: research.content,
         sources: research.sources,
       };
     }
   }

   // Usage
   const ai = new AIClient();
   const answer = await ai.generate("What is the capital of France?");
   const research = await ai.research("What is quantum computing?");
   ```
