/**
 * Verification script for CLI commands
 * 
 * This script tests the CLI commands by:
 * 1. Importing the CLI commands
 * 2. Creating a mock Commander program
 * 3. Registering the commands with the program
 * 4. Verifying that the commands are registered correctly
 * 
 * Usage: node verify-cli-commands.js
 */

import { initializeCommand } from '../src/cli/commands/initialize.js';
import { researchCommand } from '../src/cli/commands/research.js';
import { generateBlueprintCommand } from '../src/cli/commands/generate-blueprint.js';
import { listProjectsCommand } from '../src/cli/commands/list-projects.js';

// Create a mock Commander program
const mockProgram = {
  commands: [],
  
  command(name) {
    const command = {
      name,
      description: '',
      options: [],
      actionHandler: null,
      
      description(desc) {
        this.description = desc;
        return this;
      },
      
      argument(arg, desc) {
        this.argument = { arg, desc };
        return this;
      },
      
      option(flag, desc, defaultValue) {
        this.options.push({ flag, desc, defaultValue });
        return this;
      },
      
      action(handler) {
        this.actionHandler = handler;
        return this;
      }
    };
    
    this.commands.push(command);
    return command;
  },
  
  getCommands() {
    return this.commands;
  }
};

/**
 * Run the verification
 */
function runVerification() {
  console.log('Starting CLI Commands verification...');
  console.log('----------------------------------------');
  
  try {
    // Test 1: Register the initialize command
    console.log('Test 1: Registering the initialize command...');
    initializeCommand(mockProgram);
    
    const initCommand = mockProgram.getCommands().find(cmd => cmd.name === 'init');
    if (initCommand) {
      console.log(`✅ Initialize command registered successfully: ${initCommand.description}`);
    } else {
      console.error('❌ Initialize command not registered');
      process.exit(1);
    }
    
    // Test 2: Register the research command
    console.log('\nTest 2: Registering the research command...');
    researchCommand(mockProgram);
    
    const researchCmd = mockProgram.getCommands().find(cmd => cmd.name === 'research');
    if (researchCmd) {
      console.log(`✅ Research command registered successfully: ${researchCmd.description}`);
    } else {
      console.error('❌ Research command not registered');
      process.exit(1);
    }
    
    // Test 3: Register the generate blueprint command
    console.log('\nTest 3: Registering the generate blueprint command...');
    generateBlueprintCommand(mockProgram);
    
    const blueprintCmd = mockProgram.getCommands().find(cmd => cmd.name === 'blueprint');
    if (blueprintCmd) {
      console.log(`✅ Generate blueprint command registered successfully: ${blueprintCmd.description}`);
    } else {
      console.error('❌ Generate blueprint command not registered');
      process.exit(1);
    }
    
    // Test 4: Register the list projects command
    console.log('\nTest 4: Registering the list projects command...');
    listProjectsCommand(mockProgram);
    
    const listCmd = mockProgram.getCommands().find(cmd => cmd.name === 'list');
    if (listCmd) {
      console.log(`✅ List projects command registered successfully: ${listCmd.description}`);
    } else {
      console.error('❌ List projects command not registered');
      process.exit(1);
    }
    
    // Test 5: Verify all commands are registered
    console.log('\nTest 5: Verifying all commands are registered...');
    const commands = mockProgram.getCommands();
    
    if (commands.length === 4) {
      console.log(`✅ All commands registered successfully: ${commands.length} commands`);
      commands.forEach(cmd => {
        console.log(`   - ${cmd.name}: ${cmd.description}`);
      });
    } else {
      console.error(`❌ Expected 4 commands, but found ${commands.length}`);
      process.exit(1);
    }
    
    // All tests passed
    console.log('\n----------------------------------------');
    console.log('✅ All CLI Commands verification tests passed!');
    console.log('----------------------------------------');
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the verification
runVerification();
