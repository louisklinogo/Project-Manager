/**
 * Work Preservation System Tests
 */

import { jest } from '@jest/globals';
import { Task } from '../../../src/models/task.js';
import { WorkPreservationManager } from '../../../src/utils/work-preservation.js';

describe('WorkPreservationManager', () => {
  let workPreservationManager;
  
  beforeEach(() => {
    workPreservationManager = new WorkPreservationManager({
      completedStatus: 'done'
    });
  });
  
  describe('createSnapshot', () => {
    test('should create a snapshot of a task', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'done',
        completion_percentage: 100
      });
      
      // Act
      const snapshot = workPreservationManager.createSnapshot(task);
      
      // Assert
      expect(snapshot).toHaveProperty('data');
      expect(snapshot).toHaveProperty('timestamp');
      expect(snapshot).toHaveProperty('status', 'done');
      expect(snapshot).toHaveProperty('completion_percentage', 100);
      expect(snapshot.data.id).toBe('task-1');
      expect(snapshot.data.title).toBe('Test Task');
    });
    
    test('should work with plain objects', () => {
      // Arrange
      const task = {
        id: 'task-1',
        title: 'Test Task',
        status: 'done',
        completion_percentage: 100
      };
      
      // Act
      const snapshot = workPreservationManager.createSnapshot(task);
      
      // Assert
      expect(snapshot).toHaveProperty('data');
      expect(snapshot.data.id).toBe('task-1');
    });
  });
  
  describe('addCompletionHistory', () => {
    test('should add completion history to a completed task', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'done',
        completion_percentage: 100
      });
      
      // Act
      const updatedTask = workPreservationManager.addCompletionHistory(task);
      
      // Assert
      expect(updatedTask.completion_history).toBeDefined();
      expect(updatedTask.completion_history.length).toBe(1);
      expect(updatedTask.completion_history[0].status).toBe('done');
    });
    
    test('should not add completion history to a non-completed task', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'pending',
        completion_percentage: 0
      });
      
      // Act
      const updatedTask = workPreservationManager.addCompletionHistory(task);
      
      // Assert
      expect(updatedTask.completion_history).toBeDefined();
      expect(updatedTask.completion_history.length).toBe(0);
    });
    
    test('should not add duplicate completion history entries', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'done',
        completion_percentage: 100,
        completion_history: [
          {
            timestamp: '2023-01-01T00:00:00.000Z',
            status: 'done',
            completion_percentage: 100
          }
        ]
      });
      
      // Act
      const updatedTask = workPreservationManager.addCompletionHistory(task);
      
      // Assert
      expect(updatedTask.completion_history.length).toBe(1);
    });
  });
  
  describe('isTaskLocked', () => {
    test('should return true for completed tasks when preservation is enabled', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'done'
      });
      
      // Act
      const isLocked = workPreservationManager.isTaskLocked(task);
      
      // Assert
      expect(isLocked).toBe(true);
    });
    
    test('should return false for non-completed tasks', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'pending'
      });
      
      // Act
      const isLocked = workPreservationManager.isTaskLocked(task);
      
      // Assert
      expect(isLocked).toBe(false);
    });
    
    test('should return false when preservation is disabled', () => {
      // Arrange
      const manager = new WorkPreservationManager({
        preserveCompletedTasks: false
      });
      
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'done'
      });
      
      // Act
      const isLocked = manager.isTaskLocked(task);
      
      // Assert
      expect(isLocked).toBe(false);
    });
  });
  
  describe('preserveCompletedWork', () => {
    test('should preserve implementation details of completed tasks', () => {
      // Arrange
      const originalTask = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'done',
        implementation_guide: 'Original implementation',
        completion_percentage: 100
      });
      
      const updatedTask = new Task({
        id: 'task-1',
        title: 'Updated Test Task',
        status: 'done',
        implementation_guide: 'Updated implementation',
        completion_percentage: 80
      });
      
      // Act
      const preservedTask = workPreservationManager.preserveCompletedWork(originalTask, updatedTask);
      
      // Assert
      expect(preservedTask.title).toBe('Updated Test Task'); // Non-protected field should be updated
      expect(preservedTask.implementation_guide).toBe('Original implementation'); // Protected field should be preserved
      expect(preservedTask.status).toBe('done'); // Protected field should be preserved
      expect(preservedTask.completion_percentage).toBe(100); // Protected field should be preserved
      expect(preservedTask.notes).toBeDefined();
      expect(preservedTask.notes.length).toBe(1);
      expect(preservedTask.notes[0].type).toBe('work_preservation');
    });
    
    test('should preserve completed subtasks', () => {
      // Arrange
      const originalTask = new Task({
        id: 'task-1',
        title: 'Parent Task',
        status: 'in-progress',
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Completed Subtask',
            status: 'done',
            implementation_guide: 'Original subtask implementation',
            completion_percentage: 100
          },
          {
            id: 'subtask-2',
            title: 'Pending Subtask',
            status: 'pending',
            implementation_guide: 'Pending subtask implementation',
            completion_percentage: 0
          }
        ]
      });
      
      const updatedTask = new Task({
        id: 'task-1',
        title: 'Updated Parent Task',
        status: 'in-progress',
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Updated Completed Subtask',
            status: 'done',
            implementation_guide: 'Updated subtask implementation',
            completion_percentage: 80
          },
          {
            id: 'subtask-2',
            title: 'Updated Pending Subtask',
            status: 'pending',
            implementation_guide: 'Updated pending subtask implementation',
            completion_percentage: 0
          }
        ]
      });
      
      // Act
      const preservedTask = workPreservationManager.preserveCompletedWork(originalTask, updatedTask);
      
      // Assert
      expect(preservedTask.title).toBe('Updated Parent Task'); // Parent task should be updated
      
      // Completed subtask should be preserved
      expect(preservedTask.subtasks[0].title).toBe('Updated Completed Subtask'); // Non-protected field should be updated
      expect(preservedTask.subtasks[0].implementation_guide).toBe('Original subtask implementation'); // Protected field should be preserved
      expect(preservedTask.subtasks[0].status).toBe('done'); // Protected field should be preserved
      expect(preservedTask.subtasks[0].completion_percentage).toBe(100); // Protected field should be preserved
      expect(preservedTask.subtasks[0].notes).toBeDefined();
      expect(preservedTask.subtasks[0].notes.length).toBe(1);
      expect(preservedTask.subtasks[0].notes[0].type).toBe('work_preservation');
      
      // Pending subtask should be updated
      expect(preservedTask.subtasks[1].title).toBe('Updated Pending Subtask');
      expect(preservedTask.subtasks[1].implementation_guide).toBe('Updated pending subtask implementation');
    });
    
    test('should not modify tasks when there is no original task', () => {
      // Arrange
      const updatedTask = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'done',
        implementation_guide: 'Implementation'
      });
      
      // Act
      const preservedTask = workPreservationManager.preserveCompletedWork(null, updatedTask);
      
      // Assert
      expect(preservedTask).toEqual(updatedTask);
    });
  });
  
  describe('preserveCompletedWorkForTaskList', () => {
    test('should preserve completed work for multiple tasks', () => {
      // Arrange
      const originalTasks = [
        new Task({
          id: 'task-1',
          title: 'Completed Task',
          status: 'done',
          implementation_guide: 'Original implementation 1',
          completion_percentage: 100
        }),
        new Task({
          id: 'task-2',
          title: 'Pending Task',
          status: 'pending',
          implementation_guide: 'Original implementation 2',
          completion_percentage: 0
        })
      ];
      
      const updatedTasks = [
        new Task({
          id: 'task-1',
          title: 'Updated Completed Task',
          status: 'done',
          implementation_guide: 'Updated implementation 1',
          completion_percentage: 80
        }),
        new Task({
          id: 'task-2',
          title: 'Updated Pending Task',
          status: 'pending',
          implementation_guide: 'Updated implementation 2',
          completion_percentage: 0
        })
      ];
      
      // Act
      const preservedTasks = workPreservationManager.preserveCompletedWorkForTaskList(originalTasks, updatedTasks);
      
      // Assert
      expect(preservedTasks.length).toBe(2);
      
      // Completed task should be preserved
      expect(preservedTasks[0].title).toBe('Updated Completed Task'); // Non-protected field should be updated
      expect(preservedTasks[0].implementation_guide).toBe('Original implementation 1'); // Protected field should be preserved
      expect(preservedTasks[0].status).toBe('done'); // Protected field should be preserved
      expect(preservedTasks[0].completion_percentage).toBe(100); // Protected field should be preserved
      
      // Pending task should be updated
      expect(preservedTasks[1].title).toBe('Updated Pending Task');
      expect(preservedTasks[1].implementation_guide).toBe('Updated implementation 2');
    });
    
    test('should handle new tasks in the updated list', () => {
      // Arrange
      const originalTasks = [
        new Task({
          id: 'task-1',
          title: 'Existing Task',
          status: 'done',
          implementation_guide: 'Original implementation',
          completion_percentage: 100
        })
      ];
      
      const updatedTasks = [
        new Task({
          id: 'task-1',
          title: 'Updated Existing Task',
          status: 'done',
          implementation_guide: 'Updated implementation',
          completion_percentage: 80
        }),
        new Task({
          id: 'task-2',
          title: 'New Task',
          status: 'pending',
          implementation_guide: 'New implementation',
          completion_percentage: 0
        })
      ];
      
      // Act
      const preservedTasks = workPreservationManager.preserveCompletedWorkForTaskList(originalTasks, updatedTasks);
      
      // Assert
      expect(preservedTasks.length).toBe(2);
      
      // Existing task should be preserved
      expect(preservedTasks[0].title).toBe('Updated Existing Task');
      expect(preservedTasks[0].implementation_guide).toBe('Original implementation');
      
      // New task should be unchanged
      expect(preservedTasks[1].title).toBe('New Task');
      expect(preservedTasks[1].implementation_guide).toBe('New implementation');
    });
  });
  
  describe('extractKnowledgeFromCompletedTasks', () => {
    test('should extract knowledge from completed tasks', () => {
      // Arrange
      const tasks = [
        new Task({
          id: 'task-1',
          title: 'Completed Task 1',
          description: 'Description 1',
          status: 'done',
          implementation_guide: 'Implementation 1',
          completion_percentage: 100
        }),
        new Task({
          id: 'task-2',
          title: 'Completed Task 2',
          description: 'Description 2',
          status: 'done',
          implementation_guide: 'Implementation 2',
          completion_percentage: 100
        }),
        new Task({
          id: 'task-3',
          title: 'Pending Task',
          description: 'Description 3',
          status: 'pending',
          implementation_guide: 'Implementation 3',
          completion_percentage: 0
        })
      ];
      
      // Act
      const knowledge = workPreservationManager.extractKnowledgeFromCompletedTasks(tasks);
      
      // Assert
      expect(knowledge).toHaveProperty('completedTasks');
      expect(knowledge).toHaveProperty('insights');
      expect(knowledge.completedTasks.length).toBe(2);
      expect(knowledge.completedTasks[0].id).toBe('task-1');
      expect(knowledge.completedTasks[1].id).toBe('task-2');
      expect(knowledge.insights.length).toBeGreaterThan(0);
    });
    
    test('should handle empty task list', () => {
      // Act
      const knowledge = workPreservationManager.extractKnowledgeFromCompletedTasks([]);
      
      // Assert
      expect(knowledge).toHaveProperty('completedTasks');
      expect(knowledge).toHaveProperty('insights');
      expect(knowledge.completedTasks.length).toBe(0);
      expect(knowledge.insights.length).toBe(0);
    });
  });
  
  describe('generateContextFromCompletedWork', () => {
    test('should generate context from completed tasks', () => {
      // Arrange
      const tasks = [
        new Task({
          id: 'task-1',
          title: 'Completed Task',
          description: 'Description',
          status: 'done',
          implementation_guide: 'Implementation details',
          completion_percentage: 100
        }),
        new Task({
          id: 'task-2',
          title: 'Pending Task',
          description: 'Description',
          status: 'pending',
          implementation_guide: 'Implementation details',
          completion_percentage: 0
        })
      ];
      
      // Act
      const context = workPreservationManager.generateContextFromCompletedWork(tasks);
      
      // Assert
      expect(typeof context).toBe('string');
      expect(context).toContain('Completed Work Summary');
      expect(context).toContain('Completed Task');
      expect(context).toContain('Implementation');
      expect(context).toContain('Guidance for Building Upon Completed Work');
    });
    
    test('should handle no completed tasks', () => {
      // Arrange
      const tasks = [
        new Task({
          id: 'task-1',
          title: 'Pending Task',
          description: 'Description',
          status: 'pending',
          implementation_guide: 'Implementation details',
          completion_percentage: 0
        })
      ];
      
      // Act
      const context = workPreservationManager.generateContextFromCompletedWork(tasks);
      
      // Assert
      expect(typeof context).toBe('string');
      expect(context).toContain('No completed tasks found');
    });
  });
  
  describe('lockTask and unlockTask', () => {
    test('should lock a task', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task'
      });
      
      // Act
      const lockedTask = workPreservationManager.lockTask(task);
      
      // Assert
      expect(lockedTask.locked).toBe(true);
      expect(lockedTask.locked_at).toBeDefined();
      expect(lockedTask.notes).toBeDefined();
      expect(lockedTask.notes.length).toBe(1);
      expect(lockedTask.notes[0].type).toBe('task_locked');
    });
    
    test('should unlock a locked task', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        locked: true,
        locked_at: new Date().toISOString()
      });
      
      // Act
      const unlockedTask = workPreservationManager.unlockTask(task);
      
      // Assert
      expect(unlockedTask.locked).toBe(false);
      expect(unlockedTask.locked_at).toBeNull();
      expect(unlockedTask.notes).toBeDefined();
      expect(unlockedTask.notes.length).toBe(1);
      expect(unlockedTask.notes[0].type).toBe('task_unlocked');
    });
  });
});
