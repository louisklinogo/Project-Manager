/**
 * Research Flow Demo
 *
 * This script demonstrates a real-world use case of the Project-Manager system
 * using the PocketFlow framework to orchestrate a research workflow.
 *
 * The workflow:
 * 1. Takes a research query from the user
 * 2. Formats the query for different providers
 * 3. Selects the appropriate provider based on query type
 * 4. Executes the query against the provider
 * 5. Processes and scores the results
 * 6. Displays the results in a structured format
 */

import { AsyncFlow, AsyncNode, AsyncBatchNode } from '../src/core/flow/index.js';
import logger from '../src/core/utils/logger.js';
import {
  getBestAvailableAIModel,
  getPerplexityClientForMCP,
  getModelConfig
} from '../src/core/utils/ai-client-utils.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Disable all logging
logger.setLevel('OFF');

// Disable console logging redirection to logger
// Original code commented out to preserve functionality
/*
const originalInfo = console.info;
const originalLog = console.log;
const originalError = console.error;

console.info = function(...args) {
  originalInfo.apply(console, args);
  logger.info(...args);
};

console.log = function(...args) {
  originalLog.apply(console, args);
  logger.debug(...args);
};

console.error = function(...args) {
  originalError.apply(console, args);
  logger.error(...args);
};
*/

/**
 * Node for formatting research queries
 */
class QueryFormatterNode extends AsyncNode {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'QueryFormatter';
  }

  async exec(data) {
    logger.info(`Formatting query: "${data.query}"`);

    // Format the query for different providers
    const formattedQueries = {
      original: data.query,
      perplexity: `${data.query}`, // Perplexity works best with direct queries, system message is added in the execution node
      openai: `I need comprehensive information about: ${data.query}. Please include technical details, best practices, and examples.`,
      anthropic: `Please research this topic in depth: ${data.query}. Provide a comprehensive analysis with technical details, best practices, and examples.`,
      gemini: `Research query: ${data.query}. Provide detailed information, technical specifications, best practices, and examples.`
    };

    logger.debug('Formatted queries:', formattedQueries);

    return {
      ...data,
      formattedQueries
    };
  }
}

/**
 * Node for selecting the appropriate provider
 */
class ProviderSelectorNode extends AsyncNode {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'ProviderSelector';
    this.preferredProvider = options.preferredProvider;
    this.forceProvider = options.forceProvider;
    this.queryType = options.queryType || 'research'; // Default to research queries
  }

  async exec(data) {
    logger.info('Selecting provider for research query');

    try {
      // If a provider is forced, use it directly
      if (this.forceProvider) {
        logger.info(`Using forced provider: ${this.forceProvider}`);

        let client;
        let modelConfig;

        // Initialize the client based on the forced provider
        switch (this.forceProvider) {
          case 'gemini':
            // Get API key from environment variables
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              throw new Error('GEMINI_API_KEY is required but not provided');
            }

            // Import the GoogleGenerativeAI class
            const { GoogleGenerativeAI } = await import('@google/generative-ai');

            // Create the client
            client = new GoogleGenerativeAI(apiKey);

            // Get the model configuration
            modelConfig = {
              model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
              max_tokens: parseInt(process.env.MAX_TOKENS, 10) || 1000,
              temperature: parseFloat(process.env.TEMPERATURE) || 0.2
            };

            break;

          default:
            // For other providers, use the utility function
            const modelInfo = getBestAvailableAIModel({
              preferredProvider: this.forceProvider
            });

            client = modelInfo.client;
            modelConfig = modelInfo.config;
        }

        return {
          ...data,
          provider: this.forceProvider,
          client,
          modelConfig
        };
      }

      // For research queries, prioritize Perplexity
      if (this.queryType === 'research') {
        logger.info('Research query detected, prioritizing Perplexity');

        try {
          // Try to get Perplexity client
          const client = getPerplexityClientForMCP();
          const modelConfig = getModelConfig({ provider: 'perplexity' });

          logger.info('Using Perplexity for research query');
          logger.debug('Perplexity model config:', modelConfig);

          return {
            ...data,
            provider: 'perplexity',
            client,
            modelConfig
          };
        } catch (perplexityError) {
          logger.warn('Perplexity not available, falling back to other providers:', perplexityError.message);
          // Fall through to use other providers
        }
      }

      // If Perplexity is not available or this is not a research query, use the preferred provider or best available
      const modelInfo = getBestAvailableAIModel({
        preferredProvider: this.preferredProvider
      });

      logger.info(`Selected provider: ${modelInfo.provider}`);
      logger.debug('Model info:', modelInfo);

      return {
        ...data,
        provider: modelInfo.provider,
        client: modelInfo.client,
        modelConfig: modelInfo.config
      };
    } catch (error) {
      logger.error('Error selecting provider:', error);
      throw new Error(`Provider selection failed: ${error.message}`);
    }
  }
}

