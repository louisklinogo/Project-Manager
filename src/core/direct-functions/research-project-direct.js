/**
 * Direct function for researching a project
 */

import fs from 'fs';
import path from 'path';
import { ResearchManager } from '../../research/research-manager.js';
import { getBestAvailableProvider } from '../../providers/index.js';

/**
 * Read project.json file
 * @param {string} projectPath - Path to project.json
 * @returns {Object} Project data
 */
function readProjectFile(projectPath) {
  try {
    const content = fs.readFileSync(projectPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read project file: ${error.message}`);
  }
}

/**
 * Write project.json file
 * @param {string} projectPath - Path to project.json
 * @param {Object} projectData - Project data
 */
function writeProjectFile(projectPath, projectData) {
  try {
    fs.writeFileSync(projectPath, JSON.stringify(projectData, null, 2));
  } catch (error) {
    throw new Error(`Failed to write project file: ${error.message}`);
  }
}

/**
 * Generate research queries based on project requirements
 * @param {string} requirements - Project requirements
 * @returns {Array<Object>} Research queries
 */
function generateResearchQueries(requirements) {
  // Extract key concepts from requirements
  const concepts = requirements
    .split(/[.,;!?]/)
    .map(concept => concept.trim())
    .filter(concept => concept.length > 5)
    .filter(concept => !concept.match(/^(and|or|the|a|an|in|on|at|to|for|with|by|of|from)$/i));

  // Generate domain research queries
  const domainQueries = concepts.map(concept => ({
    query: `best practices for ${concept} in software development`,
    type: 'domain',
    maxResults: 5
  }));

  // Generate repository research queries
  const repoQueries = concepts.map(concept => ({
    query: `github repositories for ${concept}`,
    type: 'repository',
    maxResults: 3
  }));

  // Generate best practices research queries
  const bestPracticesQueries = [
    {
      query: `software architecture patterns for ${concepts.slice(0, 3).join(' ')}`,
      type: 'best_practices',
      maxResults: 5
    },
    {
      query: `code organization for ${concepts.slice(0, 3).join(' ')} projects`,
      type: 'best_practices',
      maxResults: 5
    }
  ];

  return [...domainQueries, ...repoQueries, ...bestPracticesQueries];
}

/**
 * Direct function wrapper for researching a project
 * @param {Object} args - Arguments for the function
 * @param {string} args.projectRoot - Project root directory
 * @param {string} args.requirements - Project requirements
 * @param {string} args.researchDepth - Research depth (basic, standard, comprehensive)
 * @param {number} args.maxResults - Maximum number of results per query
 * @param {Object} log - Logger object
 * @param {Object} context - Context object
 * @returns {Promise<Object>} Result object
 */
export async function researchProjectDirect(args, log, context = {}) {
  try {
    // Find project.json path
    const projectJsonPath = path.join(args.projectRoot, 'project.json');
    if (!fs.existsSync(projectJsonPath) || !fs.statSync(projectJsonPath).isFile()) {
      return {
        success: false,
        error: {
          code: 'PROJECT_FILE_NOT_FOUND',
          message: 'Project file not found. Please initialize a project first.'
        }
      };
    }

    // Read project data
    const projectData = readProjectFile(projectJsonPath);

    // Update project requirements if provided
    if (args.requirements) {
      projectData.requirements = args.requirements;
      writeProjectFile(projectJsonPath, projectData);
    }

    // Check if requirements exist
    if (!projectData.requirements) {
      return {
        success: false,
        error: {
          code: 'NO_REQUIREMENTS',
          message: 'No project requirements found. Please provide requirements.'
        }
      };
    }

    // Create research manager
    const researchDir = path.join(path.dirname(projectJsonPath), 'research');
    if (!fs.existsSync(researchDir)) {
      fs.mkdirSync(researchDir, { recursive: true });
    }

    // Get the best available AI provider
    const provider = await getBestAvailableProvider({ allowMock: true });
    log.info(`Using ${provider.name} provider for research`);

    // Create research manager
    const researchManager = new ResearchManager({
      storageDir: researchDir,
      providers: {
        [provider.name]: {
          apiKey: provider.apiKey,
          model: provider.defaultModel
        }
      },
      defaultProvider: provider.name,
      allowMock: true // Allow mock provider for testing
    });

    // Generate research queries
    const researchQueries = generateResearchQueries(projectData.requirements);

    // Determine how many queries to execute based on research depth
    let queryLimit = 5; // Default for 'basic'
    if (args.researchDepth === 'standard') {
      queryLimit = 10;
    } else if (args.researchDepth === 'comprehensive') {
      queryLimit = researchQueries.length;
    }

    // Execute research queries
    const results = [];
    const maxResults = args.maxResults || 5;

    // Report progress
    const reportProgress = (message) => {
      if (context.reportProgress) {
        context.reportProgress(message);
      } else {
        log.info(message);
      }
    };

    reportProgress(`Starting research with ${queryLimit} queries...`);

    // Execute queries with progress reporting
    for (let i = 0; i < Math.min(queryLimit, researchQueries.length); i++) {
      const queryData = researchQueries[i];
      reportProgress(`Executing query ${i + 1}/${queryLimit}: ${queryData.query}`);

      try {
        // Create and execute query
        const query = researchManager.createQuery({
          query: queryData.query,
          type: queryData.type,
          maxResults: maxResults
        });

        const result = await researchManager.executeQuery(query);
        results.push(result);

        // Update project data with research results
        if (queryData.type === 'domain') {
          projectData.research.domain_knowledge = [
            ...projectData.research.domain_knowledge,
            {
              query: queryData.query,
              result_id: result.id,
              summary: result.results[0]?.content || ''
            }
          ];
        } else if (queryData.type === 'repository') {
          projectData.research.similar_projects = [
            ...projectData.research.similar_projects,
            {
              query: queryData.query,
              result_id: result.id,
              summary: result.results[0]?.content || ''
            }
          ];
        } else if (queryData.type === 'best_practices') {
          projectData.research.best_practices = [
            ...projectData.research.best_practices,
            {
              query: queryData.query,
              result_id: result.id,
              summary: result.results[0]?.content || ''
            }
          ];
        }

        // Update project.json after each successful query
        writeProjectFile(projectJsonPath, projectData);

        reportProgress(`Completed query ${i + 1}/${queryLimit}`);
      } catch (error) {
        log.error(`Error executing query "${queryData.query}": ${error.message}`);
        // Continue with next query
      }
    }

    // Update project.json with research results
    projectData.updated_at = new Date().toISOString();
    writeProjectFile(projectJsonPath, projectData);

    return {
      success: true,
      data: {
        message: `Research completed with ${results.length} queries. You can now generate a blueprint.`,
        results: results.map(result => ({
          id: result.id,
          query_id: result.queryId,
          provider: result.provider
        })),
        nextSteps: [
          {
            command: 'project-manager blueprint',
            description: 'Generate a blueprint for the project'
          }
        ]
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'RESEARCH_FAILED',
        message: `Research failed: ${error.message}`,
        details: error.stack
      }
    };
  }
}
