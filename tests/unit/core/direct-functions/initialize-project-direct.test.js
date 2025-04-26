import { initializeProjectDirect } from '../../../../src/core/direct-functions/initialize-project-direct.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { jest } from '@jest/globals';

// Mock fs and path modules
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  copyFileSync: jest.fn(),
  statSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn(path => path.split('/').slice(0, -1).join('/') || '/')
}));

jest.mock('os', () => ({
  homedir: jest.fn()
}));

describe('initializeProjectDirect', () => {
  let mockLog;
  let mockContext;
  let originalCwd;
  
  beforeEach(() => {
    // Save original process.cwd
    originalCwd = process.cwd;
    
    // Mock process.cwd and process.chdir
    process.cwd = jest.fn().mockReturnValue('/test/project');
    process.chdir = jest.fn();
    
    // Mock os.homedir
    os.homedir.mockReturnValue('/home/user');
    
    // Mock fs functions
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockReturnValue(undefined);
    fs.writeFileSync.mockReturnValue(undefined);
    fs.readFileSync.mockImplementation((path) => {
      if (path.includes('mcp.json')) {
        return '{}';
      }
      return '';
    });
    
    // Create mock log and context
    mockLog = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    
    mockContext = {
      session: {
        workspaceRoot: '/test/project'
      }
    };
  });
  
  afterEach(() => {
    // Restore process.cwd
    process.cwd = originalCwd;
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  test('should initialize a project successfully', async () => {
    // Call the function
    const result = await initializeProjectDirect({
      projectRoot: '/test/project',
      addAliases: false
    }, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(true);
    expect(result.data.message).toContain('Project initialized successfully');
    expect(result.data.projectRoot).toBe('/test/project');
    
    // Check that process.chdir was called
    expect(process.chdir).toHaveBeenCalledWith('/test/project');
    
    // Check that directories were created
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('.cursor'), expect.any(Object));
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('src'), expect.any(Object));
    
    // Check that files were written
    expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('mcp.json'), expect.any(String));
  });
  
  test('should use session workspace root if projectRoot is not provided', async () => {
    // Call the function without projectRoot
    const result = await initializeProjectDirect({}, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(true);
    expect(result.data.projectRoot).toBe('/test/project');
    
    // Check that process.chdir was called with the session workspace root
    expect(process.chdir).toHaveBeenCalledWith('/test/project');
  });
  
  test('should return error if target directory is invalid', async () => {
    // Mock os.homedir to return the same as projectRoot to trigger the validation error
    os.homedir.mockReturnValue('/test/project');
    
    // Call the function
    const result = await initializeProjectDirect({
      projectRoot: '/test/project'
    }, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('INVALID_TARGET_DIRECTORY');
  });
  
  test('should return error if directory change fails', async () => {
    // Mock process.chdir to throw an error
    process.chdir.mockImplementation(() => {
      throw new Error('Permission denied');
    });
    
    // Call the function
    const result = await initializeProjectDirect({
      projectRoot: '/test/project'
    }, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('DIRECTORY_CHANGE_FAILED');
  });
  
  test('should return error if project initialization fails', async () => {
    // Mock fs.mkdirSync to throw an error
    fs.mkdirSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });
    
    // Call the function
    const result = await initializeProjectDirect({
      projectRoot: '/test/project'
    }, mockLog, mockContext);
    
    // Check the result
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('PROJECT_INITIALIZATION_FAILED');
  });
});
