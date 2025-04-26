import { ResearchManager } from '../../../src/research/research-manager.js';
import { ResearchQuery } from '../../../src/research/research-query.js';
import { ResearchResult } from '../../../src/research/research-result.js';
import { PerplexityProvider } from '../../../src/providers/perplexity-provider.js';
import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';

// Mock the fs/promises module
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readdir: jest.fn().mockResolvedValue([]),
  readFile: jest.fn().mockResolvedValue('{}')
}));

// Mock the providers
jest.mock('../../../src/providers/index.js', () => ({
  getProviderByName: jest.fn().mockImplementation((name) => {
    if (name === 'perplexity') {
      return {
        name: 'perplexity',
        defaultModel: 'sonar-pro',
        defaultMaxTokens: 4000,
        isAvailable: jest.fn().mockResolvedValue(true),
        generateChatCompletion: jest.fn().mockResolvedValue({
          provider: 'perplexity',
          model: 'sonar-pro',
          message: 'This is a mock response from Perplexity'
        })
      };
    } else if (name === 'unavailable') {
      return {
        name: 'unavailable',
        isAvailable: jest.fn().mockResolvedValue(false)
      };
    } else {
      throw new Error(`Unknown provider: ${name}`);
    }
  })
}));

describe('ResearchManager', () => {
  let manager;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new manager with a test storage directory
    manager = new ResearchManager({
      storageDir: './test-data/research',
      providers: {
        perplexity: {
          apiKey: 'test-api-key'
        }
      },
      defaultProvider: 'perplexity'
    });
  });
  
  test('should create a new research manager with default values', () => {
    const defaultManager = new ResearchManager();
    
    expect(defaultManager.storageDir).toBe('./data/research');
    expect(defaultManager.providers).toEqual({});
    expect(defaultManager.defaultProvider).toBe('perplexity');
    expect(defaultManager.queries).toBeInstanceOf(Map);
    expect(defaultManager.results).toBeInstanceOf(Map);
    
    // Check that the storage directory was created
    expect(fs.mkdir).toHaveBeenCalledWith('./data/research', { recursive: true });
  });
  
  test('should create a research manager with provided values', () => {
    expect(manager.storageDir).toBe('./test-data/research');
    expect(manager.providers).toEqual({
      perplexity: {
        apiKey: 'test-api-key'
      }
    });
    expect(manager.defaultProvider).toBe('perplexity');
    expect(manager.queries).toBeInstanceOf(Map);
    expect(manager.results).toBeInstanceOf(Map);
    
    // Check that the storage directory was created
    expect(fs.mkdir).toHaveBeenCalledWith('./test-data/research', { recursive: true });
  });
  
  test('should create a research query', () => {
    const query = manager.createQuery({
      query: 'Test query',
      type: 'general',
      maxResults: 10
    });
    
    expect(query).toBeInstanceOf(ResearchQuery);
    expect(query.query).toBe('Test query');
    expect(query.type).toBe('general');
    expect(query.maxResults).toBe(10);
    
    // Check that the query was added to the manager
    expect(manager.queries.get(query.id)).toBe(query);
  });
  
  test('should get a query by ID', () => {
    const query = manager.createQuery({
      query: 'Test query'
    });
    
    const retrievedQuery = manager.getQuery(query.id);
    
    expect(retrievedQuery).toBe(query);
  });
  
  test('should return null when getting a non-existent query', () => {
    const retrievedQuery = manager.getQuery('non-existent-id');
    
    expect(retrievedQuery).toBeNull();
  });
  
  test('should execute a query with the default provider', async () => {
    const query = manager.createQuery({
      query: 'Test query'
    });
    
    const result = await manager.executeQuery(query);
    
    // Check that the result was created correctly
    expect(result).toBeInstanceOf(ResearchResult);
    expect(result.queryId).toBe(query.id);
    expect(result.provider).toBe('perplexity');
    expect(result.results).toHaveLength(1);
    expect(result.results[0].content).toBe('This is a mock response from Perplexity');
    
    // Check that the result was added to the manager
    expect(manager.results.get(result.id)).toBe(result);
    
    // Check that the result was saved to disk
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(`result-${result.id}.json`),
      expect.any(String)
    );
  });
  
  test('should execute a query with a specified provider', async () => {
    const query = manager.createQuery({
      query: 'Test query'
    });
    
    const result = await manager.executeQuery(query, 'perplexity');
    
    // Check that the result was created correctly
    expect(result).toBeInstanceOf(ResearchResult);
    expect(result.queryId).toBe(query.id);
    expect(result.provider).toBe('perplexity');
  });
  
  test('should execute a query by ID', async () => {
    const query = manager.createQuery({
      query: 'Test query'
    });
    
    const result = await manager.executeQuery(query.id);
    
    // Check that the result was created correctly
    expect(result).toBeInstanceOf(ResearchResult);
    expect(result.queryId).toBe(query.id);
  });
  
  test('should throw an error when executing a non-existent query', async () => {
    await expect(manager.executeQuery('non-existent-id')).rejects.toThrow();
  });
  
  test('should throw an error when executing a query with an unavailable provider', async () => {
    const query = manager.createQuery({
      query: 'Test query'
    });
    
    await expect(manager.executeQuery(query, 'unavailable')).rejects.toThrow('Provider unavailable is not available');
  });
  
  test('should throw an error when executing a query with an unknown provider', async () => {
    const query = manager.createQuery({
      query: 'Test query'
    });
    
    await expect(manager.executeQuery(query, 'unknown')).rejects.toThrow('Error getting provider unknown');
  });
  
  test('should get a result by ID', async () => {
    const query = manager.createQuery({
      query: 'Test query'
    });
    
    const result = await manager.executeQuery(query);
    
    const retrievedResult = manager.getResult(result.id);
    
    expect(retrievedResult).toBe(result);
  });
  
  test('should return null when getting a non-existent result', () => {
    const retrievedResult = manager.getResult('non-existent-id');
    
    expect(retrievedResult).toBeNull();
  });
  
  test('should get results for a query', async () => {
    const query = manager.createQuery({
      query: 'Test query'
    });
    
    const result1 = await manager.executeQuery(query);
    const result2 = await manager.executeQuery(query);
    
    const results = manager.getResultsForQuery(query.id);
    
    expect(results).toHaveLength(2);
    expect(results).toContain(result1);
    expect(results).toContain(result2);
  });
  
  test('should load results from disk', async () => {
    // Mock the readdir function to return some result files
    fs.readdir.mockResolvedValueOnce(['result-1.json', 'result-2.json', 'not-a-result.txt']);
    
    // Mock the readFile function to return valid result data
    fs.readFile.mockImplementation((filePath) => {
      if (filePath.includes('result-1.json')) {
        return Promise.resolve(JSON.stringify({
          id: 'result-1',
          queryId: 'query-1',
          provider: 'perplexity',
          results: [{ title: 'Result 1', content: 'Content 1' }],
          metadata: { query: 'Query 1' }
        }));
      } else if (filePath.includes('result-2.json')) {
        return Promise.resolve(JSON.stringify({
          id: 'result-2',
          queryId: 'query-2',
          provider: 'perplexity',
          results: [{ title: 'Result 2', content: 'Content 2' }],
          metadata: { query: 'Query 2' }
        }));
      } else {
        return Promise.reject(new Error('File not found'));
      }
    });
    
    const results = await manager.loadResults();
    
    // Check that the results were loaded correctly
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('result-1');
    expect(results[1].id).toBe('result-2');
    
    // Check that the results were added to the manager
    expect(manager.results.get('result-1')).toBeDefined();
    expect(manager.results.get('result-2')).toBeDefined();
    
    // Check that the queries were added to the manager
    expect(manager.queries.get('query-1')).toBeDefined();
    expect(manager.queries.get('query-2')).toBeDefined();
  });
  
  test('should clear all queries and results', async () => {
    const query = manager.createQuery({
      query: 'Test query'
    });
    
    await manager.executeQuery(query);
    
    // Check that the query and result were added to the manager
    expect(manager.queries.size).toBe(1);
    expect(manager.results.size).toBe(1);
    
    // Clear the manager
    manager.clear();
    
    // Check that the query and result were removed
    expect(manager.queries.size).toBe(0);
    expect(manager.results.size).toBe(0);
  });
});