/**
 * Node for executing the research query
 */
class ResearchExecutionNode extends AsyncNode {
  constructor(options = {}) {
    // Set a longer timeout for API calls (2 minutes)
    super({ ...options, timeout: 120000 });
    this.name = options.name || 'ResearchExecution';
    this.maxTokens = options.maxTokens || 1000;
    this.useMockData = options.useMockData || false;
  }

  async exec(data) {
    const { provider, client, modelConfig, formattedQueries } = data;
    const query = formattedQueries[provider] || formattedQueries.original;

    logger.info(`Executing research query with ${provider}`);
    logger.debug(`Using model: ${modelConfig.model}`);

    // If mock data is enabled, return mock data instead of making API calls
    if (this.useMockData) {
      logger.info('Using mock data instead of making API calls');

      const mockContent = `# Best Practices for Implementing a Flow-Based Architecture in JavaScript

Flow-based programming (FBP) is a programming paradigm that defines applications as networks of black box processes, which exchange data across predefined connections. Here are some best practices for implementing a flow-based architecture in JavaScript:

## 1. Use Small, Single-Purpose Nodes

Each node in your flow should have a single responsibility:

- Keep nodes focused on one task
- Make nodes reusable across different flows
- Ensure nodes have clear input and output contracts

## 2. Implement Proper Error Handling

Robust error handling is critical in flow-based systems:

- Add try/catch blocks in each node's processing logic
- Provide options for continuing execution after errors
- Store errors in a central location for debugging

## 3. Use Asynchronous Processing

JavaScript's async capabilities are perfect for flow-based architectures:

\`\`\`javascript
class AsyncNode extends Node {
  async process(data) {
    const prepared = await this.prep(data);
    const result = await this.exec(prepared);
    return this.post(result);
  }
}
\`\`\`

## 4. Implement Shared Memory

Use a shared memory mechanism to pass data between nodes:

\`\`\`javascript
class Memory {
  constructor() {
    this.store = new Map();
  }

  set(key, value) {
    this.store.set(key, value);
    return this;
  }

  get(key) {
    return this.store.get(key);
  }
}
\`\`\`

## 5. Add Monitoring and Visualization

Implement tools to monitor and visualize your flows:

- Add logging at key points in the flow
- Create visualization tools for flow execution
- Track performance metrics for optimization`;

      return {
        ...data,
        response: { mock: true },
        content: mockContent
      };
    }

    try {
      let response;
      let content;

      // Execute the query based on the provider
      switch (provider) {
        case 'perplexity':
          logger.debug('Making Perplexity API call...');
          logger.debug('Perplexity query:', query);

          try {
            // Format the query for Perplexity
            const messages = [
              { role: 'system', content: 'You are a helpful research assistant. Provide detailed, accurate information with citations where possible.' },
              { role: 'user', content: `Research the following topic thoroughly: ${query}` }
            ];

            // Execute the query
            response = await client.query({
              model: modelConfig.model,
              messages,
              max_tokens: this.maxTokens
            });

            logger.debug('Perplexity API call successful');
            logger.debug('Perplexity response:', response);

            // Extract the content
            if (response && response.choices && response.choices[0] && response.choices[0].message) {
              content = response.choices[0].message.content;
              logger.debug('Content extracted successfully (first 100 chars):', content.substring(0, 100));

              // Extract citations if available
              const citations = response.citations || [];
              logger.debug(`Extracted ${citations.length} citations`);

              // Return with the content and citations
              return {
                ...data,
                response,
                content,
                citations
              };
            } else {
              throw new Error('Unexpected response format from Perplexity API: missing content');
            }
          } catch (perplexityError) {
            logger.error('Error in Perplexity API call:', perplexityError);
            throw perplexityError;
          }

        case 'anthropic':
          logger.debug('Making Anthropic API call...');
          response = await client.messages.create({
            model: modelConfig.model,
            max_tokens: this.maxTokens,
            messages: [{ role: 'user', content: query }]
          });
          logger.debug('Anthropic API call successful');

          // Extract the content
          if (response && response.content && response.content[0]) {
            content = response.content[0].text;
          } else {
            throw new Error('Unexpected response format from Anthropic API: missing content');
          }
          break;

        case 'openai':
          logger.debug('Making OpenAI API call...');
          response = await client.chat.completions.create({
            model: modelConfig.model,
            max_tokens: this.maxTokens,
            messages: [{ role: 'user', content: query }]
          });
          logger.debug('OpenAI API call successful');

          // Extract the content
          if (response && response.choices && response.choices[0] && response.choices[0].message) {
            content = response.choices[0].message.content;
          } else {
            throw new Error('Unexpected response format from OpenAI API: missing content');
          }
          break;

        case 'gemini':
          logger.debug('Making Gemini API call...');
          logger.debug('Gemini client type:', typeof client);
          logger.debug('Gemini client methods:', Object.keys(client).join(', '));
          logger.debug('Gemini query:', query);

          try {
            // Get the model from the configuration
            const modelName = modelConfig.model;
            logger.debug(`Using Gemini model: ${modelName}`);

            // Create a generative model instance
            const model = client.getGenerativeModel({ model: modelName });
            logger.debug('Created generative model instance');

            // Generate content
            logger.debug('Generating content...');
            const geminiResult = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: query }] }],
              generationConfig: {
                maxOutputTokens: this.maxTokens
              }
            });

            logger.debug('Gemini API call successful');
            logger.debug('Gemini result type:', typeof geminiResult);

            if (geminiResult && geminiResult.response) {
              response = geminiResult.response;
              logger.debug('Response extracted successfully');

              if (response && typeof response.text === 'function') {
                content = response.text();
                logger.debug('Content extracted successfully (first 100 chars):', content.substring(0, 100));
              } else {
                throw new Error('Unexpected response format from Gemini API: response.text is not a function');
              }
            } else {
              throw new Error('Unexpected response format from Gemini API: missing response property');
            }
          } catch (geminiError) {
            logger.error('Error in Gemini API call:', geminiError);
            throw geminiError;
          }
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      logger.info('Research query executed successfully');
      logger.debug('Extracted content (first 100 chars):', content?.substring(0, 100));

      return {
        ...data,
        response,
        content
      };
    } catch (error) {
      logger.error(`Error executing research query with ${provider}:`, error);

      // Provide more detailed error information
      const errorDetails = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        provider,
        model: modelConfig.model
      };

      // If it's an API error, add more details
      if (error.status) {
        errorDetails.status = error.status;
        errorDetails.type = error.type;
        errorDetails.code = error.code;
      }

      logger.error('Error details:', errorDetails);

      // Fall back to mock data if API call fails
      logger.info('Falling back to mock data due to API error');

      const mockContent = `# Best Practices for Implementing a Flow-Based Architecture in JavaScript

Flow-based programming (FBP) is a programming paradigm that defines applications as networks of black box processes, which exchange data across predefined connections. Here are some best practices for implementing a flow-based architecture in JavaScript:

## 1. Use Small, Single-Purpose Nodes

Each node in your flow should have a single responsibility:

- Keep nodes focused on one task
- Make nodes reusable across different flows
- Ensure nodes have clear input and output contracts

## 2. Implement Proper Error Handling

Robust error handling is critical in flow-based systems:

- Add try/catch blocks in each node's processing logic
- Provide options for continuing execution after errors
- Store errors in a central location for debugging

## 3. Use Asynchronous Processing

JavaScript's async capabilities are perfect for flow-based architectures:

\`\`\`javascript
class AsyncNode extends Node {
  async process(data) {
    const prepared = await this.prep(data);
    const result = await this.exec(prepared);
    return this.post(result);
  }
}
\`\`\`

## 4. Implement Shared Memory

Use a shared memory mechanism to pass data between nodes:

\`\`\`javascript
class Memory {
  constructor() {
    this.store = new Map();
  }

  set(key, value) {
    this.store.set(key, value);
    return this;
  }

  get(key) {
    return this.store.get(key);
  }
}
\`\`\`

## 5. Add Monitoring and Visualization

Implement tools to monitor and visualize your flows:

- Add logging at key points in the flow
- Create visualization tools for flow execution
- Track performance metrics for optimization`;

      return {
        ...data,
        response: { mock: true, error: errorDetails },
        content: mockContent,
        usedMockData: true
      };
    }
  }
}

