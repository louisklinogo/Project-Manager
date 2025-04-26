import { ResearchQuery } from '../../../src/research/research-query.js';
import { jest } from '@jest/globals';

describe('ResearchQuery', () => {
  let query;
  
  beforeEach(() => {
    query = new ResearchQuery({
      query: 'Test query',
      type: 'general',
      maxResults: 10,
      includeDomains: ['example.com'],
      excludeDomains: ['spam.com'],
      timeRange: 'week',
      options: { searchDepth: 'advanced' }
    });
  });
  
  test('should create a new research query with default values', () => {
    const defaultQuery = new ResearchQuery();
    
    expect(defaultQuery.id).toBeDefined();
    expect(defaultQuery.query).toBe('');
    expect(defaultQuery.type).toBe('general');
    expect(defaultQuery.maxResults).toBe(10);
    expect(defaultQuery.includeDomains).toEqual([]);
    expect(defaultQuery.excludeDomains).toEqual([]);
    expect(defaultQuery.timeRange).toBe('');
    expect(defaultQuery.options).toEqual({});
    expect(defaultQuery.createdAt).toBeDefined();
  });
  
  test('should create a research query with provided values', () => {
    expect(query.id).toBeDefined();
    expect(query.query).toBe('Test query');
    expect(query.type).toBe('general');
    expect(query.maxResults).toBe(10);
    expect(query.includeDomains).toEqual(['example.com']);
    expect(query.excludeDomains).toEqual(['spam.com']);
    expect(query.timeRange).toBe('week');
    expect(query.options).toEqual({ searchDepth: 'advanced' });
    expect(query.createdAt).toBeDefined();
  });
  
  test('should validate a research query', () => {
    expect(query.validate()).toBe(true);
  });
  
  test('should throw an error if query ID is missing', () => {
    query.id = '';
    expect(() => query.validate()).toThrow('Research query ID is required');
  });
  
  test('should throw an error if query text is missing', () => {
    query.query = '';
    expect(() => query.validate()).toThrow('Research query text is required');
  });
  
  test('should convert query to Tavily provider params', () => {
    const params = query.toProviderParams('tavily');
    
    expect(params).toEqual({
      query: 'Test query',
      max_results: 10,
      include_domains: ['example.com'],
      exclude_domains: ['spam.com'],
      time_range: 'week',
      search_depth: 'advanced',
      include_raw_content: false,
      include_images: false
    });
  });
  
  test('should convert query to Perplexity provider params', () => {
    const params = query.toProviderParams('perplexity');
    
    expect(params).toEqual({
      query: 'Test query',
      max_results: 10,
      focus: 'internet',
      highlight: false
    });
  });
  
  test('should convert query to FireCrawl provider params', () => {
    const params = query.toProviderParams('firecrawl');
    
    expect(params).toEqual({
      query: 'Test query',
      maxUrls: 10,
      maxDepth: 3,
      timeLimit: 60
    });
  });
  
  test('should convert query to default provider params', () => {
    const params = query.toProviderParams('unknown');
    
    expect(params).toEqual({
      query: 'Test query',
      maxResults: 10,
      options: { searchDepth: 'advanced' }
    });
  });
  
  test('should create a query from a plain object', () => {
    const data = {
      id: 'test-id',
      query: 'Test query',
      type: 'general',
      maxResults: 10,
      includeDomains: ['example.com'],
      excludeDomains: ['spam.com'],
      timeRange: 'week',
      options: { searchDepth: 'advanced' },
      createdAt: '2023-01-01T00:00:00.000Z'
    };
    
    const newQuery = ResearchQuery.fromObject(data);
    
    expect(newQuery.id).toBe('test-id');
    expect(newQuery.query).toBe('Test query');
    expect(newQuery.type).toBe('general');
    expect(newQuery.maxResults).toBe(10);
    expect(newQuery.includeDomains).toEqual(['example.com']);
    expect(newQuery.excludeDomains).toEqual(['spam.com']);
    expect(newQuery.timeRange).toBe('week');
    expect(newQuery.options).toEqual({ searchDepth: 'advanced' });
    expect(newQuery.createdAt).toBe('2023-01-01T00:00:00.000Z');
  });
  
  test('should convert query to a plain object', () => {
    const obj = query.toObject();
    
    expect(obj).toEqual({
      id: query.id,
      query: 'Test query',
      type: 'general',
      maxResults: 10,
      includeDomains: ['example.com'],
      excludeDomains: ['spam.com'],
      timeRange: 'week',
      options: { searchDepth: 'advanced' },
      createdAt: query.createdAt
    });
  });
});
