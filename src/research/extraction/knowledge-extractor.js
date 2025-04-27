/**
 * Knowledge Extractor
 * 
 * This module provides utilities for extracting structured knowledge from research materials.
 */

import { KnowledgeNode } from '../../models/knowledge-node.js';
import { getBestAvailableProvider } from '../../providers/index.js';

/**
 * Knowledge Extractor class
 */
export class KnowledgeExtractor {
  /**
   * Create a new knowledge extractor
   * @param {Object} options - Extractor options
   * @param {string} [options.domain] - Domain for domain-specific extraction
   * @param {Object} [options.aiProvider] - AI provider for extraction
   * @param {boolean} [options.useAI=true] - Whether to use AI for extraction
   */
  constructor(options = {}) {
    this.domain = options.domain;
    this.aiProvider = options.aiProvider;
    this.useAI = options.useAI !== false;
    this.domainExtractors = new Map();
  }
  
  /**
   * Register a domain-specific extractor
   * @param {string} domain - Domain name
   * @param {Object} extractor - Domain-specific extractor
   * @returns {KnowledgeExtractor} This extractor instance
   */
  registerDomainExtractor(domain, extractor) {
    this.domainExtractors.set(domain.toLowerCase(), extractor);
    return this;
  }
  
  /**
   * Get a domain-specific extractor
   * @param {string} domain - Domain name
   * @returns {Object|null} Domain-specific extractor or null if not found
   */
  getDomainExtractor(domain) {
    return domain ? this.domainExtractors.get(domain.toLowerCase()) || null : null;
  }
  
  /**
   * Extract knowledge from a research item
   * @param {Object} researchItem - Research item to extract knowledge from
   * @param {Object} options - Extraction options
   * @returns {Promise<Array<KnowledgeNode>>} Extracted knowledge nodes
   */
  async extractKnowledge(researchItem, options = {}) {
    // Get domain-specific extractor if available
    const domainExtractor = this.getDomainExtractor(options.domain || this.domain);
    
    if (domainExtractor && typeof domainExtractor.extractKnowledge === 'function') {
      // Use domain-specific extractor
      return domainExtractor.extractKnowledge(researchItem, options);
    }
    
    // Use default extraction method
    if (this.useAI) {
      return this.extractKnowledgeWithAI(researchItem, options);
    } else {
      return this.extractKnowledgeWithRules(researchItem, options);
    }
  }
  
  /**
   * Extract knowledge from multiple research items
   * @param {Array} researchItems - Research items to extract knowledge from
   * @param {Object} options - Extraction options
   * @returns {Promise<Array<KnowledgeNode>>} Extracted knowledge nodes
   */
  async extractKnowledgeFromMultiple(researchItems, options = {}) {
    if (!researchItems || !Array.isArray(researchItems) || researchItems.length === 0) {
      return [];
    }
    
    // Extract knowledge from each item
    const extractionPromises = researchItems.map(item => 
      this.extractKnowledge(item, options)
    );
    
    // Wait for all extractions to complete
    const extractionResults = await Promise.all(extractionPromises);
    
    // Flatten results
    const allNodes = extractionResults.flat();
    
    // Deduplicate nodes
    return this.deduplicateNodes(allNodes);
  }
  
