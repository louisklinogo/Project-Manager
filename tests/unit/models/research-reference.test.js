/**
 * Tests for research reference model
 */

import { ResearchReference } from '../../../src/models/research-reference.js';
import { jest } from '@jest/globals';

describe('ResearchReference', () => {
  test('should create a research reference with default values', () => {
    const reference = new ResearchReference();
    
    expect(reference.id).toBeDefined();
    expect(reference.id).toMatch(/^ref-/);
    expect(reference.researchId).toBe('');
    expect(reference.type).toBe('source');
    expect(reference.context).toBe('');
    expect(reference.content).toBe('');
    expect(reference.metadata).toEqual({});
    expect(reference.createdAt).toBeDefined();
  });
  
  test('should create a research reference with provided values', () => {
    const data = {
      id: 'test-id',
      researchId: 'research-id',
      type: 'finding',
      context: 'Test context',
      content: 'Test content',
      metadata: { key: 'value' },
      createdAt: '2023-01-01T00:00:00.000Z'
    };
    
    const reference = new ResearchReference(data);
    
    expect(reference.id).toBe(data.id);
    expect(reference.researchId).toBe(data.researchId);
    expect(reference.type).toBe(data.type);
    expect(reference.context).toBe(data.context);
    expect(reference.content).toBe(data.content);
    expect(reference.metadata).toEqual(data.metadata);
    expect(reference.createdAt).toBe(data.createdAt);
  });
  
  test('validate should throw error for invalid reference', () => {
    const reference1 = new ResearchReference({ id: '' });
    expect(() => reference1.validate()).toThrow('Research reference ID is required');
    
    const reference2 = new ResearchReference({ id: 'test-id', researchId: '' });
    expect(() => reference2.validate()).toThrow('Research ID is required');
    
    const reference3 = new ResearchReference({ id: 'test-id', researchId: 'research-id', type: '' });
    expect(() => reference3.validate()).toThrow('Reference type is required');
  });
  
  test('validate should return true for valid reference', () => {
    const reference = new ResearchReference({
      id: 'test-id',
      researchId: 'research-id',
      type: 'source'
    });
    
    expect(reference.validate()).toBe(true);
  });
  
  test('toObject should return a plain object representation', () => {
    const data = {
      id: 'test-id',
      researchId: 'research-id',
      type: 'finding',
      context: 'Test context',
      content: 'Test content',
      metadata: { key: 'value' },
      createdAt: '2023-01-01T00:00:00.000Z'
    };
    
    const reference = new ResearchReference(data);
    const obj = reference.toObject();
    
    expect(obj).toEqual(data);
  });
  
  test('fromObject should create a reference from a plain object', () => {
    const data = {
      id: 'test-id',
      researchId: 'research-id',
      type: 'finding',
      context: 'Test context',
      content: 'Test content',
      metadata: { key: 'value' },
      createdAt: '2023-01-01T00:00:00.000Z'
    };
    
    const reference = ResearchReference.fromObject(data);
    
    expect(reference).toBeInstanceOf(ResearchReference);
    expect(reference.id).toBe(data.id);
    expect(reference.researchId).toBe(data.researchId);
    expect(reference.type).toBe(data.type);
    expect(reference.context).toBe(data.context);
    expect(reference.content).toBe(data.content);
    expect(reference.metadata).toEqual(data.metadata);
    expect(reference.createdAt).toBe(data.createdAt);
  });
  
  test('createSourceReference should create a source reference', () => {
    const researchId = 'research-id';
    const metadata = { key: 'value' };
    
    const reference = ResearchReference.createSourceReference(researchId, metadata);
    
    expect(reference).toBeInstanceOf(ResearchReference);
    expect(reference.researchId).toBe(researchId);
    expect(reference.type).toBe('source');
    expect(reference.metadata).toEqual(metadata);
  });
  
  test('createFindingReference should create a finding reference', () => {
    const researchId = 'research-id';
    const finding = 'Test finding';
    const metadata = { key: 'value' };
    
    const reference = ResearchReference.createFindingReference(researchId, finding, metadata);
    
    expect(reference).toBeInstanceOf(ResearchReference);
    expect(reference.researchId).toBe(researchId);
    expect(reference.type).toBe('finding');
    expect(reference.content).toBe(finding);
    expect(reference.metadata).toEqual(metadata);
  });
  
  test('createConceptReference should create a concept reference', () => {
    const researchId = 'research-id';
    const concept = 'Test concept';
    const description = 'Test description';
    const metadata = { key: 'value' };
    
    const reference = ResearchReference.createConceptReference(researchId, concept, description, metadata);
    
    expect(reference).toBeInstanceOf(ResearchReference);
    expect(reference.researchId).toBe(researchId);
    expect(reference.type).toBe('concept');
    expect(reference.content).toBe(concept);
    expect(reference.context).toBe(description);
    expect(reference.metadata).toEqual(metadata);
  });
});
