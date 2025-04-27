/**
 * Tests for change tracker
 */

import { ChangeTracker } from '../../../../src/research/versioning/change-tracker.js';
import { jest } from '@jest/globals';

describe('ChangeTracker', () => {
  // Mock storage provider
  const mockStorage = {
    saveChange: jest.fn().mockResolvedValue(true),
    getChanges: jest.fn().mockResolvedValue([]),
    getRecentChanges: jest.fn().mockResolvedValue([]),
    getChangeStatistics: jest.fn().mockResolvedValue({
      total: 0,
      byType: {},
      byEntityType: {},
      byAuthor: {}
    })
  };
  
  test('should create a change tracker with default options', () => {
    const tracker = new ChangeTracker();
    
    expect(tracker).toBeInstanceOf(ChangeTracker);
    expect(tracker.storage).toBeNull();
  });
  
  test('should create a change tracker with custom options', () => {
    const tracker = new ChangeTracker({
      storage: mockStorage
    });
    
    expect(tracker).toBeInstanceOf(ChangeTracker);
    expect(tracker.storage).toBe(mockStorage);
  });
  
  test('trackChange should track a change', async () => {
    const tracker = new ChangeTracker({
      storage: mockStorage
    });
    
    const change = {
      type: 'update',
      entityType: 'node',
      entityId: 'node-1',
      data: {
        name: {
          old: 'JavaScript',
          new: 'JavaScript (JS)'
        }
      }
    };
    
    const changeRecord = await tracker.trackChange(change, 'user1');
    
    expect(changeRecord).toHaveProperty('id');
    expect(changeRecord.id).toMatch(/^c-/);
    expect(changeRecord.timestamp).toBeDefined();
    expect(changeRecord.author).toBe('user1');
    expect(changeRecord.type).toBe(change.type);
    expect(changeRecord.entityType).toBe(change.entityType);
    expect(changeRecord.entityId).toBe(change.entityId);
    expect(changeRecord.data).toEqual(change.data);
    
    // Should call storage.saveChange
    expect(mockStorage.saveChange).toHaveBeenCalledWith(changeRecord);
  });
  
  test('trackChange should throw error for invalid change', async () => {
    const tracker = new ChangeTracker();
    
    await expect(tracker.trackChange()).rejects.toThrow('Valid change information is required');
    await expect(tracker.trackChange({})).rejects.toThrow('Valid change information is required');
    await expect(tracker.trackChange({ type: 'update' })).rejects.toThrow('Valid change information is required');
    await expect(tracker.trackChange({ type: 'update', entityType: 'node' })).rejects.toThrow('Valid change information is required');
  });
  
  test('getChangeHistory should get change history for an entity', async () => {
    const tracker = new ChangeTracker({
      storage: mockStorage
    });
    
    const entityId = 'node-1';
    const options = {
      entityType: 'node',
      changeType: 'update'
    };
    
    await tracker.getChangeHistory(entityId, options);
    
    // Should call storage.getChanges
    expect(mockStorage.getChanges).toHaveBeenCalledWith(entityId, options);
  });
  
  test('getChangeHistory should throw error for missing entity ID', async () => {
    const tracker = new ChangeTracker();
    
    await expect(tracker.getChangeHistory()).rejects.toThrow('Entity ID is required');
  });
  
  test('getRecentChanges should get recent changes', async () => {
    const tracker = new ChangeTracker({
      storage: mockStorage
    });
    
    const options = {
      entityType: 'node',
      changeType: 'update',
      author: 'user1',
      limit: 5,
      offset: 10
    };
    
    await tracker.getRecentChanges(options);
    
    // Should call storage.getRecentChanges
    expect(mockStorage.getRecentChanges).toHaveBeenCalledWith(options);
  });
  
  test('getRecentChanges should use default limit and offset', async () => {
    const tracker = new ChangeTracker({
      storage: mockStorage
    });
    
    await tracker.getRecentChanges();
    
    // Should call storage.getRecentChanges with default options
    expect(mockStorage.getRecentChanges).toHaveBeenCalledWith({
      limit: 10,
      offset: 0
    });
  });
  
  test('getChangeStatistics should get change statistics', async () => {
    const tracker = new ChangeTracker({
      storage: mockStorage
    });
    
    const options = {
      entityType: 'node',
      changeType: 'update',
      author: 'user1',
      timeframe: 'week'
    };
    
    await tracker.getChangeStatistics(options);
    
    // Should call storage.getChangeStatistics
    expect(mockStorage.getChangeStatistics).toHaveBeenCalledWith(options);
  });
  
  test('trackChanges should track multiple changes', async () => {
    const tracker = new ChangeTracker({
      storage: mockStorage
    });
    
    const changes = [
      {
        type: 'update',
        entityType: 'node',
        entityId: 'node-1',
        data: {
          name: {
            old: 'JavaScript',
            new: 'JavaScript (JS)'
          }
        }
      },
      {
        type: 'add',
        entityType: 'relation',
        entityId: 'node-1',
        data: {
          relation: {
            targetId: 'node-2',
            type: 'related-to'
          }
        }
      }
    ];
    
    const changeRecords = await tracker.trackChanges(changes, 'user1');
    
    expect(Array.isArray(changeRecords)).toBe(true);
    expect(changeRecords.length).toBe(changes.length);
    
    // Should call storage.saveChange for each change
    expect(mockStorage.saveChange).toHaveBeenCalledTimes(changes.length);
  });
  
  test('trackChanges should handle empty changes array', async () => {
    const tracker = new ChangeTracker();
    
    const changeRecords = await tracker.trackChanges([]);
    
    expect(Array.isArray(changeRecords)).toBe(true);
    expect(changeRecords.length).toBe(0);
  });
  
  test('trackEntityChanges should track changes between entity versions', async () => {
    const tracker = new ChangeTracker();
    
    const oldEntity = {
      id: 'node-1',
      name: 'JavaScript',
      description: 'A programming language',
      content: 'JavaScript is a programming language.',
      metadata: {
        importance: 'high'
      },
      relations: [
        { targetId: 'node-2', type: 'related-to' }
      ],
      sources: [
        { id: 'source-1', type: 'research' }
      ]
    };
    
    const newEntity = {
      id: 'node-1',
      name: 'JavaScript (JS)',
      description: 'A programming language',
      content: 'JavaScript is a programming language used for web development.',
      metadata: {
        importance: 'high',
        complexity: 'medium'
      },
      relations: [
        { targetId: 'node-2', type: 'related-to' },
        { targetId: 'node-3', type: 'used-in' }
      ],
      sources: [
        { id: 'source-1', type: 'research' },
        { id: 'source-2', type: 'research' }
      ]
    };
    
    // Spy on trackChanges method
    const trackChangesSpy = jest.spyOn(tracker, 'trackChanges');
    
    await tracker.trackEntityChanges(oldEntity, newEntity, 'node', 'user1');
    
    // Should call trackChanges with detected changes
    expect(trackChangesSpy).toHaveBeenCalled();
    
    const changes = trackChangesSpy.mock.calls[0][0];
    
    // Should detect property changes
    expect(changes.some(c => 
      c.type === 'update' && 
      c.entityType === 'node' && 
      c.data.properties.name
    )).toBe(true);
    
    // Should detect content changes
    expect(changes.some(c => 
      c.type === 'update' && 
      c.entityType === 'node' && 
      c.data.content
    )).toBe(true);
    
    // Should detect metadata changes
    expect(changes.some(c => 
      c.type === 'update' && 
      c.entityType === 'node' && 
      c.data.metadata
    )).toBe(true);
    
    // Should detect relation changes
    expect(changes.some(c => 
      c.type === 'add' && 
      c.entityType === 'relation'
    )).toBe(true);
    
    // Should detect source changes
    expect(changes.some(c => 
      c.type === 'add' && 
      c.entityType === 'source'
    )).toBe(true);
  });
  
  test('trackEntityChanges should throw error for missing entities', async () => {
    const tracker = new ChangeTracker();
    
    await expect(tracker.trackEntityChanges()).rejects.toThrow('Both entity versions and entity type are required');
    await expect(tracker.trackEntityChanges({})).rejects.toThrow('Both entity versions and entity type are required');
    await expect(tracker.trackEntityChanges({}, {})).rejects.toThrow('Both entity versions and entity type are required');
  });
  
  test('detectPropertyChanges should detect changes in properties', () => {
    const tracker = new ChangeTracker();
    
    const oldEntity = {
      name: 'JavaScript',
      description: 'A programming language',
      type: 'concept',
      confidence: 0.8
    };
    
    const newEntity = {
      name: 'JavaScript (JS)',
      description: 'A programming language',
      type: 'concept',
      confidence: 0.9
    };
    
    const changes = tracker.detectPropertyChanges(oldEntity, newEntity);
    
    expect(changes).toHaveProperty('name');
    expect(changes.name).toEqual({
      old: 'JavaScript',
      new: 'JavaScript (JS)'
    });
    
    expect(changes).toHaveProperty('confidence');
    expect(changes.confidence).toEqual({
      old: 0.8,
      new: 0.9
    });
    
    expect(changes).not.toHaveProperty('description');
    expect(changes).not.toHaveProperty('type');
  });
  
  test('detectMetadataChanges should detect changes in metadata', () => {
    const tracker = new ChangeTracker();
    
    const oldMetadata = {
      importance: 'high',
      status: 'draft'
    };
    
    const newMetadata = {
      importance: 'medium',
      complexity: 'low'
    };
    
    const changes = tracker.detectMetadataChanges(oldMetadata, newMetadata);
    
    expect(changes.added).toHaveProperty('complexity');
    expect(changes.added.complexity).toBe('low');
    
    expect(changes.removed).toHaveProperty('status');
    expect(changes.removed.status).toBe('draft');
    
    expect(changes.changed).toHaveProperty('importance');
    expect(changes.changed.importance).toEqual({
      old: 'high',
      new: 'medium'
    });
  });
  
  test('detectArrayChanges should detect changes in arrays', () => {
    const tracker = new ChangeTracker();
    
    const oldArray = [
      { id: 'item-1', name: 'Item 1' },
      { id: 'item-2', name: 'Item 2' }
    ];
    
    const newArray = [
      { id: 'item-2', name: 'Item 2' },
      { id: 'item-3', name: 'Item 3' }
    ];
    
    const keyFn = item => item.id;
    
    const changes = tracker.detectArrayChanges(oldArray, newArray, keyFn);
    
    expect(changes.added).toContainEqual({ id: 'item-3', name: 'Item 3' });
    expect(changes.removed).toContainEqual({ id: 'item-1', name: 'Item 1' });
  });
});
