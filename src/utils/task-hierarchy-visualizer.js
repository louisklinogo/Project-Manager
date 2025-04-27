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
