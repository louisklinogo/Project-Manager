/**
 * Research Module Demonstration
 * 
 * This script demonstrates the functionality of the research module,
 * including validation, extraction, synthesis, integration, and versioning.
 */

import { 
  // Validation
  ResearchValidator,
  calculateConfidenceScore,
  
  // Extraction
  KnowledgeExtractor,
  TechnologyExtractor,
  
  // Synthesis
  ResearchSynthesizer,
  PriorityRanker,
  ConflictResolver,
  
  // Integration
  BlueprintIntegrator,
  DecisionJustifier,
  
  // Versioning
  KnowledgeVersioner,
  ChangeTracker,
  BlueprintUpdater
} from '../src/research/index.js';

import { KnowledgeNode } from '../src/models/knowledge-node.js';
import { ResearchReference } from '../src/models/research-reference.js';

// Sample research items
const researchItems = [
  {
    id: 'research-1',
    title: 'JavaScript Best Practices',
    content: `# JavaScript Best Practices

This guide covers best practices for JavaScript development.

## Variables

Use **const** and **let** instead of var. This helps prevent scope issues.

\`\`\`javascript
// Good
const name = 'John';
let age = 30;

// Bad
var name = 'John';
var age = 30;
\`\`\`

## Functions

Use arrow functions for better this binding.

\`\`\`javascript
// Good
const add = (a, b) => a + b;

// Bad
function add(a, b) {
  return a + b;
}
\`\`\``,
    url: 'https://example.com/javascript-best-practices',
    metadata: {
      publishedDate: new Date().toISOString(),
      confidence: 0.9,
      relevance: 0.95
    }
  },
  {
    id: 'research-2',
    title: 'Modern JavaScript Development',
    content: `# Modern JavaScript Development

Modern JavaScript development relies on tools like webpack, Babel, and ESLint.

## Tooling

- **Webpack**: Module bundler
- **Babel**: JavaScript compiler
- **ESLint**: Linting utility

## Package Management

Use npm or yarn for package management.

\`\`\`bash
# Initialize a new project
npm init -y

# Install dependencies
npm install webpack babel-core eslint --save-dev
\`\`\``,
    url: 'https://example.com/modern-js-development',
    metadata: {
      publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days old
      confidence: 0.8,
      relevance: 0.85
    }
  },
  {
    id: 'research-3',
    title: 'JavaScript Performance Tips',
    content: `# JavaScript Performance Tips

Optimize your JavaScript code for better performance.

## Loop Optimization

Cache array length in loops.

\`\`\`javascript
// Good
const arr = [1, 2, 3, 4, 5];
const len = arr.length;
for (let i = 0; i < len; i++) {
  console.log(arr[i]);
}

// Bad
const arr = [1, 2, 3, 4, 5];
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
\`\`\`

## DOM Manipulation

Minimize DOM operations.

\`\`\`javascript
// Good
const fragment = document.createDocumentFragment();
for (let i = 0; i < 10; i++) {
  const el = document.createElement('div');
  fragment.appendChild(el);
}
document.body.appendChild(fragment);

// Bad
for (let i = 0; i < 10; i++) {
  const el = document.createElement('div');
  document.body.appendChild(el);
}
\`\`\``,
    url: 'https://example.com/javascript-performance',
    metadata: {
      publishedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days old
      confidence: 0.75,
      relevance: 0.8
    }
  }
];

