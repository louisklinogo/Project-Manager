/**
 * List Blueprints Demo Script
 *
 * This script demonstrates how to list all existing blueprints.
 */

import { listBlueprints } from '../src/mvp/simple-blueprint-direct.js';
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
 * Run the list blueprints demo
 */
async function runListBlueprintsDemo() {
  try {
    displayHeader('List Blueprints Demo');

    console.log('Listing all blueprints...');

    // List all blueprints
    const result = await listBlueprints();

    if (!result.success) {
      displayError(`Failed to list blueprints: ${result.message}`);
      process.exit(1);
    }

    displaySuccess(`Found ${result.blueprints.length} blueprints`);

    if (result.blueprints.length === 0) {
      console.log('No blueprints found. Create one using:');
      console.log('npm run mvp:create-blueprint "Project Name" "Description" "Requirements"');
    } else {
      displayHeader('Blueprints');

      result.blueprints.forEach((blueprint, index) => {
        console.log(chalk.bold(`${index + 1}. ${blueprint.name}`));
        console.log(`   ${chalk.dim('ID:')} ${blueprint.id}`);
        console.log(`   ${chalk.dim('Project ID:')} ${blueprint.projectId}`);
        console.log(`   ${chalk.dim('Description:')} ${blueprint.description}`);
        console.log(`   ${chalk.dim('Created:')} ${new Date(blueprint.createdAt).toLocaleString()}`);
        console.log(`   ${chalk.dim('Tasks:')} ${blueprint.taskCount}`);
        console.log();
      });

      console.log('To view a specific blueprint, use:');
      console.log('npm run mvp:load-blueprint <blueprint-id>');
    }

    displayHeader('Demo Completed Successfully');
  } catch (error) {
    displayError(`Error in demo: ${error.message}`);
    console.error(error);
    displayHeader('Demo Failed');
    process.exit(1);
  }
}

// Run the demo
runListBlueprintsDemo();
