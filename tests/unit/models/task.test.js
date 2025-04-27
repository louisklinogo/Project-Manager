/**
 * Task model tests
 */

import { jest } from '@jest/globals';
import { Task } from '../../../src/models/task.js';
import fs from 'fs';

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(JSON.stringify({
      id: 'test-task',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      dependencies: [],
      acceptance_criteria: [],
      implementation_guide: '',
      subtasks: [],
      validation_plan: null,
      parent_id: null,
      completion_percentage: 0
    }))
  }
}));

describe('Task', () => {
  let task;

  beforeEach(() => {
    task = new Task({
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      dependencies: [],
      acceptance_criteria: ['Criterion 1', 'Criterion 2'],
      implementation_guide: 'Implementation Guide',
      subtasks: []
    });
  });

  test('should create a new instance with default values', () => {
    const defaultTask = new Task();
    expect(defaultTask).toBeInstanceOf(Task);
    expect(defaultTask.id).toMatch(/^task-/);
    expect(defaultTask.title).toBe('New Task');
    expect(defaultTask.status).toBe('pending');
    expect(defaultTask.priority).toBe('medium');
    expect(defaultTask.dependencies).toEqual([]);
    expect(defaultTask.acceptance_criteria).toEqual([]);
    expect(defaultTask.subtasks).toEqual([]);
  });

  test('should create a new instance with provided values', () => {
    expect(task).toBeInstanceOf(Task);
    expect(task.id).toBe('task-1');
    expect(task.title).toBe('Test Task');
    expect(task.description).toBe('Test Description');
    expect(task.status).toBe('pending');
    expect(task.priority).toBe('medium');
    expect(task.dependencies).toEqual([]);
    expect(task.acceptance_criteria).toEqual(['Criterion 1', 'Criterion 2']);
    expect(task.implementation_guide).toBe('Implementation Guide');
    expect(task.subtasks).toEqual([]);
  });

  test('should validate a task', () => {
    // Set validation_plan and parent_id to valid values
    task.validation_plan = null;
    task.parent_id = null;

    expect(task.validate()).toBe(true);

    // Test invalid task
    const invalidTask = new Task({ id: 'task-2' });
    invalidTask.title = '';
    expect(() => invalidTask.validate()).toThrow();
  });

  test('should save a task to a file', async () => {
    // Set validation_plan and parent_id to valid values
    task.validation_plan = null;
    task.parent_id = null;

    // Mock writeFile for this specific test
    const mockWriteFile = jest.fn().mockResolvedValue(undefined);
    const originalWriteFile = fs.promises.writeFile;
    fs.promises.writeFile = mockWriteFile;

    try {
      await task.save('test-task.json');
      expect(mockWriteFile).toHaveBeenCalledWith(
        'test-task.json',
        expect.any(String),
        'utf8'
      );
    } finally {
      // Restore original writeFile
      fs.promises.writeFile = originalWriteFile;
    }
  });

  test('should load a task from a file', async () => {
    // Create a temporary file for testing
    const tempFilePath = 'temp-test-task.json';
    const taskData = {
      id: 'test-task',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      dependencies: [],
      acceptance_criteria: [],
      implementation_guide: '',
      subtasks: [],
      validation_plan: null,
      parent_id: null,
      completion_percentage: 0
    };

    // Mock readFile to return our task data
    fs.promises.readFile = jest.fn().mockResolvedValue(JSON.stringify(taskData));

    const loadedTask = await Task.load(tempFilePath);
    expect(loadedTask).toBeInstanceOf(Task);
    expect(loadedTask.id).toBe('test-task');
    expect(loadedTask.title).toBe('Test Task');
    expect(loadedTask.description).toBe('Test Description');

    // Verify readFile was called with the correct path
    expect(fs.promises.readFile).toHaveBeenCalledWith(tempFilePath, 'utf8');
  });

  test('should create a task from JSON', () => {
    const json = {
      id: 'task-2',
      title: 'JSON Task',
      description: 'Created from JSON'
    };
    const jsonTask = Task.fromJSON(json);
    expect(jsonTask).toBeInstanceOf(Task);
    expect(jsonTask.id).toBe('task-2');
    expect(jsonTask.title).toBe('JSON Task');
    expect(jsonTask.description).toBe('Created from JSON');
  });

  test('should create a new task', async () => {
    // Mock the Task.save method to avoid validation errors
    const originalSave = Task.prototype.save;
    Task.prototype.save = jest.fn().mockResolvedValue(undefined);

    try {
      const newTask = await Task.create({
        title: 'New Task',
        description: 'Created with create method',
        validation_plan: null,
        parent_id: null
      }, 'new-task.json');

      expect(newTask).toBeInstanceOf(Task);
      expect(newTask.title).toBe('New Task');
      expect(newTask.description).toBe('Created with create method');
      expect(Task.prototype.save).toHaveBeenCalledWith('new-task.json');
    } finally {
      // Restore the original save method
      Task.prototype.save = originalSave;
    }
  });

  test('should create a subtask', () => {
    const subtask = task.createSubtask({
      title: 'Test Subtask',
      description: 'Test Subtask Description'
    });
    expect(subtask).toBeDefined();
    expect(subtask.title).toBe('Test Subtask');
    expect(subtask.description).toBe('Test Subtask Description');
    expect(subtask.parent_id).toBe(task.id);
    expect(task.subtasks).toContain(subtask);
  });

  test('should update completion percentage based on subtasks', () => {
    // Create subtasks
    task.createSubtask({ title: 'Subtask 1', status: 'pending' });
    task.createSubtask({ title: 'Subtask 2', status: 'in-progress' });
    task.createSubtask({ title: 'Subtask 3', status: 'done' });
    task.createSubtask({ title: 'Subtask 4', status: 'done' });

    // Update completion percentage
    const percentage = task.updateCompletionPercentage('done');

    // Check result
    expect(percentage).toBe(50); // 2 out of 4 subtasks are done
    expect(task.completion_percentage).toBe(50);
  });

  test('should update status based on subtasks', () => {
    // Create subtasks
    task.createSubtask({ title: 'Subtask 1', status: 'pending' });
    task.createSubtask({ title: 'Subtask 2', status: 'in-progress' });

    // Update status - at least one subtask is in-progress
    let status = task.updateStatusBasedOnSubtasks('done', 'in-progress');

    // Check result - should be in-progress since at least one subtask is in-progress
    expect(status).toBe('in-progress');
    expect(task.status).toBe('in-progress');

    // Update all subtasks to done
    task.subtasks.forEach(subtask => {
      subtask.status = 'done';
    });

    // Update status again
    status = task.updateStatusBasedOnSubtasks('done', 'in-progress');

    // Check result - should be done since all subtasks are done
    expect(status).toBe('done');
    expect(task.status).toBe('done');
  });

  test('should check for circular dependencies', () => {
    const task1 = new Task({ id: 'task-1', dependencies: ['task-2'] });
    const task2 = new Task({ id: 'task-2', dependencies: ['task-3'] });
    const task3 = new Task({ id: 'task-3', dependencies: ['task-1'] });

    const allTasks = [task1, task2, task3];

    expect(task1.hasCircularDependencies(allTasks)).toBe(true);
    expect(task2.hasCircularDependencies(allTasks)).toBe(true);
    expect(task3.hasCircularDependencies(allTasks)).toBe(true);

    // Test without circular dependencies
    const task4 = new Task({ id: 'task-4', dependencies: [] });
    const task5 = new Task({ id: 'task-5', dependencies: ['task-4'] });

    const nonCircularTasks = [task4, task5];

    expect(task4.hasCircularDependencies(nonCircularTasks)).toBe(false);
    expect(task5.hasCircularDependencies(nonCircularTasks)).toBe(false);
  });

  test('should get dependent tasks', () => {
    const task1 = new Task({ id: 'task-1' });
    const task2 = new Task({ id: 'task-2', dependencies: ['task-1'] });
    const task3 = new Task({ id: 'task-3', dependencies: ['task-1'] });

    const allTasks = [task1, task2, task3];

    const dependentTasks = task1.getDependentTasks(allTasks);

    expect(dependentTasks).toHaveLength(2);
    expect(dependentTasks).toContainEqual(expect.objectContaining({ id: 'task-2' }));
    expect(dependentTasks).toContainEqual(expect.objectContaining({ id: 'task-3' }));
  });

  test('should get dependency tasks', () => {
    const task1 = new Task({ id: 'task-1' });
    const task2 = new Task({ id: 'task-2' });
    const task3 = new Task({ id: 'task-3', dependencies: ['task-1', 'task-2'] });

    const allTasks = [task1, task2, task3];

    const dependencyTasks = task3.getDependencyTasks(allTasks);

    expect(dependencyTasks).toHaveLength(2);
    expect(dependencyTasks).toContainEqual(expect.objectContaining({ id: 'task-1' }));
    expect(dependencyTasks).toContainEqual(expect.objectContaining({ id: 'task-2' }));
  });

  test('should convert to hierarchical structure', () => {
    // Create subtasks
    task.createSubtask({ title: 'Subtask 1' });
    task.createSubtask({ title: 'Subtask 2' });

    const hierarchy = task.toHierarchy();

    expect(hierarchy).toHaveProperty('subtasks');
    expect(hierarchy.subtasks).toHaveLength(2);
    expect(hierarchy.subtasks[0]).toHaveProperty('parent');
    expect(hierarchy.subtasks[0].parent).toHaveProperty('id', task.id);
    expect(hierarchy.subtasks[0].parent).toHaveProperty('title', task.title);
  });

  test('should get task depth', () => {
    expect(task.getDepth()).toBe(0);

    // Create a subtask
    const subtask = task.createSubtask({ title: 'Subtask' });
    const subtaskObj = new Task({ ...subtask });

    expect(subtaskObj.getDepth()).toBe(1);
  });

  test('should check if task is a subtask', () => {
    expect(task.isSubtask()).toBe(false);

    // Create a subtask
    const subtask = task.createSubtask({ title: 'Subtask' });
    const subtaskObj = new Task({ ...subtask });

    expect(subtaskObj.isSubtask()).toBe(true);
  });

  test('should check if task is a parent task', () => {
    expect(task.isParentTask()).toBe(false);

    // Create a subtask
    task.createSubtask({ title: 'Subtask' });

    expect(task.isParentTask()).toBe(true);
  });

  test('should check if task is a leaf task', () => {
    expect(task.isLeafTask()).toBe(true);

    // Create a subtask
    task.createSubtask({ title: 'Subtask' });

    expect(task.isLeafTask()).toBe(false);
  });

  test('should get task path', () => {
    const task1 = new Task({ id: 'task-1' });
    const task2 = new Task({ id: 'task-2', parent_id: 'task-1' });
    const task3 = new Task({ id: 'task-3', parent_id: 'task-2' });

    const allTasks = [task1, task2, task3];

    const path = task3.getPath(allTasks);

    expect(path).toHaveLength(3);
    expect(path[0]).toEqual(expect.objectContaining({ id: 'task-1' }));
    expect(path[1]).toEqual(expect.objectContaining({ id: 'task-2' }));
    expect(path[2]).toEqual(expect.objectContaining({ id: 'task-3' }));
  });

  test('should get task path as string', () => {
    const task1 = new Task({ id: 'task-1', title: 'Task 1' });
    const task2 = new Task({ id: 'task-2', title: 'Task 2', parent_id: 'task-1' });
    const task3 = new Task({ id: 'task-3', title: 'Task 3', parent_id: 'task-2' });

    const allTasks = [task1, task2, task3];

    const pathString = task3.getPathString(allTasks);

    expect(pathString).toBe('Task 1 > Task 2 > Task 3');
  });
});