// Sample blueprint
const blueprint = {
  id: 'blueprint-1',
  title: 'JavaScript Project Blueprint',
  description: 'A blueprint for a modern JavaScript project',
  architecture: {
    decisions: [
      {
        id: 'decision-1',
        title: 'Use ES6 Features',
        description: 'We will use modern JavaScript ES6 features in this project.'
      },
      {
        id: 'decision-2',
        title: 'Webpack for Bundling',
        description: 'We will use Webpack as our module bundler.'
      }
    ],
    components: [
      {
        id: 'component-1',
        name: 'Frontend',
        description: 'React-based frontend'
      },
      {
        id: 'component-2',
        name: 'API Client',
        description: 'Client for interacting with backend APIs'
      }
    ]
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Set up project structure',
      description: 'Create the initial project structure and configuration',
      implementation_guide: 'Create a new directory for the project. Initialize with npm init. Set up webpack and babel.'
    },
    {
      id: 'task-2',
      title: 'Implement core components',
      description: 'Implement the core components of the application',
      subtasks: [
        {
          id: 'subtask-1',
          title: 'Create API client',
          description: 'Implement the API client for backend communication'
        }
      ]
    }
  ],
  workflow: {
    steps: [
      {
        id: 'step-1',
        title: 'Development',
        description: 'Develop features according to the tasks'
      },
      {
        id: 'step-2',
        title: 'Testing',
        description: 'Test the implemented features'
      }
    ],
    checkpoints: [
      {
        id: 'checkpoint-1',
        title: 'Code Review',
        description: 'Review code for quality and adherence to standards'
      }
    ]
  }
};

/**
 * Demonstrate research validation
 */
async function demonstrateValidation() {
  console.log('\n=== Research Validation ===\n');
  
  // Create a validator
  const validator = new ResearchValidator({
    domain: 'technology',
    strictMode: false
  });
  
  // Validate research items
  const validationResults = validator.validateItems(researchItems);
  
  console.log(`Validated ${validationResults.stats.total} research items:`);
  console.log(`- Valid: ${validationResults.stats.valid}`);
  console.log(`- Invalid: ${validationResults.stats.invalid}`);
  console.log(`- Average confidence: ${validationResults.stats.averageConfidence.toFixed(2)}`);
  
  // Calculate confidence score for a specific item
  const confidenceScore = calculateConfidenceScore(researchItems[0]);
  
  console.log('\nConfidence score for research item 1:');
  console.log(`- Overall: ${confidenceScore.overall.toFixed(2)}`);
  console.log(`- Source credibility: ${confidenceScore.sourceCredibility.overall.toFixed(2)}`);
  console.log(`- Content relevance: ${confidenceScore.contentRelevance.overall.toFixed(2)}`);
  console.log(`- Information consistency: ${confidenceScore.informationConsistency.overall.toFixed(2)}`);
  console.log(`- Passes validation: ${confidenceScore.passesValidation ? 'Yes' : 'No'}`);
  
  // Filter research items by confidence
  const highConfidenceItems = validator.filterByConfidence(researchItems, 0.8);
  
  console.log(`\nHigh confidence items (threshold 0.8): ${highConfidenceItems.length}`);
  
  // Rank research items by confidence
  const rankedItems = validator.rankByConfidence(researchItems);
  
  console.log('\nRanked research items:');
  rankedItems.forEach((item, index) => {
    console.log(`${index + 1}. ${item.item.title} (Confidence: ${item.confidence.toFixed(2)})`);
  });
  
  // Get validation issues for a low confidence item
  const lowConfidenceItem = researchItems.find(item => item.metadata.confidence < 0.8);
  if (lowConfidenceItem) {
    const issues = validator.getValidationIssues(lowConfidenceItem);
    
    console.log(`\nValidation issues for "${lowConfidenceItem.title}":`);
    issues.forEach(issue => {
      console.log(`- ${issue.category}: ${issue.message} (Score: ${issue.score.toFixed(2)}, Threshold: ${issue.threshold.toFixed(2)})`);
    });
    
    // Get improvement suggestions
    const suggestions = validator.suggestImprovements(lowConfidenceItem);
    
    console.log(`\nImprovement suggestions for "${lowConfidenceItem.title}":`);
    suggestions.forEach(suggestion => {
      console.log(`- ${suggestion.issue.category}: ${suggestion.suggestion}`);
    });
  }
}

