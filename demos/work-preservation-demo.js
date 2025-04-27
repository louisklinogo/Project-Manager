/**
 * Work Preservation Demo
 * 
 * This script demonstrates the work preservation system in action.
 */

import fs from 'fs';
import path from 'path';
import { Task } from '../src/models/task.js';
import { TaskHierarchyManager } from '../src/utils/task-hierarchy-manager.js';
import { WorkPreservationManager } from '../src/utils/work-preservation.js';

// Create demo directory if it doesn't exist
const demoDir = path.join(process.cwd(), 'demos', 'output');
if (!fs.existsSync(demoDir)) {
  fs.mkdirSync(demoDir, { recursive: true });
}

// Helper function to save JSON to file
const saveToFile = (data, filename) => {
  const filePath = path.join(demoDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Saved to ${filePath}`);
};

// Helper function to log section headers
const logSection = (title) => {
  console.log('\n' + '='.repeat(80));
  console.log(`${title}`);
  console.log('='.repeat(80));
};

// Create sample tasks
const createSampleTasks = () => {
  logSection('Creating Sample Tasks');
  
  // Create parent task
  const parentTask = new Task({
    id: 'task-1',
    title: 'Implement Authentication System',
    description: 'Design and implement a secure authentication system',
    status: 'in-progress',
    priority: 'high',
    implementation_guide: 'Use JWT tokens for authentication and implement proper password hashing.'
  });
  
  // Create subtasks
  const subtask1 = new Task({
    id: 'task-1-1',
    title: 'Implement User Registration',
    description: 'Create user registration functionality',
    status: 'done',
    priority: 'high',
    parent_id: 'task-1',
    implementation_guide: 'Implement user registration with email verification. Use bcrypt for password hashing with a salt round of 10.',
    completion_percentage: 100
  });
  
  const subtask2 = new Task({
    id: 'task-1-2',
    title: 'Implement Login System',
    description: 'Create login functionality',
    status: 'done',
    priority: 'high',
    parent_id: 'task-1',
    implementation_guide: 'Implement login with JWT token generation. Use a token expiration of 24 hours.',
    completion_percentage: 100
  });
  
  const subtask3 = new Task({
    id: 'task-1-3',
    title: 'Implement Password Reset',
    description: 'Create password reset functionality',
    status: 'pending',
    priority: 'medium',
    parent_id: 'task-1',
    implementation_guide: 'Implement password reset with email verification.',
    completion_percentage: 0
  });
  
  // Create another parent task
  const parentTask2 = new Task({
    id: 'task-2',
    title: 'Implement User Profile System',
    description: 'Design and implement user profile management',
    status: 'pending',
    priority: 'medium',
    implementation_guide: 'Create a comprehensive user profile system with avatar support.'
  });
  
  // Add subtasks to parent tasks
  parentTask.subtasks = [subtask1, subtask2, subtask3];
  
  // Create task array
  const tasks = [parentTask, parentTask2];
  
  console.log('Created sample tasks:');
  console.log(`- ${parentTask.title} (${parentTask.status}) with ${parentTask.subtasks.length} subtasks`);
  console.log(`- ${parentTask2.title} (${parentTask2.status})`);
  
  // Save tasks to file
  saveToFile(tasks, 'original-tasks.json');
  
  return tasks;
};

// Demonstrate task completion history tracking
const demonstrateCompletionHistory = (tasks) => {
  logSection('Demonstrating Task Completion History Tracking');
  
  // Create task hierarchy manager
  const hierarchyManager = new TaskHierarchyManager({
    completedStatus: 'done',
    inProgressStatus: 'in-progress'
  });
  
  // Track completion history
  const tasksWithHistory = hierarchyManager.trackCompletionHistory(tasks);
  
  console.log('Added completion history to tasks:');
  
  // Find a completed task
  const completedTask = hierarchyManager.findTaskById(tasksWithHistory, 'task-1-1');
  
  if (completedTask) {
    console.log(`Task "${completedTask.title}" completion history:`);
    console.log(JSON.stringify(completedTask.completion_history, null, 2));
  }
  
  // Save tasks with history to file
  saveToFile(tasksWithHistory, 'tasks-with-history.json');
  
  return tasksWithHistory;
};

// Demonstrate locking completed tasks
const demonstrateLockingTasks = (tasks) => {
  logSection('Demonstrating Task Locking');
  
  // Create task hierarchy manager
  const hierarchyManager = new TaskHierarchyManager({
    completedStatus: 'done',
    inProgressStatus: 'in-progress'
  });
  
  // Lock completed tasks
  const lockedTasks = hierarchyManager.lockCompletedTasks(tasks);
  
  console.log('Locked completed tasks:');
  
  // Find a completed task
  const completedTask = hierarchyManager.findTaskById(lockedTasks, 'task-1-1');
  
  if (completedTask) {
    console.log(`Task "${completedTask.title}" is now ${completedTask.locked ? 'locked' : 'unlocked'}`);
    console.log(`Locked at: ${completedTask.locked_at}`);
    
    // Show notes
    if (completedTask.notes && completedTask.notes.length > 0) {
      console.log('Notes:');
      completedTask.notes.forEach(note => {
        console.log(`- [${note.type}] ${note.message} (${note.timestamp})`);
      });
    }
  }
  
  // Save locked tasks to file
  saveToFile(lockedTasks, 'locked-tasks.json');
  
  return lockedTasks;
};

// Demonstrate work preservation when updating tasks
const demonstrateWorkPreservation = (tasks) => {
  logSection('Demonstrating Work Preservation');
  
  // Create work preservation manager
  const workPreservationManager = new WorkPreservationManager({
    completedStatus: 'done'
  });
  
  // Create updated tasks (simulating changes from an AI or user)
  const updatedTasks = JSON.parse(JSON.stringify(tasks));
  
  // Find a completed task to modify
  const completedTaskIndex = updatedTasks.findIndex(task => 
    task.subtasks && task.subtasks.some(subtask => subtask.id === 'task-1-1')
  );
  
  if (completedTaskIndex !== -1) {
    const completedSubtaskIndex = updatedTasks[completedTaskIndex].subtasks.findIndex(
      subtask => subtask.id === 'task-1-1'
    );
    
    if (completedSubtaskIndex !== -1) {
      // Attempt to modify a completed task
      const originalImplementation = updatedTasks[completedTaskIndex].subtasks[completedSubtaskIndex].implementation_guide;
      
      updatedTasks[completedTaskIndex].subtasks[completedSubtaskIndex].implementation_guide = 
        'MODIFIED: Use Argon2 for password hashing instead of bcrypt for better security.';
      
      console.log('Attempted to modify a completed task:');
      console.log(`Original: ${originalImplementation}`);
      console.log(`Modified: ${updatedTasks[completedTaskIndex].subtasks[completedSubtaskIndex].implementation_guide}`);
      
      // Preserve completed work
      const preservedTasks = workPreservationManager.preserveCompletedWorkForTaskList(tasks, updatedTasks);
      
      // Check if the modification was preserved or reverted
      const preservedTask = preservedTasks.find(task => 
        task.subtasks && task.subtasks.some(subtask => subtask.id === 'task-1-1')
      );
      
      if (preservedTask) {
        const preservedSubtask = preservedTask.subtasks.find(subtask => subtask.id === 'task-1-1');
        
        if (preservedSubtask) {
          console.log('\nAfter work preservation:');
          console.log(`Preserved: ${preservedSubtask.implementation_guide}`);
          
          // Check if the original implementation was preserved
          if (preservedSubtask.implementation_guide === originalImplementation) {
            console.log('\n✅ Work preservation successful! The completed task was not modified.');
          } else {
            console.log('\n❌ Work preservation failed! The completed task was modified.');
          }
          
          // Check for preservation notes
          if (preservedSubtask.notes && preservedSubtask.notes.length > 0) {
            console.log('\nPreservation notes:');
            preservedSubtask.notes.forEach(note => {
              if (note.type === 'work_preservation') {
                console.log(`- ${note.message} (${note.timestamp})`);
              }
            });
          }
        }
      }
      
      // Save preserved tasks to file
      saveToFile(preservedTasks, 'preserved-tasks.json');
      
      return preservedTasks;
    }
  }
  
  console.log('No completed task found to demonstrate work preservation.');
  return tasks;
};

// Demonstrate generating context from completed work
const demonstrateContextGeneration = (tasks) => {
  logSection('Demonstrating Context Generation from Completed Work');
  
  // Create work preservation manager
  const workPreservationManager = new WorkPreservationManager({
    completedStatus: 'done'
  });
  
  // Generate context from completed work
  const context = workPreservationManager.generateContextFromCompletedWork(tasks);
  
  console.log('Generated context for AI prompts:');
  console.log(context);
  
  // Save context to file
  fs.writeFileSync(path.join(demoDir, 'completed-work-context.md'), context, 'utf8');
  console.log(`Saved context to ${path.join(demoDir, 'completed-work-context.md')}`);
  
  return context;
};

// Demonstrate validation of modifications to locked tasks
const demonstrateValidation = (tasks) => {
  logSection('Demonstrating Validation of Modifications to Locked Tasks');
  
  // Create task hierarchy manager
  const hierarchyManager = new TaskHierarchyManager({
    completedStatus: 'done',
    inProgressStatus: 'in-progress'
  });
  
  // Create modified tasks (simulating changes from an AI or user)
  const modifiedTasks = JSON.parse(JSON.stringify(tasks));
  
  // Find a locked task to modify
  const lockedTaskIndex = modifiedTasks.findIndex(task => 
    task.subtasks && task.subtasks.some(subtask => subtask.id === 'task-1-1' && subtask.locked)
  );
  
  if (lockedTaskIndex !== -1) {
    const lockedSubtaskIndex = modifiedTasks[lockedTaskIndex].subtasks.findIndex(
      subtask => subtask.id === 'task-1-1' && subtask.locked
    );
    
    if (lockedSubtaskIndex !== -1) {
      // Attempt to modify a locked task
      modifiedTasks[lockedTaskIndex].subtasks[lockedSubtaskIndex].implementation_guide = 
        'MODIFIED: Use Argon2 for password hashing instead of bcrypt for better security.';
      
      console.log('Attempted to modify a locked task');
      
      // Validate modifications
      const validationResult = hierarchyManager.validateModifications(tasks, modifiedTasks);
      
      console.log(`Validation result: ${validationResult.valid ? 'Valid' : 'Invalid'}`);
      
      if (!validationResult.valid && validationResult.issues.length > 0) {
        console.log('\nValidation issues:');
        validationResult.issues.forEach(issue => {
          console.log(`- [${issue.type}] ${issue.message}`);
        });
      }
      
      // Save validation result to file
      saveToFile(validationResult, 'validation-result.json');
      
      return validationResult;
    }
  }
  
  console.log('No locked task found to demonstrate validation.');
  return { valid: true, issues: [] };
};

// Run the demo
const runDemo = async () => {
  try {
    console.log('Starting Work Preservation Demo');
    
    // Create sample tasks
    const tasks = createSampleTasks();
    
    // Demonstrate completion history tracking
    const tasksWithHistory = demonstrateCompletionHistory(tasks);
    
    // Demonstrate locking completed tasks
    const lockedTasks = demonstrateLockingTasks(tasksWithHistory);
    
    // Demonstrate work preservation
    const preservedTasks = demonstrateWorkPreservation(lockedTasks);
    
    // Demonstrate context generation
    demonstrateContextGeneration(preservedTasks);
    
    // Demonstrate validation
    demonstrateValidation(preservedTasks);
    
    console.log('\nWork Preservation Demo completed successfully!');
    console.log(`Results saved to ${demoDir}`);
  } catch (error) {
    console.error('Error running demo:', error);
  }
};

// Run the demo
runDemo();
