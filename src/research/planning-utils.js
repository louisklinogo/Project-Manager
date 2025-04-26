/**
 * Research-driven planning utilities
 * 
 * This module provides utilities for generating plans based on research results.
 */

import { getBestAvailableProvider } from '../providers/index.js';

/**
 * Generate a project plan based on research results
 * @param {Array} researchResults - Array of research results
 * @param {Object} options - Planning options
 * @returns {Promise<Object>} Generated plan
 */
export async function generateProjectPlan(researchResults, options = {}) {
  try {
    // Get the best available AI provider
    const provider = await getBestAvailableProvider({ allowMock: true });
    
    // Extract information from research results
    const domainKnowledge = researchResults.filter(result => result.type === 'domain');
    const similarProjects = researchResults.filter(result => result.type === 'repository');
    const bestPractices = researchResults.filter(result => result.type === 'best_practices');
    
    // Create a summary of the research results
    const researchSummary = createResearchSummary(domainKnowledge, similarProjects, bestPractices);
    
    // Generate a plan using the AI provider
    const planResult = await provider.generateChatCompletion({
      messages: [
        {
          role: 'system',
          content: `You are a project planning assistant. Based on the research provided, generate a detailed project plan with phases, tasks, and estimated timelines. The plan should be structured, comprehensive, and follow best practices for the domain.`
        },
        {
          role: 'user',
          content: `I need a project plan based on the following research:\n\n${researchSummary}\n\nPlease generate a detailed plan with phases, tasks, and estimated timelines.`
        }
      ],
      temperature: 0.2,
      maxTokens: 4000
    });
    
    // Parse the plan from the AI response
    const plan = parsePlan(planResult.message);
    
    return {
      success: true,
      plan,
      provider: provider.name,
      model: planResult.model
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'PLAN_GENERATION_FAILED',
        message: `Failed to generate project plan: ${error.message}`
      }
    };
  }
}

/**
 * Create a summary of research results
 * @param {Array} domainKnowledge - Domain knowledge research results
 * @param {Array} similarProjects - Similar projects research results
 * @param {Array} bestPractices - Best practices research results
 * @returns {String} Research summary
 */
function createResearchSummary(domainKnowledge, similarProjects, bestPractices) {
  let summary = '';
  
  // Add domain knowledge
  if (domainKnowledge.length > 0) {
    summary += '## Domain Knowledge\n\n';
    domainKnowledge.forEach(result => {
      summary += `### ${result.title || 'Domain Knowledge'}\n`;
      summary += `${result.content || ''}\n\n`;
    });
  }
  
  // Add similar projects
  if (similarProjects.length > 0) {
    summary += '## Similar Projects\n\n';
    similarProjects.forEach(result => {
      summary += `### ${result.title || 'Similar Project'}\n`;
      summary += `${result.content || ''}\n\n`;
    });
  }
  
  // Add best practices
  if (bestPractices.length > 0) {
    summary += '## Best Practices\n\n';
    bestPractices.forEach(result => {
      summary += `### ${result.title || 'Best Practice'}\n`;
      summary += `${result.content || ''}\n\n`;
    });
  }
  
  return summary;
}

/**
 * Parse a plan from AI response
 * @param {String} response - AI response
 * @returns {Object} Parsed plan
 */
