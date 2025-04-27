/**
 * Work Preservation System
 * 
 * This module provides utilities for preserving completed work when updating tasks
 * and blueprints. It ensures that completed tasks are not modified or lost during
 * updates, and provides mechanisms for building upon existing work.
 */

import { Task } from '../models/task.js';

/**
 * Work Preservation Manager
 * Manages the preservation of completed work across task updates
 */
export class WorkPreservationManager {
  /**
   * Create a new work preservation manager
   * @param {object} options - Manager options
   */
  constructor(options = {}) {
    this.options = {
      completedStatus: options.completedStatus || 'done',
      preserveCompletedTasks: options.preserveCompletedTasks !== false,
      preserveCompletedSubtasks: options.preserveCompletedSubtasks !== false,
      trackHistory: options.trackHistory !== false,
      ...options
    };
  }

  /**
   * Create a snapshot of the current task state
   * @param {Task|object} task - Task to snapshot
   * @returns {object} - Task snapshot with timestamp
   */
  createSnapshot(task) {
    // Convert to plain object if it's a Task instance
    const taskData = task instanceof Task ? { ...task } : { ...task };
    
    // Add snapshot metadata
    return {
      data: taskData,
      timestamp: new Date().toISOString(),
      status: taskData.status,
      completion_percentage: taskData.completion_percentage || 0
    };
  }

  /**
   * Add completion history to a task
   * @param {Task} task - Task to update
   * @returns {Task} - Updated task with history
   */
  addCompletionHistory(task) {
    if (!task) return task;
    
    // Initialize history if it doesn't exist
    if (!task.completion_history) {
      task.completion_history = [];
    }
    
    // Add current state to history if status is completed
    if (task.status === this.options.completedStatus) {
      const snapshot = this.createSnapshot(task);
      
      // Only add if there's no existing snapshot with the same status
      const hasExistingSnapshot = task.completion_history.some(
        entry => entry.status === this.options.completedStatus
      );
      
      if (!hasExistingSnapshot) {
        task.completion_history.push(snapshot);
      }
    }
    
    return task;
  }

  /**
   * Check if a task is locked (completed and should not be modified)
   * @param {Task|object} task - Task to check
   * @returns {boolean} - Whether the task is locked
   */
  isTaskLocked(task) {
    if (!task) return false;
    if (!this.options.preserveCompletedTasks) return false;
    
    return task.status === this.options.completedStatus;
  }

  /**
   * Preserve completed work when updating a task
   * @param {Task|object} originalTask - Original task
   * @param {Task|object} updatedTask - Updated task
   * @returns {Task|object} - Merged task with preserved completed work
   */
  preserveCompletedWork(originalTask, updatedTask) {
    if (!originalTask || !updatedTask) return updatedTask;
    
    // Create copies to avoid modifying the originals
    const original = { ...originalTask };
    const updated = { ...updatedTask };
    
    // If the original task is completed and we're preserving completed tasks,
    // keep the original task's core implementation details
    if (this.isTaskLocked(original)) {
      // Keep the original implementation details
      updated.implementation_guide = original.implementation_guide;
      updated.status = original.status;
      updated.completion_percentage = original.completion_percentage || 100;
      
      // Add a note about preservation
      if (!updated.notes) updated.notes = [];
      updated.notes.push({
        type: 'work_preservation',
        timestamp: new Date().toISOString(),
        message: 'This task was previously completed. Original implementation details preserved.'
      });
    }
    
    // Handle subtasks if present
    if (original.subtasks && original.subtasks.length > 0 && 
        updated.subtasks && updated.subtasks.length > 0 &&
        this.options.preserveCompletedSubtasks) {
      
      // Create a map of original subtasks by ID for quick lookup
      const originalSubtasksMap = new Map();
      original.subtasks.forEach(subtask => {
        originalSubtasksMap.set(subtask.id, subtask);
      });
      
      // Preserve completed subtasks
      updated.subtasks = updated.subtasks.map(subtask => {
        const originalSubtask = originalSubtasksMap.get(subtask.id);
        
        // If there's a matching original subtask that's completed, preserve it
        if (originalSubtask && originalSubtask.status === this.options.completedStatus) {
          return {
            ...subtask,
            implementation_guide: originalSubtask.implementation_guide,
            status: originalSubtask.status,
            completion_percentage: originalSubtask.completion_percentage || 100,
            notes: [
              ...(subtask.notes || []),
              {
                type: 'work_preservation',
                timestamp: new Date().toISOString(),
                message: 'This subtask was previously completed. Original implementation details preserved.'
              }
            ]
          };
        }
        
        return subtask;
      });
    }
    
    return updated;
  }

