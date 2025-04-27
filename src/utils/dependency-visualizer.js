/**
 * Dependency Visualizer
 *
 * This module provides utilities for visualizing task dependencies.
 */

/**
 * Dependency Visualizer class
 */
export class DependencyVisualizer {
  /**
   * Create a new dependency visualizer
   * @param {object} options - Visualizer options
   */
  constructor(options = {}) {
    this.options = {
      format: 'text',
      showTaskDetails: false,
      highlightCircularDependencies: true,
      maxDepth: Infinity,
      ...options
    };
  }

  /**
   * Visualize task dependencies
   * @param {Array} tasks - Tasks to visualize
   * @returns {string} - Visualization output
   */
  visualizeDependencies(tasks) {
    if (!tasks || tasks.length === 0) {
      return this.formatOutput('No tasks to visualize', []);
    }

    // Build a dependency graph
    const graph = this.buildDependencyGraph(tasks);
    
    // Generate the visualization based on the format
    switch (this.options.format.toLowerCase()) {
      case 'markdown':
        return this.generateMarkdownVisualization(tasks, graph);
      case 'html':
        return this.generateHtmlVisualization(tasks, graph);
      case 'json':
        return this.generateJsonVisualization(tasks, graph);
      case 'text':
      default:
        return this.generateTextVisualization(tasks, graph);
    }
  }

