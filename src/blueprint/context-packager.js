/**
 * Context Packager Module
 * 
 * This module provides utilities for packaging context for LLM consumption.
 * It helps organize and format context information to make it more digestible
 * for language models.
 */

/**
 * Context Packager class
 */
export class ContextPackager {
  /**
   * Create a new context packager instance
   * @param {object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      maxContextSize: options.maxContextSize || 8000,
      prioritizeRecent: options.prioritizeRecent || true,
      includeDependencies: options.includeDependencies || true,
      ...options
    };
  }

  /**
   * Package context for a task
   * @param {object} task - Task to package context for
   * @param {object} blueprint - Blueprint containing the task
   * @param {object} project - Project containing the blueprint
   * @returns {object} - Packaged context
   */
  packageTaskContext(task, blueprint, project) {
    if (!task || !blueprint || !project) {
      throw new Error('Task, blueprint, and project are required');
    }

    // Start with the task itself
    const context = {
      task: this._formatTask(task),
      project: this._formatProjectInfo(project),
      dependencies: [],
      relatedTasks: []
    };

    // Add dependencies if enabled
    if (this.options.includeDependencies && task.dependencies && task.dependencies.length > 0) {
      context.dependencies = task.dependencies.map(depId => {
        const depTask = blueprint.tasks.find(t => t.id === depId);
        return depTask ? this._formatTask(depTask) : null;
      }).filter(Boolean);
    }

    // Add related tasks (tasks that depend on this task)
    const relatedTasks = blueprint.tasks.filter(t => 
      t.id !== task.id && 
      t.dependencies && 
      t.dependencies.includes(task.id)
    );
    
    if (relatedTasks.length > 0) {
      context.relatedTasks = relatedTasks.map(t => this._formatTask(t));
    }

    // Add research information if available
    if (project.research) {
      context.research = this._formatResearch(project.research);
    }

    return this._trimContext(context);
  }

  /**
   * Package context for a step
   * @param {object} step - Step to package context for
   * @param {Array} steps - All steps in the workflow
   * @param {object} dependencies - Dependencies between steps
   * @param {object} blueprint - Blueprint containing the steps
   * @param {object} project - Project containing the blueprint
   * @returns {object} - Packaged context
   */
  packageStepContext(step, steps, dependencies, blueprint, project) {
    if (!step || !steps || !dependencies || !blueprint || !project) {
      throw new Error('Step, steps array, dependencies, blueprint, and project are required');
    }

    // Start with the step itself
    const context = {
      step: this._formatStep(step),
      project: this._formatProjectInfo(project),
      dependencies: [],
      nextSteps: []
    };

    // Add the task this step belongs to
    const task = blueprint.tasks.find(t => t.id === step.task_id);
    if (task) {
      context.task = this._formatTask(task);
    }

    // Add dependency steps
    const depStepIds = dependencies[step.id] || [];
    if (depStepIds.length > 0) {
      context.dependencies = depStepIds.map(depId => {
        const depStep = steps.find(s => s.id === depId);
        return depStep ? this._formatStep(depStep) : null;
      }).filter(Boolean);
    }

    // Add next steps (steps that depend on this step)
    const nextStepIds = Object.entries(dependencies)
      .filter(([_, deps]) => deps.includes(step.id))
      .map(([stepId]) => stepId);
    
    if (nextStepIds.length > 0) {
      context.nextSteps = nextStepIds.map(nextId => {
        const nextStep = steps.find(s => s.id === nextId);
        return nextStep ? this._formatStep(nextStep) : null;
      }).filter(Boolean);
    }

    return this._trimContext(context);
  }