/**
 * Demonstrate knowledge extraction
 */
async function demonstrateExtraction() {
  console.log('\n=== Knowledge Extraction ===\n');
  
  // Create an extractor
  const extractor = new KnowledgeExtractor();
  
  // Register a domain-specific extractor
  const techExtractor = new TechnologyExtractor();
  extractor.registerDomainExtractor('technology', techExtractor);
  
  // Extract knowledge from a research item
  const knowledgeNodes = await extractor.extractKnowledge(researchItems[0], {
    domain: 'technology'
  });
  
  console.log(`Extracted ${knowledgeNodes.length} knowledge nodes from "${researchItems[0].title}":`);
  knowledgeNodes.forEach((node, index) => {
    console.log(`${index + 1}. ${node.type}: ${node.name}`);
    console.log(`   Description: ${node.description.substring(0, 50)}${node.description.length > 50 ? '...' : ''}`);
    console.log(`   Confidence: ${node.confidence.toFixed(2)}`);
    console.log(`   Tags: ${node.tags.join(', ')}`);
    console.log(`   Relations: ${node.relations.length}`);
    console.log(`   Sources: ${node.sources.length}`);
  });
  
  // Extract knowledge from multiple research items
  const allNodes = await extractor.extractKnowledgeFromMultiple(researchItems);
  
  console.log(`\nExtracted ${allNodes.length} knowledge nodes from all research items.`);
  
  // Group nodes by type
  const nodesByType = allNodes.reduce((groups, node) => {
    if (!groups[node.type]) {
      groups[node.type] = [];
    }
    groups[node.type].push(node);
    return groups;
  }, {});
  
  console.log('\nKnowledge nodes by type:');
  Object.entries(nodesByType).forEach(([type, nodes]) => {
    console.log(`- ${type}: ${nodes.length} nodes`);
  });
}

/**
 * Demonstrate research synthesis
 */
async function demonstrateSynthesis() {
  console.log('\n=== Research Synthesis ===\n');
  
  // Create a priority ranker
  const ranker = new PriorityRanker();
  
  // Rank research items
  const rankedItems = ranker.rankItems(researchItems, {
    query: 'JavaScript best practices'
  });
  
  console.log('Ranked research items:');
  rankedItems.forEach((item, index) => {
    console.log(`${index + 1}. ${item.item.title} (Score: ${item.weightedScore.toFixed(2)})`);
    console.log(`   Confidence: ${item.scores.confidence.toFixed(2)}`);
    console.log(`   Relevance: ${item.scores.relevance.toFixed(2)}`);
    console.log(`   Recency: ${item.scores.recency.toFixed(2)}`);
    console.log(`   Specificity: ${item.scores.specificity.toFixed(2)}`);
  });
  
  // Create a conflict resolver
  const resolver = new ConflictResolver({ ranker });
  
  // Create conflicting research items
  const conflictingItems = [
    {
      id: 'conflict-1',
      title: 'JavaScript ES6 Release',
      content: 'ES6 was released in 2015.',
      url: 'https://example.com/es6-2015',
      metadata: {
        publishedDate: new Date().toISOString(),
        confidence: 0.9
      }
    },
    {
      id: 'conflict-2',
      title: 'ECMAScript 6 History',
      content: 'ECMAScript 6 was released in 2016.',
      url: 'https://example.com/es6-2016',
      metadata: {
        publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.7
      }
    }
  ];
  
  // Detect conflicts
  const conflicts = resolver.detectConflicts(conflictingItems);
  
  console.log(`\nDetected ${conflicts.length} conflicts.`);
  
  if (conflicts.length > 0) {
    // Resolve conflicts
    const resolutionResults = resolver.resolveConflicts(conflicts, {
      preferRecent: false,
      preferConfident: true
    });
    
    console.log(`\nResolved ${resolutionResults.resolvedConflicts.length} conflicts:`);
    resolutionResults.resolvedConflicts.forEach((result, index) => {
      console.log(`${index + 1}. Conflict on "${result.conflict.topic}":`);
      console.log(`   Value 1: ${result.conflict.conflict.value1}`);
      console.log(`   Value 2: ${result.conflict.conflict.value2}`);
      console.log(`   Resolved value: ${result.resolution.value}`);
      console.log(`   Resolution method: ${result.resolution.method}`);
      console.log(`   Confidence: ${result.resolution.confidence.toFixed(2)}`);
    });
    
    // Apply resolutions
    const updatedItems = resolver.applyResolutions(conflictingItems, resolutionResults);
    
    console.log('\nUpdated research items with resolved conflicts.');
  }
  
  // Create a synthesizer
  const synthesizer = new ResearchSynthesizer({ ranker, conflictResolver: resolver });
  
  // Synthesize research
  const synthesis = await synthesizer.synthesizeResearch(researchItems, {
    query: 'JavaScript best practices',
    domain: 'technology',
    resolveConflicts: true
  });
  
  console.log('\nSynthesized research:');
  console.log(`Summary: ${synthesis.summary.substring(0, 100)}${synthesis.summary.length > 100 ? '...' : ''}`);
  
  console.log('\nKey findings:');
  synthesis.keyFindings.forEach((finding, index) => {
    console.log(`${index + 1}. ${finding.substring(0, 100)}${finding.length > 100 ? '...' : ''}`);
  });
  
  console.log(`\nSources: ${synthesis.sources.length}`);
}

