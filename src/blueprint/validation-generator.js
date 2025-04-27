/**
 * Validation Generator Module
 * 
 * This module provides utilities for generating validation criteria for tasks and steps.
 * It helps ensure that implementations meet requirements and follow best practices.
 */

/**
 * Validation Generator class
 */
export class ValidationGenerator {
  /**
   * Create a new validation generator instance
   * @param {object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      minCriteria: options.minCriteria || 3,
      maxCriteria: options.maxCriteria || 10,
      includeTestCriteria: options.includeTestCriteria !== false,
      includePerformanceCriteria: options.includePerformanceCriteria !== false,
      ...options
    };
  }

  /**
   * Generate validation criteria for a task
   * @param {object} task - Task to generate criteria for
   * @param {object} project - Project containing the task
   * @returns {Array} - Array of validation criteria
   */
  generateTaskCriteria(task, project) {
    if (!task || !task.title) {
      throw new Error('Task with title is required');
    }

    // Start with existing criteria if available
    const criteria = [...(task.acceptance_criteria || [])];
    
    // If we already have enough criteria, return them
    if (criteria.length >= this.options.minCriteria) {
      return criteria;
    }
    
    // Generate basic criteria based on task title and description
    this._addBasicCriteria(criteria, task);
    
    // Add test criteria if enabled
    if (this.options.includeTestCriteria) {
      this._addTestCriteria(criteria, task);
    }
    
    // Add performance criteria if enabled
    if (this.options.includePerformanceCriteria) {
      this._addPerformanceCriteria(criteria, task);
    }
    
    // Add project-specific criteria if available
    if (project && project.requirements) {
      this._addProjectSpecificCriteria(criteria, task, project);
    }
    
    // Limit to maximum number of criteria
    return criteria.slice(0, this.options.maxCriteria);
  }

  /**
   * Generate validation criteria for a step
   * @param {object} step - Step to generate criteria for
   * @param {object} task - Task containing the step
   * @returns {Array} - Array of validation criteria
   */
  generateStepCriteria(step, task) {
    if (!step || !step.name) {
      throw new Error('Step with name is required');
    }

    const criteria = [];
    
    // Generate basic criteria based on step name and description
    this._addBasicStepCriteria(criteria, step);
    
    // Add task-specific criteria if available
    if (task && task.acceptance_criteria) {
      this._addTaskSpecificCriteria(criteria, step, task);
    }
    
    // Limit to maximum number of criteria
    return criteria.slice(0, this.options.maxCriteria);
  }

  /**
   * Add basic criteria based on task title and description
   * @private
   * @param {Array} criteria - Criteria array to add to
   * @param {object} task - Task to generate criteria for
   */
  _addBasicCriteria(criteria, task) {
    // Add implementation completeness criterion
    criteria.push(`The implementation must fully address the requirements of "${task.title}"`);
    
    // Add code quality criterion
    criteria.push('The implementation must follow best practices for code quality and maintainability');
    
    // Add documentation criterion
    criteria.push('The implementation must include appropriate documentation');
    
    // Add error handling criterion if not already present
    if (!criteria.some(c => c.toLowerCase().includes('error') && c.toLowerCase().includes('handl'))) {
      criteria.push('The implementation must include proper error handling');
    }
  }

  /**
   * Add test criteria
   * @private
   * @param {Array} criteria - Criteria array to add to
   * @param {object} task - Task to generate criteria for
   */
  _addTestCriteria(criteria, task) {
    // Add unit test criterion if not already present
    if (!criteria.some(c => c.toLowerCase().includes('unit test'))) {
      criteria.push('The implementation must include unit tests with adequate coverage');
    }
    
    // Add integration test criterion for complex tasks
    if (task.description && task.description.length > 200 && 
        !criteria.some(c => c.toLowerCase().includes('integration test'))) {
      criteria.push('The implementation must include integration tests for key functionality');
    }
  }

  /**
   * Add performance criteria
   * @private
   * @param {Array} criteria - Criteria array to add to
   * @param {object} task - Task to generate criteria for
   */
  _addPerformanceCriteria(criteria, task) {
    // Only add performance criteria for certain types of tasks
    const performanceKeywords = ['performance', 'optimize', 'efficient', 'speed', 'fast'];
    const isPerformanceFocused = task.title && 
      performanceKeywords.some(keyword => task.title.toLowerCase().includes(keyword)) ||
      (task.description && performanceKeywords.some(keyword => task.description.toLowerCase().includes(keyword)));
    
    if (isPerformanceFocused && !criteria.some(c => c.toLowerCase().includes('performance'))) {
      criteria.push('The implementation must meet performance requirements and avoid unnecessary resource usage');
    }
  }

