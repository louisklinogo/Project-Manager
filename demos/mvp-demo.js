/**
 * MVP Demo Script
 *
 * This script demonstrates the minimum viable product (MVP) functionality
 * of the Project-Manager, including project initialization, research,
 * and simple blueprint generation.
 */

import { v4 as uuidv4 } from 'uuid';
import { initializeProjectDirect } from '../src/direct/initialize-project-direct.js';
import { researchProjectDirect } from '../src/direct/research-project-direct.js';
import { generateSimpleBlueprintDirect, listBlueprints, loadBlueprint } from '../src/mvp/simple-blueprint-direct.js';
import logger from '../src/core/utils/logger.js';
import chalk from 'chalk';

// Set log level
logger.setLevel('INFO');

/**
 * Display a section header
 * @param {String} title - Section title
 */
function displayHeader(title) {
  console.log('\n' + chalk.bgBlue.white(' ' + title + ' ') + '\n');
}

/**
 * Display a success message
 * @param {String} message - Success message
 */
function displaySuccess(message) {
  console.log(chalk.green('✓ ' + message));
}

/**
 * Display an error message
 * @param {String} message - Error message
 */
function displayError(message) {
  console.log(chalk.red('✗ ' + message));
}

/**
 * Display a warning message
 * @param {String} message - Warning message
 */
function displayWarning(message) {
  console.log(chalk.yellow('⚠ ' + message));
}

/**
 * Display an info message
 * @param {String} message - Info message
 */
function displayInfo(message) {
  console.log(chalk.blue('ℹ ' + message));
}

/**
 * Display a blueprint summary
 * @param {Object} blueprint - Blueprint object
 */
function displayBlueprintSummary(blueprint) {
  displayHeader('Blueprint Summary');

  console.log(chalk.bold('ID: ') + blueprint.id);
  console.log(chalk.bold('Name: ') + blueprint.name);
  console.log(chalk.bold('Description: ') + blueprint.description);
  console.log(chalk.bold('Created At: ') + new Date(blueprint.createdAt).toLocaleString());

  displayHeader('Tasks');

  blueprint.tasks.forEach((task, index) => {
    console.log(chalk.bold(`${index + 1}. ${task.title}`));
    console.log(`   ${chalk.dim('Description:')} ${task.description}`);
    console.log(`   ${chalk.dim('Status:')} ${task.status}`);
    console.log(`   ${chalk.dim('Priority:')} ${task.priority}`);

    const dependsOn = blueprint.dependencies
      .filter(dep => dep.target === task.id)
      .map(dep => {
        const sourceTask = blueprint.tasks.find(t => t.id === dep.source);
        return sourceTask ? sourceTask.title : dep.source;
      });

    if (dependsOn.length > 0) {
      console.log(`   ${chalk.dim('Depends On:')} ${dependsOn.join(', ')}`);
    }

    console.log();
  });

  displayHeader('Dependency Graph');
  console.log(blueprint.visualizations.dependencyGraph);
}

/**
 * Run the MVP demo
 */
async function runMvpDemo() {
  try {
    displayHeader('Project-Manager MVP Demo');

    // Get command line arguments
    const projectName = process.argv[2] || 'Demo Project';
    const description = process.argv[3] || 'A simple demo project to showcase Project-Manager capabilities';
    const requirements = process.argv[4] || 'Create a simple web application with user authentication and data visualization';

    displayInfo(`Project Name: ${projectName}`);
    displayInfo(`Description: ${description}`);
    displayInfo(`Requirements: ${requirements}`);

    // Step 1: Initialize a project
    displayHeader('Step 1: Initialize Project');

    const projectId = `project-${uuidv4()}`;
    displayInfo(`Initializing project with ID: ${projectId}`);

    const initResult = await initializeProjectDirect({
      id: projectId,
      name: projectName,
      description,
      requirements
    });

    if (!initResult.success) {
      displayError(`Failed to initialize project: ${initResult.message}`);
      process.exit(1);
    }

    displaySuccess(`Project initialized successfully: ${projectId}`);

    // Step 2: Research the project
    displayHeader('Step 2: Research Project');

    displayInfo(`Researching project: ${projectName}`);

    let researchResult;
    try {
      researchResult = await researchProjectDirect({
        projectId,
        query: `${projectName}: ${description}. Requirements: ${requirements}`
      });

      if (!researchResult.success) {
        displayWarning(`Research failed: ${researchResult.message}. Continuing with empty research.`);
        researchResult = { success: false };
      } else {
        displaySuccess('Project research completed successfully');

        // Display research summary
        const research = researchResult.result;

        if (research && research.result && research.result.summary) {
          const summary = research.result.summary;

          displayInfo(`Provider: ${research.result.provider?.name || 'Unknown'}`);
          displayInfo(`Confidence: ${research.result.confidence?.toFixed(2) || 'Unknown'}`);

          if (summary.keyPoints && summary.keyPoints.length > 0) {
            displayHeader('Research Key Points');

            summary.keyPoints.forEach((point, index) => {
              console.log(`${index + 1}. ${point}`);
            });
          }
        }
      }
    } catch (error) {
      displayWarning(`Research failed: ${error.message}. Continuing with empty research.`);
      researchResult = { success: false };
    }

    // Step 3: Generate a simple blueprint
    displayHeader('Step 3: Generate Blueprint');

    displayInfo(`Generating blueprint for project: ${projectName}`);

    let blueprintResult;
    try {
      blueprintResult = await generateSimpleBlueprintDirect({
        projectId,
        projectName,
        description,
        requirements,
        researchResults: researchResult && researchResult.success ? researchResult.result : null
      });

      if (!blueprintResult.success) {
        displayError(`Failed to generate blueprint: ${blueprintResult.message}`);
        process.exit(1);
      }
    } catch (error) {
      displayError(`Failed to generate blueprint: ${error.message}`);
      process.exit(1);
    }

    displaySuccess('Blueprint generated successfully');

    // Step 4: Display the blueprint
    const blueprint = blueprintResult.blueprint;
    displayBlueprintSummary(blueprint);

    // Step 5: List all blueprints
    displayHeader('Step 5: List All Blueprints');

    const listResult = await listBlueprints();

    if (!listResult.success) {
      displayError(`Failed to list blueprints: ${listResult.message}`);
    } else {
      displaySuccess(`Found ${listResult.blueprints.length} blueprints`);

      listResult.blueprints.forEach((bp, index) => {
        console.log(`${index + 1}. ${bp.name} (${bp.id})`);
        console.log(`   Created: ${new Date(bp.createdAt).toLocaleString()}`);
        console.log(`   Tasks: ${bp.taskCount}`);
        console.log();
      });
    }

    displayHeader('Demo Completed Successfully');
    displayInfo(`You can now use the blueprint ID ${blueprint.id} for further operations`);
    displayInfo('To load this blueprint in the future, use:');
    displayInfo(`npm run mvp:load-blueprint ${blueprint.id}`);
  } catch (error) {
    displayError(`Error in demo: ${error.message}`);
    console.error(error);
    displayHeader('Demo Failed');
    process.exit(1);
  }
}

// Run the demo
runMvpDemo();
