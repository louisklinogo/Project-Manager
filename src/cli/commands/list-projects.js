/**
 * List Projects command for Project Manager CLI
 */

import { listProjectsDirect } from '../../core/direct-functions/list-projects-direct.js';
import chalk from 'chalk';

/**
 * Register the list projects command with the CLI program
 * @param {Object} program - Commander program instance
 */
export function listProjectsCommand(program) {
  program
    .command('list')
    .description('List all projects managed by Project Manager')
    .argument('[directory]', 'Directory to search for projects (default: current directory)')
    .option('-d, --depth <depth>', 'Maximum depth to search for projects', parseInt, 3)
    .option('--detailed', 'Include detailed information about each project', false)
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
        const result = await listProjectsDirect({
          directory: directory || process.cwd(),
          maxDepth: options.depth,
          detailed: options.detailed
        }, log, context);
        
        if (result.success) {
          console.log(chalk.green(`✅ ${result.data.message}`));
          
          // Display projects
          if (result.data.projects && result.data.projects.length > 0) {
            console.log(chalk.cyan('\nProjects:'));
            result.data.projects.forEach((project, index) => {
              console.log(chalk.cyan(`${index + 1}. ${project.name || 'Project ' + (index + 1)}`));
              console.log(chalk.gray(`   Path: ${project.path}`));
              
              if (options.detailed && project.description) {
                console.log(chalk.gray(`   Description: ${project.description}`));
              }
              
              if (options.detailed && project.requirements) {
                console.log(chalk.gray(`   Requirements: ${project.requirements.substring(0, 100)}...`));
              }
              
              console.log('');
            });
          } else {
            console.log(chalk.yellow('No projects found.'));
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
