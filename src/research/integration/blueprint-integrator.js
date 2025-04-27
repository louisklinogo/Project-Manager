/**
 * Blueprint Integrator
 * 
 * This module provides utilities for integrating research with blueprints.
 */

import { ResearchReference } from '../../models/research-reference.js';
import { DecisionJustifier } from './decision-justifier.js';
import { getBestAvailableProvider } from '../../providers/index.js';

/**
 * Blueprint Integrator class
 */
export class BlueprintIntegrator {
  /**
   * Create a new blueprint integrator
   * @param {Object} options - Integrator options
   * @param {DecisionJustifier} [options.justifier] - Decision justifier
   * @param {boolean} [options.useAI=true] - Whether to use AI for integration
   */
  constructor(options = {}) {
    this.justifier = options.justifier || new DecisionJustifier();
    this.useAI = options.useAI !== false;
  }
  
  /**
   * Integrate research with a blueprint
   * @param {Object} blueprint - Blueprint to integrate with
   * @param {Array} researchItems - Research items to integrate
   * @param {Object} options - Integration options
   * @returns {Promise<Object>} Integrated blueprint
   */
  async integrateResearch(blueprint, researchItems, options = {}) {
    if (!blueprint) {
      throw new Error('Blueprint is required');
    }
    
    if (!researchItems || !Array.isArray(researchItems) || researchItems.length === 0) {
      return blueprint;
    }
    
    // Create a copy of the blueprint
    const integratedBlueprint = JSON.parse(JSON.stringify(blueprint));
    
    // Initialize research references if not present
    if (!integratedBlueprint.research) {
      integratedBlueprint.research = {
        references: [],
        sources: []
      };
    }
    
    // Add research sources
    integratedBlueprint.research.sources = this.integrateResearchSources(
      integratedBlueprint.research.sources || [],
      researchItems
    );
    
    // Integrate research with architecture
    if (integratedBlueprint.architecture) {
      integratedBlueprint.architecture = await this.integrateWithArchitecture(
        integratedBlueprint.architecture,
        researchItems,
        options
      );
    }
    
    // Integrate research with tasks
    if (integratedBlueprint.tasks && Array.isArray(integratedBlueprint.tasks)) {
      integratedBlueprint.tasks = await this.integrateWithTasks(
        integratedBlueprint.tasks,
        researchItems,
        options
      );
    }
    
    // Integrate research with workflow
    if (integratedBlueprint.workflow) {
      integratedBlueprint.workflow = await this.integrateWithWorkflow(
        integratedBlueprint.workflow,
        researchItems,
        options
      );
    }
    
    return integratedBlueprint;
  }
  
  /**
   * Integrate research sources with blueprint
   * @param {Array} existingSources - Existing sources in blueprint
   * @param {Array} researchItems - Research items to integrate
   * @returns {Array} Integrated sources
   */
  integrateResearchSources(existingSources, researchItems) {
    const sources = [...existingSources];
    
    // Add new sources from research items
    for (const item of researchItems) {
      // Skip if source already exists
      if (sources.some(source => source.id === item.id)) {
        continue;
      }
      
      // Add new source
      sources.push({
        id: item.id,
        title: item.title || 'Untitled Research',
        url: item.url || '',
        type: 'research',
        metadata: {
          confidence: item.metadata?.confidence || 0.5,
          publishedDate: item.metadata?.publishedDate || item.createdAt || new Date().toISOString()
        }
      });
    }
    
    return sources;
  }
  
