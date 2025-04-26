/**
 * Direct function for generating a project blueprint
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getBestAvailableProvider } from '../../providers/index.js';

/**
 * Read project.json file
 * @param {string} projectPath - Path to project.json
 * @returns {Object} Project data
 */
function readProjectFile(projectPath) {
  try {
    const content = fs.readFileSync(projectPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read project file: ${error.message}`);
  }
}

/**
 * Write blueprint file
 * @param {string} blueprintPath - Path to blueprint file
 * @param {Object} blueprintData - Blueprint data
 */
function writeBlueprintFile(blueprintPath, blueprintData) {
  try {
    fs.writeFileSync(blueprintPath, JSON.stringify(blueprintData, null, 2));
  } catch (error) {
    throw new Error(`Failed to write blueprint file: ${error.message}`);
  }
}

/**
 * Generate blueprint prompt
 * @param {Object} projectData - Project data
 * @returns {string} Blueprint prompt
 */
function generateBlueprintPrompt(projectData) {
  const prompt = `
You are a software architect tasked with creating a detailed blueprint for a new project.

PROJECT DETAILS:
Name: ${projectData.name}
Description: ${projectData.description}
Requirements: ${projectData.requirements}

RESEARCH FINDINGS:
${projectData.research.domain_knowledge.map(item => `- ${item.query}: ${item.summary}`).join('\n')}
${projectData.research.similar_projects.map(item => `- ${item.query}: ${item.summary}`).join('\n')}
${projectData.research.best_practices.map(item => `- ${item.query}: ${item.summary}`).join('\n')}

Based on the project details and research findings, create a comprehensive blueprint that includes:

1. Architecture components (frontend, backend, database, etc.)
2. Component relationships and interactions
3. Technology stack recommendations
4. Project structure (directories, files, etc.)
5. Development workflow
6. Task breakdown (at least 10 tasks)

For each task, include:
- Task ID
- Task title
- Task description
- Dependencies (if any)
- Estimated complexity (low, medium, high)

Format your response as a JSON object with the following structure:
{
  "architecture": {
    "components": [
      {
        "id": "component-1",
        "name": "Component Name",
        "type": "frontend|backend|database|etc",
        "description": "Component description",
        "technologies": ["Tech1", "Tech2"]
      }
    ],
    "relationships": [
      {
        "source": "component-1",
        "target": "component-2",
        "type": "depends-on|communicates-with|etc",
        "description": "Relationship description"
      }
    ]
  },
  "project_structure": {
    "directories": [
      {
        "path": "/path/to/directory",
        "purpose": "Purpose of this directory"
      }
    ],
    "files": [
      {
        "path": "/path/to/file",
        "purpose": "Purpose of this file"
      }
    ]
  },
  "workflow": {
    "steps": [
      {
        "id": "step-1",
        "name": "Step Name",
        "description": "Step description"
      }
    ],
    "checkpoints": [
      {
        "id": "checkpoint-1",
        "name": "Checkpoint Name",
        "description": "Checkpoint description",
        "criteria": ["Criterion 1", "Criterion 2"]
      }
    ]
  },
  "tasks": [
    {
      "id": "task-1",
      "title": "Task Title",
      "description": "Task description",
      "dependencies": ["task-id-1", "task-id-2"],
      "complexity": "low|medium|high"
    }
  ]
}
`;

  return prompt;
}

/**
 * Direct function wrapper for generating a project blueprint
 * @param {Object} args - Arguments for the function
 * @param {string} args.projectRoot - Project root directory
 * @param {string} args.blueprintName - Blueprint name
 * @param {boolean} args.force - Force regeneration of blueprint
 * @param {Object} log - Logger object
 * @param {Object} context - Context object
 * @returns {Promise<Object>} Result object
 */
export async function generateBlueprintDirect(args, log, context = {}) {
  try {
    // Find project.json path
    const projectJsonPath = path.join(args.projectRoot, 'project.json');
    if (!fs.existsSync(projectJsonPath) || !fs.statSync(projectJsonPath).isFile()) {
      return {
        success: false,
        error: {
          code: 'PROJECT_FILE_NOT_FOUND',
          message: 'Project file not found. Please initialize a project first.'
        }
      };
    }

    // Read project data
    const projectData = readProjectFile(projectJsonPath);

    // Check if requirements exist
    if (!projectData.requirements) {
      return {
        success: false,
        error: {
          code: 'NO_REQUIREMENTS',
          message: 'No project requirements found. Please provide requirements.'
        }
      };
    }

    // Check if research exists
    if (!projectData.research ||
        !projectData.research.domain_knowledge ||
        !projectData.research.similar_projects ||
        !projectData.research.best_practices) {
      return {
        success: false,
        error: {
          code: 'NO_RESEARCH',
          message: 'No research data found. Please run research first.'
        }
      };
    }

    // Create blueprints directory if it doesn't exist
    const blueprintsDir = path.join(path.dirname(projectJsonPath), 'blueprints');
    if (!fs.existsSync(blueprintsDir)) {
      fs.mkdirSync(blueprintsDir, { recursive: true });
    }

    // Determine blueprint path
    const blueprintName = args.blueprintName || 'blueprint';
    const blueprintPath = path.join(blueprintsDir, `${blueprintName}.json`);

    // Check if blueprint already exists and force is not set
    if (fs.existsSync(blueprintPath) && !args.force) {
      return {
        success: false,
        error: {
          code: 'BLUEPRINT_EXISTS',
          message: `Blueprint already exists at ${blueprintPath}. Use force=true to regenerate.`
        }
      };
    }

    // Report progress
    const reportProgress = (message) => {
      if (context.reportProgress) {
        context.reportProgress(message);
      } else {
        log.info(message);
      }
    };

    reportProgress('Generating blueprint...');

    // Get the best available AI provider
    const provider = await getBestAvailableProvider({ allowMock: true });
    log.info(`Using ${provider.name} provider for blueprint generation`);

    // Generate blueprint prompt
    const prompt = generateBlueprintPrompt(projectData);

    // Generate blueprint using AI
    reportProgress('Calling AI provider to generate blueprint...');

    const messages = [
      { role: 'system', content: 'You are a software architect assistant that creates detailed project blueprints.' },
      { role: 'user', content: prompt }
    ];

    const completion = await provider.generateChatCompletion({
      messages,
      model: provider.defaultModel,
      temperature: 0.2,
      maxTokens: 4000
    });

    reportProgress('Processing AI response...');

    // Parse the AI response
    let blueprintData;
    try {
      // Extract JSON from the response
      const jsonMatch = completion.message.match(/```json\n([\s\S]*?)\n```/) ||
                        completion.message.match(/\{[\s\S]*\}/);

      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : completion.message;
      blueprintData = JSON.parse(jsonString);

      // Add metadata
      blueprintData = {
        id: uuidv4(),
        project_id: projectData.id || uuidv4(),
        name: blueprintName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...blueprintData
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BLUEPRINT_PARSING_FAILED',
          message: `Failed to parse blueprint data: ${error.message}`,
          details: completion.message
        }
      };
    }

    // Write blueprint file
    writeBlueprintFile(blueprintPath, blueprintData);

    return {
      success: true,
      data: {
        message: `Blueprint generated successfully at ${blueprintPath}`,
        blueprintPath,
        blueprint: blueprintData
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'BLUEPRINT_GENERATION_FAILED',
        message: `Blueprint generation failed: ${error.message}`,
        details: error.stack
      }
    };
  }
}
