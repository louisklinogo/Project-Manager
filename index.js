#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get package.json for version info
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

// Export version information
export const version = packageJson.version;

// Export a function to initialize a new project programmatically
export const initProject = async (options = {}) => {
  const init = await import('./src/core/init.js');
  return init.initializeProject(options);
};

// Export a function to run init as a CLI command
export const runInitCLI = async (options = {}) => {
  try {
    const init = await import('./src/core/init.js');
    const result = await init.initializeProject(options);
    return result;
  } catch (error) {
    console.error('Initialization failed:', error.message);
    if (process.env.DEBUG === 'true') {
      console.error('Debug stack trace:', error.stack);
    }
    throw error; // Re-throw to be handled by the command handler
  }
};

// Export a function to research a project
export const researchProject = async (options = {}) => {
  const research = await import('./src/research/research.js');
  return research.conductResearch(options);
};

// Export a function to generate a blueprint
export const generateBlueprint = async (options = {}) => {
  const blueprint = await import('./src/blueprints/generator.js');
  return blueprint.generateBlueprint(options);
};

// Export core functionality
export * from './src/core/project-manager-core.js';
