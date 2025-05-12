/**
 * Perplexity Research Flow Demo
 * 
 * This script demonstrates a real-world use case of the Project-Manager system
 * using the PocketFlow framework to orchestrate a research workflow with Perplexity.
 * 
 * The workflow:
 * 1. Takes a research query from the user
 * 2. Uses Perplexity as the primary research provider
 * 3. Processes and scores the results
 * 4. Displays the results in a structured format
 */

import { AsyncFlow, AsyncNode } from '../src/core/flow/index.js';
import logger from '../src/core/utils/logger.js';
import { getPerplexityClientForMCP, getModelConfig } from '../src/core/utils/ai-client-utils.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set log level to info to reduce noise
logger.setLevel('INFO');

/**
 * Node for formatting research queries
 */
class QueryFormatterNode extends AsyncNode {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'QueryFormatter';
  }

  async exec(data) {
    console.log(`Formatting query: "${data.query}"`);

    return {
      ...data,
      formattedQuery: data.query
    };
  }
}

/**
 * Node for executing the research query with Perplexity
 */
class PerplexityResearchNode extends AsyncNode {
  constructor(options = {}) {
    // Set a longer timeout for API calls (2 minutes)
    super({ ...options, timeout: 120000 });
    this.name = options.name || 'PerplexityResearch';
    this.maxTokens = options.maxTokens || 1000;
    this.useMockData = options.useMockData || false;
  }