/**
 * Node for extracting information from research results
 */
class InformationExtractorNode extends AsyncNode {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'InformationExtractor';
  }

  async exec(data) {
    logger.info('Extracting information from research results');

    const { content } = data;

    // Check if content is available
    if (!content) {
      logger.warn('No content available for extraction');

      // Return mock data if content is missing
      return {
        ...data,
        extractedInfo: {
          keyPoints: [
            'No content available for extraction',
            'This is a fallback key point',
            'The API call may have failed or timed out',
            'Check the logs for more information',
            'Try again with a different provider or query'
          ],
          codeBlocks: []
        }
      };
    }

    try {
      // Simple extraction of key points (in a real implementation, this would be more sophisticated)
      const lines = content.split('\n');
      const keyPoints = lines
        .filter(line => line.trim().length > 0)
        .filter(line => !line.startsWith('#') && !line.startsWith('##'))
        .map(line => line.trim())
        .filter(line => line.length > 40) // Filter out short lines
        .slice(0, 5); // Take the first 5 substantial lines as key points

      // Extract potential code examples (very simple approach)
      const codeBlocks = [];
      let inCodeBlock = false;
      let currentBlock = '';

      for (const line of lines) {
        if (line.trim().startsWith('```')) {
          if (inCodeBlock) {
            // End of code block
            codeBlocks.push(currentBlock);
            currentBlock = '';
            inCodeBlock = false;
          } else {
            // Start of code block
            inCodeBlock = true;
          }
        } else if (inCodeBlock) {
          currentBlock += line + '\n';
        }
      }

      // If we're still in a code block at the end, add it
      if (inCodeBlock && currentBlock.trim().length > 0) {
        codeBlocks.push(currentBlock);
      }

      // If no key points were found, create a fallback
      const finalKeyPoints = keyPoints.length > 0 ? keyPoints : [
        'No key points extracted from the content',
        'The content may not have been in the expected format',
        'Try again with a different provider or query',
        'Check the logs for more information',
        'The content may have been too short or not well-structured'
      ];

      logger.info(`Extracted ${finalKeyPoints.length} key points and ${codeBlocks.length} code blocks`);

      return {
        ...data,
        extractedInfo: {
          keyPoints: finalKeyPoints,
          codeBlocks
        }
      };
    } catch (error) {
      logger.error('Error extracting information:', error);

      // Return mock data if extraction fails
      return {
        ...data,
        extractedInfo: {
          keyPoints: [
            'Error extracting information from content',
            `Error: ${error.message}`,
            'Try again with a different provider or query',
            'Check the logs for more information',
            'The content may have been in an unexpected format'
          ],
          codeBlocks: []
        }
      };
    }
  }
}