  /**
   * Format a task for context
   * @private
   * @param {object} task - Task to format
   * @returns {object} - Formatted task
   */
  _formatTask(task) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      acceptance_criteria: task.acceptance_criteria || []
    };
  }

  /**
   * Format a step for context
   * @private
   * @param {object} step - Step to format
   * @returns {object} - Formatted step
   */
  _formatStep(step) {
    return {
      id: step.id,
      name: step.name,
      description: step.description,
      task_id: step.task_id
    };
  }

  /**
   * Format project information for context
   * @private
   * @param {object} project - Project to format
   * @returns {object} - Formatted project info
   */
  _formatProjectInfo(project) {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      requirements: project.requirements
    };
  }

  /**
   * Format research information for context
   * @private
   * @param {object} research - Research to format
   * @returns {object} - Formatted research
   */
  _formatResearch(research) {
    const formatted = {};
    
    if (research.domain_knowledge && research.domain_knowledge.length > 0) {
      formatted.domain_knowledge = research.domain_knowledge.slice(0, 5);
    }
    
    if (research.similar_projects && research.similar_projects.length > 0) {
      formatted.similar_projects = research.similar_projects.slice(0, 3);
    }
    
    if (research.best_practices && research.best_practices.length > 0) {
      formatted.best_practices = research.best_practices.slice(0, 5);
    }
    
    return formatted;
  }

  /**
   * Trim context to fit within size limits
   * @private
   * @param {object} context - Context to trim
   * @returns {object} - Trimmed context
   */
  _trimContext(context) {
    // Convert to string to measure size
    const contextString = JSON.stringify(context);
    
    // If context is already within limits, return as is
    if (contextString.length <= this.options.maxContextSize) {
      return context;
    }
    
    // Create a copy to modify
    const trimmed = JSON.parse(JSON.stringify(context));
    
    // Trim in order of priority (least important first)
    
    // 1. Trim research information
    if (trimmed.research) {
      if (trimmed.research.similar_projects) {
        trimmed.research.similar_projects = trimmed.research.similar_projects.slice(0, 1);
      }
      
      if (trimmed.research.best_practices) {
        trimmed.research.best_practices = trimmed.research.best_practices.slice(0, 3);
      }
      
      if (trimmed.research.domain_knowledge) {
        trimmed.research.domain_knowledge = trimmed.research.domain_knowledge.slice(0, 3);
      }
    }
    
    // Check if we're now within limits
    if (JSON.stringify(trimmed).length <= this.options.maxContextSize) {
      return trimmed;
    }
    
    // 2. Trim related tasks
    if (trimmed.relatedTasks && trimmed.relatedTasks.length > 0) {
      trimmed.relatedTasks = trimmed.relatedTasks.slice(0, 1);
    }
    
    // 3. Trim next steps
    if (trimmed.nextSteps && trimmed.nextSteps.length > 0) {
      trimmed.nextSteps = trimmed.nextSteps.slice(0, 1);
    }
    
    // Check if we're now within limits
    if (JSON.stringify(trimmed).length <= this.options.maxContextSize) {
      return trimmed;
    }
    
    // 4. Trim dependencies
    if (trimmed.dependencies && trimmed.dependencies.length > 0) {
      trimmed.dependencies = trimmed.dependencies.slice(0, 1);
    }
    
    // 5. As a last resort, truncate descriptions
    if (trimmed.task && trimmed.task.description && trimmed.task.description.length > 200) {
      trimmed.task.description = trimmed.task.description.substring(0, 200) + '...';
    }
    
    if (trimmed.project && trimmed.project.description && trimmed.project.description.length > 200) {
      trimmed.project.description = trimmed.project.description.substring(0, 200) + '...';
    }
    
    if (trimmed.project && trimmed.project.requirements && trimmed.project.requirements.length > 300) {
      trimmed.project.requirements = trimmed.project.requirements.substring(0, 300) + '...';
    }
    
    return trimmed;
  }

  /**
   * Convert context to a string format optimized for LLMs
   * @param {object} context - Context object
   * @returns {string} - Formatted context string
   */
  formatContextForLLM(context) {
    let result = '';
    
    // Project information
    if (context.project) {
      result += `# Project: ${context.project.name}\n\n`;
      
      if (context.project.description) {
        result += `## Description\n${context.project.description}\n\n`;
      }
      
      if (context.project.requirements) {
        result += `## Requirements\n${context.project.requirements}\n\n`;
      }
    }
    
    // Task information
    if (context.task) {
      result += `# Task: ${context.task.title}\n\n`;
      
      if (context.task.description) {
        result += `## Description\n${context.task.description}\n\n`;
      }
      
      if (context.task.acceptance_criteria && context.task.acceptance_criteria.length > 0) {
        result += `## Acceptance Criteria\n`;
        context.task.acceptance_criteria.forEach((criterion, index) => {
          result += `${index + 1}. ${criterion}\n`;
        });
        result += '\n';
      }
    }
    
    // Step information
    if (context.step) {
      result += `# Current Step: ${context.step.name}\n\n`;
      
      if (context.step.description) {
        result += `## Description\n${context.step.description}\n\n`;
      }
    }
    
    // Dependencies
    if (context.dependencies && context.dependencies.length > 0) {
      result += `# Dependencies\n\n`;
      
      context.dependencies.forEach((dep, index) => {
        result += `## Dependency ${index + 1}: ${dep.title || dep.name}\n`;
        if (dep.description) {
          result += `${dep.description}\n\n`;
        }
      });
    }
    
    // Next steps or related tasks
    if (context.nextSteps && context.nextSteps.length > 0) {
      result += `# Next Steps\n\n`;
      
      context.nextSteps.forEach((step, index) => {
        result += `${index + 1}. ${step.name}: ${step.description || ''}\n`;
      });
      result += '\n';
    } else if (context.relatedTasks && context.relatedTasks.length > 0) {
      result += `# Related Tasks\n\n`;
      
      context.relatedTasks.forEach((task, index) => {
        result += `${index + 1}. ${task.title}: ${task.description || ''}\n`;
      });
      result += '\n';
    }
    
    // Research information
    if (context.research) {
      result += `# Research Information\n\n`;
      
      if (context.research.domain_knowledge && context.research.domain_knowledge.length > 0) {
        result += `## Domain Knowledge\n`;
        context.research.domain_knowledge.forEach((item, index) => {
          result += `${index + 1}. ${item}\n`;
        });
        result += '\n';
      }
      
      if (context.research.best_practices && context.research.best_practices.length > 0) {
        result += `## Best Practices\n`;
        context.research.best_practices.forEach((item, index) => {
          result += `${index + 1}. ${item}\n`;
        });
        result += '\n';
      }
      
      if (context.research.similar_projects && context.research.similar_projects.length > 0) {
        result += `## Similar Projects\n`;
        context.research.similar_projects.forEach((item, index) => {
          result += `${index + 1}. ${item}\n`;
        });
        result += '\n';
      }
    }
    
    return result;
  }
}
