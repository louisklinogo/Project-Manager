/**
 * Direct function for initializing a new project
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Get project root from session
 * @param {object} session - Session object
 * @param {object} log - Logger object
 * @returns {string|null} - Project root path or null
 */
function getProjectRootFromSession(session, log) {
  if (!session) {
    log.warn('No session provided to getProjectRootFromSession');
    return null;
  }

  // Try to get project root from session
  try {
    // Check for workspace root in session
    if (session.workspaceRoot) {
      log.info(`Found workspaceRoot in session: ${session.workspaceRoot}`);
      return session.workspaceRoot;
    }

    // Check for workspace folders in session
    if (session.workspaceFolders && session.workspaceFolders.length > 0) {
      const firstFolder = session.workspaceFolders[0].uri;
      if (firstFolder) {
        // Remove file:// prefix if present
        const folderPath = firstFolder.startsWith('file://')
          ? new URL(firstFolder).pathname
          : firstFolder;

        log.info(`Found workspaceFolder in session: ${folderPath}`);
        return folderPath;
      }
    }

    log.warn('No workspace information found in session');
    return null;
  } catch (error) {
    log.error(`Error extracting project root from session: ${error.message}`);
    return null;
  }
}

/**
 * Ensure a directory exists
 * @param {string} dirPath - Directory path
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Copy a template file
 * @param {string} templateName - Template name
 * @param {string} targetPath - Target path
 * @param {object} replacements - Replacements for template variables
 */
function copyTemplateFile(templateName, targetPath, replacements = {}) {
  // Skip if the target file already exists
  if (fs.existsSync(targetPath)) {
    return;
  }

  // Create the directory if it doesn't exist
  const targetDir = path.dirname(targetPath);
  ensureDirectoryExists(targetDir);

  // In ES modules, __dirname is not available, so we need to use import.meta.url
  // Create a basic version of the template
  let content = '';

  // If template doesn't exist, create a basic version
  if (templateName === 'project.json') {
    content = JSON.stringify({
      name: 'New Project',
      description: 'A new project created with Project Manager',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      requirements: '',
      research: {
        domain_knowledge: [],
        similar_projects: [],
        best_practices: []
      }
    }, null, 2);
  } else if (templateName === 'blueprint.json') {
    content = JSON.stringify({
      id: 'blueprint-1',
      project_id: 'project-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      architecture: {
        components: [],
        relationships: []
      },
      tasks: [],
      workflow: {
        steps: [],
        checkpoints: []
      }
    }, null, 2);
  } else {
    // For other templates, create an empty file
    content = '';
  }

  // Replace template variables
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }

  // Write the file
  fs.writeFileSync(targetPath, content);
}

/**
 * Setup MCP configuration
 * @param {string} targetDir - Target directory
 */
function setupMCPConfiguration(targetDir) {
  const mcpDir = path.join(targetDir, '.cursor');
  ensureDirectoryExists(mcpDir);

  const mcpJsonPath = path.join(mcpDir, 'mcp.json');
  const newMCPServer = {
    'project-manager': {
      command: 'node',
      args: ['./src/mcp-server/server.js'],
      env: {
        ANTHROPIC_API_KEY: '${ANTHROPIC_API_KEY}',
        OPENAI_API_KEY: '${OPENAI_API_KEY}',
        GEMINI_API_KEY: '${GEMINI_API_KEY}',
        PERPLEXITY_API_KEY: '${PERPLEXITY_API_KEY}',
        DEFAULT_MODEL: 'claude-3-7-sonnet-20250219',
        OPENAI_MODEL: 'gpt-4o',
        GEMINI_MODEL: 'gemini-2.5-pro',
        PERPLEXITY_MODEL: 'sonar-pro',
        MAX_TOKENS: '64000',
        TEMPERATURE: '0.2',
        RESEARCH_DEPTH: 'comprehensive',
        MAX_RESEARCH_RESULTS: '10',
        DEFAULT_TASKS: '10'
      }
    }
  };

  try {
    // Try to update existing configuration
    let mcpConfig = {};
    if (fs.existsSync(mcpJsonPath)) {
      mcpConfig = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'));
    }

    // Add or update the project-manager server
    mcpConfig.mcpServers = {
      ...(mcpConfig.mcpServers || {}),
      ...newMCPServer
    };

    // Write the updated configuration
    fs.writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 4));
  } catch (error) {
    // Create a backup before potentially modifying
    const backupPath = `${mcpJsonPath}.backup-${Date.now()}`;
    if (fs.existsSync(mcpJsonPath)) {
      fs.copyFileSync(mcpJsonPath, backupPath);
    }

    // Create new configuration
    const newMCPConfig = {
      mcpServers: newMCPServer
    };

    fs.writeFileSync(mcpJsonPath, JSON.stringify(newMCPConfig, null, 4));
  }
}

/**
 * Create project structure
 * @param {boolean} addAliases - Whether to add shell aliases
 */
