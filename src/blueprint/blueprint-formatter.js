/**
 * Blueprint Formatter Module
 * 
 * This module provides utilities for formatting blueprints in a way that is
 * optimized for LLM consumption and execution.
 */

/**
 * Blueprint Formatter class
 */
export class BlueprintFormatter {
  /**
   * Create a new blueprint formatter instance
   * @param {object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      format: options.format || 'markdown',
      includeArchitecture: options.includeArchitecture !== false,
      includeWorkflow: options.includeWorkflow !== false,
      includeTasks: options.includeTasks !== false,
      includeValidation: options.includeValidation !== false,
      ...options
    };
  }

  /**
   * Format a blueprint for LLM consumption
   * @param {object} blueprint - Blueprint to format
   * @param {object} project - Project containing the blueprint
   * @returns {string} - Formatted blueprint
   */
  formatBlueprint(blueprint, project) {
    if (!blueprint) {
      throw new Error('Blueprint is required');
    }

    switch (this.options.format.toLowerCase()) {
      case 'markdown':
        return this._formatMarkdown(blueprint, project);
      case 'json':
        return this._formatJSON(blueprint, project);
      case 'xml':
        return this._formatXML(blueprint, project);
      default:
        return this._formatMarkdown(blueprint, project);
    }
  }

  /**
   * Format a blueprint as Markdown
   * @private
   * @param {object} blueprint - Blueprint to format
   * @param {object} project - Project containing the blueprint
   * @returns {string} - Formatted blueprint as Markdown
   */
  _formatMarkdown(blueprint, project) {
    let result = '';
    
    // Project information
    result += `# Project: ${project?.name || 'Unnamed Project'}\n\n`;
    
    if (project?.description) {
      result += `## Description\n${project.description}\n\n`;
    }
    
    if (project?.requirements) {
      result += `## Requirements\n${project.requirements}\n\n`;
    }
    
    // Architecture
    if (this.options.includeArchitecture && blueprint.architecture) {
      result += `# Architecture\n\n`;
      
      if (blueprint.architecture.components && blueprint.architecture.components.length > 0) {
        result += `## Components\n\n`;
        
        blueprint.architecture.components.forEach(component => {
          result += `### ${component.name}\n`;
          if (component.description) {
            result += `${component.description}\n\n`;
          }
          if (component.type) {
            result += `**Type:** ${component.type}\n\n`;
          }
          if (component.properties) {
            result += `**Properties:**\n`;
            Object.entries(component.properties).forEach(([key, value]) => {
              result += `- ${key}: ${value}\n`;
            });
            result += '\n';
          }
        });
      }
      
      if (blueprint.architecture.relationships && blueprint.architecture.relationships.length > 0) {
        result += `## Relationships\n\n`;
        
        blueprint.architecture.relationships.forEach(relationship => {
          const sourceComponent = blueprint.architecture.components.find(c => c.id === relationship.source);
          const targetComponent = blueprint.architecture.components.find(c => c.id === relationship.target);
          
          result += `- ${sourceComponent?.name || relationship.source} → ${targetComponent?.name || relationship.target}`;
          if (relationship.type) {
            result += ` (${relationship.type})`;
          }
          result += '\n';
        });
        
        result += '\n';
      }
    }
    
    // Workflow
    if (this.options.includeWorkflow && blueprint.workflow) {
      result += `# Implementation Workflow\n\n`;
      
      if (blueprint.workflow.steps && blueprint.workflow.steps.length > 0) {
        result += `## Steps\n\n`;
        
        blueprint.workflow.steps.forEach((step, index) => {
          result += `### Step ${index + 1}: ${step.name}\n`;
          if (step.description) {
            result += `${step.description}\n\n`;
          }
          
          if (step.tasks && step.tasks.length > 0) {
            result += `**Associated Tasks:**\n`;
            step.tasks.forEach(taskId => {
              const task = blueprint.tasks.find(t => t.id === taskId);
              if (task) {
                result += `- ${task.title}\n`;
              }
            });
            result += '\n';
          }
        });
      }
      
      if (blueprint.workflow.checkpoints && blueprint.workflow.checkpoints.length > 0) {
        result += `## Checkpoints\n\n`;
        
        blueprint.workflow.checkpoints.forEach((checkpoint, index) => {
          result += `### Checkpoint ${index + 1}: ${checkpoint.name}\n`;
          if (checkpoint.description) {
            result += `${checkpoint.description}\n\n`;
          }
          
          if (checkpoint.criteria && checkpoint.criteria.length > 0) {
            result += `**Criteria:**\n`;
            checkpoint.criteria.forEach(criterion => {
              result += `- ${criterion}\n`;
            });
            result += '\n';
          }
        });
      }
    }
    
    // Tasks
    if (this.options.includeTasks && blueprint.tasks && blueprint.tasks.length > 0) {
      result += `# Tasks\n\n`;
      
      blueprint.tasks.forEach((task, index) => {
        result += `## Task ${index + 1}: ${task.title}\n\n`;
        
        if (task.description) {
          result += `### Description\n${task.description}\n\n`;
        }
        
        if (task.dependencies && task.dependencies.length > 0) {
          result += `### Dependencies\n`;
          task.dependencies.forEach(depId => {
            const depTask = blueprint.tasks.find(t => t.id === depId);
            if (depTask) {
              result += `- ${depTask.title}\n`;
            }
          });
          result += '\n';
        }
        
        if (task.acceptance_criteria && task.acceptance_criteria.length > 0) {
          result += `### Acceptance Criteria\n`;
          task.acceptance_criteria.forEach((criterion, criterionIndex) => {
            result += `${criterionIndex + 1}. ${criterion}\n`;
          });
          result += '\n';
        }
        
        if (task.implementation_guide) {
          result += `### Implementation Guide\n${task.implementation_guide}\n\n`;
        }
      });
    }
    
    // Validation
    if (this.options.includeValidation) {
      result += `# Validation Guidelines\n\n`;
      
      result += `## General Validation Approach\n`;
      result += `1. Verify that each task meets its acceptance criteria\n`;
      result += `2. Ensure that the implementation follows the architecture design\n`;
      result += `3. Validate that all components work together as expected\n`;
      result += `4. Check that the implementation meets the project requirements\n\n`;
      
      result += `## Testing Strategy\n`;
      result += `- Write unit tests for individual components\n`;
      result += `- Create integration tests for component interactions\n`;
      result += `- Perform end-to-end testing for complete workflows\n`;
      result += `- Validate against acceptance criteria\n\n`;
    }
    
    return result;
  }

