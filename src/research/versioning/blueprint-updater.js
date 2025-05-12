/**
 * Blueprint Updater
 * 
 * This module provides utilities for updating blueprints based on new research.
 */

import { BlueprintIntegrator } from '../integration/blueprint-integrator.js';
import { ChangeTracker } from './change-tracker.js';
import { getBestAvailableProvider } from '../../providers/index.js';

/**
 * Blueprint Updater class
 */
export class BlueprintUpdater {
  /**
   * Create a new blueprint updater
   * @param {Object} options - Updater options
   * @param {BlueprintIntegrator} [options.integrator] - Blueprint integrator
   * @param {ChangeTracker} [options.changeTracker] - Change tracker
   * @param {boolean} [options.useAI=true] - Whether to use AI for updates
   */
  constructor(options = {}) {
    this.integrator = options.integrator || new BlueprintIntegrator();
    this.changeTracker = options.changeTracker || new ChangeTracker();
    this.useAI = options.useAI !== false;
  }
  
  /**
   * Update a blueprint based on new research
   * @param {Object} blueprint - Blueprint to update
   * @param {Array} newResearch - New research items
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated blueprint
   */
  async updateBlueprint(blueprint, newResearch, options = {}) {
    if (!blueprint) {
      throw new Error('Blueprint is required');
    }
    
    if (!newResearch || !Array.isArray(newResearch) || newResearch.length === 0) {
      return blueprint;
    }
    
    // Create a copy of the blueprint
    const originalBlueprint = JSON.parse(JSON.stringify(blueprint));
    
    // Integrate new research
    const updatedBlueprint = await this.integrator.integrateResearch(blueprint, newResearch, options);
    
    // Detect changes
    const changes = this.detectBlueprintChanges(originalBlueprint, updatedBlueprint);
    
    // Track changes if there are any
    if (changes.length > 0) {
      await this.changeTracker.trackChanges(changes, options.author || 'system');
    }
    
    // Use AI to refine updates if enabled
    if (this.useAI && changes.length > 0) {
      return this.refineUpdatesWithAI(updatedBlueprint, newResearch, changes, options);
    }
    
    return updatedBlueprint;
  }
  
  /**
   * Detect changes between two blueprints
   * @param {Object} oldBlueprint - Old blueprint
   * @param {Object} newBlueprint - New blueprint
   * @returns {Array} Changes
   */
  detectBlueprintChanges(oldBlueprint, newBlueprint) {
    const changes = [];
    
    // Detect changes in research sources
    const oldSources = oldBlueprint.research?.sources || [];
    const newSources = newBlueprint.research?.sources || [];
    
    const sourceChanges = this.detectArrayChanges(
      oldSources, 
      newSources, 
      item => item.id
    );
    
    if (sourceChanges.added.length > 0) {
      changes.push({
        type: 'add',
        entityType: 'research_source',
        entityId: newBlueprint.id,
        data: {
          sources: sourceChanges.added
        }
      });
    }
    
    // Detect changes in architecture decisions
    if (oldBlueprint.architecture?.decisions && newBlueprint.architecture?.decisions) {
      for (let i = 0; i < newBlueprint.architecture.decisions.length; i++) {
        const newDecision = newBlueprint.architecture.decisions[i];
        const oldDecision = oldBlueprint.architecture.decisions[i];
        
        if (oldDecision && 
            (oldDecision.justification !== newDecision.justification || 
             oldDecision.confidence !== newDecision.confidence)) {
          changes.push({
            type: 'update',
            entityType: 'architecture_decision',
            entityId: newDecision.id,
            data: {
              justification: {
                old: oldDecision.justification,
                new: newDecision.justification
              },
              confidence: {
                old: oldDecision.confidence,
                new: newDecision.confidence
              }
            }
          });
        }
      }
    }
    
    // Detect changes in tasks
    if (oldBlueprint.tasks && newBlueprint.tasks) {
      for (let i = 0; i < newBlueprint.tasks.length; i++) {
        const newTask = newBlueprint.tasks[i];
        const oldTask = oldBlueprint.tasks[i];
        
        if (oldTask && oldTask.implementation_guide !== newTask.implementation_guide) {
          changes.push({
            type: 'update',
            entityType: 'task',
            entityId: newTask.id,
            data: {
              implementation_guide: {
                old: oldTask.implementation_guide,
                new: newTask.implementation_guide
              }
            }
          });
        }
      }
    }
    
    return changes;
  }
  
