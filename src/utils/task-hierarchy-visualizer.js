/**
 * Task Hierarchy Visualizer
 *
 * This module provides utilities for visualizing task hierarchies.
 */

/**
 * Task Hierarchy Visualizer class
 */
export class TaskHierarchyVisualizer {
  /**
   * Create a new task hierarchy visualizer
   * @param {object} options - Visualization options
   */
  constructor(options = {}) {
    this.options = {
      indentSize: options.indentSize || 2,
      showStatus: options.showStatus !== false,
      showPriority: options.showPriority !== false,
      showCompletionPercentage: options.showCompletionPercentage !== false,
      showDependencies: options.showDependencies !== false,
      highlightCircularDependencies: options.highlightCircularDependencies !== false,
      showDependencyGraph: options.showDependencyGraph || false,
      format: options.format || 'text',
      ...options
    };
  }

  /**
   * Generate a text representation of a task hierarchy
   * @param {Array} tasks - Tasks to visualize
   * @returns {string} - Text representation
   */
  generateTextHierarchy(tasks) {
    if (!tasks || tasks.length === 0) {
      return 'No tasks';
    }

    // Find top-level tasks (no parent_id)
    const topLevelTasks = tasks.filter(task => !task.parent_id);

    // Generate the hierarchy
    let result = '';

    topLevelTasks.forEach(task => {
      result += this._generateTaskText(task, tasks, 0);
    });

    return result;
  }

  /**
   * Generate a Markdown representation of a task hierarchy
   * @param {Array} tasks - Tasks to visualize
   * @returns {string} - Markdown representation
   */
  generateMarkdownHierarchy(tasks) {
    if (!tasks || tasks.length === 0) {
      return '# No tasks';
    }

    // Find top-level tasks (no parent_id)
    const topLevelTasks = tasks.filter(task => !task.parent_id);

    // Generate the hierarchy
    let result = '# Task Hierarchy\n\n';

    topLevelTasks.forEach(task => {
      result += this._generateTaskMarkdown(task, tasks, 0);
    });

    return result;
  }

  /**
   * Generate an HTML representation of a task hierarchy
   * @param {Array} tasks - Tasks to visualize
   * @returns {string} - HTML representation
   */
  generateHTMLHierarchy(tasks) {
    if (!tasks || tasks.length === 0) {
      return '<div class="task-hierarchy"><p>No tasks</p></div>';
    }

    // Find top-level tasks (no parent_id)
    const topLevelTasks = tasks.filter(task => !task.parent_id);

    // Generate the hierarchy
    let result = '<div class="task-hierarchy">\n';
    result += '<ul class="task-list">\n';

    topLevelTasks.forEach(task => {
      result += this._generateTaskHTML(task, tasks, 1);
    });

    result += '</ul>\n';
    result += '</div>';

    return result;
  }

  /**
   * Generate a JSON representation of a task hierarchy
   * @param {Array} tasks - Tasks to visualize
   * @returns {object} - JSON representation
   */
  generateJSONHierarchy(tasks) {
    if (!tasks || tasks.length === 0) {
      return { tasks: [] };
    }

    // Find top-level tasks (no parent_id)
    const topLevelTasks = tasks.filter(task => !task.parent_id);

    // Generate the hierarchy
    const result = {
      tasks: topLevelTasks.map(task => this._generateTaskJSON(task, tasks))
    };

    return result;
  }

  /**
   * Visualize a task hierarchy
   * @param {Array} tasks - Tasks to visualize
   * @returns {string|object} - Visualization result
   */
  visualize(tasks) {
    // If dependency graph is enabled, add it to the visualization
    if (this.options.showDependencyGraph) {
      const dependencyGraph = this.generateDependencyGraph(tasks);

      switch (this.options.format.toLowerCase()) {
        case 'text':
          return this.generateTextHierarchy(tasks) + '\n\n' + dependencyGraph;
        case 'markdown':
          return this.generateMarkdownHierarchy(tasks) + '\n\n' + dependencyGraph;
        case 'html':
          return this.generateHTMLHierarchy(tasks) + this.generateHTMLDependencyGraph(tasks);
        case 'json':
          const jsonResult = this.generateJSONHierarchy(tasks);
          jsonResult.dependencyGraph = this.generateJSONDependencyGraph(tasks);
          return jsonResult;
        default:
          return this.generateTextHierarchy(tasks) + '\n\n' + dependencyGraph;
      }
    }

    // Otherwise, just return the regular hierarchy
    switch (this.options.format.toLowerCase()) {
      case 'text':
        return this.generateTextHierarchy(tasks);
      case 'markdown':
        return this.generateMarkdownHierarchy(tasks);
      case 'html':
        return this.generateHTMLHierarchy(tasks);
      case 'json':
        return this.generateJSONHierarchy(tasks);
      default:
        return this.generateTextHierarchy(tasks);
    }
  }

