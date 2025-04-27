/**
 * Tests for knowledge versioner
 */

import { KnowledgeVersioner } from '../../../../src/research/versioning/knowledge-versioner.js';
import { jest } from '@jest/globals';

describe('KnowledgeVersioner', () => {
  // Mock storage provider
  const mockStorage = {
    saveVersion: jest.fn().mockResolvedValue(true),
    getVersions: jest.fn().mockResolvedValue([]),
    getVersion: jest.fn().mockResolvedValue(null),
    getNode: jest.fn().mockResolvedValue(null),
    saveNode: jest.fn().mockResolvedValue(true)
  };
  
  // Sample knowledge node for testing
  const knowledgeNode = {
    id: 'node-1',
    type: 'concept',
    name: 'JavaScript',
    description: 'A programming language',
    content: 'JavaScript is a programming language used for web development.',
    tags: ['language', 'web'],
    relations: [
      { targetId: 'node-2', type: 'related-to' }
    ],
    metadata: {
      importance: 'high',
      complexity: 'medium'
    },
    sources: [
      { id: 'source-1', type: 'research' }
    ],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };
  
  test('should create a knowledge versioner with default options', () => {
    const versioner = new KnowledgeVersioner();
    
    expect(versioner).toBeInstanceOf(KnowledgeVersioner);
    expect(versioner.storage).toBeNull();
  });
  
  test('should create a knowledge versioner with custom options', () => {
    const versioner = new KnowledgeVersioner({
      storage: mockStorage
    });
    
    expect(versioner).toBeInstanceOf(KnowledgeVersioner);
    expect(versioner.storage).toBe(mockStorage);
  });
  
  test('createVersion should create a version for a knowledge node', async () => {
    const versioner = new KnowledgeVersioner({
      storage: mockStorage
    });
    
    const changes = {
      type: 'update',
      properties: {
        name: {
          old: 'JavaScript',
          new: 'JavaScript (JS)'
        }
      }
    };
    
    const version = await versioner.createVersion(knowledgeNode, changes, 'user1');
    
    expect(version).toHaveProperty('id');
    expect(version.id).toMatch(/^v-/);
    expect(version.nodeId).toBe(knowledgeNode.id);
    expect(version.timestamp).toBeDefined();
    expect(version.author).toBe('user1');
    expect(version.changes).toEqual(changes);
    expect(version.previousVersion).toBeNull();
    
    // Should call storage.saveVersion
    expect(mockStorage.saveVersion).toHaveBeenCalledWith(version);
  });
  
  test('createVersion should handle missing changes', async () => {
    const versioner = new KnowledgeVersioner();
    
    const version = await versioner.createVersion(knowledgeNode);
    
    expect(version).toHaveProperty('id');
    expect(version.changes).toEqual({ type: 'update' });
    expect(version.author).toBe('system');
  });
  
  test('createVersion should throw error for invalid node', async () => {
    const versioner = new KnowledgeVersioner();
    
    await expect(versioner.createVersion()).rejects.toThrow('Valid knowledge node is required');
    await expect(versioner.createVersion({})).rejects.toThrow('Valid knowledge node is required');
  });
  
  test('getVersionHistory should get version history for a node', async () => {
    const versioner = new KnowledgeVersioner({
      storage: mockStorage
    });
    
    const nodeId = 'node-1';
    
    await versioner.getVersionHistory(nodeId);
    
    // Should call storage.getVersions
    expect(mockStorage.getVersions).toHaveBeenCalledWith(nodeId);
  });
  
  test('getVersionHistory should throw error for missing node ID', async () => {
    const versioner = new KnowledgeVersioner();
    
    await expect(versioner.getVersionHistory()).rejects.toThrow('Node ID is required');
  });
  
  test('compareVersions should compare two versions', () => {
    const versioner = new KnowledgeVersioner();
    
    const oldVersion = {
      node: {
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
      }
    };
    
    const newVersion = {
      node: {
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
      }
    };
    
    const comparison = versioner.compareVersions(oldVersion, newVersion);
    
    expect(comparison).toHaveProperty('id');
    expect(comparison).toHaveProperty('properties');
    expect(comparison).toHaveProperty('content');
    expect(comparison).toHaveProperty('metadata');
    expect(comparison).toHaveProperty('relations');
    expect(comparison).toHaveProperty('sources');
    
    // Should detect name change
    expect(comparison.properties).toHaveProperty('name');
    expect(comparison.properties.name).toEqual({
      old: 'JavaScript',
      new: 'JavaScript (JS)'
    });
    
    // Should detect content change
    expect(comparison.content.changed).toBe(true);
    
    // Should detect metadata changes
    expect(comparison.metadata.added).toHaveProperty('complexity');
    
    // Should detect relation changes
    expect(comparison.relations.added.length).toBe(1);
    expect(comparison.relations.added[0].targetId).toBe('node-3');
    
    // Should detect source changes
    expect(comparison.sources.added.length).toBe(1);
    expect(comparison.sources.added[0].id).toBe('source-2');
  });
  
  test('compareVersions should throw error for missing versions', () => {
    const versioner = new KnowledgeVersioner();
    
    expect(() => versioner.compareVersions()).toThrow('Both versions are required for comparison');
    expect(() => versioner.compareVersions({})).toThrow('Both versions are required for comparison');
  });
  
  test('restoreVersion should restore a node to a specific version', async () => {
    // Mock storage with version and node data
    const mockStorageWithData = {
      ...mockStorage,
      getVersion: jest.fn().mockResolvedValue({
        id: 'v-1',
        nodeId: 'node-1',
        changes: {
          properties: {
            name: {
              old: 'JavaScript',
              new: 'JavaScript (JS)'
            }
          },
          content: {
            changed: true,
            old: 'JavaScript is a programming language.',
            new: 'JavaScript is a programming language used for web development.'
          },
          metadata: {
            added: {
              complexity: 'medium'
            },
            removed: {},
            changed: {}
          },
          relations: {
            added: [
              { targetId: 'node-3', type: 'used-in' }
            ],
            removed: []
          },
          sources: {
            added: [
              { id: 'source-2', type: 'research' }
            ],
            removed: []
          }
        }
      }),
      getNode: jest.fn().mockResolvedValue({
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
      })
    };
    
    const versioner = new KnowledgeVersioner({
      storage: mockStorageWithData
    });
    
    const nodeId = 'node-1';
    const versionId = 'v-1';
    
    const restoredNode = await versioner.restoreVersion(nodeId, versionId);
    
    // Should call storage methods
    expect(mockStorageWithData.getVersion).toHaveBeenCalledWith(nodeId, versionId);
    expect(mockStorageWithData.getNode).toHaveBeenCalledWith(nodeId);
    expect(mockStorageWithData.saveNode).toHaveBeenCalled();
    
    // Should restore node to previous state
    expect(restoredNode.name).toBe('JavaScript');
    expect(restoredNode.content).toBe('JavaScript is a programming language.');
    expect(restoredNode.metadata).not.toHaveProperty('complexity');
    expect(restoredNode.relations).not.toContainEqual({ targetId: 'node-3', type: 'used-in' });
    expect(restoredNode.sources).not.toContainEqual({ id: 'source-2', type: 'research' });
  });
  
  test('restoreVersion should throw error for missing IDs', async () => {
    const versioner = new KnowledgeVersioner({
      storage: mockStorage
    });
    
    await expect(versioner.restoreVersion()).rejects.toThrow('Node ID and version ID are required');
    await expect(versioner.restoreVersion('node-1')).rejects.toThrow('Node ID and version ID are required');
  });
  
  test('restoreVersion should throw error without storage', async () => {
    const versioner = new KnowledgeVersioner();
    
    await expect(versioner.restoreVersion('node-1', 'v-1')).rejects.toThrow('Storage provider is required for version restoration');
  });
  
  test('calculateSimilarity should calculate similarity between strings', () => {
    const versioner = new KnowledgeVersioner();
    
    // Identical strings
    expect(versioner.calculateSimilarity('hello world', 'hello world')).toBe(1);
    
    // Similar strings
    expect(versioner.calculateSimilarity('hello world', 'hello there world')).toBeGreaterThan(0.5);
    
    // Different strings
    expect(versioner.calculateSimilarity('hello world', 'goodbye universe')).toBeLessThan(0.5);
    
    // Empty strings
    expect(versioner.calculateSimilarity('', '')).toBe(1);
    expect(versioner.calculateSimilarity('hello', '')).toBe(0);
    expect(versioner.calculateSimilarity('', 'hello')).toBe(0);
  });
});
