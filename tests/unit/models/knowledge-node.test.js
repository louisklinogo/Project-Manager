/**
 * Tests for knowledge node model
 */

import { KnowledgeNode } from '../../../src/models/knowledge-node.js';
import { jest } from '@jest/globals';

describe('KnowledgeNode', () => {
  test('should create a knowledge node with default values', () => {
    const node = new KnowledgeNode();
    
    expect(node.id).toBeDefined();
    expect(node.id).toMatch(/^kn-/);
    expect(node.type).toBe('concept');
    expect(node.name).toBe('');
    expect(node.description).toBe('');
    expect(node.content).toBe('');
    expect(node.tags).toEqual([]);
    expect(node.relations).toEqual([]);
    expect(node.metadata).toEqual({});
    expect(node.sources).toEqual([]);
    expect(node.createdAt).toBeDefined();
    expect(node.updatedAt).toBeDefined();
    expect(node.confidence).toBe(0.5);
  });
  
  test('should create a knowledge node with provided values', () => {
    const data = {
      id: 'test-id',
      type: 'pattern',
      name: 'Test Pattern',
      description: 'A test pattern',
      content: 'Pattern content',
      tags: ['test', 'pattern'],
      relations: [{ targetId: 'other-id', type: 'related-to' }],
      metadata: { key: 'value' },
      sources: [{ id: 'source-id', type: 'research' }],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      confidence: 0.8
    };
    
    const node = new KnowledgeNode(data);
    
    expect(node.id).toBe(data.id);
    expect(node.type).toBe(data.type);
    expect(node.name).toBe(data.name);
    expect(node.description).toBe(data.description);
    expect(node.content).toBe(data.content);
    expect(node.tags).toEqual(data.tags);
    expect(node.relations).toEqual(data.relations);
    expect(node.metadata).toEqual(data.metadata);
    expect(node.sources).toEqual(data.sources);
    expect(node.createdAt).toBe(data.createdAt);
    expect(node.updatedAt).toBe(data.updatedAt);
    expect(node.confidence).toBe(data.confidence);
  });
  
  test('validate should throw error for invalid node', () => {
    const node1 = new KnowledgeNode({ id: '' });
    expect(() => node1.validate()).toThrow('Knowledge node ID is required');
    
    const node2 = new KnowledgeNode({ id: 'test-id', type: '' });
    expect(() => node2.validate()).toThrow('Knowledge node type is required');
    
    const node3 = new KnowledgeNode({ id: 'test-id', type: 'concept', name: '' });
    expect(() => node3.validate()).toThrow('Knowledge node name is required');
  });
  
  test('validate should return true for valid node', () => {
    const node = new KnowledgeNode({
      id: 'test-id',
      type: 'concept',
      name: 'Test Concept'
    });
    
    expect(node.validate()).toBe(true);
  });
  
  test('addRelation should add a relation to the node', () => {
    const node = new KnowledgeNode({
      id: 'test-id',
      type: 'concept',
      name: 'Test Concept'
    });
    
    const targetId = 'target-id';
    const relationType = 'related-to';
    const metadata = { key: 'value' };
    
    node.addRelation(targetId, relationType, metadata);
    
    expect(node.relations.length).toBe(1);
    expect(node.relations[0].targetId).toBe(targetId);
    expect(node.relations[0].type).toBe(relationType);
    expect(node.relations[0].metadata).toEqual(metadata);
    expect(node.relations[0].createdAt).toBeDefined();
    
    // Should update the updatedAt timestamp
    expect(node.updatedAt).not.toBe(node.createdAt);
  });
  
  test('addSource should add a source to the node', () => {
    const node = new KnowledgeNode({
      id: 'test-id',
      type: 'concept',
      name: 'Test Concept'
    });
    
    const source = {
      id: 'source-id',
      type: 'research',
      url: 'https://example.com',
      metadata: { key: 'value' }
    };
    
    node.addSource(source);
    
    expect(node.sources.length).toBe(1);
    expect(node.sources[0].id).toBe(source.id);
    expect(node.sources[0].type).toBe(source.type);
    expect(node.sources[0].url).toBe(source.url);
    expect(node.sources[0].metadata).toEqual(source.metadata);
    expect(node.sources[0].addedAt).toBeDefined();
    
    // Should update the updatedAt timestamp
    expect(node.updatedAt).not.toBe(node.createdAt);
  });
  
  test('addSource should throw error for invalid source', () => {
    const node = new KnowledgeNode({
      id: 'test-id',
      type: 'concept',
      name: 'Test Concept'
    });
    
    expect(() => node.addSource({})).toThrow('Source ID is required');
    expect(() => node.addSource({ id: 'source-id' })).toThrow('Source type is required');
  });
  
  test('update should update the node properties', () => {
    const node = new KnowledgeNode({
      id: 'test-id',
      type: 'concept',
      name: 'Test Concept',
      description: 'Original description',
      content: 'Original content',
      tags: ['original'],
      metadata: { original: true },
      confidence: 0.5
    });
    
    const updateData = {
      name: 'Updated Concept',
      description: 'Updated description',
      content: 'Updated content',
      tags: ['updated'],
      metadata: { updated: true },
      confidence: 0.8
    };
    
    node.update(updateData);
    
    expect(node.name).toBe(updateData.name);
    expect(node.description).toBe(updateData.description);
    expect(node.content).toBe(updateData.content);
    expect(node.tags).toContain('original');
    expect(node.tags).toContain('updated');
    expect(node.metadata.original).toBe(true);
    expect(node.metadata.updated).toBe(true);
    expect(node.confidence).toBe(updateData.confidence);
    
    // Should update the updatedAt timestamp
    expect(node.updatedAt).not.toBe(node.createdAt);
  });
  
  test('toObject should return a plain object representation', () => {
    const data = {
      id: 'test-id',
      type: 'pattern',
      name: 'Test Pattern',
      description: 'A test pattern',
      content: 'Pattern content',
      tags: ['test', 'pattern'],
      relations: [{ targetId: 'other-id', type: 'related-to' }],
      metadata: { key: 'value' },
      sources: [{ id: 'source-id', type: 'research' }],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      confidence: 0.8
    };
    
    const node = new KnowledgeNode(data);
    const obj = node.toObject();
    
    expect(obj).toEqual(data);
  });
  
  test('fromObject should create a node from a plain object', () => {
    const data = {
      id: 'test-id',
      type: 'pattern',
      name: 'Test Pattern',
      description: 'A test pattern',
      content: 'Pattern content',
      tags: ['test', 'pattern'],
      relations: [{ targetId: 'other-id', type: 'related-to' }],
      metadata: { key: 'value' },
      sources: [{ id: 'source-id', type: 'research' }],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      confidence: 0.8
    };
    
    const node = KnowledgeNode.fromObject(data);
    
    expect(node).toBeInstanceOf(KnowledgeNode);
    expect(node.id).toBe(data.id);
    expect(node.type).toBe(data.type);
    expect(node.name).toBe(data.name);
    expect(node.description).toBe(data.description);
    expect(node.content).toBe(data.content);
    expect(node.tags).toEqual(data.tags);
    expect(node.relations).toEqual(data.relations);
    expect(node.metadata).toEqual(data.metadata);
    expect(node.sources).toEqual(data.sources);
    expect(node.createdAt).toBe(data.createdAt);
    expect(node.updatedAt).toBe(data.updatedAt);
    expect(node.confidence).toBe(data.confidence);
  });
  
  test('withRelation should create a node with a relation', () => {
    const data = {
      id: 'test-id',
      type: 'concept',
      name: 'Test Concept'
    };
    
    const targetId = 'target-id';
    const relationType = 'related-to';
    
    const node = KnowledgeNode.withRelation(data, targetId, relationType);
    
    expect(node).toBeInstanceOf(KnowledgeNode);
    expect(node.id).toBe(data.id);
    expect(node.type).toBe(data.type);
    expect(node.name).toBe(data.name);
    expect(node.relations.length).toBe(1);
    expect(node.relations[0].targetId).toBe(targetId);
    expect(node.relations[0].type).toBe(relationType);
  });
});
