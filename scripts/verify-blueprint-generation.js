/**
 * Simplified verification script for blueprint generation
 * 
 * This script tests the blueprint generation function by:
 * 1. Creating a project.json file
 * 2. Generating a blueprint
 * 
 * Usage: node verify-blueprint-generation.js
 */

import { generateBlueprintDirect } from '../src/core/direct-functions/generate-blueprint-direct.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a temporary directory for the test project
const tempDir = path.join(process.cwd(), 'temp-blueprint-test');
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
  reportProgress: (message) => console.log(`[PROGRESS] ${message}`)
};

/**
 * Create a sample project.json file
 */
function createSampleProjectFile() {
  const projectData = {
    id: 'test-project',
    name: 'Test Project',
    description: 'A test project for verifying blueprint generation',
    requirements: 'Create a web application for project management with user authentication, task tracking, and reporting features.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    research: {
      domain_knowledge: [
        {
          query: 'best practices for web application development',
          summary: 'Use modern frameworks, implement proper authentication, follow responsive design principles.'
        }
      ],
      similar_projects: [
        {
          query: 'popular project management tools',
          summary: 'Trello, Asana, Jira, and Monday.com are popular options with various features.'
        }
      ],
      best_practices: [
        {
          query: 'best practices for user authentication',
          summary: 'Use OAuth 2.0, implement MFA, store passwords securely with bcrypt or Argon2.'
        }
      ]
    }
  };
  
  const projectJsonPath = path.join(tempDir, 'project.json');
  fs.writeFileSync(projectJsonPath, JSON.stringify(projectData, null, 2));
  
  return projectJsonPath;
}

/**
 * Run the verification
 */
async function runVerification() {
  console.log('Starting Blueprint Generation verification...');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Create a sample project.json file
    console.log('Test 1: Creating a sample project.json file...');
    const projectJsonPath = createSampleProjectFile();
    
    if (fs.existsSync(projectJsonPath)) {
      console.log(`✅ Created sample project.json at ${projectJsonPath}`);
    } else {
      console.error('❌ Failed to create sample project.json');
      process.exit(1);
    }
    
    // Test 2: Generate a blueprint
    console.log('\nTest 2: Generating a blueprint...');
    const result = await generateBlueprintDirect({
      projectRoot: tempDir,
      blueprintName: 'test-blueprint',
      force: true
    }, mockLog, mockContext);
    
    if (result.success) {
      console.log(`✅ Blueprint generated successfully: ${result.data.message}`);
    } else {
      console.error(`❌ Blueprint generation failed: ${result.error.message}`);
      process.exit(1);
    }
    
    // Test 3: Verify blueprint file exists
    console.log('\nTest 3: Verifying blueprint file exists...');
    const blueprintPath = path.join(tempDir, 'blueprints', 'test-blueprint.json');
    
    if (fs.existsSync(blueprintPath)) {
      console.log(`✅ Blueprint file exists at ${blueprintPath}`);
    } else {
      console.error(`❌ Blueprint file does not exist at ${blueprintPath}`);
      process.exit(1);
    }
    
    // Test 4: Verify blueprint content
    console.log('\nTest 4: Verifying blueprint content...');
    const blueprintContent = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
    
    if (blueprintContent.architecture && blueprintContent.tasks) {
      console.log('✅ Blueprint content is valid');
      console.log(`   Architecture components: ${blueprintContent.architecture.components?.length || 0}`);
      console.log(`   Tasks: ${blueprintContent.tasks?.length || 0}`);
    } else {
      console.error('❌ Blueprint content is invalid');
      process.exit(1);
    }
    
    // All tests passed
    console.log('\n----------------------------------------');
    console.log('✅ All Blueprint Generation verification tests passed!');
    console.log('----------------------------------------');
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the verification
runVerification();
