/**
 * Simple test script for Gemini provider models
 * 
 * This script tests the Gemini provider by:
 * 1. Initializing the Gemini provider
 * 2. Getting available models
 * 
 * Usage: node test-gemini-models.js
 */

import { GeminiProvider } from '../src/providers/gemini-provider.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for required API keys
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is required but not provided');
  console.error('Please create a .env file with your API keys');
  process.exit(1);
}

/**
 * Run the test
 */
async function runTest() {
  console.log('Starting Gemini Provider Model Test...');
  console.log('----------------------------------------');
  
  try {
    // Initialize the Gemini provider
    console.log('Initializing the Gemini provider...');
    const provider = new GeminiProvider({
      apiKey: process.env.GEMINI_API_KEY
    });
    
    if (provider) {
      console.log('✅ Gemini provider initialized successfully');
      console.log(`   Default model: ${provider.defaultModel}`);
    } else {
      console.error('❌ Failed to initialize Gemini provider');
      process.exit(1);
    }
    
    // Get available models
    console.log('\nGetting available models...');
    const models = await provider.getAvailableModels();
    
    if (models && models.length > 0) {
      console.log(`✅ Gemini provider has ${models.length} models available:`);
      models.forEach(model => console.log(`   - ${model}`));
    } else {
      console.error('❌ Gemini provider has no models available');
      process.exit(1);
    }
    
    // Test if the provider is available
    console.log('\nChecking if the provider is available...');
    const available = await provider.isAvailable();
    
    if (available) {
      console.log('✅ Gemini provider is available');
    } else {
      console.error('❌ Gemini provider is not available');
      process.exit(1);
    }
    
    console.log('\n----------------------------------------');
    console.log('✅ Gemini Provider Model Test completed successfully!');
    console.log('----------------------------------------');
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
runTest();