  /**
   * Generate a dependency graph visualization
   * @param {Array} tasks - Tasks to visualize
   * @returns {string} - Text representation of the dependency graph
   */
  generateDependencyGraph(tasks) {
    if (!tasks || tasks.length === 0) {
      return 'No tasks';
    }

    // Flatten the hierarchy for easier graph generation
    const flatTasks = this._flattenHierarchy(tasks);

    // Find circular dependencies if highlighting is enabled
    const circularDependencies = new Set();
    if (this.options.highlightCircularDependencies) {
      this._findCircularDependencies(flatTasks, circularDependencies);
    }

    // Generate the graph
    let result = 'Dependency Graph:\n\n';

    flatTasks.forEach(task => {
      const isCircular = circularDependencies.has(task.id);
      const prefix = isCircular ? '! ' : '  ';

      result += `${prefix}${task.id}: ${task.title}\n`;

      // Show dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const depTask = flatTasks.find(t => t.id === depId);
          const depName = depTask ? depTask.title : 'Unknown Task';
          const isCircularDep = isCircular && circularDependencies.has(depId);
          const depPrefix = isCircularDep ? '! ' : '  ';

          result += `${depPrefix}  ↳ Depends on: ${depId} (${depName})\n`;
        });
      }

      // Show dependent tasks
      const dependentTasks = flatTasks.filter(t =>
        t.dependencies && t.dependencies.includes(task.id)
      );

      if (dependentTasks.length > 0) {
        result += '    Required by:\n';
        dependentTasks.forEach(depTask => {
          const isCircularDep = isCircular && circularDependencies.has(depTask.id);
          const depPrefix = isCircularDep ? '! ' : '  ';

          result += `${depPrefix}  ↳ ${depTask.id} (${depTask.title})\n`;
        });
      }