  /**
   * Integrate research with architecture
   * @param {Object} architecture - Blueprint architecture
   * @param {Array} researchItems - Research items to integrate
   * @param {Object} options - Integration options
   * @returns {Promise<Object>} Integrated architecture
   */
  async integrateWithArchitecture(architecture, researchItems, options = {}) {
    // Create a copy of the architecture
    const integratedArchitecture = JSON.parse(JSON.stringify(architecture));
    
    // Initialize research references if not present
    if (!integratedArchitecture.research) {
      integratedArchitecture.research = {
        references: []
      };
    }
    
    // Justify architecture decisions
    if (integratedArchitecture.decisions && Array.isArray(integratedArchitecture.decisions)) {
      for (let i = 0; i < integratedArchitecture.decisions.length; i++) {
        const decision = integratedArchitecture.decisions[i];
        
        // Justify decision
        const justification = await this.justifier.justifyDecision(decision, researchItems, options);
        
        // Update decision with justification
        integratedArchitecture.decisions[i] = {
          ...decision,
          justification: justification.justification,
          confidence: justification.confidence
        };
        
        // Add references
        integratedArchitecture.research.references.push(...justification.references);
      }
    }
    
    // Integrate with components
    if (integratedArchitecture.components && Array.isArray(integratedArchitecture.components)) {
      for (let i = 0; i < integratedArchitecture.components.length; i++) {
        const component = integratedArchitecture.components[i];
        
        // Find relevant research for component
        const relevantResearch = this.findRelevantResearch(component.name, researchItems);
        
        if (relevantResearch.length > 0) {
          // Add research references to component
          if (!component.research) {
            integratedArchitecture.components[i].research = {
              references: []
            };
          }
          
          // Create references
          for (const research of relevantResearch) {
            const reference = ResearchReference.createSourceReference(
              research.item.id,
              { relevance: research.relevance }
            );
            
            integratedArchitecture.components[i].research.references.push(reference);
            integratedArchitecture.research.references.push(reference);
          }
        }
      }
    }
    
    return integratedArchitecture;
  }
  
  /**
   * Integrate research with tasks
   * @param {Array} tasks - Blueprint tasks
   * @param {Array} researchItems - Research items to integrate
   * @param {Object} options - Integration options
   * @returns {Promise<Array>} Integrated tasks
   */
  async integrateWithTasks(tasks, researchItems, options = {}) {
    // Create a copy of the tasks
    const integratedTasks = JSON.parse(JSON.stringify(tasks));
    
    // Integrate research with each task
    for (let i = 0; i < integratedTasks.length; i++) {
      const task = integratedTasks[i];
      
      // Initialize research references if not present
      if (!task.research) {
        integratedTasks[i].research = {
          references: []
        };
      }
      
      // Find relevant research for task
      const relevantResearch = this.findRelevantResearch(
        `${task.title} ${task.description || ''}`,
        researchItems
      );
      
      if (relevantResearch.length > 0) {
        // Create references
        for (const research of relevantResearch) {
          // Create source reference
          const sourceRef = ResearchReference.createSourceReference(
            research.item.id,
            { relevance: research.relevance }
          );
          
          integratedTasks[i].research.references.push(sourceRef);
          
          // Extract key findings
          const findings = this.extractKeyFindings(research.item.content || '');
          
          // Create finding references
          findings.slice(0, 2).forEach(finding => {
            const findingRef = ResearchReference.createFindingReference(
              research.item.id,
              finding,
              { relevance: research.relevance }
            );
            
            integratedTasks[i].research.references.push(findingRef);
          });
        }
        
        // Enhance implementation guide with research
        if (task.implementation_guide) {
          integratedTasks[i].implementation_guide = await this.enhanceImplementationGuide(
            task.implementation_guide,
            relevantResearch,
            options
          );
        }
      }
      
      // Integrate with subtasks if present
      if (task.subtasks && Array.isArray(task.subtasks)) {
        integratedTasks[i].subtasks = await this.integrateWithTasks(
          task.subtasks,
          researchItems,
          options
        );
      }
    }
    
    return integratedTasks;
  }
  
