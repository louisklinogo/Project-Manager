/**
 * Research Flow Runner
 * 
 * This script runs the research-flow-demo.js script and filters out timestamp lines
 * to provide a cleaner output.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get command line arguments
const args = process.argv.slice(2);

// Spawn the research-flow-demo.js script
const child = spawn('node', ['--experimental-modules', path.join(__dirname, 'research-flow-demo.js'), ...args], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Filter out timestamp lines from stdout
child.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  const filteredLines = lines.filter(line => !line.match(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/));
  if (filteredLines.length > 0) {
    process.stdout.write(filteredLines.join('\n') + (filteredLines[filteredLines.length - 1] === '' ? '' : '\n'));
  }
});

// Pass through stderr
child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Handle process exit
child.on('close', (code) => {
  process.exit(code);
});