  /**
   * Extract knowledge using AI
   * @param {Object} researchItem - Research item to extract knowledge from
   * @param {Object} options - Extraction options
   * @returns {Promise<Array<KnowledgeNode>>} Extracted knowledge nodes
   */
  async extractKnowledgeWithAI(researchItem, options = {}) {
    try {
      // Get AI provider
      const provider = this.aiProvider || await getBestAvailableProvider({ allowMock: true });
      
      // Prepare content for extraction
      const content = researchItem.content || '';
      const title = researchItem.title || '';
      const url = researchItem.url || '';
      
      // Create extraction prompt
      const extractionPrompt = this.createExtractionPrompt(title, content, options);
      
      // Generate extraction using AI
      const extractionResult = await provider.generateChatCompletion({
        messages: [
          {
            role: 'system',
            content: `You are a knowledge extraction assistant. Extract structured knowledge from the provided research material. Focus on key concepts, patterns, practices, and relationships. Return the extracted knowledge in JSON format.`
          },
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        temperature: 0.2,
        maxTokens: 2000,
        responseFormat: { type: 'json_object' }
      });
      
      // Parse extraction result
      const extractedData = this.parseExtractionResult(extractionResult.message);
      
      // Create knowledge nodes
      return this.createKnowledgeNodes(extractedData, researchItem);
    } catch (error) {
      console.error('Error extracting knowledge with AI:', error);
      
      // Fall back to rule-based extraction
      return this.extractKnowledgeWithRules(researchItem, options);
    }
  }
  
  /**
   * Extract knowledge using rule-based methods
   * @param {Object} researchItem - Research item to extract knowledge from
   * @param {Object} options - Extraction options
   * @returns {Promise<Array<KnowledgeNode>>} Extracted knowledge nodes
   */
  async extractKnowledgeWithRules(researchItem, options = {}) {
    // Get content
    const content = researchItem.content || '';
    const title = researchItem.title || '';
    
    // Extract concepts (terms that appear to be important)
    const concepts = this.extractConcepts(content);
    
    // Extract patterns (code patterns, design patterns, etc.)
    const patterns = this.extractPatterns(content);
    
    // Extract practices (best practices, recommendations, etc.)
    const practices = this.extractPractices(content);
    
    // Create knowledge nodes
    const nodes = [];
    
    // Add concept nodes
    concepts.forEach(concept => {
      nodes.push(new KnowledgeNode({
        type: 'concept',
        name: concept.name,
        description: concept.description,
        content: concept.content,
        tags: concept.tags,
        sources: [{
          id: researchItem.id,
          type: 'research',
          url: researchItem.url,
          title: researchItem.title
        }],
        confidence: 0.6 // Rule-based extraction has moderate confidence
      }));
    });
    
    // Add pattern nodes
    patterns.forEach(pattern => {
      nodes.push(new KnowledgeNode({
        type: 'pattern',
        name: pattern.name,
        description: pattern.description,
        content: pattern.content,
        tags: pattern.tags,
        sources: [{
          id: researchItem.id,
          type: 'research',
          url: researchItem.url,
          title: researchItem.title
        }],
        confidence: 0.6
      }));
    });
    
    // Add practice nodes
    practices.forEach(practice => {
      nodes.push(new KnowledgeNode({
        type: 'practice',
        name: practice.name,
        description: practice.description,
        content: practice.content,
        tags: practice.tags,
        sources: [{
          id: researchItem.id,
          type: 'research',
          url: researchItem.url,
          title: researchItem.title
        }],
        confidence: 0.6
      }));
    });
    
    return nodes;
  }
  
  /**
   * Create an extraction prompt for AI
   * @param {string} title - Research title
   * @param {string} content - Research content
   * @param {Object} options - Extraction options
   * @returns {string} Extraction prompt
   */
  createExtractionPrompt(title, content, options = {}) {
    const domain = options.domain || this.domain || 'general';
    
    return `
Extract structured knowledge from the following research material.

Title: ${title}

Content:
${content}

Please extract the following types of knowledge:
1. Concepts: Key terms, ideas, or abstractions
2. Patterns: Recurring solutions, design patterns, or code patterns
3. Practices: Best practices, recommendations, or guidelines
4. Relationships: Connections between different knowledge elements

For each knowledge element, provide:
- Type (concept, pattern, practice)
- Name
- Description
- Content (details, examples, code snippets)
- Tags (relevant keywords)
- Confidence (0.0-1.0)

Domain: ${domain}

Return the extracted knowledge in the following JSON format:
{
  "concepts": [
    {
      "name": "string",
      "description": "string",
      "content": "string",
      "tags": ["string"],
      "confidence": number
    }
  ],
  "patterns": [
    {
      "name": "string",
      "description": "string",
      "content": "string",
      "tags": ["string"],
      "confidence": number
    }
  ],
  "practices": [
    {
      "name": "string",
      "description": "string",
      "content": "string",
      "tags": ["string"],
      "confidence": number
    }
  ],
  "relationships": [
    {
      "sourceType": "string",
      "sourceName": "string",
      "targetType": "string",
      "targetName": "string",
      "relationType": "string",
      "description": "string",
      "confidence": number
    }
  ]
}
`;
  }
  
  /**
   * Parse extraction result from AI
   * @param {string} result - Extraction result
   * @returns {Object} Parsed extraction data
   */
  parseExtractionResult(result) {
    try {
      // If result is already an object, return it
      if (typeof result === 'object' && result !== null) {
        return result;
      }
      
      // Try to parse JSON from the result
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || 
                        result.match(/```\n([\s\S]*?)\n```/) ||
                        result.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, return empty extraction
      return {
        concepts: [],
        patterns: [],
        practices: [],
        relationships: []
      };
    } catch (error) {
      console.error('Error parsing extraction result:', error);
      
      // Return empty extraction on error
      return {
        concepts: [],
        patterns: [],
        practices: [],
        relationships: []
      };
    }
  }
  
  /**
   * Create knowledge nodes from extracted data
   * @param {Object} extractedData - Extracted data
   * @param {Object} researchItem - Source research item
   * @returns {Array<KnowledgeNode>} Knowledge nodes
   */
  createKnowledgeNodes(extractedData, researchItem) {
    const nodes = [];
    
    // Create source reference
    const source = {
      id: researchItem.id,
      type: 'research',
      url: researchItem.url,
      title: researchItem.title
    };
    
    // Create concept nodes
    if (extractedData.concepts && Array.isArray(extractedData.concepts)) {
      extractedData.concepts.forEach(concept => {
        nodes.push(new KnowledgeNode({
          type: 'concept',
          name: concept.name,
          description: concept.description,
          content: concept.content,
          tags: concept.tags,
          sources: [source],
          confidence: concept.confidence || 0.8
        }));
      });
    }
    
    // Create pattern nodes
    if (extractedData.patterns && Array.isArray(extractedData.patterns)) {
      extractedData.patterns.forEach(pattern => {
        nodes.push(new KnowledgeNode({
          type: 'pattern',
          name: pattern.name,
          description: pattern.description,
          content: pattern.content,
          tags: pattern.tags,
          sources: [source],
          confidence: pattern.confidence || 0.8
        }));
      });
    }
    
    // Create practice nodes
    if (extractedData.practices && Array.isArray(extractedData.practices)) {
      extractedData.practices.forEach(practice => {
        nodes.push(new KnowledgeNode({
          type: 'practice',
          name: practice.name,
          description: practice.description,
          content: practice.content,
          tags: practice.tags,
          sources: [source],
          confidence: practice.confidence || 0.8
        }));
      });
    }
    
    // Create relationships between nodes
    if (extractedData.relationships && Array.isArray(extractedData.relationships)) {
      extractedData.relationships.forEach(relationship => {
        // Find source and target nodes
        const sourceNode = nodes.find(node => 
          node.type === relationship.sourceType && node.name === relationship.sourceName
        );
        
        const targetNode = nodes.find(node => 
          node.type === relationship.targetType && node.name === relationship.targetName
        );
        
        // Add relation if both nodes exist
        if (sourceNode && targetNode) {
          sourceNode.addRelation(targetNode.id, relationship.relationType, {
            description: relationship.description,
            confidence: relationship.confidence || 0.7
          });
        }
      });
    }
    
    return nodes;
  }
  
  /**
   * Deduplicate knowledge nodes
   * @param {Array<KnowledgeNode>} nodes - Knowledge nodes
   * @returns {Array<KnowledgeNode>} Deduplicated nodes
   */
  deduplicateNodes(nodes) {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return [];
    }
    
    // Group nodes by type and name
    const nodeGroups = new Map();
    
    nodes.forEach(node => {
      const key = `${node.type}:${node.name.toLowerCase()}`;
      
      if (!nodeGroups.has(key)) {
        nodeGroups.set(key, []);
      }
      
      nodeGroups.get(key).push(node);
    });
    
    // Merge nodes in each group
    const mergedNodes = [];
    
    nodeGroups.forEach(group => {
      if (group.length === 1) {
        // Only one node in group, no need to merge
        mergedNodes.push(group[0]);
      } else {
        // Merge multiple nodes
        const mergedNode = this.mergeNodes(group);
        mergedNodes.push(mergedNode);
      }
    });
    
    return mergedNodes;
  }
  