  /**
   * Detect changes in arrays
   * @param {Array} oldArray - Old array
   * @param {Array} newArray - New array
   * @param {Function} keyFn - Function to extract key from array item
   * @returns {Object} Array changes
   */
  detectArrayChanges(oldArray, newArray, keyFn) {
    const changes = {
      added: [],
      removed: []
    };
    
    // Create maps for faster lookup
    const oldMap = new Map();
    const newMap = new Map();
    
    for (const item of oldArray) {
      oldMap.set(keyFn(item), item);
    }
    
    for (const item of newArray) {
      newMap.set(keyFn(item), item);
    }
    
    // Find added items
    for (const [key, item] of newMap.entries()) {
      if (!oldMap.has(key)) {
        changes.added.push(item);
      }
    }
    
    // Find removed items
    for (const [key, item] of oldMap.entries()) {
      if (!newMap.has(key)) {
        changes.removed.push(item);
      }
    }
    
    return changes;
  }
  
  /**
   * Refine blueprint updates with AI
   * @param {Object} blueprint - Updated blueprint
   * @param {Array} newResearch - New research items
   * @param {Array} changes - Detected changes
   * @param {Object} options - Refinement options
   * @returns {Promise<Object>} Refined blueprint
   */
  async refineUpdatesWithAI(blueprint, newResearch, changes, options = {}) {
    try {
      // Get AI provider
      const provider = options.aiProvider || await getBestAvailableProvider({ allowMock: true });
      
      // Create refinement prompt
      const refinementPrompt = this.createRefinementPrompt(blueprint, newResearch, changes);
      
      // Generate refinement using AI
      const refinementResult = await provider.generateChatCompletion({
        messages: [
          {
            role: 'system',
            content: `You are a blueprint refinement assistant. Refine the provided blueprint based on new research. Focus on ensuring that the blueprint is coherent, consistent, and effectively incorporates the new research findings. Make targeted improvements to the blueprint while preserving its overall structure and purpose.`
          },
          {
            role: 'user',
            content: refinementPrompt
          }
        ],
        temperature: 0.3,
        maxTokens: 2000,
        responseFormat: { type: 'json_object' }
      });
      
      // Parse refinement result
      const refinementData = this.parseRefinementResult(refinementResult.message);
      
      // Apply refinements to blueprint
      return this.applyRefinements(blueprint, refinementData);
    } catch (error) {
      console.error('Error refining blueprint updates with AI:', error);
      
      // Return the original updated blueprint on error
      return blueprint;
    }
  }
  
  /**
   * Create a refinement prompt for AI
   * @param {Object} blueprint - Updated blueprint
   * @param {Array} newResearch - New research items
   * @param {Array} changes - Detected changes
   * @returns {string} Refinement prompt
   */
  createRefinementPrompt(blueprint, newResearch, changes) {
    let prompt = `
Refine the following blueprint based on new research:

Blueprint:
${JSON.stringify(blueprint, null, 2)}

New Research:
`;
    
    // Add new research items to prompt
    newResearch.forEach((item, index) => {
      prompt += `
Item ${index + 1}: ${item.title || 'Untitled'}
Source: ${item.url || 'Unknown'}
Content:
${item.content || 'No content available'}

`;
    });
    
    prompt += `
Changes Made:
${JSON.stringify(changes, null, 2)}

Please refine the blueprint by:
1. Ensuring coherence and consistency across all sections
2. Improving integration of new research findings
3. Enhancing justifications for architectural decisions
4. Refining implementation guides for tasks
5. Resolving any conflicts or inconsistencies

Return the refined blueprint in JSON format with the following structure:
{
  "refinements": {
    "architecture": {
      "decisions": [
        {
          "id": "string",
          "justification": "string",
          "confidence": number
        }
      ]
    },
    "tasks": [
      {
        "id": "string",
        "implementation_guide": "string"
      }
    ]
  }
}
`;
    
    return prompt;
  }
  
