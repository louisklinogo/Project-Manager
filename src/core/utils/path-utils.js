/**
 * Path utility functions for Project Manager
 */

import fs from 'fs';
import path from 'path';

// Project marker files that indicate a potential project root
export const PROJECT_MARKERS = [
  // Project Manager specific
  'project.json',
  'blueprints/blueprint.json',

  // Common version control
  '.git',
  '.svn',

  // Common package files
  'package.json',
  'pyproject.toml',
  'Gemfile',
  'go.mod',
  'Cargo.toml',

  // Common IDE/editor folders
  '.cursor',
  '.vscode',
  '.idea',

  // Common dependency directories
  'node_modules',
  'venv',
  '.venv',

  // Common config files
  '.env',
  '.eslintrc',
  'tsconfig.json',
  'babel.config.js',
  'jest.config.js',
  'webpack.config.js',

  // Common CI/CD files
  '.github/workflows',
  '.gitlab-ci.yml',
  '.circleci/config.yml'
];

// Keep track of the last found project root for better UX
let lastFoundProjectRoot = null;

/**
 * Find the project.json file in a directory
 * @param {string} directory - Directory to search in
 * @param {string} explicitFilePath - Optional explicit file path
 * @param {object} log - Logger object
 * @returns {string} - Path to the project.json file
 * @throws {Error} - If project.json is not found
 */
export function findProjectJsonInDirectory(directory, explicitFilePath, log) {
  // If an explicit file path is provided, use it
  if (explicitFilePath) {
    const fullPath = path.resolve(directory, explicitFilePath);
    if (fs.existsSync(fullPath)) {
      log?.info(`Found project file at explicit path: ${fullPath}`);
      lastFoundProjectRoot = directory;
      return fullPath;
    }
    throw new Error(`Explicit project file not found at: ${fullPath}`);
  }

  // Check for project.json in the root
  const rootProjectJson = path.join(directory, 'project.json');
  if (fs.existsSync(rootProjectJson)) {
    log?.info(`Found project.json in root: ${rootProjectJson}`);
    lastFoundProjectRoot = directory;
    return rootProjectJson;
  }

  // Check for project.json in the blueprints directory
  const blueprintsDir = path.join(directory, 'blueprints');
  if (fs.existsSync(blueprintsDir)) {
    const blueprintsProjectJson = path.join(blueprintsDir, 'project.json');
    if (fs.existsSync(blueprintsProjectJson)) {
      log?.info(`Found project.json in blueprints directory: ${blueprintsProjectJson}`);
      lastFoundProjectRoot = directory;
      return blueprintsProjectJson;
    }
  }

  throw new Error(`project.json not found in ${directory} or its subdirectories`);
}

/**
 * Find the project.json file by walking up the directory tree
 * @param {string} startDir - Directory to start searching from
 * @param {string} explicitFilePath - Optional explicit file path
 * @param {object} log - Logger object
 * @returns {string} - Path to the project.json file
 * @throws {Error} - If project.json is not found
 */
export function findProjectJsonWithParentSearch(startDir, explicitFilePath, log) {
  let currentDir = startDir;
  const rootDir = path.parse(currentDir).root;

  // Keep traversing up until we hit the root directory
  while (currentDir !== rootDir) {
    // First check for project.json directly
    try {
      return findProjectJsonInDirectory(currentDir, explicitFilePath, log);
    } catch (error) {
      // If project.json not found but the directory has project markers,
      // log it as a potential project root (helpful for debugging)
      if (hasProjectMarkers(currentDir)) {
        log?.info(`Found project markers in ${currentDir}, but no project.json`);
      }

      // Move up to parent directory
      const parentDir = path.dirname(currentDir);

      // Check if we've reached the root
      if (parentDir === currentDir) {
        break;
      }

      log?.info(
        `Project file not found in ${currentDir}, searching in parent directory: ${parentDir}`
      );
      currentDir = parentDir;
    }
  }

  throw new Error(`project.json not found in ${startDir} or any parent directories`);
}

/**
 * Check if a directory contains any project marker files or directories
 * @param {string} dirPath - Directory to check
 * @returns {boolean} - True if the directory contains any project markers
 */
function hasProjectMarkers(dirPath) {
  return PROJECT_MARKERS.some((marker) => {
    const markerPath = path.join(dirPath, marker);
    // Check if the marker exists as either a file or directory
    return fs.existsSync(markerPath);
  });
}

/**
 * Find the project.json file
 * @param {object} args - Arguments containing projectRoot and file
 * @param {object} log - Logger object
 * @returns {string} - Path to the project.json file
 * @throws {Error} - If project.json is not found
 */
export function findProjectJsonPath(args = {}, log = console) {
  // 1. If project root is explicitly provided (e.g., from MCP session), use it directly
  if (args.projectRoot) {
    const projectRoot = args.projectRoot;
    log.info(`Using explicitly provided project root: ${projectRoot}`);
    try {
      // This will throw if project.json isn't found within this root
      return findProjectJsonInDirectory(projectRoot, args.file, log);
    } catch (error) {
      // Include debug info in error
      const debugInfo = {
        projectRoot,
        currentDir: process.cwd(),
        serverDir: path.dirname(process.argv[1]),
        possibleProjectRoot: path.resolve(
          path.dirname(process.argv[1]),
          '../..'
        ),
        lastFoundProjectRoot,
        searchedPaths: error.message
      };
      
      log.error(`Failed to find project.json in provided project root: ${JSON.stringify(debugInfo, null, 2)}`);
      // Continue to other search methods
    }
  }

  // 2. Start from current working directory
  const startDir = process.cwd();
  log.info(`Searching for project.json starting from current directory: ${startDir}`);

  // 3. If we have a last found project root from a project.json search, use that for consistency
  if (lastFoundProjectRoot) {
    log.info(
      `Using last known project root where project.json was found: ${lastFoundProjectRoot}`
    );
    return lastFoundProjectRoot;
  }

  // 4. Check if the current directory has any indicators of being a project-manager project
  const currentDir = process.cwd();
  if (
    PROJECT_MARKERS.some((marker) => {
      const markerPath = path.join(currentDir, marker);
      return fs.existsSync(markerPath);
    })
  ) {
    log.info(
      `Using current directory as project root (found project markers): ${currentDir}`
    );
    return currentDir;
  }

  // Try to find project.json by walking up the directory tree from cwd
  try {
    // This will throw if not found in the CWD tree
    return findProjectJsonWithParentSearch(startDir, args.file, log);
  } catch (error) {
    // If all attempts fail, augment and throw the original error from CWD search
    error.message = `${error.message}\n\nPossible solutions:\n1. Run the command from your project directory containing project.json\n2. Use --project-root=/path/to/project to specify the project location (if using CLI)\n3. Ensure the project root is correctly passed from the client (if using MCP)\n\nCurrent working directory: ${startDir}\nLast known project root: ${lastFoundProjectRoot}\nProject root from args: ${args.projectRoot}`;
    throw error;
  }
}
