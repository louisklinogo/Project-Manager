/**
 * Load Blueprint Demo Script
 *
 * This script demonstrates how to load an existing blueprint
 * and display its contents.
 */

import { loadBlueprint } from '../src/mvp/simple-blueprint-direct.js';
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
    console.log(`   ${chalk.dim('Priority:')} ${task.priority || 'medium'}`);

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
 * Run the load blueprint demo
 */
async function runLoadBlueprintDemo() {
  try {
    displayHeader('Load Blueprint Demo');

    // Get the blueprint ID from command line arguments
    const blueprintId = process.argv[2];

    if (!blueprintId) {
      displayError('No blueprint ID provided');
      console.log('Usage: npm run mvp:load-blueprint <blueprint-id>');
      process.exit(1);
    }

    console.log(`Loading blueprint: ${blueprintId}`);

    // Load the blueprint
    const result = await loadBlueprint(blueprintId);

    if (!result.success) {
      displayError(`Failed to load blueprint: ${result.message}`);
      process.exit(1);
    }

    displaySuccess(`Blueprint loaded successfully: ${blueprintId}`);

    // Display the blueprint
    displayBlueprintSummary(result.blueprint);

    displayHeader('Demo Completed Successfully');
  } catch (error) {
    displayError(`Error in demo: ${error.message}`);
    console.error(error);
    displayHeader('Demo Failed');
    process.exit(1);
  }
}

// Run the demo
runLoadBlueprintDemo();
