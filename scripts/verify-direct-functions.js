/**
 * Verification script for Direct Functions
 *
 * This script tests the Direct Functions by:
 * 1. Initializing a project
 * 2. Researching the project
 * 3. Generating a blueprint
 * 4. Listing projects
 *
 * Usage: node verify-direct-functions.js
 */

import {
  initializeProjectDirect,
  researchProjectDirect,
  generateBlueprintDirect,
  listProjectsDirect
} from '../src/core/project-manager-core.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for required API keys
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is required but not provided');
  console.error('Please create a .env file with your API keys');
  process.exit(1);
} else {
  console.log(`Using Gemini API key: ${process.env.GEMINI_API_KEY.substring(0, 5)}...`);
}

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
  },
  reportProgress: (message) => console.log(`[PROGRESS] ${message}`)
};

/**
 * Run the verification
 */
async function runVerification() {
  console.log('Starting Direct Functions verification...');
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

    // Test 2: Update project.json with requirements
    console.log('\nTest 2: Adding project requirements...');
    const projectJsonPath = path.join(tempDir, 'project.json');
    if (fs.existsSync(projectJsonPath)) {
      const projectData = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
      projectData.name = 'Test Project';
      projectData.description = 'A test project for verifying direct functions';
      projectData.requirements = 'Create a web application for project management with user authentication, task tracking, and reporting features.';
      fs.writeFileSync(projectJsonPath, JSON.stringify(projectData, null, 2));
      console.log('✅ Project requirements added successfully');
    } else {
      console.error('❌ project.json not found');
      process.exit(1);
    }

    // Test 3: Research the project
    console.log('\nTest 3: Researching the project...');
    const researchResult = await researchProjectDirect({
      projectRoot: tempDir,
      researchDepth: 'basic',
      maxResults: 3
    }, mockLog, mockContext);

    if (researchResult.success) {
      console.log(`✅ Project researched successfully: ${researchResult.data.message}`);
    } else {
      console.error(`❌ Project research failed: ${researchResult.error.message}`);
      process.exit(1);
    }

    // Test 4: Generate a blueprint
    console.log('\nTest 4: Generating a blueprint...');
    const blueprintResult = await generateBlueprintDirect({
      projectRoot: tempDir,
      blueprintName: 'test-blueprint',
      force: true
    }, mockLog, mockContext);

    if (blueprintResult.success) {
      console.log(`✅ Blueprint generated successfully: ${blueprintResult.data.message}`);
    } else {
      console.error(`❌ Blueprint generation failed: ${blueprintResult.error.message}`);
      process.exit(1);
    }

    // Test 5: List projects
    console.log('\nTest 5: Listing projects...');
    const listResult = await listProjectsDirect({
      directory: path.dirname(tempDir),
      maxDepth: 2,
      detailed: true
    }, mockLog, mockContext);

    if (listResult.success) {
      console.log(`✅ Projects listed successfully: ${listResult.data.message}`);
      console.log(`   Found ${listResult.data.projects.length} projects`);
    } else {
      console.error(`❌ Project listing failed: ${listResult.error.message}`);
      process.exit(1);
    }

    // All tests passed
    console.log('\n----------------------------------------');
    console.log('✅ All Direct Functions verification tests passed!');
    console.log('----------------------------------------');
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      // Uncomment to clean up the temp directory
      // fs.rmSync(tempDir, { recursive: true, force: true });
      console.log(`\nTemporary project data is available at: ${tempDir}`);
    }
  }
}

// Run the verification
runVerification();
