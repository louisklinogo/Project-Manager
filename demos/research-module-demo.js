/**
 * Research Module Demonstration
 * 
 * This script demonstrates using the Perplexity API to perform research
 * and store the results in a knowledge base.
 * 
 * It shows a real-world usage scenario with actual API calls.
 */

import dotenv from 'dotenv';
import { ResearchModule } from '../src/modules/research-module.js';
import { KnowledgeBase } from '../src/models/knowledge-base.js';
import { PerplexityProvider } from '../src/providers/perplexity-provider.js';

// Load environment variables
dotenv.config();

// Initialize the Perplexity provider
const perplexityProvider = new PerplexityProvider({
  apiKey: process.env.PERPLEXITY_API_KEY
});

// Initialize the research module
const researchModule = new ResearchModule({
  provider: perplexityProvider
});

// Create a knowledge base
const knowledgeBase = new KnowledgeBase({
  id: 'demo-kb',
  domain: 'Mobile App Development',
  concepts: [],
  patterns: [],
  best_practices: [],
  examples: []
});

/**
 * Perform research on a topic
 * @param {string} topic - Topic to research
 * @returns {Promise<Object>} - Research results
 */
async function performResearch(topic) {
  console.log(`Researching topic: ${topic}...\n`);
  
  try {
    const results = await researchModule.researchTopic(topic, {
      maxResults: 3,
      includeSourceLinks: true
    });
    
    return results;
  } catch (error) {
    console.error('Error performing research:', error);
    return {
      summary: 'Error performing research',
      key_points: [],
      sources: []
    };
  }
}

/**
 * Add research results to knowledge base
 * @param {Object} results - Research results
 * @param {string} category - Category to add results to (concepts, patterns, best_practices, examples)
 */
function addToKnowledgeBase(results, category) {
  console.log(`Adding research results to knowledge base under category: ${category}...\n`);
  
  if (!results || !results.key_points) {
    console.log('No results to add to knowledge base');
    return;
  }
  
  // Add each key point as an entry in the knowledge base
  results.key_points.forEach((point, index) => {
    knowledgeBase[category].push({
      id: `${category}-${knowledgeBase[category].length + 1}`,
      title: `Research finding ${index + 1}`,
      description: point,
      sources: results.sources || [],
      created_at: new Date().toISOString()
    });
  });
  
  console.log(`Added ${results.key_points.length} entries to knowledge base`);
}

/**
 * Main function to run the demonstration
 */
async function runDemo() {
  console.log('Research Module Demonstration\n');
  
  // Research topics for different categories
  const topics = [
    {
      topic: 'Best practices for mobile app UI design',
      category: 'best_practices'
    },
    {
      topic: 'Common design patterns in fitness tracking apps',
      category: 'patterns'
    },
    {
      topic: 'Key concepts in mobile app development',
      category: 'concepts'
    },
    {
      topic: 'Examples of successful fitness tracking apps',
      category: 'examples'
    }
  ];
  
  // Perform research on each topic
  for (const { topic, category } of topics) {
    console.log(`\n--- Researching: ${topic} ---\n`);
    
    const results = await performResearch(topic);
    console.log('Research results:');
    console.log(JSON.stringify(results, null, 2));
    
    addToKnowledgeBase(results, category);
  }
  
  // Display the final knowledge base
  console.log('\nFinal Knowledge Base:');
  console.log(JSON.stringify(knowledgeBase, null, 2));
  
  // Save the knowledge base to a file
  try {
    await knowledgeBase.save('demo-knowledge-base.json');
    console.log('\nKnowledge base saved to demo-knowledge-base.json');
  } catch (error) {
    console.error('Error saving knowledge base:', error);
  }
  
  console.log('\nResearch Module Demonstration Complete!');
}

// Run the demonstration
runDemo();
