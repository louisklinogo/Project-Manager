/**
 * Verification script for Gemini Provider
 * 
 * This script tests the Gemini Provider by:
 * 1. Initializing the Gemini provider
 * 2. Checking if it's available
 * 3. Generating completions
 * 
 * Usage: node verify-gemini-provider.js
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
 * Run the verification
 */
async function runVerification() {
  console.log('Starting Gemini Provider verification...');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Initialize the Gemini provider
    console.log('Test 1: Initializing the Gemini provider...');
    const provider = new GeminiProvider({
      apiKey: process.env.GEMINI_API_KEY
    });
    
    if (provider) {
      console.log('✅ Gemini provider initialized successfully');
    } else {
      console.error('❌ Failed to initialize Gemini provider');
      process.exit(1);
    }
    
    // Test 2: Check if the provider is available
    console.log('\nTest 2: Checking if the provider is available...');
    const available = await provider.isAvailable();
    
    if (available) {
      console.log('✅ Gemini provider is available');
    } else {
      console.error('❌ Gemini provider is not available');
      process.exit(1);
    }
    
    // Test 3: Get available models
    console.log('\nTest 3: Getting available models...');
    const models = await provider.getAvailableModels();
    
    if (models && models.length > 0) {
      console.log(`✅ Gemini provider has ${models.length} models available`);
      console.log(`   Models: ${models.join(', ')}`);
    } else {
      console.error('❌ Gemini provider has no models available');
      process.exit(1);
    }
    
    // Test 4: Generate a chat completion
    console.log('\nTest 4: Generating a chat completion...');
    const chatCompletion = await provider.generateChatCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, Gemini! What can you do?' }
      ],
      temperature: 0.2
    });
    
    if (chatCompletion && chatCompletion.message) {
      console.log('✅ Generated chat completion:');
      console.log(`   ${chatCompletion.message.substring(0, 100)}...`);
    } else {
      console.error('❌ Failed to generate chat completion');
      process.exit(1);
    }
    
    // Test 5: Generate a streaming chat completion
    console.log('\nTest 5: Generating a streaming chat completion...');
    console.log('   Response: ');
    
    let streamingResponse = '';
    await provider.generateStreamingChatCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Count from 1 to 5 briefly.' }
      ],
      temperature: 0.2
    }, (chunk) => {
      process.stdout.write(chunk.chunk);
      streamingResponse += chunk.chunk;
    });
    
    console.log('\n');
    
    if (streamingResponse) {
      console.log('✅ Generated streaming chat completion');
    } else {
      console.error('❌ Failed to generate streaming chat completion');
      process.exit(1);
    }
    
    // All tests passed
    console.log('\n----------------------------------------');
    console.log('✅ All Gemini Provider verification tests passed!');
    console.log('----------------------------------------');
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the verification
runVerification();