  /**
   * Format a blueprint as JSON
   * @private
   * @param {object} blueprint - Blueprint to format
   * @param {object} project - Project containing the blueprint
   * @returns {string} - Formatted blueprint as JSON
   */
  _formatJSON(blueprint, project) {
    const result = {
      project: {
        id: project?.id,
        name: project?.name || 'Unnamed Project',
        description: project?.description,
        requirements: project?.requirements
      },
      blueprint: {
        id: blueprint.id,
        created_at: blueprint.created_at,
        updated_at: blueprint.updated_at
      }
    };
    
    // Architecture
    if (this.options.includeArchitecture && blueprint.architecture) {
      result.architecture = blueprint.architecture;
    }
    
    // Workflow
    if (this.options.includeWorkflow && blueprint.workflow) {
      result.workflow = blueprint.workflow;
    }
    
    // Tasks
    if (this.options.includeTasks && blueprint.tasks) {
      result.tasks = blueprint.tasks;
    }
    
    return JSON.stringify(result, null, 2);
  }

  /**
   * Format a blueprint as XML
   * @private
   * @param {object} blueprint - Blueprint to format
   * @param {object} project - Project containing the blueprint
   * @returns {string} - Formatted blueprint as XML
   */
  _formatXML(blueprint, project) {
    let result = '<?xml version="1.0" encoding="UTF-8"?>\n';
    result += '<Blueprint>\n';
    
    // Project information
    result += '  <Project>\n';
    result += `    <ID>${this._escapeXml(project?.id || '')}</ID>\n`;
    result += `    <Name>${this._escapeXml(project?.name || 'Unnamed Project')}</Name>\n`;
    
    if (project?.description) {
      result += `    <Description>${this._escapeXml(project.description)}</Description>\n`;
    }
    
    if (project?.requirements) {
      result += `    <Requirements>${this._escapeXml(project.requirements)}</Requirements>\n`;
    }
    
    result += '  </Project>\n';
    
    // Architecture
    if (this.options.includeArchitecture && blueprint.architecture) {
      result += '  <Architecture>\n';
      
      if (blueprint.architecture.components && blueprint.architecture.components.length > 0) {
        result += '    <Components>\n';
        
        blueprint.architecture.components.forEach(component => {
          result += '      <Component>\n';
          result += `        <ID>${this._escapeXml(component.id)}</ID>\n`;
          result += `        <Name>${this._escapeXml(component.name)}</Name>\n`;
          
          if (component.description) {
            result += `        <Description>${this._escapeXml(component.description)}</Description>\n`;
          }
          
          if (component.type) {
            result += `        <Type>${this._escapeXml(component.type)}</Type>\n`;
          }
          
          if (component.properties) {
            result += '        <Properties>\n';
            Object.entries(component.properties).forEach(([key, value]) => {
              result += `          <${this._escapeXml(key)}>${this._escapeXml(String(value))}</${this._escapeXml(key)}>\n`;
            });
            result += '        </Properties>\n';
          }
          
          result += '      </Component>\n';
        });
        
        result += '    </Components>\n';
      }
      
      if (blueprint.architecture.relationships && blueprint.architecture.relationships.length > 0) {
        result += '    <Relationships>\n';
        
        blueprint.architecture.relationships.forEach(relationship => {
          result += '      <Relationship>\n';
          result += `        <ID>${this._escapeXml(relationship.id)}</ID>\n`;
          result += `        <Source>${this._escapeXml(relationship.source)}</Source>\n`;
          result += `        <Target>${this._escapeXml(relationship.target)}</Target>\n`;
          
          if (relationship.type) {
            result += `        <Type>${this._escapeXml(relationship.type)}</Type>\n`;
          }
          
          result += '      </Relationship>\n';
        });
        
        result += '    </Relationships>\n';
      }
      
      result += '  </Architecture>\n';
    }
    
    // Tasks
    if (this.options.includeTasks && blueprint.tasks && blueprint.tasks.length > 0) {
      result += '  <Tasks>\n';
      
      blueprint.tasks.forEach(task => {
        result += '    <Task>\n';
        result += `      <ID>${this._escapeXml(task.id)}</ID>\n`;
        result += `      <Title>${this._escapeXml(task.title)}</Title>\n`;
        
        if (task.description) {
          result += `      <Description>${this._escapeXml(task.description)}</Description>\n`;
        }
        
        if (task.dependencies && task.dependencies.length > 0) {
          result += '      <Dependencies>\n';
          task.dependencies.forEach(depId => {
            result += `        <DependencyID>${this._escapeXml(depId)}</DependencyID>\n`;
          });
          result += '      </Dependencies>\n';
        }
        
        if (task.acceptance_criteria && task.acceptance_criteria.length > 0) {
          result += '      <AcceptanceCriteria>\n';
          task.acceptance_criteria.forEach(criterion => {
            result += `        <Criterion>${this._escapeXml(criterion)}</Criterion>\n`;
          });
          result += '      </AcceptanceCriteria>\n';
        }
        
        if (task.implementation_guide) {
          result += `      <ImplementationGuide>${this._escapeXml(task.implementation_guide)}</ImplementationGuide>\n`;
        }
        
        result += '    </Task>\n';
      });
      
      result += '  </Tasks>\n';
    }
    
    // Workflow
    if (this.options.includeWorkflow && blueprint.workflow) {
      result += '  <Workflow>\n';
      
      if (blueprint.workflow.steps && blueprint.workflow.steps.length > 0) {
        result += '    <Steps>\n';
        
        blueprint.workflow.steps.forEach(step => {
          result += '      <Step>\n';
          result += `        <ID>${this._escapeXml(step.id)}</ID>\n`;
          result += `        <Name>${this._escapeXml(step.name)}</Name>\n`;
          
          if (step.description) {
            result += `        <Description>${this._escapeXml(step.description)}</Description>\n`;
          }
          
          if (step.tasks && step.tasks.length > 0) {
            result += '        <TaskIDs>\n';
            step.tasks.forEach(taskId => {
              result += `          <TaskID>${this._escapeXml(taskId)}</TaskID>\n`;
            });
            result += '        </TaskIDs>\n';
          }
          
          result += '      </Step>\n';
        });
        
        result += '    </Steps>\n';
      }
      
      if (blueprint.workflow.checkpoints && blueprint.workflow.checkpoints.length > 0) {
        result += '    <Checkpoints>\n';
        
        blueprint.workflow.checkpoints.forEach(checkpoint => {
          result += '      <Checkpoint>\n';
          result += `        <ID>${this._escapeXml(checkpoint.id)}</ID>\n`;
          result += `        <Name>${this._escapeXml(checkpoint.name)}</Name>\n`;
          
          if (checkpoint.description) {
            result += `        <Description>${this._escapeXml(checkpoint.description)}</Description>\n`;
          }
          
          if (checkpoint.criteria && checkpoint.criteria.length > 0) {
            result += '        <Criteria>\n';
            checkpoint.criteria.forEach(criterion => {
              result += `          <Criterion>${this._escapeXml(criterion)}</Criterion>\n`;
            });
            result += '        </Criteria>\n';
          }
          
          result += '      </Checkpoint>\n';
        });
        
        result += '    </Checkpoints>\n';
      }
      
      result += '  </Workflow>\n';
    }
    
    result += '</Blueprint>';
    
    return result;
  }