      result += '\n';
    });

    // Add legend if circular dependencies are highlighted
    if (this.options.highlightCircularDependencies) {
      result += 'Legend:\n';
      result += '! - Task involved in circular dependency\n';
    }

    return result;
  }

  /**
   * Generate an HTML dependency graph visualization
   * @param {Array} tasks - Tasks to visualize
   * @returns {string} - HTML representation of the dependency graph
   */
  generateHTMLDependencyGraph(tasks) {
    if (!tasks || tasks.length === 0) {
      return '<div class="dependency-graph"><p>No tasks</p></div>';
    }

    // Flatten the hierarchy for easier graph generation
    const flatTasks = this._flattenHierarchy(tasks);

    // Find circular dependencies if highlighting is enabled
    const circularDependencies = new Set();
    if (this.options.highlightCircularDependencies) {
      this._findCircularDependencies(flatTasks, circularDependencies);
    }

    // Generate the graph
    let result = '<div class="dependency-graph">\n';
    result += '<h2>Dependency Graph</h2>\n';
    result += '<ul class="dependency-list">\n';

    flatTasks.forEach(task => {
      const isCircular = circularDependencies.has(task.id);
      const circularClass = isCircular ? 'circular-dependency' : '';

      result += `<li class="dependency-item ${circularClass}">\n`;
      result += `<div class="dependency-header">\n`;
      result += `<span class="dependency-title">${this._escapeHTML(task.id)}: ${this._escapeHTML(task.title)}</span>\n`;
      result += `</div>\n`;

      // Show dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        result += '<div class="depends-on">\n';
        result += '<h4>Depends On:</h4>\n';
        result += '<ul>\n';

        task.dependencies.forEach(depId => {
          const depTask = flatTasks.find(t => t.id === depId);
          const depName = depTask ? depTask.title : 'Unknown Task';
          const isCircularDep = isCircular && circularDependencies.has(depId);
          const depClass = isCircularDep ? 'circular-dependency' : '';

          result += `<li class="${depClass}">${this._escapeHTML(depId)}: ${this._escapeHTML(depName)}</li>\n`;
        });

        result += '</ul>\n';
        result += '</div>\n';
      }

      // Show dependent tasks
      const dependentTasks = flatTasks.filter(t =>
        t.dependencies && t.dependencies.includes(task.id)
      );

      if (dependentTasks.length > 0) {
        result += '<div class="required-by">\n';
        result += '<h4>Required By:</h4>\n';
        result += '<ul>\n';

        dependentTasks.forEach(depTask => {
          const isCircularDep = isCircular && circularDependencies.has(depTask.id);
          const depClass = isCircularDep ? 'circular-dependency' : '';

          result += `<li class="${depClass}">${this._escapeHTML(depTask.id)}: ${this._escapeHTML(depTask.title)}</li>\n`;
        });

        result += '</ul>\n';
        result += '</div>\n';
      }

      result += '</li>\n';
    });

    result += '</ul>\n';

    // Add legend if circular dependencies are highlighted
    if (this.options.highlightCircularDependencies) {
      result += '<div class="legend">\n';
      result += '<h3>Legend</h3>\n';
      result += '<p><span class="circular-dependency">Highlighted</span> - Task involved in circular dependency</p>\n';
      result += '</div>\n';
    }

    result += '</div>\n';

    return result;
  }

  /**
   * Generate a JSON dependency graph
   * @param {Array} tasks - Tasks to visualize
   * @returns {object} - JSON representation of the dependency graph
   */
  generateJSONDependencyGraph(tasks) {
    if (!tasks || tasks.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Flatten the hierarchy for easier graph generation
    const flatTasks = this._flattenHierarchy(tasks);

    // Find circular dependencies if highlighting is enabled
    const circularDependencies = new Set();
    if (this.options.highlightCircularDependencies) {
      this._findCircularDependencies(flatTasks, circularDependencies);
    }

    // Generate the graph
    const nodes = flatTasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      completion_percentage: task.completion_percentage,
      has_circular_dependency: circularDependencies.has(task.id)
    }));

    const edges = [];
    flatTasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          edges.push({
            source: depId,
            target: task.id,
            is_circular: circularDependencies.has(depId) && circularDependencies.has(task.id)
          });
        });
      }
    });

    return { nodes, edges };
  }

  /**
   * Flatten a task hierarchy
   * @private
   * @param {Array} tasks - Tasks to flatten
   * @returns {Array} - Flattened tasks
   */
  _flattenHierarchy(tasks) {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    const result = [];

    const flattenTask = (task) => {
      const { subtasks, ...taskWithoutSubtasks } = task;
      result.push(taskWithoutSubtasks);

      if (subtasks && subtasks.length > 0) {
        subtasks.forEach(subtask => flattenTask(subtask));
      }
    };

    tasks.forEach(task => flattenTask(task));

    return result;
  }

  /**
   * Find circular dependencies in tasks
   * @private
   * @param {Array} tasks - Tasks to check
   * @param {Set} circularDependencies - Set to store circular dependencies
   */
  _findCircularDependencies(tasks, circularDependencies) {
    const visited = new Map();
    const recStack = new Map();

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
          cycle.forEach(id => circularDependencies.add(id));
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
   * Generate text representation of a task
   * @private
   * @param {object} task - Task to visualize
   * @param {Array} allTasks - All tasks
   * @param {number} depth - Current depth
   * @returns {string} - Text representation
   */
  _generateTaskText(task, allTasks, depth) {
    const indent = ' '.repeat(depth * this.options.indentSize);
    let result = `${indent}${task.title}`;

    // Add status if enabled
    if (this.options.showStatus && task.status) {
      result += ` [${task.status}]`;
    }

    // Add priority if enabled
    if (this.options.showPriority && task.priority) {
      result += ` (${task.priority})`;
    }

    // Add completion percentage if enabled
    if (this.options.showCompletionPercentage && task.completion_percentage !== undefined) {
      result += ` - ${task.completion_percentage}%`;
    }

    result += '\n';

    // Add dependencies if enabled
    if (this.options.showDependencies && task.dependencies && task.dependencies.length > 0) {
      const dependencyTasks = allTasks.filter(t => task.dependencies.includes(t.id));
      if (dependencyTasks.length > 0) {
        result += `${indent}  Dependencies: ${dependencyTasks.map(t => t.title).join(', ')}\n`;
      }
    }

    // Add subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => {
        result += this._generateTaskText(subtask, allTasks, depth + 1);
      });
    }

    return result;
  }

  /**
   * Generate Markdown representation of a task
   * @private
   * @param {object} task - Task to visualize
   * @param {Array} allTasks - All tasks
   * @param {number} depth - Current depth
   * @returns {string} - Markdown representation
   */
  _generateTaskMarkdown(task, allTasks, depth) {
    const heading = '#'.repeat(Math.min(depth + 2, 6));
    let result = `${heading} ${task.title}`;

    // Add status if enabled
    if (this.options.showStatus && task.status) {
      result += ` \`${task.status}\``;
    }

    // Add priority if enabled
    if (this.options.showPriority && task.priority) {
      result += ` *${task.priority}*`;
    }

    result += '\n\n';

    // Add description if available
    if (task.description) {
      result += `${task.description}\n\n`;
    }

    // Add completion percentage if enabled
    if (this.options.showCompletionPercentage && task.completion_percentage !== undefined) {
      result += `**Completion:** ${task.completion_percentage}%\n\n`;
    }

    // Add dependencies if enabled
    if (this.options.showDependencies && task.dependencies && task.dependencies.length > 0) {
      const dependencyTasks = allTasks.filter(t => task.dependencies.includes(t.id));
      if (dependencyTasks.length > 0) {
        result += '**Dependencies:**\n\n';
        dependencyTasks.forEach(depTask => {
          result += `- ${depTask.title}\n`;
        });
        result += '\n';
      }
    }

    // Add subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => {
        result += this._generateTaskMarkdown(subtask, allTasks, depth + 1);
      });
    }

    return result;
  }

  /**
   * Generate HTML representation of a task
   * @private
   * @param {object} task - Task to visualize
   * @param {Array} allTasks - All tasks
   * @param {number} depth - Current depth
   * @returns {string} - HTML representation
   */
  _generateTaskHTML(task, allTasks, depth) {
    let result = '<li class="task-item">\n';

    // Add task title and details
    result += `<div class="task-header">\n`;
    result += `<span class="task-title">${this._escapeHTML(task.title)}</span>\n`;

    // Add status if enabled
    if (this.options.showStatus && task.status) {
      result += `<span class="task-status ${task.status}">${this._escapeHTML(task.status)}</span>\n`;
    }

    // Add priority if enabled
    if (this.options.showPriority && task.priority) {
      result += `<span class="task-priority ${task.priority}">${this._escapeHTML(task.priority)}</span>\n`;
    }

    // Add completion percentage if enabled
    if (this.options.showCompletionPercentage && task.completion_percentage !== undefined) {
      result += `<div class="task-progress">\n`;
      result += `<div class="progress-bar" style="width: ${task.completion_percentage}%"></div>\n`;
      result += `<span class="progress-text">${task.completion_percentage}%</span>\n`;
      result += `</div>\n`;
    }

    result += `</div>\n`;

    // Add description if available
    if (task.description) {
      result += `<div class="task-description">${this._escapeHTML(task.description)}</div>\n`;
    }

    // Add dependencies if enabled
    if (this.options.showDependencies && task.dependencies && task.dependencies.length > 0) {
      const dependencyTasks = allTasks.filter(t => task.dependencies.includes(t.id));
      if (dependencyTasks.length > 0) {
        result += '<div class="task-dependencies">\n';
        result += '<span class="dependencies-label">Dependencies:</span>\n';
        result += '<ul class="dependencies-list">\n';
        dependencyTasks.forEach(depTask => {
          result += `<li>${this._escapeHTML(depTask.title)}</li>\n`;
        });
        result += '</ul>\n';
        result += '</div>\n';
      }
    }

    // Add subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      result += '<ul class="subtask-list">\n';
      task.subtasks.forEach(subtask => {
        result += this._generateTaskHTML(subtask, allTasks, depth + 1);
      });
      result += '</ul>\n';
    }

    result += '</li>\n';

    return result;
  }

  /**
   * Generate JSON representation of a task
   * @private
   * @param {object} task - Task to visualize
   * @param {Array} allTasks - All tasks
   * @returns {object} - JSON representation
   */
  _generateTaskJSON(task, allTasks) {
    const result = {
      id: task.id,
      title: task.title
    };

    // Add description if available
    if (task.description) {
      result.description = task.description;
    }

    // Add status if enabled
    if (this.options.showStatus && task.status) {
      result.status = task.status;
    }

    // Add priority if enabled
    if (this.options.showPriority && task.priority) {
      result.priority = task.priority;
    }

    // Add completion percentage if enabled
    if (this.options.showCompletionPercentage && task.completion_percentage !== undefined) {
      result.completion_percentage = task.completion_percentage;
    }

    // Add dependencies if enabled
    if (this.options.showDependencies && task.dependencies && task.dependencies.length > 0) {
      const dependencyTasks = allTasks.filter(t => task.dependencies.includes(t.id));
      if (dependencyTasks.length > 0) {
        result.dependencies = dependencyTasks.map(depTask => ({
          id: depTask.id,
          title: depTask.title
        }));
      }
    }

    // Add subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      result.subtasks = task.subtasks.map(subtask => this._generateTaskJSON(subtask, allTasks));
    }

    return result;
  }

  /**
   * Escape HTML special characters
   * @private
   * @param {string} str - String to escape
   * @returns {string} - Escaped string
   */
  _escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