  /**
   * Integrate research with workflow
   * @param {Object} workflow - Blueprint workflow
   * @param {Array} researchItems - Research items to integrate
   * @param {Object} options - Integration options
   * @returns {Promise<Object>} Integrated workflow
   */
  async integrateWithWorkflow(workflow, researchItems, options = {}) {
    // Create a copy of the workflow
    const integratedWorkflow = JSON.parse(JSON.stringify(workflow));
    
    // Initialize research references if not present
    if (!integratedWorkflow.research) {
      integratedWorkflow.research = {
        references: []
      };
    }
    
    // Integrate with steps
    if (integratedWorkflow.steps && Array.isArray(integratedWorkflow.steps)) {
      for (let i = 0; i < integratedWorkflow.steps.length; i++) {
        const step = integratedWorkflow.steps[i];
        
        // Find relevant research for step
        const relevantResearch = this.findRelevantResearch(
          `${step.title || ''} ${step.description || ''}`,
          researchItems
        );
        
        if (relevantResearch.length > 0) {
          // Initialize research references if not present
          if (!step.research) {
            integratedWorkflow.steps[i].research = {
              references: []
            };
          }
          
          // Create references
          for (const research of relevantResearch) {
            const reference = ResearchReference.createSourceReference(
              research.item.id,
              { relevance: research.relevance }
            );
            
            integratedWorkflow.steps[i].research.references.push(reference);
            integratedWorkflow.research.references.push(reference);
          }
        }
      }
    }
    
    // Integrate with checkpoints
    if (integratedWorkflow.checkpoints && Array.isArray(integratedWorkflow.checkpoints)) {
      for (let i = 0; i < integratedWorkflow.checkpoints.length; i++) {
        const checkpoint = integratedWorkflow.checkpoints[i];
        
        // Find relevant research for checkpoint
        const relevantResearch = this.findRelevantResearch(
          `${checkpoint.title || ''} ${checkpoint.description || ''}`,
          researchItems
        );
        
        if (relevantResearch.length > 0) {
          // Initialize research references if not present
          if (!checkpoint.research) {
            integratedWorkflow.checkpoints[i].research = {
              references: []
            };
          }
          
          // Create references
          for (const research of relevantResearch) {
            const reference = ResearchReference.createSourceReference(
              research.item.id,
              { relevance: research.relevance }
            );
            
            integratedWorkflow.checkpoints[i].research.references.push(reference);
            integratedWorkflow.research.references.push(reference);
          }
        }
      }
    }
    
    return integratedWorkflow;
  }
  