  /**
   * Escape XML special characters
   * @private
   * @param {string} str - String to escape
   * @returns {string} - Escaped string
   */
  _escapeXml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Format a task for LLM consumption
   * @param {object} task - Task to format
   * @param {object} blueprint - Blueprint containing the task
   * @param {object} project - Project containing the blueprint
   * @returns {string} - Formatted task
   */
  formatTask(task, blueprint, project) {
    if (!task) {
      throw new Error('Task is required');
    }

    let result = '';
    
    // Task information
    result += `# Task: ${task.title}\n\n`;
    
    if (task.description) {
      result += `## Description\n${task.description}\n\n`;
    }
    
    // Project context
    if (project) {
      result += `## Project Context\n`;
      result += `**Project:** ${project.name}\n\n`;
      
      if (project.description) {
        result += `**Project Description:** ${project.description}\n\n`;
      }
    }
    
    // Dependencies
    if (task.dependencies && task.dependencies.length > 0 && blueprint) {
      result += `## Dependencies\n`;
      
      task.dependencies.forEach(depId => {
        const depTask = blueprint.tasks.find(t => t.id === depId);
        if (depTask) {
          result += `- **${depTask.title}**: ${depTask.description ? depTask.description.substring(0, 100) + (depTask.description.length > 100 ? '...' : '') : 'No description'}\n`;
        }
      });
      
      result += '\n';
    }
    
    // Acceptance criteria
    if (task.acceptance_criteria && task.acceptance_criteria.length > 0) {
      result += `## Acceptance Criteria\n`;
      
      task.acceptance_criteria.forEach((criterion, index) => {
        result += `${index + 1}. ${criterion}\n`;
      });
      
      result += '\n';
    }
    
    // Implementation guide
    if (task.implementation_guide) {
      result += `## Implementation Guide\n${task.implementation_guide}\n\n`;
    }
    
    // Related components
    if (blueprint && blueprint.architecture && blueprint.architecture.components) {
      const relatedComponents = blueprint.architecture.components.filter(component => 
        component.name.toLowerCase().includes(task.title.toLowerCase()) ||
        (component.description && component.description.toLowerCase().includes(task.title.toLowerCase()))
      );
      
      if (relatedComponents.length > 0) {
        result += `## Related Components\n`;
        
        relatedComponents.forEach(component => {
          result += `- **${component.name}**: ${component.description || 'No description'}\n`;
        });
        
        result += '\n';
      }
    }
    
    return result;
  }

