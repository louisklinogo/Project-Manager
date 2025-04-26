/**
 * Simplified verification script for project initialization
 * 
 * This script tests the initialization function by:
 * 1. Initializing a project
 * 2. Verifying the project structure
 * 
 * Usage: node verify-initialization.js
 */

import { initializeProjectDirect } from '../src/core/direct-functions/initialize-project-direct.js';
import fs from 'fs';
import path from 'path';

// Create a temporary directory for the test project
const tempDir = path.join(process.cwd(), 'temp-project');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Create a mock logger
const mockLog = {
  info: (message) => console.log(`[INFO] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`)
};

// Create a mock context
const mockContext = {
  session: {
    workspaceRoot: tempDir
  }
};

/**
 * Run the verification
 */
async function runVerification() {
  console.log('Starting Project Initialization verification...');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Initialize a project
    console.log('Test 1: Initializing a project...');
    const initResult = await initializeProjectDirect({
      projectRoot: tempDir,
      addAliases: false
    }, mockLog, mockContext);
    
    if (initResult.success) {
      console.log(`✅ Project initialized successfully: ${initResult.data.message}`);
    } else {
      console.error(`❌ Project initialization failed: ${initResult.error.message}`);
      process.exit(1);
    }
    
    // Test 2: Verify project structure
    console.log('\nTest 2: Verifying project structure...');
    const projectJsonPath = path.join(tempDir, 'project.json');
    if (fs.existsSync(projectJsonPath)) {
      console.log('✅ project.json created successfully');
    } else {
      console.error('❌ project.json not found');
      process.exit(1);
    }
    
    // Check for other important files and directories
    const filesToCheck = [
      '.cursor/mcp.json',
      'src',
      'src/core',
      'src/models',
      'src/providers',
      'src/research',
      'src/blueprints',
      'src/mcp-server',
      'tests',
      'tests/unit',
      'tests/integration',
      'blueprints'
    ];
    
    let allFilesExist = true;
    for (const file of filesToCheck) {
      const filePath = path.join(tempDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} created successfully`);
      } else {
        console.error(`❌ ${file} not found`);
        allFilesExist = false;
      }
    }
    
    if (allFilesExist) {
      console.log('\n✅ All project files and directories created successfully');
    } else {
      console.error('\n❌ Some project files or directories are missing');
      process.exit(1);
    }
    
    // All tests passed
    console.log('\n----------------------------------------');
    console.log('✅ Project Initialization verification tests passed!');
    console.log('----------------------------------------');
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the verification
runVerification();
