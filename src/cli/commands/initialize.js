/**
 * Initialize command for Project Manager CLI
 */

import { initializeProjectDirect } from '../../core/direct-functions/initialize-project-direct.js';
import chalk from 'chalk';

/**
 * Register the initialize command with the CLI program
 * @param {Object} program - Commander program instance
 */
export function initializeCommand(program) {
  program
    .command('init')
    .description('Initialize a new project with Project Manager')
    .argument('[directory]', 'Directory to initialize the project in (default: current directory)')
    .option('-a, --add-aliases', 'Add aliases to the project', false)
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
        const result = await initializeProjectDirect({
          projectRoot: directory || process.cwd(),
          addAliases: options.addAliases
        }, log, context);

        if (result.success) {
          console.log(chalk.green(`✅ ${result.data.message}`));

          // Display next steps if available
          if (result.data.nextSteps && result.data.nextSteps.length > 0) {
            console.log(chalk.cyan('\nNext Steps:'));
            result.data.nextSteps.forEach((step, index) => {
              console.log(chalk.cyan(`${index + 1}. ${step.description}`));
              console.log(chalk.gray(`   $ ${step.command}`));
            });
          }
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
