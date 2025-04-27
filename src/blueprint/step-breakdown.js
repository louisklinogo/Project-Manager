/**
 * Step Breakdown Module
 * 
 * This module provides utilities for breaking down complex tasks into smaller,
 * more manageable steps that are optimized for LLM consumption and execution.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Step Breakdown class
 */
export class StepBreakdown {
  /**
   * Create a new step breakdown instance
   * @param {object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      maxStepComplexity: options.maxStepComplexity || 5,
      minStepsPerTask: options.minStepsPerTask || 2,
      maxStepsPerTask: options.maxStepsPerTask || 10,
      ...options
    };
  }

  /**
   * Break down a task into steps
   * @param {object} task - Task to break down
   * @returns {Array} - Array of steps
   */
  breakdownTask(task) {
    if (!task || !task.description) {
      throw new Error('Task must have a description');
    }

    // If the task already has steps defined, return them
    if (task.steps && task.steps.length > 0) {
      return task.steps;
    }

    // Create a default step breakdown based on task complexity
    const complexity = this._estimateComplexity(task);
    const numSteps = Math.min(
      Math.max(
        Math.ceil(complexity / this.options.maxStepComplexity),
        this.options.minStepsPerTask
      ),
      this.options.maxStepsPerTask
    );

    // Generate steps
    return this._generateSteps(task, numSteps);
  }

  /**
   * Break down multiple tasks into steps with dependencies
   * @param {Array} tasks - Tasks to break down
   * @returns {object} - Object with steps and dependencies
   */
  breakdownTasks(tasks) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('Tasks must be a non-empty array');
    }

    const allSteps = [];
    const stepDependencies = new Map();

    // Process each task
    tasks.forEach(task => {
      const taskSteps = this.breakdownTask(task);
      
      // Add steps to the result
      allSteps.push(...taskSteps);
      
      // Process dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        // Find the first step of the current task
        const firstStepId = taskSteps[0].id;
        
        // For each dependency, find its last step
        task.dependencies.forEach(depId => {
          const depTask = tasks.find(t => t.id === depId);
          if (depTask) {
            const depTaskSteps = this.breakdownTask(depTask);
            const lastStepId = depTaskSteps[depTaskSteps.length - 1].id;
            
            // Add dependency: first step of current task depends on last step of dependency task
            stepDependencies.set(firstStepId, [
              ...(stepDependencies.get(firstStepId) || []),
              lastStepId
            ]);
          }
        });
      }
      
      // Add internal step dependencies (each step depends on the previous step)
      for (let i = 1; i < taskSteps.length; i++) {
        const currentStepId = taskSteps[i].id;
        const prevStepId = taskSteps[i - 1].id;
        
        stepDependencies.set(currentStepId, [
          ...(stepDependencies.get(currentStepId) || []),
          prevStepId
        ]);
      }
    });

    return {
      steps: allSteps,
      dependencies: Object.fromEntries(stepDependencies)
    };
  }

  /**
   * Estimate the complexity of a task
   * @private
   * @param {object} task - Task to estimate complexity for
   * @returns {number} - Complexity score
   */
  _estimateComplexity(task) {
    let complexity = 1; // Base complexity

    // Add complexity based on description length
    if (task.description) {
      complexity += Math.ceil(task.description.length / 200);
    }

    // Add complexity based on acceptance criteria
    if (task.acceptance_criteria && Array.isArray(task.acceptance_criteria)) {
      complexity += task.acceptance_criteria.length;
    }

    // Add complexity based on dependencies
    if (task.dependencies && Array.isArray(task.dependencies)) {
      complexity += task.dependencies.length * 0.5;
    }

    // Add complexity based on implementation guide
    if (task.implementation_guide) {
      complexity += Math.ceil(task.implementation_guide.length / 500);
    }

    return complexity;
  }

  /**
   * Generate steps for a task
   * @private
   * @param {object} task - Task to generate steps for
   * @param {number} numSteps - Number of steps to generate
   * @returns {Array} - Array of steps
   */
  _generateSteps(task, numSteps) {
    const steps = [];
    
    // Create a preparation step
    steps.push({
      id: `step-${uuidv4()}`,
      name: `Prepare for ${task.title}`,
      description: `Gather requirements and understand the scope for: ${task.title}`,
      task_id: task.id
    });
    
    // Create implementation steps
    const implementationSteps = numSteps - 2; // Subtract preparation and verification steps
    for (let i = 0; i < implementationSteps; i++) {
      steps.push({
        id: `step-${uuidv4()}`,
        name: `Implement part ${i + 1} of ${task.title}`,
        description: `Implementation step ${i + 1} for: ${task.title}`,
        task_id: task.id
      });
    }
    
    // Create a verification step
    steps.push({
      id: `step-${uuidv4()}`,
      name: `Verify ${task.title}`,
      description: `Verify that the implementation meets all requirements for: ${task.title}`,
      task_id: task.id
    });
    
    return steps;
  }

  /**
   * Detect and resolve circular dependencies in steps
   * @param {Array} steps - Steps to check
   * @param {object} dependencies - Dependencies between steps
   * @returns {object} - Object with steps and resolved dependencies
   */
  resolveCircularDependencies(steps, dependencies) {
    const graph = new Map();
    
    // Build dependency graph
    Object.entries(dependencies).forEach(([stepId, deps]) => {
      graph.set(stepId, deps);
    });
    
    // Detect cycles using DFS
    const visited = new Set();
    const recStack = new Set();
    const cycleEdges = new Set();
    
    const detectCycle = (node, path = []) => {
      if (!graph.has(node)) return false;
      
      if (recStack.has(node)) {
        // Found a cycle, mark all edges in the cycle
        const cycleStart = path.indexOf(node);
        for (let i = cycleStart; i < path.length - 1; i++) {
          cycleEdges.add(`${path[i]}->${path[i + 1]}`);
        }
        return true;
      }
      
      if (visited.has(node)) return false;
      
      visited.add(node);
      recStack.add(node);
      path.push(node);
      
      const deps = graph.get(node) || [];
      for (const dep of deps) {
        if (detectCycle(dep, [...path])) {
          return true;
        }
      }
      
      recStack.delete(node);
      return false;
    };
    
    // Check each node for cycles
    for (const stepId of Object.keys(dependencies)) {
      detectCycle(stepId);
    }
    
    // Resolve cycles by removing problematic edges
    const resolvedDependencies = { ...dependencies };
    
    cycleEdges.forEach(edge => {
      const [source, target] = edge.split('->');
      resolvedDependencies[source] = resolvedDependencies[source].filter(dep => dep !== target);
    });
    
    return {
      steps,
      dependencies: resolvedDependencies
    };
  }
}
