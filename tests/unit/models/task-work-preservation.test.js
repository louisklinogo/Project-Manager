/**
 * Task Model Work Preservation Tests
 */

import { jest } from '@jest/globals';
import { Task } from '../../../src/models/task.js';

describe('Task - Work Preservation', () => {
  describe('addCompletionHistoryEntry', () => {
    test('should add a completion history entry', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'done',
        completion_percentage: 100,
        version: 1
      });
      
      // Act
      const entry = task.addCompletionHistoryEntry();
      
      // Assert
      expect(task.completion_history).toBeDefined();
      expect(task.completion_history.length).toBe(1);
      expect(task.completion_history[0]).toEqual(entry);
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('status', 'done');
      expect(entry).toHaveProperty('completion_percentage', 100);
      expect(entry).toHaveProperty('version', 1);
      expect(task.version).toBe(2); // Version should be incremented
    });
    
    test('should add a completion history entry with custom values', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        status: 'pending',
        completion_percentage: 0,
        version: 1
      });
      
      // Act
      const entry = task.addCompletionHistoryEntry('done', 100, { source: 'test' });
      
      // Assert
      expect(task.completion_history.length).toBe(1);
      expect(entry.status).toBe('done');
      expect(entry.completion_percentage).toBe(100);
      expect(entry.metadata).toHaveProperty('source', 'test');
    });
    
    test('should initialize completion_history if it does not exist', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task'
      });
      delete task.completion_history; // Explicitly remove the property
      
      // Act
      task.addCompletionHistoryEntry();
      
      // Assert
      expect(task.completion_history).toBeDefined();
      expect(Array.isArray(task.completion_history)).toBe(true);
    });
  });
  
  describe('getCompletionHistory', () => {
    test('should return the completion history', () => {
      // Arrange
      const history = [
        {
          timestamp: '2023-01-01T00:00:00.000Z',
          status: 'done',
          completion_percentage: 100,
          version: 1
        }
      ];
      
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        completion_history: history
      });
      
      // Act
      const result = task.getCompletionHistory();
      
      // Assert
      expect(result).toEqual(history);
    });
    
    test('should return an empty array if no history exists', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task'
      });
      delete task.completion_history; // Explicitly remove the property
      
      // Act
      const result = task.getCompletionHistory();
      
      // Assert
      expect(result).toEqual([]);
    });
  });
  
  describe('isLocked', () => {
    test('should return true if the task is locked', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        locked: true
      });
      
      // Act
      const result = task.isLocked();
      
      // Assert
      expect(result).toBe(true);
    });
    
    test('should return false if the task is not locked', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        locked: false
      });
      
      // Act
      const result = task.isLocked();
      
      // Assert
      expect(result).toBe(false);
    });
    
    test('should return false if locked property is undefined', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task'
      });
      delete task.locked; // Explicitly remove the property
      
      // Act
      const result = task.isLocked();
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe('lock', () => {
    test('should lock the task', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task'
      });
      
      // Act
      const result = task.lock();
      
      // Assert
      expect(result).toBe(task); // Should return this
      expect(task.locked).toBe(true);
      expect(task.locked_at).toBeDefined();
      expect(task.notes).toBeDefined();
      expect(task.notes.length).toBe(1);
      expect(task.notes[0].type).toBe('task_locked');
      expect(task.notes[0].message).toBe('Task completed');
    });
    
    test('should lock the task with a custom reason', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task'
      });
      
      // Act
      task.lock('Custom reason');
      
      // Assert
      expect(task.notes[0].message).toBe('Custom reason');
    });
  });
  
  describe('unlock', () => {
    test('should unlock the task', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        locked: true,
        locked_at: '2023-01-01T00:00:00.000Z'
      });
      
      // Act
      const result = task.unlock();
      
      // Assert
      expect(result).toBe(task); // Should return this
      expect(task.locked).toBe(false);
      expect(task.locked_at).toBeNull();
      expect(task.notes).toBeDefined();
      expect(task.notes.length).toBe(1);
      expect(task.notes[0].type).toBe('task_unlocked');
      expect(task.notes[0].message).toBe('Manual unlock');
    });
    
    test('should unlock the task with a custom reason', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        locked: true,
        locked_at: '2023-01-01T00:00:00.000Z'
      });
      
      // Act
      task.unlock('Custom reason');
      
      // Assert
      expect(task.notes[0].message).toBe('Custom reason');
    });
  });
  
  describe('addNote', () => {
    test('should add a note to the task', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task'
      });
      
      // Act
      const note = task.addNote('test_note', 'Test message');
      
      // Assert
      expect(task.notes).toBeDefined();
      expect(task.notes.length).toBe(1);
      expect(task.notes[0]).toEqual(note);
      expect(note).toHaveProperty('type', 'test_note');
      expect(note).toHaveProperty('message', 'Test message');
      expect(note).toHaveProperty('timestamp');
      expect(note).toHaveProperty('metadata');
    });
    
    test('should add a note with custom metadata', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task'
      });
      
      // Act
      const note = task.addNote('test_note', 'Test message', { source: 'test' });
      
      // Assert
      expect(note.metadata).toHaveProperty('source', 'test');
    });
    
    test('should initialize notes if it does not exist', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task'
      });
      delete task.notes; // Explicitly remove the property
      
      // Act
      task.addNote('test_note', 'Test message');
      
      // Assert
      expect(task.notes).toBeDefined();
      expect(Array.isArray(task.notes)).toBe(true);
    });
  });
  
  describe('getNotesByType', () => {
    test('should return notes of the specified type', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        notes: [
          {
            type: 'type_a',
            message: 'Message A',
            timestamp: '2023-01-01T00:00:00.000Z'
          },
          {
            type: 'type_b',
            message: 'Message B',
            timestamp: '2023-01-02T00:00:00.000Z'
          },
          {
            type: 'type_a',
            message: 'Message C',
            timestamp: '2023-01-03T00:00:00.000Z'
          }
        ]
      });
      
      // Act
      const result = task.getNotesByType('type_a');
      
      // Assert
      expect(result.length).toBe(2);
      expect(result[0].message).toBe('Message A');
      expect(result[1].message).toBe('Message C');
    });
    
    test('should return an empty array if no notes of the specified type exist', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        notes: [
          {
            type: 'type_a',
            message: 'Message A',
            timestamp: '2023-01-01T00:00:00.000Z'
          }
        ]
      });
      
      // Act
      const result = task.getNotesByType('type_b');
      
      // Assert
      expect(result).toEqual([]);
    });
    
    test('should return an empty array if notes is undefined', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task'
      });
      delete task.notes; // Explicitly remove the property
      
      // Act
      const result = task.getNotesByType('type_a');
      
      // Assert
      expect(result).toEqual([]);
    });
  });
  
  describe('updateTimestamp', () => {
    test('should update the task timestamp', () => {
      // Arrange
      const task = new Task({
        id: 'task-1',
        title: 'Test Task',
        updated_at: '2023-01-01T00:00:00.000Z'
      });
      
      // Mock Date.now to return a fixed timestamp
      const originalDate = global.Date;
      const mockDate = new Date('2023-01-02T00:00:00.000Z');
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
        
        static now() {
          return mockDate.getTime();
        }
      };
      
      // Act
      const result = task.updateTimestamp();
      
      // Restore original Date
      global.Date = originalDate;
      
      // Assert
      expect(result).toBe('2023-01-02T00:00:00.000Z');
      expect(task.updated_at).toBe('2023-01-02T00:00:00.000Z');
    });
  });
});
