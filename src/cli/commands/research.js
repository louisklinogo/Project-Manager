/**
 * Research command for Project Manager CLI
 */

import { researchProjectDirect } from '../../core/direct-functions/research-project-direct.js';
import chalk from 'chalk';

/**
 * Register the research command with the CLI program
 * @param {Object} program - Commander program instance
 */
export function researchCommand(program) {
  program
    .command('research')
    .description('Research a project using AI to gather domain knowledge, similar projects, and best practices')
    .argument('[directory]', 'Directory of the project to research (default: current directory)')
    .option('-r, --requirements <requirements>', 'Project requirements to research')
    .option('-d, --depth <depth>', 'Depth of research to perform (basic, standard, comprehensive)', 'standard')
    .option('-m, --max-results <maxResults>', 'Maximum number of results to return per category', parseInt, 5)
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
        const result = await researchProjectDirect({
          projectRoot: directory || process.cwd(),
          requirements: options.requirements,
          researchDepth: options.depth,
          maxResults: options.maxResults
        }, log, context);

        if (result.success) {
          console.log(chalk.green(`✅ ${result.data.message}`));

          // Display research results summary
          if (result.data.results && result.data.results.length > 0) {
            console.log(chalk.cyan('\nResearch Results Summary:'));
            result.data.results.forEach((result, index) => {
              console.log(chalk.cyan(`${index + 1}. ${result.title || 'Result ' + (index + 1)}`));
            });
          }

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
