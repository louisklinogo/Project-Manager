/**
 * Tests for blueprint updater
 */

import { BlueprintUpdater } from '../../../../src/research/versioning/blueprint-updater.js';
import { BlueprintIntegrator } from '../../../../src/research/integration/blueprint-integrator.js';
import { ChangeTracker } from '../../../../src/research/versioning/change-tracker.js';
import { jest } from '@jest/globals';

// Mock the getBestAvailableProvider function
jest.mock('../../../../src/providers/index.js', () => ({
  getBestAvailableProvider: jest.fn().mockResolvedValue({
    name: 'mock',
    generateChatCompletion: jest.fn().mockResolvedValue({
      message: {
        refinements: {
          architecture: {
            decisions: [
              {
                id: 'decision-1',
                justification: 'Refined justification',
                confidence: 0.9
              }
            ]
          },
          tasks: [
            {
              id: 'task-1',
              implementation_guide: 'Refined implementation guide'
            }
          ]
        }
      }
    })
  })
}));

// Mock the BlueprintIntegrator
jest.mock('../../../../src/research/integration/blueprint-integrator.js', () => {
  return {
    BlueprintIntegrator: jest.fn().mockImplementation(() => ({
      integrateResearch: jest.fn().mockImplementation((blueprint, research) => {
        // Create a copy of the blueprint with integrated research
        const integratedBlueprint = JSON.parse(JSON.stringify(blueprint));
        
        // Add research sources
        if (!integratedBlueprint.research) {
          integratedBlueprint.research = {
            sources: [],
            references: []
          };
        }
        
        // Add new sources
        for (const item of research) {
          integratedBlueprint.research.sources.push({
            id: item.id,
            title: item.title,
            url: item.url
          });
        }
        
        // Update architecture decisions
        if (integratedBlueprint.architecture?.decisions) {
          for (const decision of integratedBlueprint.architecture.decisions) {
            decision.justification = `Justification based on research: ${research[0]?.title}`;
            decision.confidence = 0.8;
          }
        }
        
        // Update task implementation guides
        if (integratedBlueprint.tasks) {
          for (const task of integratedBlueprint.tasks) {
            if (task.implementation_guide) {
              task.implementation_guide += `\n\nUpdated with research: ${research[0]?.title}`;
            }
          }
        }
        
        return integratedBlueprint;
      })
    }))
  };
});

// Mock the ChangeTracker
jest.mock('../../../../src/research/versioning/change-tracker.js', () => {
  return {
    ChangeTracker: jest.fn().mockImplementation(() => ({
      trackChanges: jest.fn().mockResolvedValue([]),
      trackChange: jest.fn().mockResolvedValue({})
    }))
  };
});

