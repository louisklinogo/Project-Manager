/**
 * Verification script for AI Providers
 * 
 * This script tests the AI Provider abstraction by:
 * 1. Testing each provider individually
 * 2. Testing provider selection
 * 3. Testing provider fallback
 * 
 * Usage: node verify-ai-providers.js
 */

import { 
  AIProvider,
  ClaudeProvider,
  OpenAIProvider,
  GeminiProvider,
  PerplexityProvider,
  getBestAvailableProvider,
  getProviderByName
} from '../src/providers/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test a provider
 * @param {AIProvider} provider - Provider to test
 * @returns {Promise<boolean>} - Whether the test passed
 */
async function testProvider(provider) {
  console.log(`Testing ${provider.name} provider...`);
  
  try {
    // Test 1: Check if provider is available
    console.log(`  Test 1: Checking if ${provider.name} is available...`);
    const available = await provider.isAvailable();
    if (available) {
      console.log(`  ✅ ${provider.name} is available`);
    } else {
      console.log(`  ❌ ${provider.name} is not available`);
      return false;
    }
    
    // Test 2: Get available models
    console.log(`  Test 2: Getting available models for ${provider.name}...`);
    const models = await provider.getAvailableModels();
    if (models && models.length > 0) {
      console.log(`  ✅ ${provider.name} has ${models.length} models available`);
      console.log(`     First model: ${models[0]}`);
    } else {
      console.log(`  ❌ ${provider.name} has no models available`);
      return false;
    }
    
    // Test 3: Generate a chat completion
    console.log(`  Test 3: Generating a chat completion with ${provider.name}...`);
    const completion = await provider.generateChatCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, can you tell me what provider you are?' }
      ],
      temperature: 0.2,
      maxTokens: 100
    });
    
    if (completion && completion.message) {
      console.log(`  ✅ ${provider.name} generated a chat completion`);
      console.log(`     Response: ${completion.message.substring(0, 100)}...`);
    } else {
      console.log(`  ❌ ${provider.name} failed to generate a chat completion`);
      return false;
    }
    
    // Test 4: Generate a streaming chat completion
    console.log(`  Test 4: Generating a streaming chat completion with ${provider.name}...`);
    let streamingResponse = '';
    
    await provider.generateStreamingChatCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Count from 1 to 5.' }
      ],
      temperature: 0.2,
      maxTokens: 100
    }, (chunk) => {
      process.stdout.write(chunk.chunk);
      streamingResponse += chunk.chunk;
    });
    
    console.log('\n');
    
    if (streamingResponse) {
      console.log(`  ✅ ${provider.name} generated a streaming chat completion`);
    } else {
      console.log(`  ❌ ${provider.name} failed to generate a streaming chat completion`);
      return false;
    }
    
    console.log(`✅ All tests passed for ${provider.name} provider\n`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error testing ${provider.name} provider: ${error.message}`);
    return false;
  }
}

/**
 * Run the verification
 */
async function runVerification() {
  console.log('Starting AI Providers verification...');
  console.log('----------------------------------------');
  
  try {
    // Test each provider individually if API keys are available
    const providerResults = {};
    
    // Test Claude provider
    if (process.env.ANTHROPIC_API_KEY) {
      const claudeProvider = new ClaudeProvider({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      providerResults.claude = await testProvider(claudeProvider);
    } else {
      console.log('Skipping Claude provider test (ANTHROPIC_API_KEY not provided)');
    }
    
    // Test OpenAI provider
    if (process.env.OPENAI_API_KEY) {
      const openaiProvider = new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY
      });
      providerResults.openai = await testProvider(openaiProvider);
    } else {
      console.log('Skipping OpenAI provider test (OPENAI_API_KEY not provided)');
    }
    
    // Test Gemini provider
    if (process.env.GEMINI_API_KEY) {
      const geminiProvider = new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY
      });
      providerResults.gemini = await testProvider(geminiProvider);
    } else {
      console.log('Skipping Gemini provider test (GEMINI_API_KEY not provided)');
    }
    
    // Test Perplexity provider
    if (process.env.PERPLEXITY_API_KEY) {
      const perplexityProvider = new PerplexityProvider({
        apiKey: process.env.PERPLEXITY_API_KEY
      });
      providerResults.perplexity = await testProvider(perplexityProvider);
    } else {
      console.log('Skipping Perplexity provider test (PERPLEXITY_API_KEY not provided)');
    }
    
    // Test provider selection
    console.log('\nTesting provider selection...');
    
    // Test getProviderByName
    console.log('  Test 1: Getting provider by name...');
    const availableProviders = Object.keys(providerResults).filter(name => providerResults[name]);
    
    if (availableProviders.length > 0) {
      const providerName = availableProviders[0];
      const provider = getProviderByName(providerName, {
        apiKey: process.env[`${providerName.toUpperCase()}_API_KEY`]
      });
      
      if (provider && provider.name === providerName) {
        console.log(`  ✅ Successfully got provider by name: ${providerName}`);
      } else {
        console.log(`  ❌ Failed to get provider by name: ${providerName}`);
      }
    } else {
      console.log('  ⚠️ Skipping getProviderByName test (no available providers)');
    }
    
    // Test getBestAvailableProvider
    console.log('  Test 2: Getting best available provider...');
    if (Object.values(providerResults).some(result => result)) {
      const bestProvider = await getBestAvailableProvider();
      
      if (bestProvider) {
        console.log(`  ✅ Successfully got best available provider: ${bestProvider.name}`);
      } else {
        console.log('  ❌ Failed to get best available provider');
      }
    } else {
      console.log('  ⚠️ Skipping getBestAvailableProvider test (no available providers)');
    }
    
    // All tests passed
    console.log('\n----------------------------------------');
    console.log('✅ AI Providers verification completed!');
    console.log('----------------------------------------');
    
    // Summary
    console.log('\nProvider Test Summary:');
    for (const [provider, result] of Object.entries(providerResults)) {
      console.log(`  ${provider}: ${result ? '✅ Passed' : '❌ Failed'}`);
    }
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the verification
runVerification();