/**
 * Demonstrate blueprint integration
 */
async function demonstrateIntegration() {
  console.log('\n=== Blueprint Integration ===\n');
  
  // Create a decision justifier
  const justifier = new DecisionJustifier();
  
  // Justify a decision
  const decision = blueprint.architecture.decisions[0];
  
  console.log(`Justifying decision: "${decision.title}"`);
  
  const justification = await justifier.justifyDecision(decision, researchItems);
  
  console.log(`\nJustification: ${justification.justification.substring(0, 100)}${justification.justification.length > 100 ? '...' : ''}`);
  console.log(`Confidence: ${justification.confidence.toFixed(2)}`);
  console.log(`References: ${justification.references.length}`);
  
  // Create a blueprint integrator
  const integrator = new BlueprintIntegrator({ justifier });
  
  // Integrate research with blueprint
  console.log('\nIntegrating research with blueprint...');
  
  const integratedBlueprint = await integrator.integrateResearch(blueprint, researchItems);
  
  console.log('\nIntegrated blueprint:');
  console.log(`- Research sources: ${integratedBlueprint.research.sources.length}`);
  console.log(`- Research references: ${integratedBlueprint.research.references.length}`);
  
  // Check architecture decisions
  console.log('\nArchitecture decisions:');
  integratedBlueprint.architecture.decisions.forEach((decision, index) => {
    console.log(`${index + 1}. ${decision.title}`);
    if (decision.justification) {
      console.log(`   Justification: ${decision.justification.substring(0, 100)}${decision.justification.length > 100 ? '...' : ''}`);
      console.log(`   Confidence: ${decision.confidence.toFixed(2)}`);
    }
  });
  
  // Check tasks
  console.log('\nTasks:');
  integratedBlueprint.tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.title}`);
    if (task.research && task.research.references) {
      console.log(`   References: ${task.research.references.length}`);
    }
    if (task.implementation_guide) {
      console.log(`   Implementation guide: ${task.implementation_guide.substring(0, 100)}${task.implementation_guide.length > 100 ? '...' : ''}`);
    }
  });
}

/**
 * Demonstrate versioning
 */
async function demonstrateVersioning() {
  console.log('\n=== Research Versioning ===\n');
  
  // Create a knowledge node
  const node = new KnowledgeNode({
    type: 'concept',
    name: 'JavaScript',
    description: 'A programming language',
    content: 'JavaScript is a programming language used for web development.',
    tags: ['language', 'web'],
    metadata: {
      importance: 'high'
    }
  });
  
  console.log('Created knowledge node:');
  console.log(`- ID: ${node.id}`);
  console.log(`- Type: ${node.type}`);
  console.log(`- Name: ${node.name}`);
  console.log(`- Description: ${node.description}`);
  
  // Create a knowledge versioner
  const versioner = new KnowledgeVersioner();
  
  // Create a version
  const changes = {
    type: 'update',
    properties: {
      name: {
        old: 'JavaScript',
        new: 'JavaScript (JS)'
      }
    },
    content: {
      changed: true,
      old: 'JavaScript is a programming language used for web development.',
      new: 'JavaScript is a high-level, interpreted programming language used for web development.'
    },
    metadata: {
      added: {
        complexity: 'medium'
      }
    }
  };
  
  const version = await versioner.createVersion(node, changes, 'user1');
  
  console.log('\nCreated version:');
  console.log(`- ID: ${version.id}`);
  console.log(`- Node ID: ${version.nodeId}`);
  console.log(`- Author: ${version.author}`);
  console.log(`- Timestamp: ${version.timestamp}`);
  console.log(`- Changes: ${Object.keys(version.changes).join(', ')}`);
  
  // Create a change tracker
  const tracker = new ChangeTracker();
  
  // Track a change
  const change = {
    type: 'update',
    entityType: 'node',
    entityId: node.id,
    data: {
      name: {
        old: 'JavaScript',
        new: 'JavaScript (JS)'
      }
    }
  };
  
  const changeRecord = await tracker.trackChange(change, 'user1');
  
  console.log('\nTracked change:');
  console.log(`- ID: ${changeRecord.id}`);
  console.log(`- Type: ${changeRecord.type}`);
  console.log(`- Entity type: ${changeRecord.entityType}`);
  console.log(`- Entity ID: ${changeRecord.entityId}`);
  console.log(`- Author: ${changeRecord.author}`);
  console.log(`- Timestamp: ${changeRecord.timestamp}`);
  
  // Create a blueprint updater
  const updater = new BlueprintUpdater();
  
  // Assess update needs
  const assessment = await updater.assessUpdateNeeds(blueprint, researchItems);
  
  console.log('\nBlueprint update assessment:');
  console.log(`- Needs update: ${assessment.needsUpdate ? 'Yes' : 'No'}`);
  console.log(`- Reasons: ${assessment.reasons.length}`);
  console.log(`- Relevant research: ${assessment.relevantResearch.length}`);
  
  if (assessment.needsUpdate) {
    // Update blueprint
    console.log('\nUpdating blueprint...');
    
    const updatedBlueprint = await updater.updateBlueprint(blueprint, assessment.relevantResearch);
    
    console.log('\nUpdated blueprint:');
    console.log(`- Research sources: ${updatedBlueprint.research.sources.length}`);
    
    // Check architecture decisions
    console.log('\nArchitecture decisions:');
    updatedBlueprint.architecture.decisions.forEach((decision, index) => {
      console.log(`${index + 1}. ${decision.title}`);
      if (decision.justification) {
        console.log(`   Justification: ${decision.justification.substring(0, 100)}${decision.justification.length > 100 ? '...' : ''}`);
        console.log(`   Confidence: ${decision.confidence.toFixed(2)}`);
      }
    });
  }
}

/**
 * Run the demonstration
 */
async function runDemo() {
  console.log('=== Research Module Demonstration ===');
  
  try {
    await demonstrateValidation();
    await demonstrateExtraction();
    await demonstrateSynthesis();
    await demonstrateIntegration();
    await demonstrateVersioning();
    
    console.log('\n=== Demonstration Complete ===');
  } catch (error) {
    console.error('Error in demonstration:', error);
  }
}

// Run the demo
runDemo();
