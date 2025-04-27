/**
 * Research Project Direct Functions
 *
 * This module provides direct functions for researching projects.
 */

import { v4 as uuidv4 } from 'uuid';
import logger from '../core/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AsyncFlow } from '../core/flow/async-flow.js';
import { QueryFormatterNode } from '../research/nodes/query-formatter-node.js';
import { ProviderSelectorNode } from '../research/nodes/provider-selector-node.js';
import { ResearchExecutionNode } from '../research/nodes/research-execution-node.js';
import { InformationExtractorNode } from '../research/nodes/information-extractor-node.js';
import { ConfidenceScorerNode } from '../research/nodes/confidence-scorer-node.js';
import { OutputFormatterNode } from '../research/nodes/output-formatter-node.js';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the data directory
const DATA_DIR = path.resolve(__dirname, '../../data');
const RESEARCH_DIR = path.resolve(DATA_DIR, 'research');

/**
 * Research a project
 * @param {Object} options - Research options
 * @returns {Promise<Object>} - Result object
 */
export async function researchProjectDirect(options) {
  try {
    // Ensure required options are provided
    const projectId = options.projectId || `project-${uuidv4()}`;
    const query = options.query || '';
    const preferredProvider = options.preferredProvider || null;
    const forceProvider = options.forceProvider || null;
    const useMockData = options.useMockData !== false; // Default to true

    logger.info(`Researching project: ${projectId}`);
    logger.info(`Query: ${query}`);

    if (useMockData) {
      logger.info('Using mock data for research');
    }

    // Create a research ID
    const researchId = `research-${uuidv4()}`;

    // Run the research flow
    const result = await runResearchFlow({
      query,
      preferredProvider,
      forceProvider,
      useMockData
    });

    // Save the research results
    await saveResearch({
      id: researchId,
      projectId,
      query,
      result,
      createdAt: new Date().toISOString()
    });

    logger.info(`Research completed successfully: ${researchId}`);

    return {
      success: true,
      message: 'Research completed successfully',
      researchId,
      result
    };
  } catch (error) {
    logger.error(`Error researching project: ${error.message}`);

    return {
      success: false,
      message: `Error researching project: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * Run the research flow
 * @param {Object} options - Flow options
 * @returns {Promise<Object>} - Flow result
 */
async function runResearchFlow(options = {}) {
  const { query, preferredProvider, forceProvider, useMockData = true } = options;

  // Create the research flow
  const flow = new AsyncFlow({
    name: 'ResearchFlow',
    storeIntermediateResults: true,
    continueOnError: true
  });

  // Add nodes to the flow
  flow
    .add(new QueryFormatterNode())
    .add(new ProviderSelectorNode({ preferredProvider, forceProvider }))
    .add(new ResearchExecutionNode({ maxTokens: 1000, useMockData }))
    .add(new InformationExtractorNode())
    .add(new ConfidenceScorerNode())
    .add(new OutputFormatterNode());

  // Run the flow
  try {
    const result = await flow.run({ query });
    return result;
  } catch (error) {
    logger.error('Error running research flow:', error);
    throw error;
  }
}

/**
 * Save research results to disk
 * @param {Object} research - Research results
 * @returns {Promise<void>}
 */
export async function saveResearch(research) {
  try {
    // Ensure the research directory exists
    if (!fs.existsSync(RESEARCH_DIR)) {
      fs.mkdirSync(RESEARCH_DIR, { recursive: true });
    }

    // Save the research
    const researchPath = path.resolve(RESEARCH_DIR, `${research.id}.json`);
    fs.writeFileSync(researchPath, JSON.stringify(research, null, 2));

    logger.info(`Research saved to: ${researchPath}`);
  } catch (error) {
    logger.error(`Error saving research: ${error.message}`);
    throw error;
  }
}

/**
 * Load research results from disk
 * @param {String} researchId - Research ID
 * @returns {Promise<Object>} - Research object
 */
export async function loadResearch(researchId) {
  try {
    // Check if the research exists
    const researchPath = path.resolve(RESEARCH_DIR, `${researchId}.json`);

    if (!fs.existsSync(researchPath)) {
      throw new Error(`Research not found: ${researchId}`);
    }

    // Load the research
    const researchData = fs.readFileSync(researchPath, 'utf8');
    const research = JSON.parse(researchData);

    logger.info(`Research loaded from: ${researchPath}`);

    return {
      success: true,
      message: 'Research loaded successfully',
      research
    };
  } catch (error) {
    logger.error(`Error loading research: ${error.message}`);

    return {
      success: false,
      message: `Error loading research: ${error.message}`,
      error: error.message
    };
  }
}