describe('BlueprintUpdater', () => {
  // Sample research items for testing
  const researchItem1 = {
    id: 'research-1',
    title: 'JavaScript Best Practices',
    content: 'Use const and let instead of var. Arrow functions are preferred for better this binding.',
    url: 'https://example.com/js-best-practices',
    metadata: {
      publishedDate: new Date().toISOString(),
      confidence: 0.9
    }
  };
  
  const researchItem2 = {
    id: 'research-2',
    title: 'Modern JavaScript Development',
    content: 'Modern JavaScript development relies on tools like webpack, Babel, and ESLint.',
    url: 'https://example.com/modern-js',
    metadata: {
      publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days old
      confidence: 0.8
    }
  };
  
  const researchItems = [researchItem1, researchItem2];
  
  // Sample blueprint for testing
  const blueprint = {
    id: 'blueprint-1',
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
        }
      ]
    },
    tasks: [
      {
        id: 'task-1',
        title: 'Set up project structure',
        description: 'Create the initial project structure and configuration',
        implementation_guide: 'Create a new directory for the project. Initialize with npm init.'
      }
    ]
  };
  
  test('should create a blueprint updater with default options', () => {
    const updater = new BlueprintUpdater();
    
    expect(updater).toBeInstanceOf(BlueprintUpdater);
    expect(BlueprintIntegrator).toHaveBeenCalled();
    expect(ChangeTracker).toHaveBeenCalled();
    expect(updater.useAI).toBe(true);
  });
  
  test('should create a blueprint updater with custom options', () => {
    const integrator = new BlueprintIntegrator();
    const changeTracker = new ChangeTracker();
    
    const updater = new BlueprintUpdater({
      integrator,
      changeTracker,
      useAI: false
    });
    
    expect(updater).toBeInstanceOf(BlueprintUpdater);
    expect(updater.integrator).toBe(integrator);
    expect(updater.changeTracker).toBe(changeTracker);
    expect(updater.useAI).toBe(false);
  });
  
  test('updateBlueprint should update a blueprint with new research', async () => {
    const updater = new BlueprintUpdater();
    
    const updatedBlueprint = await updater.updateBlueprint(blueprint, researchItems);
    
    // Should call integrator.integrateResearch
    expect(updater.integrator.integrateResearch).toHaveBeenCalledWith(blueprint, researchItems, {});
    
    // Should call changeTracker.trackChanges
    expect(updater.changeTracker.trackChanges).toHaveBeenCalled();
    
    // Should have integrated research
    expect(updatedBlueprint).toHaveProperty('research');
    expect(updatedBlueprint.research).toHaveProperty('sources');
    expect(updatedBlueprint.research.sources.length).toBe(researchItems.length);
    
    // Should have updated architecture decisions
    expect(updatedBlueprint.architecture.decisions[0]).toHaveProperty('justification');
    expect(updatedBlueprint.architecture.decisions[0]).toHaveProperty('confidence');
    
    // Should have updated task implementation guides
    expect(updatedBlueprint.tasks[0].implementation_guide).toContain('Updated with research');
  });
  
  test('updateBlueprint should handle empty research items', async () => {
    const updater = new BlueprintUpdater();
    
    const updatedBlueprint = await updater.updateBlueprint(blueprint, []);
    
    // Should not call integrator.integrateResearch
    expect(updater.integrator.integrateResearch).not.toHaveBeenCalled();
    
    // Should not call changeTracker.trackChanges
    expect(updater.changeTracker.trackChanges).not.toHaveBeenCalled();
    
    // Should return the original blueprint
    expect(updatedBlueprint).toEqual(blueprint);
  });
  
  test('updateBlueprint should throw error for missing blueprint', async () => {
    const updater = new BlueprintUpdater();
    
    await expect(updater.updateBlueprint()).rejects.toThrow('Blueprint is required');
  });
  
  test('updateBlueprint should refine updates with AI when enabled', async () => {
    const updater = new BlueprintUpdater();
    
    // Spy on refineUpdatesWithAI method
    const refineUpdatesSpy = jest.spyOn(updater, 'refineUpdatesWithAI');
    
    await updater.updateBlueprint(blueprint, researchItems);
    
    // Should call refineUpdatesWithAI
    expect(refineUpdatesSpy).toHaveBeenCalled();
  });
  
  test('updateBlueprint should not refine updates with AI when disabled', async () => {
    const updater = new BlueprintUpdater({ useAI: false });
    
    // Spy on refineUpdatesWithAI method
    const refineUpdatesSpy = jest.spyOn(updater, 'refineUpdatesWithAI');
    
    await updater.updateBlueprint(blueprint, researchItems);
    
    // Should not call refineUpdatesWithAI
    expect(refineUpdatesSpy).not.toHaveBeenCalled();
  });
  
  test('detectBlueprintChanges should detect changes between blueprints', () => {
    const updater = new BlueprintUpdater();
    
    const oldBlueprint = {
      id: 'blueprint-1',
      research: {
        sources: [
          { id: 'source-1', title: 'Source 1' }
        ]
      },
      architecture: {
        decisions: [
          {
            id: 'decision-1',
            justification: 'Original justification',
            confidence: 0.7
          }
        ]
      },
      tasks: [
        {
          id: 'task-1',
          implementation_guide: 'Original guide'
        }
      ]
    };
    
    const newBlueprint = {
      id: 'blueprint-1',
      research: {
        sources: [
          { id: 'source-1', title: 'Source 1' },
          { id: 'source-2', title: 'Source 2' }
        ]
      },
      architecture: {
        decisions: [
          {
            id: 'decision-1',
            justification: 'Updated justification',
            confidence: 0.8
          }
        ]
      },
      tasks: [
        {
          id: 'task-1',
          implementation_guide: 'Updated guide'
        }
      ]
    };
    
    const changes = updater.detectBlueprintChanges(oldBlueprint, newBlueprint);
    
    expect(Array.isArray(changes)).toBe(true);
    expect(changes.length).toBeGreaterThan(0);
    
    // Should detect source changes
    expect(changes.some(c => 
      c.type === 'add' && 
      c.entityType === 'research_source' && 
      c.data.sources.some(s => s.id === 'source-2')
    )).toBe(true);
    
    // Should detect decision changes
    expect(changes.some(c => 
      c.type === 'update' && 
      c.entityType === 'architecture_decision' && 
      c.data.justification
    )).toBe(true);
    
    // Should detect task changes
    expect(changes.some(c => 
      c.type === 'update' && 
      c.entityType === 'task' && 
      c.data.implementation_guide
    )).toBe(true);
  });
  
  test('detectArrayChanges should detect changes in arrays', () => {
    const updater = new BlueprintUpdater();
    
    const oldArray = [
      { id: 'item-1', name: 'Item 1' },
      { id: 'item-2', name: 'Item 2' }
    ];
    
    const newArray = [
      { id: 'item-2', name: 'Item 2' },
      { id: 'item-3', name: 'Item 3' }
    ];
    
    const keyFn = item => item.id;
    
    const changes = updater.detectArrayChanges(oldArray, newArray, keyFn);
    
    expect(changes.added).toContainEqual({ id: 'item-3', name: 'Item 3' });
    expect(changes.removed).toContainEqual({ id: 'item-1', name: 'Item 1' });
  });
  
  test('refineUpdatesWithAI should refine blueprint updates', async () => {
    const updater = new BlueprintUpdater();
    
    const changes = [
      {
        type: 'update',
        entityType: 'architecture_decision',
        entityId: 'decision-1',
        data: {
          justification: {
            old: 'Original justification',
            new: 'Updated justification'
          }
        }
      }
    ];
    
    const refinedBlueprint = await updater.refineUpdatesWithAI(blueprint, researchItems, changes);
    
    // Should have refined architecture decisions
    expect(refinedBlueprint.architecture.decisions[0].justification).toBe('Refined justification');
    expect(refinedBlueprint.architecture.decisions[0].confidence).toBe(0.9);
    
    // Should have refined task implementation guides
    expect(refinedBlueprint.tasks[0].implementation_guide).toBe('Refined implementation guide');
  });
  
  test('createRefinementPrompt should generate a valid prompt', () => {
    const updater = new BlueprintUpdater();
    
    const changes = [
      {
        type: 'update',
        entityType: 'architecture_decision',
        entityId: 'decision-1',
        data: {
          justification: {
            old: 'Original justification',
            new: 'Updated justification'
          }
        }
      }
    ];
    
    const prompt = updater.createRefinementPrompt(blueprint, researchItems, changes);
    
    expect(prompt).toContain(JSON.stringify(blueprint, null, 2));
    expect(prompt).toContain(researchItem1.title);
    expect(prompt).toContain(researchItem2.title);
    expect(prompt).toContain(JSON.stringify(changes, null, 2));
    expect(prompt).toContain('Refine the blueprint');
  });
  
  test('parseRefinementResult should handle various formats', () => {
    const updater = new BlueprintUpdater();
    
    // Test with object
    const objectResult = {
      refinements: {
        architecture: {
          decisions: [
            {
              id: 'decision-1',
              justification: 'Refined justification'
            }
          ]
        }
      }
    };
    
    const parsed1 = updater.parseRefinementResult(objectResult);
    expect(parsed1).toEqual(objectResult);
    
    // Test with JSON string in code block
    const jsonBlockResult = '```json\n{"refinements":{"architecture":{"decisions":[{"id":"decision-1","justification":"Refined justification"}]}}}\n```';
    
    const parsed2 = updater.parseRefinementResult(jsonBlockResult);
    expect(parsed2).toHaveProperty('refinements');
    expect(parsed2.refinements).toHaveProperty('architecture');
    
    // Test with invalid input
    const invalidResult = 'Not JSON';
    
    const parsed3 = updater.parseRefinementResult(invalidResult);
    expect(parsed3).toHaveProperty('refinements');
    expect(parsed3.refinements).toHaveProperty('architecture');
    expect(parsed3.refinements).toHaveProperty('tasks');
  });
  
  test('applyRefinements should apply refinements to blueprint', () => {
    const updater = new BlueprintUpdater();
    
    const refinementData = {
      refinements: {
        architecture: {
          decisions: [
            {
              id: 'decision-1',
              justification: 'Refined justification',
              confidence: 0.9
            }
          ]
        },
        tasks: [
          {
            id: 'task-1',
            implementation_guide: 'Refined implementation guide'
          }
        ]
      }
    };
    
    const refinedBlueprint = updater.applyRefinements(blueprint, refinementData);
    
    // Should have refined architecture decisions
    expect(refinedBlueprint.architecture.decisions[0].justification).toBe('Refined justification');
    expect(refinedBlueprint.architecture.decisions[0].confidence).toBe(0.9);
    
    // Should have refined task implementation guides
    expect(refinedBlueprint.tasks[0].implementation_guide).toBe('Refined implementation guide');
  });
  
  test('assessUpdateNeeds should assess if blueprint needs updating', async () => {
    const updater = new BlueprintUpdater();
    
    // Blueprint with no existing research
    const assessment1 = await updater.assessUpdateNeeds(blueprint, researchItems);
    
    expect(assessment1).toHaveProperty('needsUpdate');
    expect(assessment1).toHaveProperty('reasons');
    expect(assessment1).toHaveProperty('relevantResearch');
    
    expect(assessment1.needsUpdate).toBe(true);
    expect(assessment1.reasons.length).toBeGreaterThan(0);
    expect(assessment1.relevantResearch.length).toBeGreaterThan(0);
    
    // Blueprint with existing research
    const blueprintWithResearch = {
      ...blueprint,
      research: {
        sources: [
          { id: researchItem1.id, title: researchItem1.title }
        ]
      }
    };
    
    const assessment2 = await updater.assessUpdateNeeds(blueprintWithResearch, [researchItem1]);
    
    expect(assessment2.needsUpdate).toBe(false);
    expect(assessment2.reasons).toContain('All research is already integrated');
  });
  
  test('checkRelevanceToArchitecture should check relevance to architecture', () => {
    const updater = new BlueprintUpdater();
    
    // Relevant research
    const relevantResearch = {
      title: 'JavaScript ES6 Features',
      content: 'ES6 introduced many new features like arrow functions and let/const declarations.'
    };
    
    const relevance1 = updater.checkRelevanceToArchitecture(relevantResearch, blueprint.architecture);
    
    expect(relevance1.isRelevant).toBe(true);
    expect(relevance1.reason).toContain('Relevant to decision');
    
    // Irrelevant research
    const irrelevantResearch = {
      title: 'Python Data Analysis',
      content: 'Python is great for data analysis with libraries like pandas and numpy.'
    };
    
    const relevance2 = updater.checkRelevanceToArchitecture(irrelevantResearch, blueprint.architecture);
    
    expect(relevance2.isRelevant).toBe(false);
  });
  
  test('checkRelevanceToTasks should check relevance to tasks', () => {
    const updater = new BlueprintUpdater();
    
    // Relevant research
    const relevantResearch = {
      title: 'Setting Up JavaScript Projects',
      content: 'Initialize a new project with npm init. Configure webpack and babel.'
    };
    
    const relevance1 = updater.checkRelevanceToTasks(relevantResearch, blueprint.tasks);
    
    expect(relevance1.isRelevant).toBe(true);
    expect(relevance1.reason).toContain('Relevant to task');
    
    // Irrelevant research
    const irrelevantResearch = {
      title: 'Python Data Analysis',
      content: 'Python is great for data analysis with libraries like pandas and numpy.'
    };
    
    const relevance2 = updater.checkRelevanceToTasks(irrelevantResearch, blueprint.tasks);
    
    expect(relevance2.isRelevant).toBe(false);
  });
  
  test('calculateRelevance should calculate relevance between text and research', () => {
    const updater = new BlueprintUpdater();
    
    // High relevance
    const highRelevanceText = 'JavaScript ES6 features and best practices';
    expect(updater.calculateRelevance(highRelevanceText, researchItem1)).toBeGreaterThan(0.5);
    
    // Medium relevance
    const mediumRelevanceText = 'Modern development tools';
    expect(updater.calculateRelevance(mediumRelevanceText, researchItem2)).toBeGreaterThan(0.3);
    
    // Low relevance
    const lowRelevanceText = 'Python data analysis';
    expect(updater.calculateRelevance(lowRelevanceText, researchItem1)).toBeLessThan(0.3);
    
    // Use relevance from metadata if available
    const itemWithRelevance = {
      ...researchItem1,
      metadata: {
        ...researchItem1.metadata,
        relevance: 0.75
      }
    };
    expect(updater.calculateRelevance('Any text', itemWithRelevance)).toBe(0.75);
  });
});
