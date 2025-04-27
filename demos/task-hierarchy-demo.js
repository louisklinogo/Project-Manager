/**
 * Task Hierarchy Demonstration
 * 
 * This script demonstrates the task hierarchy functionality in a real-world scenario.
 * It creates a sample project with tasks and subtasks, manipulates the hierarchy,
 * and visualizes the results.
 */

import { Task } from '../src/models/task.js';
import { TaskHierarchyManager } from '../src/utils/task-hierarchy-manager.js';
import { TaskHierarchyVisualizer } from '../src/utils/task-hierarchy-visualizer.js';

// Create a task hierarchy manager and visualizer
const manager = new TaskHierarchyManager();
const visualizer = new TaskHierarchyVisualizer({ format: 'markdown' });

// Create a sample project with tasks
console.log('Creating sample project with tasks...\n');

// Create main tasks
const setupTask = new Task({
  id: 'task-1',
  title: 'Project Setup',
  description: 'Set up the initial project structure and dependencies',
  status: 'done',
  priority: 'high'
});

const backendTask = new Task({
  id: 'task-2',
  title: 'Backend Development',
  description: 'Implement the backend services and APIs',
  status: 'in-progress',
  priority: 'high',
  dependencies: ['task-1']
});

const frontendTask = new Task({
  id: 'task-3',
  title: 'Frontend Development',
  description: 'Implement the frontend UI and components',
  status: 'in-progress',
  priority: 'medium',
  dependencies: ['task-1']
});

const testingTask = new Task({
  id: 'task-4',
  title: 'Testing',
  description: 'Test the application functionality and performance',
  status: 'pending',
  priority: 'medium',
  dependencies: ['task-2', 'task-3']
});

const deploymentTask = new Task({
  id: 'task-5',
  title: 'Deployment',
  description: 'Deploy the application to production',
  status: 'pending',
  priority: 'low',
  dependencies: ['task-4']
});

// Create subtasks for backend development
backendTask.createSubtask({
  id: 'subtask-1',
  title: 'Database Setup',
  description: 'Set up the database schema and migrations',
  status: 'done'
});

backendTask.createSubtask({
  id: 'subtask-2',
  title: 'API Development',
  description: 'Implement the REST APIs',
  status: 'in-progress'
});

backendTask.createSubtask({
  id: 'subtask-3',
  title: 'Authentication',
  description: 'Implement user authentication and authorization',
  status: 'pending'
});

// Create subtasks for frontend development
frontendTask.createSubtask({
  id: 'subtask-4',
  title: 'UI Components',
  description: 'Develop reusable UI components',
  status: 'done'
});

frontendTask.createSubtask({
  id: 'subtask-5',
  title: 'State Management',
  description: 'Implement application state management',
  status: 'in-progress'
});

frontendTask.createSubtask({
  id: 'subtask-6',
  title: 'Responsive Design',
  description: 'Ensure the UI is responsive on all devices',
  status: 'pending'
});

// Create a flat list of tasks
const tasks = [setupTask, backendTask, frontendTask, testingTask, deploymentTask];

// Build the task hierarchy
console.log('Building task hierarchy...\n');
const hierarchy = manager.buildHierarchy(tasks);

// Visualize the initial hierarchy
console.log('Initial Task Hierarchy:');
console.log(visualizer.visualize(hierarchy));

// Update task statuses based on subtasks
console.log('\nUpdating task statuses based on subtasks...\n');
const updatedTasks = manager.updateTaskStatuses(tasks);

// Update task completion percentages
console.log('Updating task completion percentages...\n');
const tasksWithCompletion = manager.updateTaskCompletionPercentages(updatedTasks);

// Visualize the updated hierarchy
console.log('Updated Task Hierarchy with Status and Completion:');
const updatedHierarchy = manager.buildHierarchy(tasksWithCompletion);
console.log(visualizer.visualize(updatedHierarchy));

// Find tasks by criteria
console.log('\nFinding in-progress tasks...\n');
const inProgressTasks = manager.findTasks(tasksWithCompletion, { status: 'in-progress' });
console.log(`Found ${inProgressTasks.length} in-progress tasks:`);
inProgressTasks.forEach(task => {
  console.log(`- ${task.title} (${task.completion_percentage}% complete)`);
});

// Move a task to a different parent
console.log('\nMoving "Testing" task to be a subtask of "Backend Development"...\n');
const reorganizedTasks = manager.moveTask(tasksWithCompletion, 'task-4', 'task-2');
const reorganizedHierarchy = manager.buildHierarchy(reorganizedTasks);

// Visualize the reorganized hierarchy
console.log('Reorganized Task Hierarchy:');
console.log(visualizer.visualize(reorganizedHierarchy));

// Find the critical path
console.log('\nFinding the critical path...\n');
const criticalPath = manager.getCriticalPath(reorganizedTasks);
console.log('Critical Path:');
criticalPath.forEach(task => {
  console.log(`- ${task.title}`);
});

// Demonstrate task path
console.log('\nTask Paths:\n');
reorganizedTasks.forEach(task => {
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach(subtask => {
      const path = manager.getTaskPathString({ ...subtask, parent_id: task.id }, reorganizedTasks);
      console.log(`${subtask.title}: ${path}`);
    });
  }
});

// Export tasks as JSON
console.log('\nExporting tasks as JSON...\n');
const jsonVisualizer = new TaskHierarchyVisualizer({ format: 'json' });
const jsonOutput = jsonVisualizer.visualize(reorganizedHierarchy);
console.log('Task hierarchy exported as JSON structure');

// Demonstrate different visualization formats
console.log('\nDemonstrating different visualization formats...\n');

// Text format
const textVisualizer = new TaskHierarchyVisualizer({ format: 'text' });
console.log('Text Format Example:');
console.log(textVisualizer.visualize([reorganizedHierarchy[0]]));

// HTML format
const htmlVisualizer = new TaskHierarchyVisualizer({ format: 'html' });
console.log('\nHTML Format Example (truncated):');
const htmlOutput = htmlVisualizer.visualize([reorganizedHierarchy[0]]);
console.log(htmlOutput.substring(0, 500) + '...');

console.log('\nTask Hierarchy Demonstration Complete!');