  /**
   * Format a step for LLM consumption
   * @param {object} step - Step to format
   * @param {object} task - Task containing the step
   * @param {object} blueprint - Blueprint containing the task
   * @param {object} project - Project containing the blueprint
   * @returns {string} - Formatted step
   */
  formatStep(step, task, blueprint, project) {
    if (!step) {
      throw new Error('Step is required');
    }

    let result = '';
    
    // Step information
    result += `# Step: ${step.name}\n\n`;
    
    if (step.description) {
      result += `## Description\n${step.description}\n\n`;
    }
    
    // Task context
    if (task) {
      result += `## Task Context\n`;
      result += `**Task:** ${task.title}\n\n`;
      
      if (task.description) {
        result += `**Task Description:** ${task.description}\n\n`;
      }
      
      if (task.acceptance_criteria && task.acceptance_criteria.length > 0) {
        result += `**Task Acceptance Criteria:**\n`;
        task.acceptance_criteria.forEach((criterion, index) => {
          result += `${index + 1}. ${criterion}\n`;
        });
        result += '\n';
      }
    }
    
    // Project context
    if (project) {
      result += `## Project Context\n`;
      result += `**Project:** ${project.name}\n\n`;
      
      if (project.description) {
        result += `**Project Description:** ${project.description.substring(0, 200)}${project.description.length > 200 ? '...' : ''}\n\n`;
      }
    }
    
    // Implementation guidance
    result += `## Implementation Guidance\n`;
    result += `1. Understand the requirements for this step\n`;
    result += `2. Implement the functionality described in the step\n`;
    result += `3. Test your implementation against the acceptance criteria\n`;
    result += `4. Document your implementation\n`;
    result += `5. Verify that your implementation integrates properly with other components\n\n`;
    
    return result;
  }
}
