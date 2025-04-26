/**
 * Verification script for MCP server integration
 * 
 * This script tests the MCP server integration by:
 * 1. Registering the tools with a mock MCP server
 * 2. Executing each tool with sample arguments
 * 
 * Usage: node verify-mcp-integration.js
 */

import { 
  registerTools, 
  getTools,
  initializeProjectTool,
  researchProjectTool,
  generateBlueprintTool,
  listProjectsTool
} from '../src/mcp-server/index.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a temporary directory for the test project
const tempDir = path.join(process.cwd(), 'temp-mcp-test');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Create a mock MCP server
const mockMCP = {
  registeredTools: [],
  
  registerTool(tool) {
    this.registeredTools.push(tool);
    console.log(`Registered tool: ${tool.name}`);
  },
  
  getRegisteredTools() {
    return this.registeredTools;
  }
};

// Create a mock MCP context
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
  console.log('Starting MCP Server Integration verification...');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Register tools with the mock MCP server
    console.log('Test 1: Registering tools with the mock MCP server...');
    registerTools(mockMCP);
    
    const registeredTools = mockMCP.getRegisteredTools();
    if (registeredTools.length === 4) {
      console.log(`✅ Registered ${registeredTools.length} tools with the mock MCP server`);
    } else {
      console.error(`❌ Expected 4 tools, but registered ${registeredTools.length}`);
      process.exit(1);
    }
    
    // Test 2: Get tools
    console.log('\nTest 2: Getting tools...');
    const tools = getTools();
    
    if (tools.length === 4) {
      console.log(`✅ Got ${tools.length} tools`);
    } else {
      console.error(`❌ Expected 4 tools, but got ${tools.length}`);
      process.exit(1);
    }
    
    // Test 3: Execute the initialize project tool
    console.log('\nTest 3: Executing the initialize project tool...');
    const initializeResult = await initializeProjectTool.execute({
      projectRoot: tempDir
    }, mockContext);
    
    if (initializeResult.status === 'success') {
      console.log(`✅ Initialize project tool executed successfully: ${initializeResult.message}`);
    } else {
      console.error(`❌ Initialize project tool execution failed: ${initializeResult.message}`);
      process.exit(1);
    }
    
    // Test 4: Create a sample project.json file
    console.log('\nTest 4: Creating a sample project.json file...');
    const projectData = {
      name: 'Test Project',
      description: 'A test project for verifying MCP integration',
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
    
    // Test 5: Execute the research project tool
    console.log('\nTest 5: Executing the research project tool...');
    const researchResult = await researchProjectTool.execute({
      projectRoot: tempDir,
      researchDepth: 'basic',
      maxResults: 2
    }, mockContext);
    
    if (researchResult.status === 'success') {
      console.log(`✅ Research project tool executed successfully: ${researchResult.message}`);
    } else {
      console.error(`❌ Research project tool execution failed: ${researchResult.message}`);
      process.exit(1);
    }
    
    // Test 6: Execute the generate blueprint tool
    console.log('\nTest 6: Executing the generate blueprint tool...');
    const generateResult = await generateBlueprintTool.execute({
      projectRoot: tempDir,
      blueprintName: 'test-blueprint',
      force: true
    }, mockContext);
    
    if (generateResult.status === 'success') {
      console.log(`✅ Generate blueprint tool executed successfully: ${generateResult.message}`);
    } else {
      console.error(`❌ Generate blueprint tool execution failed: ${generateResult.message}`);
      process.exit(1);
    }
    
    // Test 7: Execute the list projects tool
    console.log('\nTest 7: Executing the list projects tool...');
    const listResult = await listProjectsTool.execute({
      directory: path.dirname(tempDir),
      maxDepth: 2,
      detailed: true
    }, mockContext);
    
    if (listResult.status === 'success') {
      console.log(`✅ List projects tool executed successfully: ${listResult.message}`);
      console.log(`   Found ${listResult.projects.length} projects`);
    } else {
      console.error(`❌ List projects tool execution failed: ${listResult.message}`);
      process.exit(1);
    }
    
    // All tests passed
    console.log('\n----------------------------------------');
    console.log('✅ All MCP Server Integration verification tests passed!');
    console.log('----------------------------------------');
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the verification
runVerification();