  /**
   * Parse refinement result from AI
   * @param {string} result - Refinement result
   * @returns {Object} Parsed refinement data
   */
  parseRefinementResult(result) {
    try {
      // If result is already an object, return it
      if (typeof result === 'object' && result !== null) {
        return result;
      }
      
      // Try to parse JSON from the result
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || 
                        result.match(/```\n([\s\S]*?)\n```/) ||
                        result.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Return empty refinements on error
      return {
        refinements: {
          architecture: {
            decisions: []
          },
          tasks: []
        }
      };
    } catch (error) {
      console.error('Error parsing refinement result:', error);
      
      // Return empty refinements on error
      return {
        refinements: {
          architecture: {
            decisions: []
          },
          tasks: []
        }
      };
    }
  }
  
  /**
   * Apply refinements to blueprint
   * @param {Object} blueprint - Blueprint to refine
   * @param {Object} refinementData - Refinement data
   * @returns {Object} Refined blueprint
   */
  applyRefinements(blueprint, refinementData) {
    // Create a copy of the blueprint
    const refinedBlueprint = JSON.parse(JSON.stringify(blueprint));
    
    // Apply refinements if available
    if (refinementData.refinements) {
      // Apply architecture decision refinements
      if (refinementData.refinements.architecture?.decisions) {
        for (const refinedDecision of refinementData.refinements.architecture.decisions) {
          // Find matching decision
          const decisionIndex = refinedBlueprint.architecture.decisions.findIndex(d => d.id === refinedDecision.id);
          
          if (decisionIndex !== -1) {
            // Apply refinements
            if (refinedDecision.justification) {
              refinedBlueprint.architecture.decisions[decisionIndex].justification = refinedDecision.justification;
            }
            
            if (typeof refinedDecision.confidence === 'number') {
              refinedBlueprint.architecture.decisions[decisionIndex].confidence = refinedDecision.confidence;
            }
          }
        }
      }
      
      // Apply task refinements
      if (refinementData.refinements.tasks) {
        for (const refinedTask of refinementData.refinements.tasks) {
          // Find matching task
          const taskIndex = refinedBlueprint.tasks.findIndex(t => t.id === refinedTask.id);
          
          if (taskIndex !== -1) {
            // Apply refinements
            if (refinedTask.implementation_guide) {
              refinedBlueprint.tasks[taskIndex].implementation_guide = refinedTask.implementation_guide;
            }
          }
        }
      }
    }
    
    return refinedBlueprint;
  }
  
  /**
   * Check if a blueprint needs updating based on new research
   * @param {Object} blueprint - Blueprint to check
   * @param {Array} newResearch - New research items
   * @returns {Promise<Object>} Update assessment
   */
  async assessUpdateNeeds(blueprint, newResearch) {
    if (!blueprint) {
      throw new Error('Blueprint is required');
    }
    
    if (!newResearch || !Array.isArray(newResearch) || newResearch.length === 0) {
      return {
        needsUpdate: false,
        reasons: ['No new research provided']
      };
    }
    
    // Check if research is already integrated
    const existingSources = blueprint.research?.sources || [];
    const newSources = newResearch.filter(item => 
      !existingSources.some(source => source.id === item.id)
    );
    
    if (newSources.length === 0) {
      return {
        needsUpdate: false,
        reasons: ['All research is already integrated']
      };
    }
    
    // Check relevance of new research
    const relevantResearch = [];
    const reasons = [];
    
    for (const item of newSources) {
      // Check relevance to architecture
      const architectureRelevance = this.checkRelevanceToArchitecture(item, blueprint.architecture);
      
      if (architectureRelevance.isRelevant) {
        relevantResearch.push(item);
        reasons.push(`Research "${item.title}" is relevant to architecture: ${architectureRelevance.reason}`);
      }
      
      // Check relevance to tasks
      const tasksRelevance = this.checkRelevanceToTasks(item, blueprint.tasks);
      
      if (tasksRelevance.isRelevant) {
        if (!relevantResearch.includes(item)) {
          relevantResearch.push(item);
        }
        reasons.push(`Research "${item.title}" is relevant to tasks: ${tasksRelevance.reason}`);
      }
    }
    
    return {
      needsUpdate: relevantResearch.length > 0,
      reasons,
      relevantResearch
    };
  }
  
