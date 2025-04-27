/**
 * Simple test script for the Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is required but not provided');
      process.exit(1);
    }

    console.log('Creating Gemini client...');
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini client created');

    // Get the model
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    console.log(`Using model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Generate content
    console.log('Generating content...');
    const query = 'Best practices for implementing a flow-based architecture in JavaScript';
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: query }] }],
      generationConfig: {
        maxOutputTokens: 1000
      }
    });

    console.log('Content generated successfully');
    const response = result.response;
    console.log('Response:', response);
    
    const text = response.text();
    console.log('\n--- Generated Text ---\n');
    console.log(text);
    console.log('\n--- End of Generated Text ---\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
