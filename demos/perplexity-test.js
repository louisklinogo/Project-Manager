/**
 * Simple test script for the Perplexity API
 */

import dotenv from 'dotenv';
import { getPerplexityClientForMCP } from '../src/core/utils/ai-client-utils.js';
import logger from '../src/core/utils/logger.js';

// Load environment variables
dotenv.config();

// Set log level to debug for more detailed output
logger.setLevel('DEBUG');

async function main() {
  try {
    console.log('Creating Perplexity client...');
    const client = getPerplexityClientForMCP();
    console.log('Perplexity client created');

    // Get the model
    const modelName = process.env.PERPLEXITY_MODEL || 'sonar-pro';
    console.log(`Using model: ${modelName}`);

    // Generate content
    console.log('Executing research query...');
    const query = 'Best practices for implementing a flow-based architecture in JavaScript';
    const result = await client.query({
      model: modelName,
      messages: [
        { role: 'system', content: 'You are a helpful research assistant. Provide detailed, accurate information with citations where possible.' },
        { role: 'user', content: `Research the following topic thoroughly: ${query}` }
      ],
      max_tokens: 1000
    });

    console.log('Query executed successfully');
    console.log('Response:', JSON.stringify(result, null, 2));
    
    // Extract the content
    const content = result.choices[0].message.content;
    console.log('\n--- Generated Text ---\n');
    console.log(content);
    console.log('\n--- End of Generated Text ---\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