  /**
   * Check relevance of research to architecture
   * @param {Object} research - Research item
   * @param {Object} architecture - Blueprint architecture
   * @returns {Object} Relevance assessment
   */
  checkRelevanceToArchitecture(research, architecture) {
    if (!architecture) {
      return { isRelevant: false };
    }
    
    // Check relevance to decisions
    if (architecture.decisions && Array.isArray(architecture.decisions)) {
      for (const decision of architecture.decisions) {
        const decisionText = `${decision.title} ${decision.description || ''}`;
        const relevance = this.calculateRelevance(decisionText, research);
        
        if (relevance > 0.3) {
          return {
            isRelevant: true,
            reason: `Relevant to decision "${decision.title}" (score: ${relevance.toFixed(2)})`
          };
        }
      }
    }
    
    // Check relevance to components
    if (architecture.components && Array.isArray(architecture.components)) {
      for (const component of architecture.components) {
        const componentText = `${component.name} ${component.description || ''}`;
        const relevance = this.calculateRelevance(componentText, research);
        
        if (relevance > 0.3) {
          return {
            isRelevant: true,
            reason: `Relevant to component "${component.name}" (score: ${relevance.toFixed(2)})`
          };
        }
      }
    }
    
    return { isRelevant: false };
  }
  
  /**
   * Check relevance of research to tasks
   * @param {Object} research - Research item
   * @param {Array} tasks - Blueprint tasks
   * @returns {Object} Relevance assessment
   */
  checkRelevanceToTasks(research, tasks) {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return { isRelevant: false };
    }
    
    for (const task of tasks) {
      const taskText = `${task.title} ${task.description || ''} ${task.implementation_guide || ''}`;
      const relevance = this.calculateRelevance(taskText, research);
      
      if (relevance > 0.3) {
        return {
          isRelevant: true,
          reason: `Relevant to task "${task.title}" (score: ${relevance.toFixed(2)})`
        };
      }
      
      // Check subtasks
      if (task.subtasks && Array.isArray(task.subtasks)) {
        const subtasksRelevance = this.checkRelevanceToTasks(research, task.subtasks);
        
        if (subtasksRelevance.isRelevant) {
          return subtasksRelevance;
        }
      }
    }
    
    return { isRelevant: false };
  }
  
  /**
   * Calculate relevance between text and research item
   * @param {string} text - Text
   * @param {Object} researchItem - Research item
   * @returns {number} Relevance score (0-1)
   */
  calculateRelevance(text, researchItem) {
    // Use relevance from metadata if available
    if (researchItem.metadata && typeof researchItem.metadata.relevance === 'number') {
      return researchItem.metadata.relevance;
    }
    
    const content = [
      researchItem.title || '',
      researchItem.description || '',
      researchItem.content || ''
    ].join(' ').toLowerCase();
    
    const textTerms = text.toLowerCase().split(/\s+/);
    
    // Count matching terms
    const matchingTerms = textTerms.filter(term => content.includes(term));
    
    // Calculate relevance score
    return matchingTerms.length / Math.max(1, textTerms.length);
  }
}