function createProjectStructure(addAliases) {
  const targetDir = process.cwd();

  // Create directories
  ensureDirectoryExists(path.join(targetDir, '.cursor'));
  ensureDirectoryExists(path.join(targetDir, 'src'));
  ensureDirectoryExists(path.join(targetDir, 'src', 'core'));
  ensureDirectoryExists(path.join(targetDir, 'src', 'models'));
  ensureDirectoryExists(path.join(targetDir, 'src', 'providers'));
  ensureDirectoryExists(path.join(targetDir, 'src', 'research'));
  ensureDirectoryExists(path.join(targetDir, 'src', 'blueprints'));
  ensureDirectoryExists(path.join(targetDir, 'src', 'mcp-server'));
  ensureDirectoryExists(path.join(targetDir, 'tests'));
  ensureDirectoryExists(path.join(targetDir, 'tests', 'unit'));
  ensureDirectoryExists(path.join(targetDir, 'tests', 'integration'));
  ensureDirectoryExists(path.join(targetDir, 'blueprints'));

  // Setup MCP configuration
  setupMCPConfiguration(targetDir);

  // Copy template files with replacements
  const replacements = {
    year: new Date().getFullYear()
  };

  // Copy .env.example
  copyTemplateFile('env.example', path.join(targetDir, '.env.example'), replacements);

  // Copy .gitignore
  copyTemplateFile('gitignore', path.join(targetDir, '.gitignore'));

  // Create project.json
  const projectJsonPath = path.join(targetDir, 'project.json');
  copyTemplateFile('project.json', projectJsonPath, replacements);

  // Create blueprint.json
  copyTemplateFile('blueprint.json', path.join(targetDir, 'blueprints', 'blueprint.json'), replacements);

  // Create research directory
  const researchDir = path.join(targetDir, '.research');
  ensureDirectoryExists(researchDir);

  // Create README.md
  copyTemplateFile('README.md', path.join(targetDir, 'README.md'), replacements);
}

/**
 * Direct function wrapper for initializing a project.
 * Derives target directory from session, sets CWD, and calls core init logic.
 * @param {object} args - Arguments containing initialization options (addAliases, skipInstall, yes, projectRoot)
 * @param {object} log - The FastMCP logger instance.
 * @param {object} context - The context object, must contain { session }.
 * @returns {Promise<{success: boolean, data?: any, error?: {code: string, message: string}}>} - Standard result object.
 */
export async function initializeProjectDirect(args, log, context = {}) {
  const { session } = context;
  const homeDir = os.homedir();
  let targetDirectory = null;

  // --- Determine Target Directory ---
  // 1. Prioritize projectRoot passed directly in args
  // Ensure it's not null, '/', or the home directory
  if (
    args.projectRoot &&
    args.projectRoot !== '/' &&
    args.projectRoot !== homeDir
  ) {
    log.info(`Using projectRoot directly from args: ${args.projectRoot}`);
    targetDirectory = args.projectRoot;
  } else {
    // 2. If args.projectRoot is missing or invalid, THEN try session (as a fallback)
    log.warn(
      `args.projectRoot ('${args.projectRoot}') is missing or invalid. Attempting to derive from session.`
    );
    const sessionDerivedPath = getProjectRootFromSession(session, log);
    // Validate the session-derived path as well
    if (
      sessionDerivedPath &&
      sessionDerivedPath !== '/' &&
      sessionDerivedPath !== homeDir
    ) {
      log.info(
        `Using project root derived from session: ${sessionDerivedPath}`
      );
      targetDirectory = sessionDerivedPath;
    } else {
      log.error(
        `Could not determine a valid project root. args.projectRoot='${args.projectRoot}', sessionDerivedPath='${sessionDerivedPath}'`
      );
    }
  }

  // 3. Validate the final targetDirectory
  if (!targetDirectory) {
    // This error now covers cases where neither args.projectRoot nor session provided a valid path
    return {
      success: false,
      error: {
        code: 'INVALID_TARGET_DIRECTORY',
        message: `Cannot initialize project: Could not determine a valid target directory. Please ensure a workspace/folder is open or specify projectRoot.`,
        details: `Attempted args.projectRoot: ${args.projectRoot}`
      },
      fromCache: false
    };
  }

  // --- Change to Target Directory ---
  try {
    // Change to the target directory
    process.chdir(targetDirectory);
    log.info(`Changed working directory to: ${targetDirectory}`);
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DIRECTORY_CHANGE_FAILED',
        message: `Failed to change to target directory: ${error.message}`,
        details: error.stack
      },
      fromCache: false
    };
  }

  // --- Create Project Structure ---
  try {
    // Create the project structure
    createProjectStructure(args.addAliases || false);

    return {
      success: true,
      data: {
        message: `Project initialized successfully in ${targetDirectory}. You can now run research to gather domain knowledge.`,
        projectRoot: targetDirectory,
        nextSteps: [
          {
            command: 'project-manager research',
            description: 'Research the project to gather domain knowledge'
          },
          {
            command: 'project-manager blueprint',
            description: 'Generate a blueprint for the project'
          }
        ]
      },
      fromCache: false
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'PROJECT_INITIALIZATION_FAILED',
        message: `Failed to initialize project: ${error.message}`,
        details: error.stack
      },
      fromCache: false
    };
  }
}
