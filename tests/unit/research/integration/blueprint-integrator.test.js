/**
 * Tests for blueprint integrator
 */

import { BlueprintIntegrator } from '../../../../src/research/integration/blueprint-integrator.js';
import { DecisionJustifier } from '../../../../src/research/integration/decision-justifier.js';
import { ResearchReference } from '../../../../src/models/research-reference.js';
import { jest } from '@jest/globals';

// Mock the getBestAvailableProvider function
jest.mock('../../../../src/providers/index.js', () => ({
  getBestAvailableProvider: jest.fn().mockResolvedValue({
    name: 'mock',
    generateChatCompletion: jest.fn().mockResolvedValue({
      message: 'Enhanced implementation guide with research findings.'
    })
  })
}));

// Mock the DecisionJustifier
jest.mock('../../../../src/research/integration/decision-justifier.js', () => {
  const originalModule = jest.requireActual('../../../../src/research/integration/decision-justifier.js');
  
  return {
    ...originalModule,
    DecisionJustifier: jest.fn().mockImplementation(() => ({
      justifyDecision: jest.fn().mockResolvedValue({
        justification: 'Mocked justification',
        confidence: 0.8,
        references: [
          {
            id: 'ref-1',
            researchId: 'research-1',
            type: 'source'
          }
        ]
      })
    }))
  };
});