  /**
   * Merge multiple knowledge nodes
   * @param {Array<KnowledgeNode>} nodes - Knowledge nodes to merge
   * @returns {KnowledgeNode} Merged node
   */
  mergeNodes(nodes) {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      throw new Error('No nodes to merge');
    }
    
    if (nodes.length === 1) {
      return nodes[0];
    }
    
    // Use the first node as base
    const baseNode = nodes[0];
    
    // Merge data from other nodes
    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Merge description (use longer description)
      if (node.description.length > baseNode.description.length) {
        baseNode.description = node.description;
      }
      
      // Merge content (concatenate unique content)
      if (node.content && !baseNode.content.includes(node.content)) {
        baseNode.content += '\n\n' + node.content;
      }
      
      // Merge tags
      node.tags.forEach(tag => {
        if (!baseNode.tags.includes(tag)) {
          baseNode.tags.push(tag);
        }
      });
      
      // Merge relations
      node.relations.forEach(relation => {
        // Check if relation already exists
        const existingRelation = baseNode.relations.find(r => 
          r.targetId === relation.targetId && r.type === relation.type
        );
        
        if (!existingRelation) {
          baseNode.relations.push(relation);
        }
      });
      
      // Merge sources
      node.sources.forEach(source => {
        // Check if source already exists
        const existingSource = baseNode.sources.find(s => s.id === source.id);
        
        if (!existingSource) {
          baseNode.sources.push(source);
        }
      });
      
