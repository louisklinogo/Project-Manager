#!/usr/bin/env node

/**
 * Project Manager CLI
 * 
 * This is the main entry point for the Project Manager CLI.
 */

import { Command } from 'commander';
import { initializeCommand } from './commands/initialize.js';
import { researchCommand } from './commands/research.js';
import { generateBlueprintCommand } from './commands/generate-blueprint.js';
import { listProjectsCommand } from './commands/list-projects.js';
import { version } from '../../package.json';

// Create the CLI program
const program = new Command();

// Set up the program
program
  .name('project-manager')
  .description('Project Manager CLI for managing AI-driven projects')
  .version(version);

// Register commands
initializeCommand(program);
researchCommand(program);
generateBlueprintCommand(program);
listProjectsCommand(program);

// Parse arguments
program.parse(process.argv);

// If no arguments are provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