/**
 * Node for scoring research results
 */
class ConfidenceScorerNode extends AsyncNode {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'ConfidenceScorer';
  }

  async exec(data) {
    logger.info('Scoring research results');

    try {
      const { content, provider, extractedInfo } = data;

      // Check if required data is available
      if (!extractedInfo) {
        logger.warn('No extracted information available for scoring');
        return {
          ...data,
          confidenceScore: 0.3 // Low confidence due to missing information
        };
      }

      // Simple confidence scoring (in a real implementation, this would be more sophisticated)
      let score = 0.5; // Base score

      // Adjust score based on content length (longer content might be more comprehensive)
      if (content) {
        const contentLength = content.length;
        if (contentLength > 2000) score += 0.1;
        if (contentLength > 5000) score += 0.1;
      } else {
        score -= 0.2; // Penalize missing content
      }

      // Adjust score based on key points
      if (extractedInfo.keyPoints && extractedInfo.keyPoints.length >= 3) score += 0.1;
      if (extractedInfo.keyPoints && extractedInfo.keyPoints.length >= 5) score += 0.1;

      // Adjust score based on code examples
      if (extractedInfo.codeBlocks && extractedInfo.codeBlocks.length >= 1) score += 0.1;
      if (extractedInfo.codeBlocks && extractedInfo.codeBlocks.length >= 3) score += 0.1;

      // Adjust score based on provider (just an example, not a real evaluation)
      if (provider === 'anthropic') score += 0.05;

      // Check for error indicators in key points
      if (extractedInfo.keyPoints && extractedInfo.keyPoints.some(point =>
        point.includes('Error') ||
        point.includes('No content available') ||
        point.includes('failed') ||
        point.includes('timed out')
      )) {
        score -= 0.2; // Penalize error indicators
      }

      // Cap the score between 0.1 and 1.0
      score = Math.max(0.1, Math.min(score, 1.0));

      logger.info(`Confidence score: ${score.toFixed(2)}`);

      return {
        ...data,
        confidenceScore: score
      };
    } catch (error) {
      logger.error('Error scoring research results:', error);

      // Return a low confidence score if scoring fails
      return {
        ...data,
        confidenceScore: 0.1 // Very low confidence due to scoring error
      };
    }
  }
}

