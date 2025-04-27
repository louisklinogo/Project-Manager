/**
 * Dependency Resolver Tests
 */

import { DependencyResolver } from '../../../src/utils/dependency-resolver.js';

describe('DependencyResolver', () => {
  let resolver;
  
  beforeEach(() => {
    resolver = new DependencyResolver();
  });
  
  describe('resolveDependencyIssues', () => {
    test('should return original tasks if there are no issues', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2' }
      ];
      
      const result = resolver.resolveDependencyIssues(tasks);
      
      expect(result.tasks).toEqual(tasks);
      expect(result.changes).toHaveLength(0);
    });
    
    test('should remove missing dependencies', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-3'] },
        { id: 'task-2', title: 'Task 2' }
      ];
      
      const result = resolver.resolveDependencyIssues(tasks);
      
      expect(result.tasks[0].dependencies).toHaveLength(0);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('remove_missing_dependency');
    });
    
    test('should remove self-dependencies', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-1'] },
        { id: 'task-2', title: 'Task 2' }
      ];
      
      const result = resolver.resolveDependencyIssues(tasks);
      
      expect(result.tasks[0].dependencies).toHaveLength(0);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('remove_self_dependency');
    });
    
    test('should remove circular dependencies', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-1'] }
      ];
      
      const result = resolver.resolveDependencyIssues(tasks);
      
      // One of the dependencies should be removed to break the cycle
      const totalDependencies = result.tasks[0].dependencies.length + result.tasks[1].dependencies.length;
      expect(totalDependencies).toBe(1);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('remove_circular_dependency');
    });
    
    test('should handle multiple issues', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-1', 'task-3'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-1'] }
      ];
      
      const result = resolver.resolveDependencyIssues(tasks);
      
      expect(result.changes.length).toBeGreaterThan(1);
    });
  });
  
  describe('removeMissingDependency', () => {
    test('should remove missing dependencies from tasks', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-3'] },
        { id: 'task-2', title: 'Task 2' }
      ];
      
      const changes = [];
      resolver.removeMissingDependency(tasks, {
        taskId: 'task-1',
        dependencyId: 'task-3'
      }, changes);
      
      expect(tasks[0].dependencies).toHaveLength(0);
      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('remove_missing_dependency');
    });
    
    test('should remove missing dependencies from subtasks', () => {
      const tasks = [
        { 
          id: 'task-1', 
          title: 'Task 1', 
          subtasks: [
            { id: 1, title: 'Subtask 1', dependencies: [2] }
          ]
        },
        { id: 'task-2', title: 'Task 2' }
      ];
      
      const changes = [];
      resolver.removeMissingDependency(tasks, {
        taskId: 'task-1.1',
        dependencyId: 2
      }, changes);
      
      expect(tasks[0].subtasks[0].dependencies).toHaveLength(0);
      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('remove_missing_dependency');
    });
  });
  
  describe('removeSelfDependency', () => {
    test('should remove self-dependencies from tasks', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-1'] },
        { id: 'task-2', title: 'Task 2' }
      ];
      
      const changes = [];
      resolver.removeSelfDependency(tasks, {
        taskId: 'task-1'
      }, changes);
      
      expect(tasks[0].dependencies).toHaveLength(0);
      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('remove_self_dependency');
    });
    
    test('should remove self-dependencies from subtasks', () => {
      const tasks = [
        { 
          id: 'task-1', 
          title: 'Task 1', 
          subtasks: [
            { id: 1, title: 'Subtask 1', dependencies: [1] }
          ]
        },
        { id: 'task-2', title: 'Task 2' }
      ];
      
      const changes = [];
      resolver.removeSelfDependency(tasks, {
        taskId: 'task-1.1'
      }, changes);
      
      expect(tasks[0].subtasks[0].dependencies).toHaveLength(0);
      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('remove_self_dependency');
    });
  });
  
  describe('removeCircularDependency', () => {
    test('should remove circular dependencies', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-1'] }
      ];
      
      const changes = [];
      resolver.removeCircularDependency(tasks, {
        path: ['task-1', 'task-2', 'task-1']
      }, changes);
      
      // One of the dependencies should be removed to break the cycle
      const task2 = tasks.find(t => t.id === 'task-2');
      expect(task2.dependencies).toHaveLength(0);
      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('remove_circular_dependency');
    });
  });
  
  describe('suggestAlternativeDependencies', () => {
    test('should suggest alternative dependencies', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: [] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-3'] },
        { id: 'task-3', title: 'Task 3', dependencies: [] }
      ];
      
      const suggestions = resolver.suggestAlternativeDependencies(tasks, 'task-1', 'task-2');
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].id).toBe('task-3');
    });
    
    test('should not suggest dependencies that would create circular dependencies', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-3'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-1'] },
        { id: 'task-3', title: 'Task 3', dependencies: [] }
      ];
      
      const suggestions = resolver.suggestAlternativeDependencies(tasks, 'task-3', 'task-2');
      
      expect(suggestions).toHaveLength(0);
    });
  });
  
  describe('optimizeDependencyChains', () => {
    test('should remove redundant dependencies', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2', 'task-3'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-3'] },
        { id: 'task-3', title: 'Task 3', dependencies: [] }
      ];
      
      const result = resolver.optimizeDependencyChains(tasks);
      
      // task-1 should no longer directly depend on task-3
      expect(result.tasks[0].dependencies).toEqual(['task-2']);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('optimize_dependencies');
    });
    
    test('should not modify tasks with no redundant dependencies', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-3'] },
        { id: 'task-3', title: 'Task 3', dependencies: [] }
      ];
      
      const result = resolver.optimizeDependencyChains(tasks);
      
      expect(result.tasks).toEqual(tasks);
      expect(result.changes).toHaveLength(0);
    });
  });
  
  describe('analyzeDependencyImpact', () => {
    test('should analyze dependency impact', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: ['task-2'] },
        { id: 'task-2', title: 'Task 2', dependencies: [] },
        { id: 'task-3', title: 'Task 3', dependencies: ['task-1'] }
      ];
      
      const result = resolver.analyzeDependencyImpact(tasks, 'task-1');
      
      expect(result.task).toEqual(tasks[0]);
      expect(result.dependsOn).toHaveLength(1);
      expect(result.dependsOn[0]).toEqual(tasks[1]);
      expect(result.dependedOnBy).toHaveLength(1);
      expect(result.dependedOnBy[0]).toEqual(tasks[2]);
    });
    
    test('should calculate critical path', () => {
      const tasks = [
        { id: 'task-1', title: 'Task 1', dependencies: [] },
        { id: 'task-2', title: 'Task 2', dependencies: ['task-1'] },
        { id: 'task-3', title: 'Task 3', dependencies: ['task-2'] },
        { id: 'task-4', title: 'Task 4', dependencies: ['task-3'] }
      ];
      
      const result = resolver.analyzeDependencyImpact(tasks, 'task-2');
      
      expect(result.criticalPath.length).toBeGreaterThan(0);
      expect(result.impactScore).toBeGreaterThan(0);
    });
  });
});
