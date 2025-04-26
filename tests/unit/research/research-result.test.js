import { ResearchResult } from '../../../src/research/research-result.js';
import { jest } from '@jest/globals';

describe('ResearchResult', () => {
  let result;
  
  beforeEach(() => {
    result = new ResearchResult({
      queryId: 'test-query-id',
      provider: 'perplexity',
      results: [
        {
          title: 'Test Result 1',
          url: 'https://example.com/1',
          snippet: 'This is a test snippet 1',
          content: 'This is the full content of test result 1'
        },
        {
          title: 'Test Result 2',
          url: 'https://example.com/2',
          snippet: 'This is a test snippet 2',
          content: 'This is the full content of test result 2'
        }
      ],
      metadata: {
        query: 'Test query',
        model: 'sonar-pro'
      }
    });
  });
  
  test('should create a new research result with default values', () => {
    const defaultResult = new ResearchResult();
    
    expect(defaultResult.id).toBeDefined();
    expect(defaultResult.queryId).toBe('');
    expect(defaultResult.provider).toBe('');
    expect(defaultResult.results).toEqual([]);
    expect(defaultResult.metadata).toEqual({});
    expect(defaultResult.createdAt).toBeDefined();
  });
  
  test('should create a research result with provided values', () => {
    expect(result.id).toBeDefined();
    expect(result.queryId).toBe('test-query-id');
    expect(result.provider).toBe('perplexity');
    expect(result.results).toHaveLength(2);
    expect(result.results[0].title).toBe('Test Result 1');
    expect(result.metadata).toEqual({
      query: 'Test query',
      model: 'sonar-pro'
    });
    expect(result.createdAt).toBeDefined();
  });
  
  test('should validate a research result', () => {
    expect(result.validate()).toBe(true);
  });
  
  test('should throw an error if result ID is missing', () => {
    result.id = '';
    expect(() => result.validate()).toThrow('Research result ID is required');
  });
  
  test('should throw an error if query ID is missing', () => {
    result.queryId = '';
    expect(() => result.validate()).toThrow('Research query ID is required');
  });
  
  test('should throw an error if provider is missing', () => {
    result.provider = '';
    expect(() => result.validate()).toThrow('Research provider is required');
  });
  
  test('should get result items', () => {
    const items = result.getItems();
    
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('Test Result 1');
    expect(items[1].title).toBe('Test Result 2');
  });
  
  test('should convert result to markdown', () => {
    const markdown = result.toMarkdown();
    
    expect(markdown).toContain('# Research Results');
    expect(markdown).toContain('Query: Test query');
    expect(markdown).toContain('Provider: perplexity');
    expect(markdown).toContain('Results: 2');
    expect(markdown).toContain('## Result 1');
    expect(markdown).toContain('### Test Result 1');
    expect(markdown).toContain('Source: [https://example.com/1](https://example.com/1)');
    expect(markdown).toContain('This is the full content of test result 1');
    expect(markdown).toContain('## Result 2');
  });
  
  test('should extract information as text with summary focus', () => {
    const text = result.extractInformation({ format: 'text', focus: 'summary' });
    
    expect(text).toContain('Research Results for "Test query"');
    expect(text).toContain('1. Test Result 1');
    expect(text).toContain('Source: https://example.com/1');
    expect(text).toContain('This is a test snippet 1');
    expect(text).toContain('2. Test Result 2');
  });
  
  test('should extract information as text with details focus', () => {
    const text = result.extractInformation({ format: 'text', focus: 'details' });
    
    expect(text).toContain('Research Results for "Test query"');
    expect(text).toContain('1. Test Result 1');
    expect(text).toContain('Source: https://example.com/1');
    expect(text).toContain('This is the full content of test result 1');
    expect(text).toContain('2. Test Result 2');
  });
  
  test('should extract information as JSON with summary focus', () => {
    const json = result.extractInformation({ format: 'json', focus: 'summary' });
    
    expect(json).toEqual({
      query: 'Test query',
      provider: 'perplexity',
      resultCount: 2,
      results: [
        {
          title: 'Test Result 1',
          url: 'https://example.com/1',
          content: 'This is a test snippet 1'
        },
        {
          title: 'Test Result 2',
          url: 'https://example.com/2',
          content: 'This is a test snippet 2'
        }
      ]
    });
  });
  
  test('should extract information as JSON with details focus', () => {
    const json = result.extractInformation({ format: 'json', focus: 'details' });
    
    expect(json).toEqual({
      query: 'Test query',
      provider: 'perplexity',
      resultCount: 2,
      results: [
        {
          title: 'Test Result 1',
          url: 'https://example.com/1',
          content: 'This is the full content of test result 1'
        },
        {
          title: 'Test Result 2',
          url: 'https://example.com/2',
          content: 'This is the full content of test result 2'
        }
      ]
    });
  });
  
  test('should create a result from a plain object', () => {
    const data = {
      id: 'test-id',
      queryId: 'test-query-id',
      provider: 'perplexity',
      results: [
        {
          title: 'Test Result 1',
          url: 'https://example.com/1',
          snippet: 'This is a test snippet 1',
          content: 'This is the full content of test result 1'
        }
      ],
      metadata: {
        query: 'Test query',
        model: 'sonar-pro'
      },
      createdAt: '2023-01-01T00:00:00.000Z'
    };
    
    const newResult = ResearchResult.fromObject(data);
    
    expect(newResult.id).toBe('test-id');
    expect(newResult.queryId).toBe('test-query-id');
    expect(newResult.provider).toBe('perplexity');
    expect(newResult.results).toHaveLength(1);
    expect(newResult.results[0].title).toBe('Test Result 1');
    expect(newResult.metadata).toEqual({
      query: 'Test query',
      model: 'sonar-pro'
    });
    expect(newResult.createdAt).toBe('2023-01-01T00:00:00.000Z');
  });
  
  test('should convert result to a plain object', () => {
    const obj = result.toObject();
    
    expect(obj).toEqual({
      id: result.id,
      queryId: 'test-query-id',
      provider: 'perplexity',
      results: [
        {
          title: 'Test Result 1',
          url: 'https://example.com/1',
          snippet: 'This is a test snippet 1',
          content: 'This is the full content of test result 1'
        },
        {
          title: 'Test Result 2',
          url: 'https://example.com/2',
          snippet: 'This is a test snippet 2',
          content: 'This is the full content of test result 2'
        }
      ],
      metadata: {
        query: 'Test query',
        model: 'sonar-pro'
      },
      createdAt: result.createdAt
    });
  });
});