describe('BlueprintIntegrator', () => {
  // Sample research items for testing
  const researchItem1 = {
    id: 'research-1',
    title: 'JavaScript Best Practices',
    content: 'Use const and let instead of var. Arrow functions are preferred for better this binding. Always use strict mode.\n\n- Use descriptive variable names\n- Keep functions small and focused\n- Use modern ES6+ features',
    url: 'https://example.com/js-best-practices',
    metadata: {
      publishedDate: new Date().toISOString(),
      confidence: 0.9
    }
  };
  
  const researchItem2 = {
    id: 'research-2',
    title: 'Modern JavaScript Development',
    content: 'Modern JavaScript development relies on tools like webpack, Babel, and ESLint. Use npm or yarn for package management.\n\n- Set up proper tooling\n- Use a consistent code style\n- Implement automated testing',
    url: 'https://example.com/modern-js',
    metadata: {
      publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days old
      confidence: 0.8
    }
  };
  
  const researchItems = [researchItem1, researchItem2];
  
  // Sample blueprint for testing
  const blueprint = {
    title: 'Sample Project Blueprint',
    description: 'A blueprint for a sample JavaScript project',
    architecture: {
      decisions: [
        {
          id: 'decision-1',
          title: 'Use ES6 Features',
          description: 'We will use modern JavaScript ES6 features in this project.'
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
          name: 'Backend',
          description: 'Node.js backend with Express'
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
        title: 'Implement frontend components',
        description: 'Create React components for the UI',
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Create header component',
            description: 'Implement the header component with navigation'
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
  
  test('should create a blueprint integrator with default options', () => {
    const integrator = new BlueprintIntegrator();
    
    expect(integrator).toBeInstanceOf(BlueprintIntegrator);
    expect(DecisionJustifier).toHaveBeenCalled();
    expect(integrator.useAI).toBe(true);
  });
  
  test('should create a blueprint integrator with custom options', () => {
    const justifier = new DecisionJustifier();
    
    const integrator = new BlueprintIntegrator({
      justifier,
      useAI: false
    });
    
    expect(integrator).toBeInstanceOf(BlueprintIntegrator);
    expect(integrator.justifier).toBe(justifier);
    expect(integrator.useAI).toBe(false);
  });
  
  test('integrateResearch should integrate research with blueprint', async () => {
    const integrator = new BlueprintIntegrator();
    
    const integratedBlueprint = await integrator.integrateResearch(blueprint, researchItems);
    
    expect(integratedBlueprint).toHaveProperty('research');
    expect(integratedBlueprint.research).toHaveProperty('sources');
    expect(integratedBlueprint.research).toHaveProperty('references');
    
    // Should add research sources
    expect(integratedBlueprint.research.sources.length).toBe(researchItems.length);
    expect(integratedBlueprint.research.sources[0].id).toBe(researchItem1.id);
    expect(integratedBlueprint.research.sources[1].id).toBe(researchItem2.id);
    
    // Should integrate with architecture
    expect(integratedBlueprint.architecture.decisions[0]).toHaveProperty('justification');
    expect(integratedBlueprint.architecture.decisions[0]).toHaveProperty('confidence');
    expect(integratedBlueprint.architecture.research).toHaveProperty('references');
    
    // Should integrate with components
    expect(integratedBlueprint.architecture.components.some(c => c.research)).toBe(true);
    
    // Should integrate with tasks
    expect(integratedBlueprint.tasks[0]).toHaveProperty('research');
    expect(integratedBlueprint.tasks[0].research).toHaveProperty('references');
    
    // Should integrate with subtasks
    expect(integratedBlueprint.tasks[1].subtasks[0]).toHaveProperty('research');
    
    // Should integrate with workflow
    expect(integratedBlueprint.workflow.research).toHaveProperty('references');
    expect(integratedBlueprint.workflow.steps[0]).toHaveProperty('research');
    expect(integratedBlueprint.workflow.checkpoints[0]).toHaveProperty('research');
  });
  
  test('integrateResearch should handle empty research items', async () => {
    const integrator = new BlueprintIntegrator();
    
    const integratedBlueprint = await integrator.integrateResearch(blueprint, []);
    
    // Should return the original blueprint
    expect(integratedBlueprint).toEqual(blueprint);
  });
  
  test('integrateResearchSources should add new sources', () => {
    const integrator = new BlueprintIntegrator();
    
    const existingSources = [
      {
        id: 'existing-source',
        title: 'Existing Source',
        url: 'https://example.com/existing'
      }
    ];
    
    const integratedSources = integrator.integrateResearchSources(existingSources, researchItems);
    
    expect(integratedSources.length).toBe(existingSources.length + researchItems.length);
    expect(integratedSources[0].id).toBe('existing-source');
    expect(integratedSources[1].id).toBe(researchItem1.id);
    expect(integratedSources[2].id).toBe(researchItem2.id);
  });
  
  test('integrateResearchSources should not duplicate sources', () => {
    const integrator = new BlueprintIntegrator();
    
    const existingSources = [
      {
        id: researchItem1.id,
        title: 'Existing Source',
        url: 'https://example.com/existing'
      }
    ];
    
    const integratedSources = integrator.integrateResearchSources(existingSources, researchItems);
    
    expect(integratedSources.length).toBe(existingSources.length + 1); // Only add researchItem2
    expect(integratedSources[0].id).toBe(researchItem1.id);
    expect(integratedSources[1].id).toBe(researchItem2.id);
  });
  
  test('integrateWithArchitecture should integrate research with architecture', async () => {
    const integrator = new BlueprintIntegrator();
    
    const integratedArchitecture = await integrator.integrateWithArchitecture(blueprint.architecture, researchItems);
    
    expect(integratedArchitecture).toHaveProperty('research');
    expect(integratedArchitecture.research).toHaveProperty('references');
    
    // Should justify decisions
    expect(integratedArchitecture.decisions[0]).toHaveProperty('justification');
    expect(integratedArchitecture.decisions[0]).toHaveProperty('confidence');
    
    // Should integrate with components
    expect(integratedArchitecture.components.some(c => c.research)).toBe(true);
  });
  
  test('integrateWithTasks should integrate research with tasks', async () => {
    const integrator = new BlueprintIntegrator();
    
    const integratedTasks = await integrator.integrateWithTasks(blueprint.tasks, researchItems);
    
    expect(integratedTasks.length).toBe(blueprint.tasks.length);
    
    // Should add research references to tasks
    expect(integratedTasks[0]).toHaveProperty('research');
    expect(integratedTasks[0].research).toHaveProperty('references');
    
    // Should enhance implementation guide
    expect(integratedTasks[0].implementation_guide).toBeDefined();
    
    // Should integrate with subtasks
    expect(integratedTasks[1].subtasks[0]).toHaveProperty('research');
  });
  
  test('integrateWithWorkflow should integrate research with workflow', async () => {
    const integrator = new BlueprintIntegrator();
    
    const integratedWorkflow = await integrator.integrateWithWorkflow(blueprint.workflow, researchItems);
    
    expect(integratedWorkflow).toHaveProperty('research');
    expect(integratedWorkflow.research).toHaveProperty('references');
    
    // Should integrate with steps
    expect(integratedWorkflow.steps[0]).toHaveProperty('research');
    
    // Should integrate with checkpoints
    expect(integratedWorkflow.checkpoints[0]).toHaveProperty('research');
  });
  
  test('findRelevantResearch should find research items relevant to text', () => {
    const integrator = new BlueprintIntegrator();
    
    const text = 'JavaScript development with modern features';
    
    const relevantItems = integrator.findRelevantResearch(text, researchItems);
    
    expect(Array.isArray(relevantItems)).toBe(true);
    expect(relevantItems.length).toBeGreaterThan(0);
    
    // Items should be sorted by relevance
    for (let i = 1; i < relevantItems.length; i++) {
      expect(relevantItems[i - 1].relevance).toBeGreaterThanOrEqual(relevantItems[i].relevance);
    }
    
    // Each item should have required properties
    relevantItems.forEach(item => {
      expect(item).toHaveProperty('item');
      expect(item).toHaveProperty('relevance');
      
      expect(typeof item.relevance).toBe('number');
      expect(item.relevance).toBeGreaterThan(0);
      expect(item.relevance).toBeLessThanOrEqual(1);
    });
  });
  
  test('calculateRelevance should return appropriate relevance score', () => {
    const integrator = new BlueprintIntegrator();
    
    // High relevance
    const highRelevanceText = 'JavaScript ES6 features and best practices';
    expect(integrator.calculateRelevance(highRelevanceText, researchItem1)).toBeGreaterThan(0.5);
    
    // Medium relevance
    const mediumRelevanceText = 'Modern development tools';
    expect(integrator.calculateRelevance(mediumRelevanceText, researchItem2)).toBeGreaterThan(0.3);
    
    // Low relevance
    const lowRelevanceText = 'Python data analysis';
    expect(integrator.calculateRelevance(lowRelevanceText, researchItem1)).toBeLessThan(0.3);
    
    // Use relevance from metadata if available
    const itemWithRelevance = {
      ...researchItem1,
      metadata: {
        ...researchItem1.metadata,
        relevance: 0.75
      }
    };
    expect(integrator.calculateRelevance('Any text', itemWithRelevance)).toBe(0.75);
  });
  
  test('extractKeyFindings should extract findings from content', () => {
    const integrator = new BlueprintIntegrator();
    
    const findings = integrator.extractKeyFindings(researchItem1.content);
    
    expect(Array.isArray(findings)).toBe(true);
    expect(findings.length).toBeGreaterThan(0);
    
    // Should extract bullet points
    expect(findings.some(finding => finding.includes('descriptive variable names'))).toBe(true);
    
    // Should extract sentences with key phrases
    const contentWithKeyPhrases = 'It is important to validate user input. You should always sanitize data from external sources.';
    const phrasesFindings = integrator.extractKeyFindings(contentWithKeyPhrases);
    
    expect(phrasesFindings.some(finding => finding.includes('important to validate'))).toBe(true);
    expect(phrasesFindings.some(finding => finding.includes('should always sanitize'))).toBe(true);
  });
  
  test('enhanceImplementationGuide should enhance guide with research', async () => {
    const integrator = new BlueprintIntegrator();
    
    const guide = 'Create a new directory for the project. Initialize with npm init. Set up webpack and babel.';
    const relevantResearch = [
      { item: researchItem1, relevance: 0.8 },
      { item: researchItem2, relevance: 0.7 }
    ];
    
    // Test with AI
    const enhancedGuideWithAI = await integrator.enhanceImplementationGuide(guide, relevantResearch);
    expect(enhancedGuideWithAI).toBe('Enhanced implementation guide with research findings.');
    
    // Test with rules
    const integratorWithoutAI = new BlueprintIntegrator({ useAI: false });
    const enhancedGuideWithRules = await integratorWithoutAI.enhanceImplementationGuide(guide, relevantResearch);
    
    expect(enhancedGuideWithRules).toContain(guide);
    expect(enhancedGuideWithRules).toContain('Research-Based Recommendations');
  });
  
  test('createEnhancementPrompt should generate a valid prompt', () => {
    const integrator = new BlueprintIntegrator();
    
    const guide = 'Create a new directory for the project. Initialize with npm init. Set up webpack and babel.';
    const relevantResearch = [
      { item: researchItem1, relevance: 0.8 },
      { item: researchItem2, relevance: 0.7 }
    ];
    
    const prompt = integrator.createEnhancementPrompt(guide, relevantResearch);
    
    expect(prompt).toContain(guide);
    expect(prompt).toContain(researchItem1.title);
    expect(prompt).toContain(researchItem2.title);
    expect(prompt).toContain('Enhance the implementation guide');
  });
});