/**
 * Node for formatting the final output
 */
class OutputFormatterNode extends AsyncNode {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'OutputFormatter';
  }

  async exec(data) {
    logger.info('Formatting output');

    try {
      // Extract data with default values for missing properties
      const {
        query = 'Unknown query',
        provider = 'unknown',
        modelConfig = { model: 'unknown' },
        confidenceScore = 0.0,
        extractedInfo = { keyPoints: [], codeBlocks: [] },
        content = 'No content available',
        citations = [],
        usedMockData = false
      } = data;

      // Format the output as a structured result
      const result = {
        query: {
          original: query
        },
        provider: {
          name: provider,
          model: modelConfig.model || 'unknown'
        },
        confidence: confidenceScore,
        summary: {
          keyPoints: extractedInfo.keyPoints || [],
          codeExamples: (extractedInfo.codeBlocks || []).length
        },
        citations: citations || [],
        usedMockData: usedMockData || false,
        fullContent: content
      };

      logger.debug('Formatted output:', result);

      return {
        ...data,
        result
      };
    } catch (error) {
      logger.error('Error formatting output:', error);

      // Return a minimal result if formatting fails
      return {
        ...data,
        result: {
          query: {
            original: data.query || 'Unknown query'
          },
          provider: {
            name: data.provider || 'unknown',
            model: (data.modelConfig && data.modelConfig.model) || 'unknown'
          },
          confidence: data.confidenceScore || 0.0,
          summary: {
            keyPoints: ['Error formatting output', `Error: ${error.message}`],
            codeExamples: 0
          },
          citations: [],
          usedMockData: true,
          fullContent: 'Error formatting output'
        }
      };
    }
  }
}

/**
 * Run the research flow
 * @param {Object} options - Flow options
 * @returns {Promise<Object>} - Flow result
 */
async function runResearchFlow(options = {}) {
  const { query, preferredProvider, forceProvider, useMockData = false } = options;

  // Create the research flow
  const flow = new AsyncFlow({
    name: 'ResearchFlow',
    storeIntermediateResults: true,
    continueOnError: true
  });

  // Add nodes to the flow
  flow
    .add(new QueryFormatterNode())
    .add(new ProviderSelectorNode({ preferredProvider, forceProvider }))
    .add(new ResearchExecutionNode({ maxTokens: 1000, useMockData }))
    .add(new InformationExtractorNode())
    .add(new ConfidenceScorerNode())
    .add(new OutputFormatterNode());

  // Run the flow
  try {
    const result = await flow.run({ query });
    return result;
  } catch (error) {
    console.error('Error running research flow:', error.message);
    throw error;
  }
}

