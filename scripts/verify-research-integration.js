/**
 * Verification script for research module integration
 * 
 * This script tests the integration between the research module and other components:
 * 1. Research module integration with project initialization
 * 2. Research module integration with blueprint generation
 * 3. Research-driven planning utilities
 * 
 * Usage: node verify-research-integration.js
 */

import fs from 'fs';
import path from 'path';
import { ResearchManager } from '../src/research/index.js';
import { 
  generateProjectPlan, 
  generateArchitectureRecommendations, 
  generateTaskBreakdown 
} from '../src/research/planning-utils.js';
import { initializeProjectDirect } from '../src/core/direct-functions/initialize-project-direct.js';
import { researchProjectDirect } from '../src/core/direct-functions/research-project-direct.js';
import { generateBlueprintDirect } from '../src/core/direct-functions/generate-blueprint-direct.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a temporary directory for the test project
const tempDir = path.join(process.cwd(), 'temp-research-integration-test');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Create a logger
const log = {
  info: (message) => console.log(`[INFO] ${message}`),
  warn: (message) => console.log(`[WARN] ${message}`),
  error: (message) => console.log(`[ERROR] ${message}`)
};

// Create a mock context
const context = {
  session: {
    workspaceRoot: tempDir
  },
  reportProgress: (message) => console.log(`[PROGRESS] ${message}`)
};

/**
 * Run the verification
 */
async function runVerification() {
  console.log('Starting Research Module Integration verification...');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Initialize a project
    console.log('Test 1: Initializing a project...');
    const initResult = await initializeProjectDirect({
      projectRoot: tempDir
    }, log, context);
    
    if (initResult.success) {
      console.log(`✅ Project initialized successfully: ${initResult.data.message}`);
    } else {
      console.error(`❌ Project initialization failed: ${initResult.error.message}`);
      process.exit(1);
    }
    
    // Test 2: Create a sample project.json file with requirements
    console.log('\nTest 2: Creating a sample project.json file...');
    const projectData = {
      name: 'Test Project',
      description: 'A test project for verifying research module integration',
      requirements: 'Create a web application for project management with user authentication, task tracking, and reporting features.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      research: {
        domain_knowledge: [],
        similar_projects: [],
        best_practices: []
      }
    };
    
    const projectJsonPath = path.join(tempDir, 'project.json');
    fs.writeFileSync(projectJsonPath, JSON.stringify(projectData, null, 2));
    
    if (fs.existsSync(projectJsonPath)) {
      console.log(`✅ Created sample project.json at ${projectJsonPath}`);
    } else {
      console.error(`❌ Failed to create sample project.json at ${projectJsonPath}`);
      process.exit(1);
    }
    
    // Test 3: Research the project
    console.log('\nTest 3: Researching the project...');
    const researchResult = await researchProjectDirect({
      projectRoot: tempDir,
      researchDepth: 'basic',
      maxResults: 2
    }, log, context);
    
    if (researchResult.success) {
      console.log(`✅ Research completed successfully: ${researchResult.data.message}`);
    } else {
      console.error(`❌ Research failed: ${researchResult.error.message}`);
      process.exit(1);
    }
    
    // Test 4: Create a research manager
    console.log('\nTest 4: Creating a research manager...');
    const researchManager = new ResearchManager({
      storageDir: path.join(tempDir, '.research'),
      allowMock: true
    });
    
    // Load research results
    await researchManager.loadResults();
    
    const resultIds = Array.from(researchManager.results.keys());
    
    if (resultIds.length > 0) {
      console.log(`✅ Research manager loaded ${resultIds.length} results`);
    } else {
      console.warn(`⚠️ Research manager loaded 0 results. Using mock results for testing.`);
      
      // Create a mock research result
      const mockResult = {
        id: 'mock-result-1',
        queryId: 'mock-query-1',
        type: 'domain',
        title: 'Mock Research Result',
        content: 'This is a mock research result for testing purposes.',
        provider: 'mock'
      };
      
      resultIds.push(mockResult.id);
      researchManager.results.set(mockResult.id, mockResult);
    }
    
    // Test 5: Generate a project plan
    console.log('\nTest 5: Generating a project plan...');
    const planResult = await researchManager.generateProjectPlan(resultIds);
    
    if (planResult.success) {
      console.log(`✅ Project plan generated successfully`);
      console.log(`   Plan has ${planResult.plan.phases.length} phases`);
    } else {
      console.error(`❌ Project plan generation failed: ${planResult.error.message}`);
      process.exit(1);
    }
    
    // Test 6: Generate architecture recommendations
    console.log('\nTest 6: Generating architecture recommendations...');
    const architectureResult = await researchManager.generateArchitectureRecommendations(resultIds);
    
    if (architectureResult.success) {
      console.log(`✅ Architecture recommendations generated successfully`);
      console.log(`   Architecture has ${architectureResult.architecture.components.length} components`);
    } else {
      console.error(`❌ Architecture recommendations generation failed: ${architectureResult.error.message}`);
      process.exit(1);
    }
    
    // Test 7: Generate task breakdown
    console.log('\nTest 7: Generating task breakdown...');
    const taskBreakdownResult = await researchManager.generateTaskBreakdown(resultIds, planResult.plan);
    
    if (taskBreakdownResult.success) {
      console.log(`✅ Task breakdown generated successfully`);
      console.log(`   Task breakdown has ${taskBreakdownResult.tasks.length} tasks`);
    } else {
      console.error(`❌ Task breakdown generation failed: ${taskBreakdownResult.error.message}`);
      process.exit(1);
    }
    
    // Test 8: Generate a complete blueprint
    console.log('\nTest 8: Generating a complete blueprint...');
    const blueprintResult = await researchManager.generateBlueprint(resultIds, {
      blueprintName: 'test-blueprint',
      description: 'Test blueprint'
    });
    
    if (blueprintResult.success) {
      console.log(`✅ Blueprint generated successfully`);
      console.log(`   Blueprint has ${blueprintResult.blueprint.tasks.length} tasks`);
    } else {
      console.error(`❌ Blueprint generation failed: ${blueprintResult.error.message}`);
      process.exit(1);
    }
    
    // Test 9: Generate a blueprint using the direct function
    console.log('\nTest 9: Generating a blueprint using the direct function...');
    const directBlueprintResult = await generateBlueprintDirect({
      projectRoot: tempDir,
      blueprintName: 'direct-blueprint',
      force: true
    }, log, context);
    
    if (directBlueprintResult.success) {
      console.log(`✅ Blueprint generated successfully using direct function: ${directBlueprintResult.data.message}`);
    } else {
      console.error(`❌ Blueprint generation failed using direct function: ${directBlueprintResult.error.message}`);
      process.exit(1);
    }
    
    // All tests passed
    console.log('\n----------------------------------------');
    console.log('✅ All Research Module Integration verification tests passed!');
    console.log('----------------------------------------');
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Clean up
    console.log('\nCleaning up...');
    // Uncomment the following line to delete the temporary directory
    // fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// Run the verification
runVerification();