  /**
   * Add project-specific criteria
   * @private
   * @param {Array} criteria - Criteria array to add to
   * @param {object} task - Task to generate criteria for
   * @param {object} project - Project containing the task
   */
  _addProjectSpecificCriteria(criteria, task, project) {
    // Extract keywords from project requirements
    const requirements = project.requirements || '';
    
    // Check for security requirements
    if (requirements.toLowerCase().includes('secur') && 
        !criteria.some(c => c.toLowerCase().includes('secur'))) {
      criteria.push('The implementation must follow security best practices');
    }
    
    // Check for accessibility requirements
    if (requirements.toLowerCase().includes('accessib') && 
        !criteria.some(c => c.toLowerCase().includes('accessib'))) {
      criteria.push('The implementation must meet accessibility standards');
    }
    
    // Check for compatibility requirements
    if ((requirements.toLowerCase().includes('compatible') || requirements.toLowerCase().includes('compatibility')) && 
        !criteria.some(c => c.toLowerCase().includes('compatib'))) {
      criteria.push('The implementation must be compatible with specified platforms and environments');
    }
  }

  /**
   * Add basic criteria based on step name and description
   * @private
   * @param {Array} criteria - Criteria array to add to
   * @param {object} step - Step to generate criteria for
   */
  _addBasicStepCriteria(criteria, step) {
    // Add completion criterion
    criteria.push(`The step "${step.name}" must be fully completed`);
    
    // Add documentation criterion
    criteria.push('The step implementation must be properly documented');
    
    // Add quality criterion
    criteria.push('The step implementation must meet quality standards');
  }

  /**
   * Add task-specific criteria for a step
   * @private
   * @param {Array} criteria - Criteria array to add to
   * @param {object} step - Step to generate criteria for
   * @param {object} task - Task containing the step
   */
  _addTaskSpecificCriteria(criteria, step, task) {
    // Add relevant task acceptance criteria
    if (task.acceptance_criteria && task.acceptance_criteria.length > 0) {
      // For the first step, focus on setup and preparation
      if (step.name.toLowerCase().includes('prepare')) {
        criteria.push('All necessary resources and dependencies must be properly set up');
      }
      // For verification steps, include all task acceptance criteria
      else if (step.name.toLowerCase().includes('verify')) {
        task.acceptance_criteria.forEach(criterion => {
          criteria.push(`Verify that: ${criterion}`);
        });
      }
      // For implementation steps, include relevant task acceptance criteria
      else {
        // Just add one representative criterion from the task
        if (task.acceptance_criteria.length > 0) {
          criteria.push(`The implementation must contribute to satisfying: ${task.acceptance_criteria[0]}`);
        }
      }
    }
  }

  /**
   * Format validation criteria for LLM consumption
   * @param {Array} criteria - Validation criteria
   * @returns {string} - Formatted criteria string
   */
  formatCriteriaForLLM(criteria) {
    if (!criteria || criteria.length === 0) {
      return 'No validation criteria specified.';
    }
    
    let result = '# Validation Criteria\n\n';
    
    criteria.forEach((criterion, index) => {
      result += `${index + 1}. ${criterion}\n`;
    });
    
    return result;
  }

  /**
   * Generate a validation plan for a task or step
   * @param {object} item - Task or step to generate plan for
   * @param {Array} criteria - Validation criteria
   * @returns {object} - Validation plan
   */
  generateValidationPlan(item, criteria) {
    if (!item || !criteria || criteria.length === 0) {
      throw new Error('Item and criteria are required');
    }
    
    const validationSteps = [];
    
    // Add a preparation step
    validationSteps.push({
      name: 'Preparation',
      description: 'Prepare the environment for validation',
      actions: [
        'Ensure all dependencies are installed',
        'Set up any necessary test fixtures',
        'Prepare test data if required'
      ]
    });
    
    // Add steps for each criterion
    criteria.forEach((criterion, index) => {
      validationSteps.push({
        name: `Validate Criterion ${index + 1}`,
        description: `Validate: ${criterion}`,
        actions: this._generateActionsForCriterion(criterion)
      });
    });
    
    // Add a final verification step
    validationSteps.push({
      name: 'Final Verification',
      description: 'Perform final verification of all criteria',
      actions: [
        'Verify that all criteria have been met',
        'Document any issues or concerns',
        'Prepare validation report'
      ]
    });
    
    return {
      item_id: item.id,
      item_type: item.title ? 'task' : 'step',
      item_name: item.title || item.name,
      criteria,
      validation_steps: validationSteps
    };
  }

  /**
   * Generate actions for a criterion
   * @private
   * @param {string} criterion - Criterion to generate actions for
   * @returns {Array} - Array of actions
   */
  _generateActionsForCriterion(criterion) {
    const actions = [];
    
    // Add inspection action
    actions.push(`Inspect the implementation to verify it meets: ${criterion}`);
    
    // Add test-related actions for test criteria
    if (criterion.toLowerCase().includes('test')) {
      actions.push('Run the relevant tests and verify they pass');
      actions.push('Check test coverage to ensure it is adequate');
    }
    
    // Add performance-related actions for performance criteria
    if (criterion.toLowerCase().includes('performance')) {
      actions.push('Measure performance metrics');
      actions.push('Compare against performance requirements');
    }
    
    // Add security-related actions for security criteria
    if (criterion.toLowerCase().includes('secur')) {
      actions.push('Perform security review');
      actions.push('Verify that security best practices are followed');
    }
    
    // Add documentation-related actions for documentation criteria
    if (criterion.toLowerCase().includes('document')) {
      actions.push('Review documentation for completeness and clarity');
      actions.push('Verify that documentation follows project standards');
    }
    
    return actions;
  }
}