  async exec(data) {
    console.log('Executing research query with Perplexity');

    // If mock data is enabled, return mock data instead of making API calls
    if (this.useMockData) {
      console.log('Using mock data instead of making API calls');
      
      return {
        ...data,
        response: { mock: true },
        content: "This is mock data for the query: " + data.query,
        citations: ["https://example.com/mock-citation-1", "https://example.com/mock-citation-2"]
      };
    }

    try {
      // Get Perplexity client and model config
      const client = getPerplexityClientForMCP();
      const modelConfig = getModelConfig({ provider: 'perplexity' });
      
      console.log(`Using Perplexity model: ${modelConfig.model}`);
      
      // Format the query for Perplexity
      const messages = [
        { role: 'system', content: 'You are a helpful research assistant. Provide detailed, accurate information with citations where possible.' },
        { role: 'user', content: `Research the following topic thoroughly: ${data.formattedQuery}` }
      ];
      
      // Execute the query
      console.log('Sending query to Perplexity API...');
      const response = await client.query({
        model: modelConfig.model,
        messages,
        max_tokens: this.maxTokens
      });
      
      console.log('Perplexity API call successful');
      
      // Extract the content
      if (response && response.choices && response.choices[0] && response.choices[0].message) {
        const content = response.choices[0].message.content;
        console.log('Content extracted successfully');
        
        // Extract citations if available
        const citations = response.citations || [];
        console.log(`Extracted ${citations.length} citations`);
        
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
    } catch (error) {
      console.error('Error executing research query with Perplexity:', error);
      
      // Fall back to mock data if API call fails
      console.log('Falling back to mock data due to API error');
      
      return {
        ...data,
        response: { mock: true, error: error.message },
        content: "API Error occurred. This is fallback mock data for the query: " + data.query,
        citations: ["https://example.com/error-fallback-1"],
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
    console.log('Extracting information from research results');

    try {
      const { content } = data;

      // Check if content is available
      if (!content) {
        console.warn('No content available for extraction');
        return {
          ...data,
          extractedInfo: {
            keyPoints: ['No content available for extraction'],
            codeBlocks: []
          }
        };
      }

      // Simple extraction of key points
      const lines = content.split('\n');
      const keyPoints = lines
        .filter(line => line.trim().length > 0)
        .filter(line => !line.startsWith('#') && !line.startsWith('##'))
        .map(line => line.trim())
        .filter(line => line.length > 40) // Filter out short lines
        .slice(0, 5); // Take the first 5 substantial lines as key points

      // Extract potential code examples
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
        'The content may not have been in the expected format'
      ];

      console.log(`Extracted ${finalKeyPoints.length} key points and ${codeBlocks.length} code blocks`);

      return {
        ...data,
        extractedInfo: {
          keyPoints: finalKeyPoints,
          codeBlocks
        }
      };
    } catch (error) {
      console.error('Error extracting information:', error);
      
      // Return basic info if extraction fails
      return {
        ...data,
        extractedInfo: {
          keyPoints: ['Error extracting information from content'],
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
    console.log('Scoring research results');

    try {
      const { content, citations, extractedInfo, usedMockData } = data;

      // Base score
      let score = 0.5;

      // If mock data was used, reduce the score
      if (usedMockData) {
        score -= 0.3;
      }

      // Adjust score based on content length
      if (content) {
        const contentLength = content.length;
        if (contentLength > 2000) score += 0.1;
        if (contentLength > 5000) score += 0.1;
      }

      // Adjust score based on key points
      if (extractedInfo?.keyPoints?.length >= 3) score += 0.1;
      if (extractedInfo?.keyPoints?.length >= 5) score += 0.1;

      // Adjust score based on code examples
      if (extractedInfo?.codeBlocks?.length >= 1) score += 0.1;
      if (extractedInfo?.codeBlocks?.length >= 3) score += 0.1;

      // Adjust score based on citations
      if (citations?.length >= 1) score += 0.1;
      if (citations?.length >= 3) score += 0.1;

      // Cap the score between 0.1 and 1.0
      score = Math.max(0.1, Math.min(score, 1.0));

      console.log(`Confidence score: ${score.toFixed(2)}`);

      return {
        ...data,
        confidenceScore: score
      };
    } catch (error) {
      console.error('Error scoring research results:', error);
      
      // Return a low confidence score if scoring fails
      return {
        ...data,
        confidenceScore: 0.1
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
  const { query, useMockData = false } = options;

  console.log(`Starting research flow for query: "${query}"`);
  if (useMockData) {
    console.log('Using mock data for this flow run');
  }

  // Create the research flow
  const flow = new AsyncFlow({
    name: 'PerplexityResearchFlow',
    storeIntermediateResults: true,
    continueOnError: true
  });

  // Add nodes to the flow
  flow
    .add(new QueryFormatterNode())
    .add(new PerplexityResearchNode({ maxTokens: 1000, useMockData }))
    .add(new InformationExtractorNode())
    .add(new ConfidenceScorerNode());

  // Run the flow
  try {
    const result = await flow.run({ query });
    return result;
  } catch (error) {
    console.error('Error running research flow:', error);
    throw error;
  }
}

/**
 * Display the research results
 * @param {Object} data - Research results
 */
function displayResults(data) {
  console.log('\n=== Research Results ===\n');
  
  // Display query
  console.log(`Query: ${data.query}`);
  
  // Display provider
  console.log('Provider: Perplexity');
  
  // Display if mock data was used
  if (data.usedMockData) {
    console.log('Note: Mock data was used due to API issues');
  }
  
  // Display confidence score
  console.log(`Confidence Score: ${(data.confidenceScore || 0).toFixed(2)}`);
  
  // Display key points
  console.log('\n--- Key Points ---\n');
  if (data.extractedInfo?.keyPoints?.length > 0) {
    data.extractedInfo.keyPoints.forEach((point, index) => {
      console.log(`${index + 1}. ${point}`);
    });
  } else {
    console.log('No key points available');
  }
  
  // Display code examples
  const codeExamplesCount = data.extractedInfo?.codeBlocks?.length || 0;
  console.log(`\n--- Code Examples: ${codeExamplesCount} ---\n`);
  
  // Display citations if available
  if (data.citations && data.citations.length > 0) {
    console.log('\n--- Citations ---\n');
    data.citations.forEach((citation, index) => {
      console.log(`${index + 1}. ${citation}`);
    });
  }
  
  // Display content preview
  console.log('\n--- Content Preview (first 300 chars) ---\n');
  if (data.content) {
    console.log(data.content.substring(0, 300) + '...');
  } else {
    console.log('No content available');
  }
  
  console.log('\n=== End of Results ===\n');
}

// Main function
async function main() {
  try {
    // Get the query from command line arguments or use a default query
    const query = process.argv[2] || 'Best practices for implementing a flow-based architecture in JavaScript';
    
    // Check if we should use mock data
    const useMockData = process.argv[3] === 'mock';
    
    // Run the research flow
    const result = await runResearchFlow({ query, useMockData });
    
    // Display the results
    displayResults(result);
    
    // Return success
    process.exit(0);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run the main function
main();