      // Update confidence (use average)
      baseNode.confidence = (baseNode.confidence + node.confidence) / 2;
    }
    
    // Update timestamp
    baseNode.updatedAt = new Date().toISOString();
    
    return baseNode;
  }
  
  /**
   * Extract concepts from content using rule-based methods
   * @param {string} content - Content to extract concepts from
   * @returns {Array} Extracted concepts
   */
  extractConcepts(content) {
    if (!content) {
      return [];
    }
    
    const concepts = [];
    
    // Extract headings (potential concepts)
    const headingRegex = /#{1,3}\s+([A-Z][A-Za-z0-9\s]+)(?:\n|\r\n?)((?:(?!#)[^\n])*)/g;
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const name = match[1].trim();
      const description = match[2].trim();
      
      // Skip common headings that aren't concepts
      if (['introduction', 'conclusion', 'summary', 'overview', 'references'].includes(name.toLowerCase())) {
        continue;
      }
      
      concepts.push({
        name,
        description,
        content: '',
        tags: []
      });
    }
    
    // Extract terms in bold or italics (potential concepts)
    const emphasisRegex = /\*\*([A-Z][A-Za-z0-9\s]+)\*\*|\*([A-Z][A-Za-z0-9\s]+)\*/g;
    
    while ((match = emphasisRegex.exec(content)) !== null) {
      const name = (match[1] || match[2]).trim();
      
      // Skip if already extracted
      if (concepts.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        continue;
      }
      
      concepts.push({
        name,
        description: '',
        content: '',
        tags: []
      });
    }
    
    return concepts;
  }
  
  /**
   * Extract patterns from content using rule-based methods
   * @param {string} content - Content to extract patterns from
   * @returns {Array} Extracted patterns
   */
  extractPatterns(content) {
    if (!content) {
      return [];
    }
    
    const patterns = [];
    
    // Extract code blocks (potential patterns)
    const codeBlockRegex = /```(?:[a-z]+)?\n([\s\S]*?)\n```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const codeContent = match[1].trim();
      
      // Skip empty code blocks
      if (!codeContent) {
        continue;
      }
      
      // Try to extract pattern name from preceding text
      const precedingText = content.substring(0, match.index).trim();
      const lastNewline = precedingText.lastIndexOf('\n');
      const precedingLine = precedingText.substring(lastNewline + 1).trim();
      
      let name = 'Code Pattern';
      
      if (precedingLine && !precedingLine.startsWith('#')) {
        name = precedingLine;
      }
      
      patterns.push({
        name,
        description: '',
        content: codeContent,
        tags: []
      });
    }
    
    // Extract sections that might describe patterns
    const patternSectionRegex = /#{1,3}\s+([A-Za-z0-9\s]+Pattern[A-Za-z0-9\s]*)(?:\n|\r\n?)((?:(?!#)[^\n])*)/g;
    
    while ((match = patternSectionRegex.exec(content)) !== null) {
      const name = match[1].trim();
      const description = match[2].trim();
      
      // Skip if already extracted
      if (patterns.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        continue;
      }
      
      patterns.push({
        name,
        description,
        content: '',
        tags: []
      });
    }
    
    return patterns;
  }
  
  /**
   * Extract practices from content using rule-based methods
   * @param {string} content - Content to extract practices from
   * @returns {Array} Extracted practices
   */
  extractPractices(content) {
    if (!content) {
      return [];
    }
    
    const practices = [];
    
    // Extract best practices sections
    const practicesSectionRegex = /#{1,3}\s+([A-Za-z0-9\s]+(Best Practices|Guidelines|Recommendations)[A-Za-z0-9\s]*)(?:\n|\r\n?)((?:(?!#)[^\n])*)/g;
    let match;
    
    while ((match = practicesSectionRegex.exec(content)) !== null) {
      const name = match[1].trim();
      const description = match[2].trim();
      
      practices.push({
        name,
        description,
        content: '',
        tags: []
      });
    }
    
    // Extract list items that might be practices
    const listItemRegex = /[-*]\s+([A-Z][^.\n]+\.)/g;
    
    while ((match = listItemRegex.exec(content)) !== null) {
      const practiceText = match[1].trim();
      
      // Skip short items
      if (practiceText.length < 15) {
        continue;
      }
      
      practices.push({
        name: practiceText,
        description: '',
        content: '',
        tags: []
      });
    }
    
    return practices;
  }
}
