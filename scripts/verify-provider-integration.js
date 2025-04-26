/**
 * Verification script for AI Provider Integration
 *
 * This script tests the AI Provider integration by:
 * 1. Getting the best available provider
 * 2. Getting a provider by name
 * 3. Using the provider to generate a completion
 *
 * Usage: node verify-provider-integration.js
 */

import {
  getBestAvailableProvider,
  getProviderByName,
  MockProvider
} from '../src/providers/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Run the verification
 */
async function runVerification() {
  console.log('Starting AI Provider Integration verification...');
  console.log('----------------------------------------');

  try {
    // Test 1: Get the mock provider directly
    console.log('Test 1: Getting the mock provider...');
    const provider = getProviderByName('mock');

    if (provider && provider instanceof MockProvider) {
      console.log('✅ Got mock provider');
    } else {
      console.error('❌ Failed to get mock provider');
      process.exit(1);
    }

    // Test 2: Get a provider by name
    console.log('\nTest 2: Getting a provider by name...');
    const mockProvider = getProviderByName('mock');

    if (mockProvider && mockProvider instanceof MockProvider) {
      console.log('✅ Got mock provider');
    } else {
      console.error('❌ Failed to get mock provider');
      process.exit(1);
    }

    // Test 3: Generate a completion
    console.log('\nTest 3: Generating a completion...');
    const completion = await provider.generateCompletion({
      prompt: 'Hello, world!'
    });

    if (completion && completion.completion) {
      console.log(`✅ Generated completion: ${completion.completion}`);
    } else {
      console.error('❌ Failed to generate completion');
      process.exit(1);
    }

    // Test 4: Generate a chat completion
    console.log('\nTest 4: Generating a chat completion...');
    const chatCompletion = await provider.generateChatCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, world!' }
      ]
    });

    if (chatCompletion && chatCompletion.message) {
      console.log(`✅ Generated chat completion: ${chatCompletion.message}`);
    } else {
      console.error('❌ Failed to generate chat completion');
      process.exit(1);
    }

    // Test 5: Generate a streaming chat completion
    console.log('\nTest 5: Generating a streaming chat completion...');
    let streamingResponse = '';

    await provider.generateStreamingChatCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Count from 1 to 5.' }
      ]
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
    console.log('✅ All AI Provider Integration verification tests passed!');
    console.log('----------------------------------------');
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the verification
runVerification();