  /**
   * Apply work preservation to a list of tasks
   * @param {Array} originalTasks - Original tasks
   * @param {Array} updatedTasks - Updated tasks
   * @returns {Array} - Merged tasks with preserved completed work
   */
  preserveCompletedWorkForTaskList(originalTasks, updatedTasks) {
    if (!originalTasks || !updatedTasks) return updatedTasks;
    
    // Create a map of original tasks by ID for quick lookup
    const originalTasksMap = new Map();
    originalTasks.forEach(task => {
      originalTasksMap.set(task.id, task);
    });
    
    // Preserve completed work for each task
    return updatedTasks.map(task => {
      const originalTask = originalTasksMap.get(task.id);
      
      // If there's a matching original task, preserve completed work
      if (originalTask) {
        return this.preserveCompletedWork(originalTask, task);
      }
      
      return task;
    });
  }

  /**
   * Extract knowledge from completed tasks to inform new work
   * @param {Array} tasks - Tasks to extract knowledge from
   * @returns {object} - Extracted knowledge
   */
  extractKnowledgeFromCompletedTasks(tasks) {
    if (!tasks || tasks.length === 0) return { completedTasks: [], insights: [] };
    
    // Filter completed tasks
    const completedTasks = tasks.filter(task => 
      task.status === this.options.completedStatus
    );
    
    // Extract key information
    const knowledge = {
      completedTasks: completedTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        implementation_guide: task.implementation_guide,
        completion_percentage: task.completion_percentage || 100
      })),
      insights: []
    };
    
    // Extract insights from completed tasks
    if (completedTasks.length > 0) {
      knowledge.insights.push({
        type: 'completion_summary',
        message: `${completedTasks.length} tasks have been completed.`
      });
      
      // Add more specific insights based on completed tasks
      // This could be expanded with more sophisticated analysis
      const hasSubtasks = completedTasks.some(task => 
        task.subtasks && task.subtasks.length > 0
      );
      
      if (hasSubtasks) {
        knowledge.insights.push({
          type: 'structure_insight',
          message: 'The project uses hierarchical task structures with subtasks.'
        });
      }
    }
    
    return knowledge;
  }

  /**
   * Generate context for building upon completed work
   * @param {Array} tasks - Tasks to generate context from
   * @returns {string} - Context for AI prompts
   */
  generateContextFromCompletedWork(tasks) {
    const knowledge = this.extractKnowledgeFromCompletedTasks(tasks);
    
    if (knowledge.completedTasks.length === 0) {
      return 'No completed tasks found. You are starting with a clean slate.';
    }
    
    // Generate context
    let context = `## Completed Work Summary\n\n`;
    context += `${knowledge.completedTasks.length} tasks have been completed:\n\n`;
    
    // Add details for each completed task
    knowledge.completedTasks.forEach(task => {
      context += `### ${task.title} (${task.id})\n`;
      context += `${task.description}\n\n`;
      
      // Add implementation details if available
      if (task.implementation_guide) {
        context += `**Implementation:**\n${task.implementation_guide.substring(0, 200)}${task.implementation_guide.length > 200 ? '...' : ''}\n\n`;
      }
    });
    
    // Add insights
    if (knowledge.insights.length > 0) {
      context += `## Insights\n\n`;
      knowledge.insights.forEach(insight => {
        context += `- ${insight.message}\n`;
      });
    }
    
    // Add guidance for building upon completed work
    context += `\n## Guidance for Building Upon Completed Work\n\n`;
    context += `- Preserve the functionality and approach of completed tasks\n`;
    context += `- Ensure new work is compatible with existing implementations\n`;
    context += `- Reference completed tasks when designing related functionality\n`;
    context += `- Maintain consistent coding patterns and architectural decisions\n`;
    
    return context;
  }

  /**
   * Lock a task to prevent modifications
   * @param {Task} task - Task to lock
   * @returns {Task} - Locked task
   */
  lockTask(task) {
    if (!task) return task;
    
    // Create a new task instance if needed
    const taskInstance = task instanceof Task ? task : new Task(task);
    
    // Set the locked flag
    taskInstance.locked = true;
    taskInstance.locked_at = new Date().toISOString();
    
    // Add a note about locking
    if (!taskInstance.notes) taskInstance.notes = [];
    taskInstance.notes.push({
      type: 'task_locked',
      timestamp: new Date().toISOString(),
      message: 'This task has been locked to prevent modifications.'
    });
    
    return taskInstance;
  }

  /**
   * Unlock a task to allow modifications
   * @param {Task} task - Task to unlock
   * @returns {Task} - Unlocked task
   */
  unlockTask(task) {
    if (!task) return task;
    
    // Create a new task instance if needed
    const taskInstance = task instanceof Task ? task : new Task(task);
    
    // Remove the locked flag
    taskInstance.locked = false;
    taskInstance.locked_at = null;
    
    // Add a note about unlocking
    if (!taskInstance.notes) taskInstance.notes = [];
    taskInstance.notes.push({
      type: 'task_unlocked',
      timestamp: new Date().toISOString(),
      message: 'This task has been unlocked to allow modifications.'
    });
    
    return taskInstance;
  }
}

// Export a default instance with standard options
export default new WorkPreservationManager();
