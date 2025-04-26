import { researchProjectDirect } from '../../../../src/core/direct-functions/research-project-direct.js';
import { findProjectJsonPath } from '../../../../src/core/utils/path-utils.js';
import { ResearchManager } from '../../../../src/research/research-manager.js';
import { getBestAvailableProvider } from '../../../../src/providers/index.js';
import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../../src/core/utils/path-utils.js', () => ({
  findProjectJsonPath: jest.fn()
}));

jest.mock('../../../../src/research/research-manager.js', () => {
  const mockCreateQuery = jest.fn().mockReturnValue({
    id: 'test-query-id',
    query: 'test query'
  });
  
  const mockExecuteQuery = jest.fn().mockResolvedValue({
    id: 'test-result-id',
    queryId: 'test-query-id',
    provider: 'test-provider',
    results: [
      {
        title: 'Test Result',
        content: 'This is a test result'
      }
    ]
  });
  
  return {
    ResearchManager: jest.fn().mockImplementation(() => ({
      createQuery: mockCreateQuery,
      executeQuery: mockExecuteQuery
    }))
  };
});

jest.mock('../../../../src/providers/index.js', () => ({
  getBestAvailableProvider: jest.fn()
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn(path => path.split('/').slice(0, -1).join('/') || '/')
}));

describe('researchProjectDirect', () => {
  let mockLog;
  let mockContext;
  
  beforeEach(() => {
    // Mock findProjectJsonPath
    findProjectJsonPath.mockReturnValue('/test/project/project.json');
    
    // Mock fs functions
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReturnValue(undefined);
    fs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'Test Project',
      description: 'A test project',
      requirements: 'This is a test project with requirements',
      research: {
        domain_knowledge: [],
        similar_projects: [],
        best_practices: []
      }
    }));
    fs.writeFileSync.mockReturnValue(undefined);
    
    // Mock getBestAvailableProvider
    getBestAvailableProvider.mockResolvedValue({
      name: 'test-provider',
      apiKey: 'test-api-key',
      defaultModel: 'test-model'
    });
    
    // Create mock log and context
    mockLog = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    
    mockContext = {
      reportProgress: jest.fn()
    };
  });
  
  afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  test('should research a project successfully', async () => {
    // Call the function
    const result = await researchProjectDirect({
      projectRoot: '/test/project',
      researchDepth: 'basic',
      maxResults: 5
    }, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(true);
    expect(result.data.message).toContain('Research completed');
    expect(result.data.results).toHaveLength(5); // Default for 'basic' depth
    
    // Check that findProjectJsonPath was called
    expect(findProjectJsonPath).toHaveBeenCalledWith('/test/project');
    
    // Check that fs.readFileSync was called
    expect(fs.readFileSync).toHaveBeenCalledWith('/test/project/project.json', 'utf8');
    
    // Check that ResearchManager was instantiated
    expect(ResearchManager).toHaveBeenCalled();
    
    // Check that createQuery and executeQuery were called
    const researchManager = ResearchManager.mock.results[0].value;
    expect(researchManager.createQuery).toHaveBeenCalled();
    expect(researchManager.executeQuery).toHaveBeenCalled();
    
    // Check that fs.writeFileSync was called to update project.json
    expect(fs.writeFileSync).toHaveBeenCalledWith('/test/project/project.json', expect.any(String));
  });
  
  test('should return error if project file not found', async () => {
    // Mock findProjectJsonPath to return null
    findProjectJsonPath.mockReturnValue(null);
    
    // Call the function
    const result = await researchProjectDirect({
      projectRoot: '/test/project'
    }, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('PROJECT_FILE_NOT_FOUND');
  });
  
  test('should return error if no requirements found', async () => {
    // Mock fs.readFileSync to return project without requirements
    fs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'Test Project',
      description: 'A test project',
      research: {
        domain_knowledge: [],
        similar_projects: [],
        best_practices: []
      }
    }));
    
    // Call the function
    const result = await researchProjectDirect({
      projectRoot: '/test/project'
    }, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('NO_REQUIREMENTS');
  });
  
  test('should update requirements if provided', async () => {
    // Call the function with requirements
    const result = await researchProjectDirect({
      projectRoot: '/test/project',
      requirements: 'New requirements'
    }, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(true);
    
    // Check that fs.writeFileSync was called to update project.json with new requirements
    expect(fs.writeFileSync).toHaveBeenCalledWith('/test/project/project.json', expect.stringContaining('New requirements'));
  });
  
  test('should use standard research depth', async () => {
    // Call the function with standard research depth
    const result = await researchProjectDirect({
      projectRoot: '/test/project',
      researchDepth: 'standard'
    }, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(true);
    expect(result.data.results).toHaveLength(10); // 10 for 'standard' depth
  });
  
  test('should use comprehensive research depth', async () => {
    // Call the function with comprehensive research depth
    const result = await researchProjectDirect({
      projectRoot: '/test/project',
      researchDepth: 'comprehensive'
    }, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(true);
    // Should execute all queries for 'comprehensive' depth
  });
});