  /**
   * Build a dependency graph
   * @param {Array} tasks - Tasks to analyze
   * @returns {object} - Dependency graph
   * @private
   */
  buildDependencyGraph(tasks) {
    const graph = {
      nodes: [],
      edges: [],
      circular: new Set()
    };

    // Add nodes
    tasks.forEach(task => {
      graph.nodes.push({
        id: task.id,
        label: task.title,
        status: task.status,
        priority: task.priority,
        completion: task.completion_percentage || 0
      });
    });

    // Add edges
    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          graph.edges.push({
            source: depId,
            target: task.id
          });
        });
      }
    });

    // Detect circular dependencies
    this.detectCircularDependencies(tasks, graph);

    return graph;
  }

  /**
   * Detect circular dependencies
   * @param {Array} tasks - Tasks to analyze
   * @param {object} graph - Dependency graph
   * @private
   */
  detectCircularDependencies(tasks, graph) {
    const visited = new Map();
    const recStack = new Map();

    // Helper function to check for cycles using DFS
    const hasCycle = (taskId, path = []) => {
      // If we've already determined this task doesn't have cycles, return false
      if (visited.get(taskId) === true) {
        return false;
      }

      // If we're already visiting this task in the current path, we found a cycle
      if (recStack.get(taskId) === true) {
        // Mark all tasks in the cycle
        const cycleStart = path.indexOf(taskId);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart).concat(taskId);
          cycle.forEach(id => graph.circular.add(id));
        }
        return true;
      }

      // Mark the current task as being visited
      visited.set(taskId, false);
      recStack.set(taskId, true);
      path.push(taskId);

      // Find the task
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        // Task not found, can't have cycles
        visited.set(taskId, true);
        recStack.set(taskId, false);
        path.pop();
        return false;
      }

      // Check each dependency
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          if (hasCycle(depId, [...path])) {
            // We found a cycle
            visited.set(taskId, true);
            recStack.set(taskId, false);
            return true;
          }
        }
      }

      // No cycles found for this task
      visited.set(taskId, true);
      recStack.set(taskId, false);
      path.pop();
      return false;
    };

    // Check each task for circular dependencies
    tasks.forEach(task => {
      hasCycle(task.id);
    });
  }

  /**
   * Generate text visualization
   * @param {Array} tasks - Tasks to visualize
   * @param {object} graph - Dependency graph
   * @returns {string} - Text visualization
   * @private
   */
  generateTextVisualization(tasks, graph) {
    const lines = ['Task Dependencies:'];
    
    // Sort tasks by ID for consistent output
    const sortedTasks = [...tasks].sort((a, b) => {
      if (typeof a.id === 'number' && typeof b.id === 'number') {
        return a.id - b.id;
      }
      return String(a.id).localeCompare(String(b.id));
    });
    
    // Generate dependency tree
    sortedTasks.forEach(task => {
      const isCircular = graph.circular.has(task.id);
      const prefix = isCircular ? '! ' : '  ';
      
      lines.push(`${prefix}${task.id}: ${task.title} (${task.status})`);
      
      // Show dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const depTask = tasks.find(t => t.id === depId);
          const depName = depTask ? depTask.title : 'Unknown Task';
          const isCircularDep = isCircular && graph.circular.has(depId);
          const depPrefix = isCircularDep ? '! ' : '  ';
          
          lines.push(`${depPrefix}  ↳ Depends on: ${depId} (${depName})`);
        });
      } else {
        lines.push('    No dependencies');
      }
      
      // Show dependent tasks
      const dependentTasks = tasks.filter(t => 
        t.dependencies && t.dependencies.includes(task.id)
      );
      
      if (dependentTasks.length > 0) {
        lines.push('    Required by:');
        dependentTasks.forEach(depTask => {
          const isCircularDep = isCircular && graph.circular.has(depTask.id);
          const depPrefix = isCircularDep ? '! ' : '  ';
          
          lines.push(`${depPrefix}  ↳ ${depTask.id} (${depTask.title})`);
        });
      } else {
        lines.push('    Not required by any task');
      }
      
      lines.push('');
    });
    
    // Add legend
    lines.push('Legend:');
    lines.push('! - Task involved in circular dependency');
    
    return lines.join('\n');
  }

  /**
   * Generate Markdown visualization
   * @param {Array} tasks - Tasks to visualize
   * @param {object} graph - Dependency graph
   * @returns {string} - Markdown visualization
   * @private
   */
  generateMarkdownVisualization(tasks, graph) {
    const lines = ['# Task Dependencies'];
    
    // Sort tasks by ID for consistent output
    const sortedTasks = [...tasks].sort((a, b) => {
      if (typeof a.id === 'number' && typeof b.id === 'number') {
        return a.id - b.id;
      }
      return String(a.id).localeCompare(String(b.id));
    });
    
    // Generate dependency tree
    sortedTasks.forEach(task => {
      const isCircular = graph.circular.has(task.id);
      const title = isCircular ? `⚠️ ${task.id}: ${task.title}` : `${task.id}: ${task.title}`;
      
      lines.push(`\n## ${title}`);
      lines.push(`**Status:** ${task.status} | **Priority:** ${task.priority}`);
      
      if (this.options.showTaskDetails && task.description) {
        lines.push(`\n${task.description}`);
      }
      
      // Show dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        lines.push('\n### Dependencies');
        lines.push('This task depends on:');
        lines.push('');
        
        task.dependencies.forEach(depId => {
          const depTask = tasks.find(t => t.id === depId);
          const depName = depTask ? depTask.title : 'Unknown Task';
          const isCircularDep = isCircular && graph.circular.has(depId);
          const depPrefix = isCircularDep ? '⚠️ ' : '';
          
          lines.push(`- ${depPrefix}**${depId}**: ${depName}`);
        });
      } else {
        lines.push('\n### Dependencies');
        lines.push('This task has no dependencies.');
      }
      
      // Show dependent tasks
      const dependentTasks = tasks.filter(t => 
        t.dependencies && t.dependencies.includes(task.id)
      );
      
      if (dependentTasks.length > 0) {
        lines.push('\n### Required By');
        lines.push('This task is required by:');
        lines.push('');
        
        dependentTasks.forEach(depTask => {
          const isCircularDep = isCircular && graph.circular.has(depTask.id);
          const depPrefix = isCircularDep ? '⚠️ ' : '';
          
          lines.push(`- ${depPrefix}**${depTask.id}**: ${depTask.title}`);
        });
      } else {
        lines.push('\n### Required By');
        lines.push('This task is not required by any other task.');
      }
    });
    
    // Add legend
    lines.push('\n## Legend');
    lines.push('- ⚠️ Task involved in circular dependency');
    
    return lines.join('\n');
  }

  /**
   * Generate HTML visualization
   * @param {Array} tasks - Tasks to visualize
   * @param {object} graph - Dependency graph
   * @returns {string} - HTML visualization
   * @private
   */
  generateHtmlVisualization(tasks, graph) {
    const taskElements = [];
    
    // Sort tasks by ID for consistent output
    const sortedTasks = [...tasks].sort((a, b) => {
      if (typeof a.id === 'number' && typeof b.id === 'number') {
        return a.id - b.id;
      }
      return String(a.id).localeCompare(String(b.id));
    });
    
    // Generate task elements
    sortedTasks.forEach(task => {
      const isCircular = graph.circular.has(task.id);
      const circularClass = isCircular ? 'circular-dependency' : '';
      
      // Dependencies
      const dependencies = [];
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const depTask = tasks.find(t => t.id === depId);
          const depName = depTask ? depTask.title : 'Unknown Task';
          const isCircularDep = isCircular && graph.circular.has(depId);
          const depClass = isCircularDep ? 'circular-dependency' : '';
          
          dependencies.push(`
            <li class="${depClass}">
              <strong>${depId}</strong>: ${depName}
            </li>
          `);
        });
      } else {
        dependencies.push('<li>No dependencies</li>');
      }
      
      // Dependent tasks
      const dependentTasks = tasks.filter(t => 
        t.dependencies && t.dependencies.includes(task.id)
      );
      
      const dependents = [];
      if (dependentTasks.length > 0) {
        dependentTasks.forEach(depTask => {
          const isCircularDep = isCircular && graph.circular.has(depTask.id);
          const depClass = isCircularDep ? 'circular-dependency' : '';
          
          dependents.push(`
            <li class="${depClass}">
              <strong>${depTask.id}</strong>: ${depTask.title}
            </li>
          `);
        });
      } else {
        dependents.push('<li>Not required by any task</li>');
      }
      
      // Task element
      taskElements.push(`
        <div class="task ${circularClass}">
          <h2>${task.id}: ${task.title}</h2>
          <div class="task-meta">
            <span class="status">Status: ${task.status}</span>
            <span class="priority">Priority: ${task.priority}</span>
            ${task.completion_percentage !== undefined ? 
              `<span class="completion">Completion: ${task.completion_percentage}%</span>` : ''}
          </div>
          
          ${this.options.showTaskDetails && task.description ? 
            `<div class="description">${task.description}</div>` : ''}
          
          <div class="dependencies">
            <h3>Dependencies</h3>
            <ul>
              ${dependencies.join('')}
            </ul>
          </div>
          
          <div class="dependents">
            <h3>Required By</h3>
            <ul>
              ${dependents.join('')}
            </ul>
          </div>
        </div>
      `);
    });
    
    // Generate HTML
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Task Dependencies</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          h1 {
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
          }
          .task {
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f9f9f9;
          }
          .task h2 {
            margin-top: 0;
            color: #444;
          }
          .task-meta {
            display: flex;
            gap: 15px;
            margin-bottom: 10px;
          }
          .status, .priority, .completion {
            background-color: #eee;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.9em;
          }
          .description {
            margin: 10px 0;
            padding: 10px;
            background-color: #fff;
            border-radius: 3px;
          }
          .dependencies, .dependents {
            margin-top: 15px;
          }
          .dependencies h3, .dependents h3 {
            font-size: 1.1em;
            margin-bottom: 5px;
          }
          .circular-dependency {
            border-color: #f44336;
            background-color: #ffebee;
          }
          .circular-dependency h2 {
            color: #d32f2f;
          }
          .circular-dependency li.circular-dependency {
            color: #d32f2f;
          }
          .legend {
            margin-top: 30px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <h1>Task Dependencies</h1>
        
        <div class="tasks">
          ${taskElements.join('')}
        </div>
        
        <div class="legend">
          <h2>Legend</h2>
          <p><span style="color: #d32f2f;">Red highlighting</span> indicates tasks involved in circular dependencies.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate JSON visualization
   * @param {Array} tasks - Tasks to visualize
   * @param {object} graph - Dependency graph
   * @returns {string} - JSON visualization
   * @private
   */
  generateJsonVisualization(tasks, graph) {
    const result = {
      tasks: [],
      circular_dependencies: Array.from(graph.circular)
    };
    
    // Process each task
    tasks.forEach(task => {
      const isCircular = graph.circular.has(task.id);
      
      // Find dependent tasks
      const dependentTasks = tasks.filter(t => 
        t.dependencies && t.dependencies.includes(task.id)
      ).map(t => t.id);
      
      // Create task object
      const taskObj = {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        completion_percentage: task.completion_percentage || 0,
        dependencies: task.dependencies || [],
        dependent_tasks: dependentTasks,
        has_circular_dependency: isCircular
      };
      
      // Add description if showing details
      if (this.options.showTaskDetails && task.description) {
        taskObj.description = task.description;
      }
      
      result.tasks.push(taskObj);
    });
    
    return JSON.stringify(result, null, 2);
  }

  /**
   * Format the output
   * @param {string} message - Message to format
   * @param {Array} tasks - Tasks
   * @returns {string} - Formatted output
   * @private
   */
  formatOutput(message, tasks) {
    switch (this.options.format.toLowerCase()) {
      case 'markdown':
        return `# Task Dependencies\n\n${message}`;
      case 'html':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Task Dependencies</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
            </style>
          </head>
          <body>
            <h1>Task Dependencies</h1>
            <p>${message}</p>
          </body>
          </html>
        `;
      case 'json':
        return JSON.stringify({ message, tasks: [] }, null, 2);
      case 'text':
      default:
        return `Task Dependencies:\n\n${message}`;
    }
  }
}