  /**
   * Find research items relevant to a text
   * @param {string} text - Text to find relevant research for
   * @param {Array} researchItems - Research items
   * @returns {Array} Relevant research items with relevance scores
   */
  findRelevantResearch(text, researchItems) {
    const relevantItems = [];
    
    for (const item of researchItems) {
      // Calculate relevance score
      const relevance = this.calculateRelevance(text, item);
      
      // Only include items with sufficient relevance
      if (relevance > 0.3) {
        relevantItems.push({
          item,
          relevance
        });
      }
    }
    
    // Sort by relevance (descending)
    return relevantItems.sort((a, b) => b.relevance - a.relevance);
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
  
  /**
   * Extract key findings from content
   * @param {string} content - Content to extract from
   * @returns {Array} Key findings
   */
  extractKeyFindings(content) {
    if (!content) {
      return [];
    }
    
    const findings = [];
    
    // Extract bullet points
    const bulletPoints = content.match(/[-*•]\s*([^\n]+)/g) || [];
    
    for (const point of bulletPoints) {
      const cleanPoint = point.replace(/^[-*•]\s*/, '').trim();
      
      // Skip short points
      if (cleanPoint.length < 10) {
        continue;
      }
      
      findings.push(cleanPoint);
    }
    
    // Extract sentences with key phrases
    const keyPhrases = [
      'important', 'significant', 'key', 'critical', 'essential',
      'best practice', 'recommended', 'should', 'must', 'need to',
      'advantage', 'benefit', 'drawback', 'limitation', 'challenge'
    ];
    
    for (const phrase of keyPhrases) {
      const regex = new RegExp(`[^.!?]*\\b${phrase}\\b[^.!?]*[.!?]`, 'gi');
      const matches = content.match(regex) || [];
      
      for (const match of matches) {
        const cleanMatch = match.trim();
        
        // Skip short matches
        if (cleanMatch.length < 20) {
          continue;
        }
        
        findings.push(cleanMatch);
      }
    }
    
    // Remove duplicates and limit to 5 findings
    return [...new Set(findings)].slice(0, 5);
  }
  
  /**
   * Enhance implementation guide with research
   * @param {string} guide - Implementation guide
   * @param {Array} relevantResearch - Relevant research items
   * @param {Object} options - Enhancement options
   * @returns {Promise<string>} Enhanced implementation guide
   */
  async enhanceImplementationGuide(guide, relevantResearch, options = {}) {
    if (!guide || relevantResearch.length === 0) {
      return guide;
    }
    
    // Use AI for enhancement if enabled
    if (this.useAI) {
      return this.enhanceGuideWithAI(guide, relevantResearch, options);
    } else {
      return this.enhanceGuideWithRules(guide, relevantResearch);
    }
  }
  
  /**
   * Enhance implementation guide with AI
   * @param {string} guide - Implementation guide
   * @param {Array} relevantResearch - Relevant research items
   * @param {Object} options - Enhancement options
   * @returns {Promise<string>} Enhanced implementation guide
   */
  async enhanceGuideWithAI(guide, relevantResearch, options = {}) {
    try {
      // Get AI provider
      const provider = options.aiProvider || await getBestAvailableProvider({ allowMock: true });
      
      // Create enhancement prompt
      const enhancementPrompt = this.createEnhancementPrompt(guide, relevantResearch);
      
      // Generate enhancement using AI
      const enhancementResult = await provider.generateChatCompletion({
        messages: [
          {
            role: 'system',
            content: `You are an implementation guide enhancement assistant. Enhance the provided implementation guide with relevant research findings. Focus on integrating key insights, best practices, and recommendations from the research materials. Maintain the original structure and purpose of the guide while adding valuable research-backed information.`
          },
          {
            role: 'user',
            content: enhancementPrompt
          }
        ],
        temperature: 0.3,
        maxTokens: 2000
      });
      
      // Return enhanced guide
      return enhancementResult.message;
    } catch (error) {
      console.error('Error enhancing implementation guide with AI:', error);
      
      // Fall back to rule-based enhancement
      return this.enhanceGuideWithRules(guide, relevantResearch);
    }
  }
  
  /**
   * Enhance implementation guide with rule-based methods
   * @param {string} guide - Implementation guide
   * @param {Array} relevantResearch - Relevant research items
   * @returns {string} Enhanced implementation guide
   */
  enhanceGuideWithRules(guide, relevantResearch) {
    // Extract key findings from research
    const findings = [];
    
    for (const research of relevantResearch) {
      const itemFindings = this.extractKeyFindings(research.item.content || '');
      findings.push(...itemFindings);
    }
    
    // Remove duplicates
    const uniqueFindings = [...new Set(findings)];
    
    // Add research section to guide
    let enhancedGuide = guide;
    
    if (uniqueFindings.length > 0) {
      enhancedGuide += '\n\n## Research-Based Recommendations\n\n';
      
      uniqueFindings.slice(0, 5).forEach(finding => {
        enhancedGuide += `- ${finding}\n`;
      });
    }
    
    return enhancedGuide;
  }
  
  /**
   * Create an enhancement prompt for AI
   * @param {string} guide - Implementation guide
   * @param {Array} relevantResearch - Relevant research items
   * @returns {string} Enhancement prompt
   */
  createEnhancementPrompt(guide, relevantResearch) {
    let prompt = `
Enhance the following implementation guide with relevant research findings:

Implementation Guide:
${guide}

Relevant Research:
`;
    
    // Add research items to prompt
    relevantResearch.forEach((research, index) => {
      prompt += `
Item ${index + 1}: ${research.item.title || 'Untitled'}
Source: ${research.item.url || 'Unknown'}
Relevance: ${research.relevance.toFixed(2)}
Content:
${research.item.content || 'No content available'}

`;
    });
    
    prompt += `
Please enhance the implementation guide by:
1. Integrating key insights from the research
2. Adding best practices and recommendations
3. Including specific examples or code patterns if relevant
4. Maintaining the original structure and purpose of the guide
5. Clearly indicating which parts are research-based additions

Return the enhanced implementation guide.
`;
    
    return prompt;
  }
}
