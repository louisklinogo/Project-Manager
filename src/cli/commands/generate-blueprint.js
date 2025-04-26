/**
 * Generate Blueprint command for Project Manager CLI
 */

import { generateBlueprintDirect } from '../../core/direct-functions/generate-blueprint-direct.js';
import chalk from 'chalk';

/**
 * Register the generate blueprint command with the CLI program
 * @param {Object} program - Commander program instance
 */
export function generateBlueprintCommand(program) {
  program
    .command('blueprint')
    .description('Generate a blueprint for a project using AI')
    .argument('[directory]', 'Directory of the project to generate a blueprint for (default: current directory)')
    .option('-n, --name <name>', 'Name of the blueprint to generate', 'default')
    .option('-f, --force', 'Overwrite an existing blueprint with the same name', false)
    .option('--no-architecture', 'Do not include architecture in the blueprint')
    .option('--no-tasks', 'Do not include tasks in the blueprint')
    .option('--no-workflow', 'Do not include workflow in the blueprint')
    .action(async (directory, options) => {
      try {
        // Create a logger that uses console
        const log = {
          info: (message) => console.log(chalk.blue(`[INFO] ${message}`)),
          warn: (message) => console.log(chalk.yellow(`[WARN] ${message}`)),
          error: (message) => console.log(chalk.red(`[ERROR] ${message}`))
        };
        
        // Create a mock context
        const context = {
          session: {
            workspaceRoot: process.cwd()
          },
          reportProgress: (message) => console.log(chalk.gray(`[PROGRESS] ${message}`))
        };
        
        // Execute the direct function
        const result = await generateBlueprintDirect({
          projectRoot: directory || process.cwd(),
          blueprintName: options.name,
          force: options.force,
          options: {
            includeArchitecture: options.architecture !== false,
            includeTasks: options.tasks !== false,
            includeWorkflow: options.workflow !== false
          }
        }, log, context);
        
        if (result.success) {
          console.log(chalk.green(`✅ ${result.data.message}`));
          console.log(chalk.cyan(`Blueprint saved to: ${result.data.blueprintPath}`));
        } else {
          console.log(chalk.red(`❌ ${result.error.message}`));
          process.exit(1);
        }
      } catch (error) {
        console.log(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });
}