function parsePlan(response) {
  // Simple parsing for now - in a real implementation, this would be more sophisticated
  const phases = [];
  let currentPhase = null;
  
  // Split the response into lines
  const lines = response.split('\n');
  
  // Parse the lines
  for (const line of lines) {
    // Check if this is a phase header (e.g., "## Phase 1: Planning")
    if (line.startsWith('## ') || line.startsWith('# ')) {
      if (currentPhase) {
        phases.push(currentPhase);
      }
      
      const phaseName = line.replace(/^[#\s]+/, '');
      currentPhase = {
        name: phaseName,
        tasks: [],
        description: ''
      };
    } 
    // Check if this is a task (e.g., "- Task 1: Do something")
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (currentPhase) {
        const taskText = line.replace(/^[\s-*]+/, '');
        currentPhase.tasks.push({
          name: taskText,
          description: ''
        });
      }
    } 
    // Otherwise, add to the description of the current phase
    else if (currentPhase && line.trim() !== '') {
      currentPhase.description += line + '\n';
    }
  }
  
  // Add the last phase
  if (currentPhase) {
    phases.push(currentPhase);
  }
  
  return {
    phases,
    summary: response.substring(0, 500) // First 500 characters as a summary
  };
}

/**
 * Generate architecture recommendations based on research results
 * @param {Array} researchResults - Array of research results
 * @param {Object} options - Planning options
 * @returns {Promise<Object>} Generated architecture recommendations
 */
export async function generateArchitectureRecommendations(researchResults, options = {}) {
  try {
    // Get the best available AI provider
    const provider = await getBestAvailableProvider({ allowMock: true });
    
    // Extract information from research results
    const domainKnowledge = researchResults.filter(result => result.type === 'domain');
    const similarProjects = researchResults.filter(result => result.type === 'repository');
    const bestPractices = researchResults.filter(result => result.type === 'best_practices');
    
    // Create a summary of the research results
    const researchSummary = createResearchSummary(domainKnowledge, similarProjects, bestPractices);
    
    // Generate architecture recommendations using the AI provider
    const architectureResult = await provider.generateChatCompletion({
      messages: [
        {
          role: 'system',
          content: `You are a software architecture expert. Based on the research provided, generate architecture recommendations for the project. Include components, relationships, technologies, and patterns that would be appropriate for this project.`
        },
        {
          role: 'user',
          content: `I need architecture recommendations based on the following research:\n\n${researchSummary}\n\nPlease generate detailed architecture recommendations.`
        }
      ],
      temperature: 0.2,
      maxTokens: 4000
    });
    
    // Parse the architecture recommendations from the AI response
    const architecture = parseArchitecture(architectureResult.message);
    
    return {
      success: true,
      architecture,
      provider: provider.name,
      model: architectureResult.model
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'ARCHITECTURE_GENERATION_FAILED',
        message: `Failed to generate architecture recommendations: ${error.message}`
      }
    };
  }
}

/**
 * Parse architecture recommendations from AI response
 * @param {String} response - AI response
 * @returns {Object} Parsed architecture recommendations
 */
function parseArchitecture(response) {
  // Simple parsing for now - in a real implementation, this would be more sophisticated
  const components = [];
  const relationships = [];
  
  // Split the response into lines
  const lines = response.split('\n');
  
  // Parse the lines
  let currentSection = null;
  
  for (const line of lines) {
    // Check if this is a section header
    if (line.startsWith('## ') || line.startsWith('# ')) {
      const sectionName = line.replace(/^[#\s]+/, '').toLowerCase();
      
      if (sectionName.includes('component')) {
        currentSection = 'components';
      } else if (sectionName.includes('relation') || sectionName.includes('connection')) {
        currentSection = 'relationships';
      } else {
        currentSection = null;
      }
    } 
    // Check if this is a component or relationship
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const itemText = line.replace(/^[\s-*]+/, '');
      
      if (currentSection === 'components') {
        components.push({
          name: itemText,
          description: ''
        });
      } else if (currentSection === 'relationships') {
        relationships.push({
          description: itemText
        });
      }
    }
  }
  
  return {
    components,
    relationships,
    summary: response.substring(0, 500) // First 500 characters as a summary
  };
}

/**
 * Generate task breakdown based on research results and project plan
 * @param {Array} researchResults - Array of research results
 * @param {Object} projectPlan - Project plan
 * @param {Object} options - Planning options
 * @returns {Promise<Object>} Generated task breakdown
 */
export async function generateTaskBreakdown(researchResults, projectPlan, options = {}) {
  try {
    // Get the best available AI provider
    const provider = await getBestAvailableProvider({ allowMock: true });
    
    // Extract information from research results
    const domainKnowledge = researchResults.filter(result => result.type === 'domain');
    const similarProjects = researchResults.filter(result => result.type === 'repository');
    const bestPractices = researchResults.filter(result => result.type === 'best_practices');
    
    // Create a summary of the research results
    const researchSummary = createResearchSummary(domainKnowledge, similarProjects, bestPractices);
    
    // Create a summary of the project plan
    const planSummary = createPlanSummary(projectPlan);
    
    // Generate task breakdown using the AI provider
    const taskBreakdownResult = await provider.generateChatCompletion({
      messages: [
        {
          role: 'system',
          content: `You are a project management expert. Based on the research and project plan provided, generate a detailed task breakdown for the project. Include task dependencies, acceptance criteria, and implementation guides.`
        },
        {
          role: 'user',
          content: `I need a detailed task breakdown based on the following research and project plan:\n\n${researchSummary}\n\n${planSummary}\n\nPlease generate a detailed task breakdown.`
        }
      ],
      temperature: 0.2,
      maxTokens: 4000
    });
    
    // Parse the task breakdown from the AI response
    const tasks = parseTaskBreakdown(taskBreakdownResult.message);
    
    return {
      success: true,
      tasks,
      provider: provider.name,
      model: taskBreakdownResult.model
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'TASK_BREAKDOWN_FAILED',
        message: `Failed to generate task breakdown: ${error.message}`
      }
    };
  }
}