/**
 * Display the research results
 * @param {Object} data - Research results
 */
function displayResults(data) {
  try {
    // Check if result is available
    if (!data || !data.result) {
      console.log('\n\n=============================================');
      console.log('            NO RESULTS AVAILABLE            ');
      console.log('=============================================\n');
      return;
    }

    const { result } = data;

    console.log('\n\n=============================================');
    console.log('               RESEARCH RESULTS              ');
    console.log('=============================================\n');

    // Display query
    console.log(`QUERY: ${result.query?.original || 'Unknown query'}`);

    // Display provider
    if (result.provider) {
      console.log(`PROVIDER: ${result.provider.name || 'unknown'} (${result.provider.model || 'unknown model'})`);
    } else {
      console.log('PROVIDER: Unknown');
    }

    // Display if mock data was used
    if (result.usedMockData) {
      console.log('NOTE: Mock data was used due to API issues');
    }

    // Display confidence score
    console.log(`CONFIDENCE SCORE: ${(result.confidence || 0).toFixed(2)}`);

    // Display key points
    console.log('\n-----------------KEY POINTS-----------------\n');
    if (result.summary?.keyPoints && result.summary.keyPoints.length > 0) {
      result.summary.keyPoints.forEach((point, index) => {
        console.log(`${index + 1}. ${point}`);
      });
    } else {
      console.log('No key points available');
    }

    // Display code examples
    console.log(`\n-----------------CODE EXAMPLES: ${result.summary?.codeExamples || 0}-----------------\n`);

    // Display citations if available
    if (result.citations && result.citations.length > 0) {
      console.log('\n-----------------CITATIONS-----------------\n');
      result.citations.forEach((citation, index) => {
        console.log(`${index + 1}. ${citation}`);
      });
    }

    // Display content preview
    console.log('\n-----------------CONTENT PREVIEW-----------------\n');
    if (result.fullContent) {
      console.log(result.fullContent.substring(0, 300) + '...');
    } else {
      console.log('No content available');
    }

    console.log('\n=============================================');
    console.log('            END OF RESEARCH RESULTS         ');
    console.log('=============================================\n');
  } catch (error) {
    console.error('Error displaying results:', error);
    console.log('\n\n=============================================');
    console.log('            ERROR DISPLAYING RESULTS         ');
    console.log('=============================================\n');
    console.log('Error message:', error.message);
    console.log('\n=============================================\n');
  }
}

// Main function
async function main() {
  try {
    // Get the query from command line arguments or use a default query
    const query = process.argv[2] || 'Best practices for implementing a flow-based architecture in JavaScript';

    // Get the provider from command line arguments
    const provider = process.argv[3] || '';

    // Check if we should use mock data
    const useMockData = process.argv[4] !== 'live';

    // Determine if we should force a specific provider
    let preferredProvider = null;
    let forceProvider = null;

    if (provider === 'gemini') {
      // For Gemini, we need to force it to use our direct implementation
      forceProvider = 'gemini';
      console.log(`\nUsing provider: GEMINI`);
    } else if (provider) {
      // For other providers, we can use the preferred provider option
      preferredProvider = provider;
      console.log(`\nPreferred provider: ${provider.toUpperCase()}`);
    }

    if (useMockData) {
      console.log('\nUsing MOCK data (add "live" as the third argument to use real API calls)');
    } else {
      console.log('\nUsing LIVE API calls');
    }

    console.log(`\nResearching: "${query}"\n`);
    console.log('Processing...\n');

    // Run the research flow
    const result = await runResearchFlow({
      query,
      preferredProvider,
      forceProvider,
      useMockData
    });

    // Display the results
    displayResults(result);

    // Return success
    process.exit(0);
  } catch (error) {
    console.error('\n\nERROR IN RESEARCH FLOW:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run the main function
main();
