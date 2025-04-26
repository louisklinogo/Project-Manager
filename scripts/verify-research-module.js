/**
 * Verification script for the Research Module
 * 
 * This script tests the Research Module functionality by:
 * 1. Creating a research query
 * 2. Executing the query
 * 3. Retrieving and displaying the results
 * 
 * Usage: node verify-research-module.js
 */

import { ResearchManager } from '../src/research/research-manager.js';
import { ResearchQuery } from '../src/research/research-query.js';
import { ResearchResult } from '../src/research/research-result.js';
import { PerplexityProvider } from '../src/providers/perplexity-provider.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for required API keys
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('Error: PERPLEXITY_API_KEY is required but not provided');
  console.error('Please create a .env file with your API keys');
  process.exit(1);
}

// Create a temporary directory for research data
const tempDir = path.join(process.cwd(), 'temp-research');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Create a Perplexity provider
const perplexityProvider = new PerplexityProvider({
  apiKey: process.env.PERPLEXITY_API_KEY
});

// Create a research manager
const researchManager = new ResearchManager({
  storageDir: tempDir,
  providers: {
    perplexity: {
      apiKey: process.env.PERPLEXITY_API_KEY
    }
  },
  defaultProvider: 'perplexity'
});

// Test queries
const testQueries = [
  {
    query: 'What are the best practices for modern JavaScript development?',
    type: 'domain',
    maxResults: 3
  },
  {
    query: 'Popular GitHub repositories for project management tools',
    type: 'repository',
    maxResults: 3
  }
];

/**
 * Run the verification
 */
async function runVerification() {
  console.log('Starting Research Module verification...');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Verify Perplexity provider is available
    console.log('Test 1: Verifying Perplexity provider availability...');
    const available = await perplexityProvider.isAvailable();
    if (available) {
      console.log('✅ Perplexity provider is available');
    } else {
      console.error('❌ Perplexity provider is not available');
      process.exit(1);
    }
    
    // Test 2: Create and validate research queries
    console.log('\nTest 2: Creating and validating research queries...');
    const queries = [];
    for (const queryData of testQueries) {
      const query = new ResearchQuery(queryData);
      try {
        query.validate();
        console.log(`✅ Query "${query.query}" is valid`);
        queries.push(query);
      } catch (error) {
        console.error(`❌ Query "${query.query}" is invalid: ${error.message}`);
        process.exit(1);
      }
    }
    
    // Test 3: Execute queries using the research manager
    console.log('\nTest 3: Executing research queries...');
    const results = [];
    for (const queryData of testQueries) {
      console.log(`Executing query: "${queryData.query}"...`);
      try {
        // Create the query using the research manager
        const query = researchManager.createQuery(queryData);
        
        // Execute the query
        const result = await researchManager.executeQuery(query);
        console.log(`✅ Query executed successfully, result ID: ${result.id}`);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to execute query: ${error.message}`);
        process.exit(1);
      }
    }
    
    // Test 4: Verify result storage and retrieval
    console.log('\nTest 4: Verifying result storage and retrieval...');
    for (const result of results) {
      const retrievedResult = researchManager.getResult(result.id);
      if (retrievedResult) {
        console.log(`✅ Result ${result.id} retrieved successfully`);
      } else {
        console.error(`❌ Failed to retrieve result ${result.id}`);
        process.exit(1);
      }
    }
    
    // Test 5: Verify result content
    console.log('\nTest 5: Verifying result content...');
    for (const result of results) {
      if (result.results.length > 0) {
        console.log(`✅ Result ${result.id} has ${result.results.length} items`);
        
        // Display the first result item
        const firstItem = result.results[0];
        console.log(`   Title: ${firstItem.title || 'N/A'}`);
        console.log(`   Content: ${firstItem.content ? firstItem.content.substring(0, 100) + '...' : 'N/A'}`);
      } else {
        console.error(`❌ Result ${result.id} has no items`);
        process.exit(1);
      }
    }
    
    // Test 6: Verify result extraction
    console.log('\nTest 6: Verifying result extraction...');
    for (const result of results) {
      const textExtraction = result.extractInformation({ format: 'text', focus: 'summary' });
      const jsonExtraction = result.extractInformation({ format: 'json', focus: 'summary' });
      
      if (textExtraction && jsonExtraction) {
        console.log(`✅ Result ${result.id} extraction successful`);
      } else {
        console.error(`❌ Result ${result.id} extraction failed`);
        process.exit(1);
      }
    }
    
    // Test 7: Verify result markdown conversion
    console.log('\nTest 7: Verifying result markdown conversion...');
    for (const result of results) {
      const markdown = result.toMarkdown();
      if (markdown) {
        console.log(`✅ Result ${result.id} markdown conversion successful`);
      } else {
        console.error(`❌ Result ${result.id} markdown conversion failed`);
        process.exit(1);
      }
    }
    
    // Test 8: Load results from disk
    console.log('\nTest 8: Loading results from disk...');
    const loadedResults = await researchManager.loadResults();
    if (loadedResults.length > 0) {
      console.log(`✅ Loaded ${loadedResults.length} results from disk`);
    } else {
      console.error('❌ Failed to load results from disk');
      process.exit(1);
    }
    
    // All tests passed
    console.log('\n----------------------------------------');
    console.log('✅ All Research Module verification tests passed!');
    console.log('----------------------------------------');
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      // Uncomment to clean up the temp directory
      // fs.rmSync(tempDir, { recursive: true, force: true });
      console.log(`\nTemporary research data is available at: ${tempDir}`);
    }
  }
}

// Run the verification
runVerification();