/**
 * Create a summary of a project plan
 * @param {Object} projectPlan - Project plan
 * @returns {String} Plan summary
 */
function createPlanSummary(projectPlan) {
  let summary = '## Project Plan\n\n';
  
  if (projectPlan.phases) {
    projectPlan.phases.forEach((phase, index) => {
      summary += `### Phase ${index + 1}: ${phase.name}\n`;
      summary += `${phase.description || ''}\n\n`;
      
      if (phase.tasks && phase.tasks.length > 0) {
        phase.tasks.forEach((task, taskIndex) => {
          summary += `- Task ${taskIndex + 1}: ${task.name}\n`;
        });
      }
      
      summary += '\n';
    });
  }
  
  return summary;
}

/**
 * Parse task breakdown from AI response
 * @param {String} response - AI response
 * @returns {Array} Parsed tasks
 */
function parseTaskBreakdown(response) {
  // Simple parsing for now - in a real implementation, this would be more sophisticated
  const tasks = [];
  let currentTask = null;
  let currentSection = null;
  
  // Split the response into lines
  const lines = response.split('\n');
  
  // Parse the lines
  for (const line of lines) {
    // Check if this is a task header (e.g., "## Task 1: Do something")
    if (line.startsWith('## ') || line.startsWith('# ')) {
      if (currentTask) {
        tasks.push(currentTask);
      }
      
      const taskName = line.replace(/^[#\s]+/, '');
      currentTask = {
        name: taskName,
        description: '',
        dependencies: [],
        acceptanceCriteria: [],
        implementationGuide: ''
      };
      currentSection = 'description';
    } 
    // Check if this is a section header
    else if (line.startsWith('### ')) {
      const sectionName = line.replace(/^[#\s]+/, '').toLowerCase();
      
      if (sectionName.includes('depend')) {
        currentSection = 'dependencies';
      } else if (sectionName.includes('accept') || sectionName.includes('criteria')) {
        currentSection = 'acceptanceCriteria';
      } else if (sectionName.includes('implement') || sectionName.includes('guide')) {
        currentSection = 'implementationGuide';
      } else {
        currentSection = 'description';
      }
    } 
    // Check if this is a list item
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const itemText = line.replace(/^[\s-*]+/, '');
      
      if (currentTask) {
        if (currentSection === 'dependencies') {
          currentTask.dependencies.push(itemText);
        } else if (currentSection === 'acceptanceCriteria') {
          currentTask.acceptanceCriteria.push(itemText);
        } else if (currentSection === 'implementationGuide') {
          currentTask.implementationGuide += itemText + '\n';
        } else {
          currentTask.description += line + '\n';
        }
      }
    } 
    // Otherwise, add to the current section
    else if (currentTask && line.trim() !== '') {
      if (currentSection === 'implementationGuide') {
        currentTask.implementationGuide += line + '\n';
      } else if (currentSection === 'description') {
        currentTask.description += line + '\n';
      }
    }
  }
  
  // Add the last task
  if (currentTask) {
    tasks.push(currentTask);
  }
  
  return tasks;
}
