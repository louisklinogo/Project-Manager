/**
 * Dependency Visualizer
 *
 * This module provides utilities for visualizing task dependencies.
 */

/**
 * Generate a Mermaid diagram for task dependencies
 * @param {Array} tasks - Array of tasks
 * @param {Array} dependencies - Array of dependencies
 * @returns {String} - Mermaid diagram
 */
export function generateMermaidDiagram(tasks, dependencies = []) {
  try {
    // Start the diagram
    let diagram = 'graph TD;\n';

    // Add nodes for each task
    tasks.forEach(task => {
      const taskId = task.id.replace ? task.id.replace(/-/g, '_') : task.id;
      const taskTitle = task.title.replace ? task.title.replace(/"/g, "'") : task.title;
      diagram += `  ${taskId}["${taskTitle}"];\n`;
    });

    // Add edges for dependencies
    dependencies.forEach(dep => {
      const sourceId = dep.source.replace ? dep.source.replace(/-/g, '_') : dep.source;
      const targetId = dep.target.replace ? dep.target.replace(/-/g, '_') : dep.target;
      diagram += `  ${sourceId} --> ${targetId};\n`;
    });

    // If no dependencies, create a simple linear flow
    if (dependencies.length === 0 && tasks.length > 1) {
      for (let i = 0; i < tasks.length - 1; i++) {
        const sourceId = tasks[i].id.replace ? tasks[i].id.replace(/-/g, '_') : tasks[i].id;
        const targetId = tasks[i + 1].id.replace ? tasks[i + 1].id.replace(/-/g, '_') : tasks[i + 1].id;
        diagram += `  ${sourceId} --> ${targetId};\n`;
      }
    }

    return diagram;
  } catch (error) {
    console.error('Error generating Mermaid diagram:', error);
    return 'graph TD;\n  error["Error generating diagram"];\n';
  }
}

/**
 * Dependency Visualizer class
 */
export class DependencyVisualizer {
  /**
   * Generate a Mermaid diagram for task dependencies
   * @param {Array} tasks - Array of tasks
   * @param {Array} dependencies - Array of dependencies
   * @returns {String} - Mermaid diagram
   */
  static generateMermaidDiagram(tasks, dependencies = []) {
    return generateMermaidDiagram(tasks, dependencies);
  }
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
      interactive: false,
      collapsible: false,
      theme: 'default',
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
      case 'mermaid':
        return this.generateMermaidVisualization(tasks, graph);
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
    // If interactive option is enabled, use Mermaid for visualization
    if (this.options.interactive) {
      return this.generateInteractiveHtmlVisualization(tasks, graph);
    }

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
   * Generate interactive HTML visualization using Mermaid
   * @param {Array} tasks - Tasks to visualize
   * @param {object} graph - Dependency graph
   * @returns {string} - Interactive HTML visualization
   * @private
   */
  generateInteractiveHtmlVisualization(tasks, graph) {
    // Generate Mermaid diagram definition
    let mermaidDefinition = 'flowchart TD\n';

    // Add nodes
    graph.nodes.forEach(node => {
      const isCircular = graph.circular.has(node.id);
      const style = isCircular ? 'fill:#FFEBEE,stroke:#D32F2F' :
                 (node.status === 'done' ? 'fill:#E8F5E9,stroke:#388E3C' :
                 (node.status === 'in-progress' ? 'fill:#E3F2FD,stroke:#1976D2' :
                 'fill:#F5F5F5,stroke:#9E9E9E'));

      // Create node with ID and label
      mermaidDefinition += `    ${node.id}["${node.id}: ${node.label}"]\n`;

      // Add styling
      mermaidDefinition += `    style ${node.id} ${style}\n`;
    });

    // Add edges
    graph.edges.forEach(edge => {
      const isCircular = graph.circular.has(edge.source) && graph.circular.has(edge.target);
      const style = isCircular ? 'stroke:#D32F2F,stroke-width:2px' : '';

      mermaidDefinition += `    ${edge.source} -->|depends on| ${edge.target}\n`;

      if (style) {
        // We need to track the linkStyle index, but this is simplified for now
        // In a real implementation, we would need to track the index of each link
        mermaidDefinition += `    linkStyle ${graph.edges.indexOf(edge)} ${style}\n`;
      }
    });

    // Generate task details for the sidebar
    const taskDetails = tasks.map(task => {
      const isCircular = graph.circular.has(task.id);
      const circularClass = isCircular ? 'circular-dependency' : '';

      return `
        <div id="task-${task.id}" class="task-detail ${circularClass}" style="display: none;">
          <h2>${task.id}: ${task.title}</h2>
          <div class="task-meta">
            <span class="status">Status: ${task.status}</span>
            <span class="priority">Priority: ${task.priority}</span>
            ${task.completion_percentage !== undefined ?
              `<span class="completion">Completion: ${task.completion_percentage}%</span>` : ''}
          </div>

          ${task.description ?
            `<div class="description">${task.description}</div>` : ''}

          <div class="dependencies">
            <h3>Dependencies</h3>
            <ul>
              ${task.dependencies && task.dependencies.length > 0 ?
                task.dependencies.map(depId => {
                  const depTask = tasks.find(t => t.id === depId);
                  const depName = depTask ? depTask.title : 'Unknown Task';
                  const isCircularDep = isCircular && graph.circular.has(depId);
                  const depClass = isCircularDep ? 'circular-dependency' : '';

                  return `<li class="${depClass}"><strong>${depId}</strong>: ${depName}</li>`;
                }).join('') :
                '<li>No dependencies</li>'}
            </ul>
          </div>

          <div class="dependents">
            <h3>Required By</h3>
            <ul>
              ${(() => {
                const dependentTasks = tasks.filter(t =>
                  t.dependencies && t.dependencies.includes(task.id)
                );

                if (dependentTasks.length > 0) {
                  return dependentTasks.map(depTask => {
                    const isCircularDep = isCircular && graph.circular.has(depTask.id);
                    const depClass = isCircularDep ? 'circular-dependency' : '';

                    return `<li class="${depClass}"><strong>${depTask.id}</strong>: ${depTask.title}</li>`;
                  }).join('');
                } else {
                  return '<li>Not required by any task</li>';
                }
              })()}
            </ul>
          </div>
        </div>
      `;
    }).join('');

    // Generate HTML with Mermaid
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Interactive Task Dependencies</title>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: #333;
            display: flex;
            flex-direction: column;
            height: 100vh;
          }
          header {
            background-color: #f5f5f5;
            padding: 10px 20px;
            border-bottom: 1px solid #ddd;
          }
          h1 {
            margin: 0;
            font-size: 1.5em;
          }
          .container {
            display: flex;
            flex: 1;
            overflow: hidden;
          }
          .graph-container {
            flex: 1;
            padding: 20px;
            overflow: auto;
          }
          .sidebar {
            width: 300px;
            background-color: #f9f9f9;
            border-left: 1px solid #ddd;
            padding: 20px;
            overflow: auto;
          }
          .task-detail {
            margin-bottom: 20px;
          }
          .task-meta {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
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
            border: 1px solid #eee;
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
            margin-top: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
          }
          .controls {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
          }
          button {
            padding: 5px 10px;
            margin-right: 5px;
            background-color: #e0e0e0;
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;
          }
          button:hover {
            background-color: #d0d0d0;
          }
          ${this.options.collapsible ? `
          .collapsible {
            cursor: pointer;
            padding: 10px;
            width: 100%;
            border: none;
            text-align: left;
            outline: none;
            font-size: 15px;
            background-color: #f1f1f1;
            margin-bottom: 5px;
          }
          .active, .collapsible:hover {
            background-color: #e0e0e0;
          }
          .content {
            padding: 0 18px;
            display: none;
            overflow: hidden;
            background-color: #f9f9f9;
          }
          ` : ''}
        </style>
      </head>
      <body>
        <header>
          <h1>Interactive Task Dependencies</h1>
        </header>

        <div class="container">
          <div class="graph-container">
            <div class="controls">
              <button id="zoom-in">Zoom In</button>
              <button id="zoom-out">Zoom Out</button>
              <button id="reset">Reset</button>
              ${this.options.collapsible ? '<button id="toggle-all">Expand/Collapse All</button>' : ''}
            </div>
            <div class="mermaid">${mermaidDefinition}</div>
          </div>

          <div class="sidebar">
            <h2>Task Details</h2>
            <p>Click on a task in the diagram to view its details.</p>
            ${taskDetails}

            <div class="legend">
              <h3>Legend</h3>
              <ul>
                <li><span style="color: #d32f2f;">Red</span>: Circular dependencies</li>
                <li><span style="color: #388E3C;">Green</span>: Completed tasks</li>
                <li><span style="color: #1976D2;">Blue</span>: In-progress tasks</li>
                <li><span style="color: #9E9E9E;">Gray</span>: Pending tasks</li>
              </ul>
            </div>
          </div>
        </div>

        <script>
          // Initialize Mermaid
          mermaid.initialize({
            startOnLoad: true,
            theme: '${this.options.theme}',
            securityLevel: 'loose',
            flowchart: {
              curve: 'basis'
            }
          });

          // Add click handlers after Mermaid renders
          document.addEventListener('DOMContentLoaded', function() {
            // Get all the task nodes
            const taskNodes = document.querySelectorAll('.mermaid g.node');

            // Add click handlers to each node
            taskNodes.forEach(node => {
              node.addEventListener('click', function() {
                // Get the task ID from the node
                const taskId = this.id.replace('flowchart-', '');

                // Hide all task details
                document.querySelectorAll('.task-detail').forEach(detail => {
                  detail.style.display = 'none';
                });

                // Show the selected task details
                const taskDetail = document.getElementById('task-' + taskId);
                if (taskDetail) {
                  taskDetail.style.display = 'block';
                }
              });
            });

            // Zoom controls
            let zoom = 1;
            const zoomStep = 0.1;
            const mermaidDiv = document.querySelector('.mermaid');

            document.getElementById('zoom-in').addEventListener('click', function() {
              zoom += zoomStep;
              mermaidDiv.style.transform = 'scale(' + zoom + ')';
            });

            document.getElementById('zoom-out').addEventListener('click', function() {
              if (zoom > zoomStep) {
                zoom -= zoomStep;
                mermaidDiv.style.transform = 'scale(' + zoom + ')';
              }
            });

            document.getElementById('reset').addEventListener('click', function() {
              zoom = 1;
              mermaidDiv.style.transform = 'scale(1)';
            });

            ${this.options.collapsible ? `
            // Collapsible sections
            const coll = document.getElementsByClassName("collapsible");
            for (let i = 0; i < coll.length; i++) {
              coll[i].addEventListener("click", function() {
                this.classList.toggle("active");
                const content = this.nextElementSibling;
                if (content.style.display === "block") {
                  content.style.display = "none";
                } else {
                  content.style.display = "block";
                }
              });
            }

            // Toggle all button
            document.getElementById('toggle-all').addEventListener('click', function() {
              const allCollapsible = document.getElementsByClassName("collapsible");
              const allExpanded = Array.from(allCollapsible).every(el => el.classList.contains("active"));

              for (let i = 0; i < allCollapsible.length; i++) {
                const content = allCollapsible[i].nextElementSibling;
                if (allExpanded) {
                  allCollapsible[i].classList.remove("active");
                  content.style.display = "none";
                } else {
                  allCollapsible[i].classList.add("active");
                  content.style.display = "block";
                }
              }
            });
            ` : ''}
          });
        </script>
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
   * Generate Mermaid visualization
   * @param {Array} tasks - Tasks to visualize
   * @param {object} graph - Dependency graph
   * @returns {string} - Mermaid visualization
   * @private
   */
  generateMermaidVisualization(tasks, graph) {
    // Start with the Mermaid flowchart definition
    const lines = ['```mermaid', 'flowchart TD'];

    // Add nodes
    graph.nodes.forEach(node => {
      const isCircular = graph.circular.has(node.id);
      const style = isCircular ? 'fill:#FFEBEE,stroke:#D32F2F' :
                   (node.status === 'done' ? 'fill:#E8F5E9,stroke:#388E3C' :
                   (node.status === 'in-progress' ? 'fill:#E3F2FD,stroke:#1976D2' :
                   'fill:#F5F5F5,stroke:#9E9E9E'));

      // Create node with ID and label
      lines.push(`    ${node.id}["${node.id}: ${node.label}"]`);

      // Add styling
      lines.push(`    style ${node.id} ${style}`);
    });

    // Add edges
    graph.edges.forEach(edge => {
      const isCircular = graph.circular.has(edge.source) && graph.circular.has(edge.target);
      const style = isCircular ? 'stroke:#D32F2F,stroke-width:2px' : '';

      if (style) {
        lines.push(`    ${edge.source} -->|depends on| ${edge.target}`);
        lines.push(`    linkStyle ${lines.length - 2} ${style}`);
      } else {
        lines.push(`    ${edge.source} -->|depends on| ${edge.target}`);
      }
    });

    // Add click interactions if enabled
    if (this.options.interactive) {
      graph.nodes.forEach(node => {
        lines.push(`    click ${node.id} callback "Task ${node.id}"`);
      });
    }

    // Close the Mermaid code block
    lines.push('```');

    // Add legend
    lines.push('\n### Legend');
    lines.push('- Red nodes and edges: Circular dependencies');
    lines.push('- Green nodes: Completed tasks');
    lines.push('- Blue nodes: In-progress tasks');
    lines.push('- Gray nodes: Pending tasks');

    return lines.join('\n');
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
      case 'mermaid':
        return `# Task Dependencies\n\n\`\`\`mermaid\nflowchart TD\n    A[${message}]\n\`\`\``;
      case 'json':
        return JSON.stringify({ message, tasks: [] }, null, 2);
      case 'text':
      default:
        return `Task Dependencies:\n\n${message}`;
    }
  }
}
