/**
 * Technology Domain Knowledge Extractor
 * 
 * This module provides specialized extraction for technology domain knowledge.
 */

import { KnowledgeNode } from '../../../models/knowledge-node.js';
import { getBestAvailableProvider } from '../../../providers/index.js';

/**
 * Technology Domain Extractor
 */
export class TechnologyExtractor {
  /**
   * Create a new technology domain extractor
   * @param {Object} options - Extractor options
   */
  constructor(options = {}) {
    this.options = options;
  }
  
  /**
   * Extract knowledge from a research item
   * @param {Object} researchItem - Research item to extract knowledge from
   * @param {Object} options - Extraction options
   * @returns {Promise<Array<KnowledgeNode>>} Extracted knowledge nodes
   */
  async extractKnowledge(researchItem, options = {}) {
    try {
      // Get AI provider
      const provider = options.aiProvider || await getBestAvailableProvider({ allowMock: true });
      
      // Prepare content for extraction
      const content = researchItem.content || '';
      const title = researchItem.title || '';
      const url = researchItem.url || '';
      
      // Create technology-specific extraction prompt
      const extractionPrompt = this.createTechExtractionPrompt(title, content, options);
      
      // Generate extraction using AI
      const extractionResult = await provider.generateChatCompletion({
        messages: [
          {
            role: 'system',
            content: `You are a technology knowledge extraction assistant. Extract structured knowledge from the provided technical research material. Focus on technologies, frameworks, libraries, programming languages, APIs, design patterns, and best practices. Return the extracted knowledge in JSON format.`
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
      console.error('Error extracting technology knowledge with AI:', error);
      
      // Fall back to rule-based extraction
      return this.extractKnowledgeWithRules(researchItem, options);
    }
  }
  
  /**
   * Create a technology-specific extraction prompt
   * @param {string} title - Research title
   * @param {string} content - Research content
   * @param {Object} options - Extraction options
   * @returns {string} Extraction prompt
   */
  createTechExtractionPrompt(title, content, options = {}) {
    return `
Extract structured technology knowledge from the following research material.

Title: ${title}

Content:
${content}

Please extract the following types of technology knowledge:
1. Technologies: Programming languages, frameworks, libraries, platforms
2. Concepts: Key technical concepts, algorithms, data structures
3. Patterns: Design patterns, architectural patterns, code patterns
4. Practices: Best practices, coding standards, optimization techniques
5. APIs: API endpoints, parameters, response formats
6. Tools: Development tools, testing tools, deployment tools
7. Relationships: Dependencies, compatibility, integration points

For each knowledge element, provide:
- Type (technology, concept, pattern, practice, api, tool)
- Name
- Description
- Content (details, examples, code snippets)
- Tags (relevant keywords)
- Version (if applicable)
- Confidence (0.0-1.0)

Return the extracted knowledge in the following JSON format:
{
  "technologies": [
    {
      "name": "string",
      "description": "string",
      "content": "string",
      "tags": ["string"],
      "version": "string",
      "confidence": number
    }
  ],
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
  "apis": [
    {
      "name": "string",
      "description": "string",
      "content": "string",
      "tags": ["string"],
      "version": "string",
      "confidence": number
    }
  ],
  "tools": [
    {
      "name": "string",
      "description": "string",
      "content": "string",
      "tags": ["string"],
      "version": "string",
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
        technologies: [],
        concepts: [],
        patterns: [],
        practices: [],
        apis: [],
        tools: [],
        relationships: []
      };
    } catch (error) {
      console.error('Error parsing technology extraction result:', error);
      
      // Return empty extraction on error
      return {
        technologies: [],
        concepts: [],
        patterns: [],
        practices: [],
        apis: [],
        tools: [],
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
    
    // Create technology nodes
    if (extractedData.technologies && Array.isArray(extractedData.technologies)) {
      extractedData.technologies.forEach(tech => {
        nodes.push(new KnowledgeNode({
          type: 'technology',
          name: tech.name,
          description: tech.description,
          content: tech.content,
          tags: tech.tags,
          metadata: {
            version: tech.version
          },
          sources: [source],
          confidence: tech.confidence || 0.8
        }));
      });
    }
    
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
    
    // Create API nodes
    if (extractedData.apis && Array.isArray(extractedData.apis)) {
      extractedData.apis.forEach(api => {
        nodes.push(new KnowledgeNode({
          type: 'api',
          name: api.name,
          description: api.description,
          content: api.content,
          tags: api.tags,
          metadata: {
            version: api.version
          },
          sources: [source],
          confidence: api.confidence || 0.8
        }));
      });
    }
    
    // Create tool nodes
    if (extractedData.tools && Array.isArray(extractedData.tools)) {
      extractedData.tools.forEach(tool => {
        nodes.push(new KnowledgeNode({
          type: 'tool',
          name: tool.name,
          description: tool.description,
          content: tool.content,
          tags: tool.tags,
          metadata: {
            version: tool.version
          },
          sources: [source],
          confidence: tool.confidence || 0.8
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
   * Extract knowledge using rule-based methods
   * @param {Object} researchItem - Research item to extract knowledge from
   * @param {Object} options - Extraction options
   * @returns {Promise<Array<KnowledgeNode>>} Extracted knowledge nodes
   */
  async extractKnowledgeWithRules(researchItem, options = {}) {
    // Get content
    const content = researchItem.content || '';
    const title = researchItem.title || '';
    
    // Extract technologies (programming languages, frameworks, libraries)
    const technologies = this.extractTechnologies(content);
    
    // Extract code patterns
    const patterns = this.extractCodePatterns(content);
    
    // Extract APIs
    const apis = this.extractAPIs(content);
    
    // Create knowledge nodes
    const nodes = [];
    
    // Create source reference
    const source = {
      id: researchItem.id,
      type: 'research',
      url: researchItem.url,
      title: researchItem.title
    };
    
    // Add technology nodes
    technologies.forEach(tech => {
      nodes.push(new KnowledgeNode({
        type: 'technology',
        name: tech.name,
        description: tech.description,
        content: tech.content,
        tags: tech.tags,
        metadata: {
          version: tech.version
        },
        sources: [source],
        confidence: 0.6
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
        sources: [source],
        confidence: 0.6
      }));
    });
    
    // Add API nodes
    apis.forEach(api => {
      nodes.push(new KnowledgeNode({
        type: 'api',
        name: api.name,
        description: api.description,
        content: api.content,
        tags: api.tags,
        metadata: {
          version: api.version
        },
        sources: [source],
        confidence: 0.6
      }));
    });
    
    return nodes;
  }
  
  /**
   * Extract technologies from content
   * @param {string} content - Content to extract technologies from
   * @returns {Array} Extracted technologies
   */
  extractTechnologies(content) {
    if (!content) {
      return [];
    }
    
    const technologies = [];
    
    // Common technology keywords
    const techKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C\\+\\+', 'Ruby', 'Go', 'Rust', 'PHP',
      'React', 'Angular', 'Vue', 'Svelte', 'Node\\.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP\\.NET',
      'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'pandas', 'NumPy',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Firebase',
      'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Elasticsearch'
    ];
    
    // Create regex to match technology keywords
    const techRegex = new RegExp(`\\b(${techKeywords.join('|')})\\b(?:\\s+([0-9]+(?:\\.[0-9]+)*)?)?`, 'g');
    
    let match;
    while ((match = techRegex.exec(content)) !== null) {
      const name = match[1];
      const version = match[2] || '';
      
      // Skip if already extracted
      if (technologies.some(t => t.name === name)) {
        continue;
      }
      
      // Try to extract description from surrounding text
      const surroundingText = content.substring(Math.max(0, match.index - 100), match.index + match[0].length + 100);
      const sentenceRegex = new RegExp(`[^.!?]*\\b${name}\\b[^.!?]*[.!?]`);
      const sentenceMatch = surroundingText.match(sentenceRegex);
      const description = sentenceMatch ? sentenceMatch[0].trim() : '';
      
      technologies.push({
        name,
        description,
        content: '',
        tags: [name.toLowerCase()],
        version
      });
    }
    
    return technologies;
  }
  
  /**
   * Extract code patterns from content
   * @param {string} content - Content to extract code patterns from
   * @returns {Array} Extracted code patterns
   */
  extractCodePatterns(content) {
    if (!content) {
      return [];
    }
    
    const patterns = [];
    
    // Extract code blocks
    const codeBlockRegex = /```(?:javascript|typescript|js|ts|python|java|csharp|cpp|ruby|go|rust|php)?\n([\s\S]*?)\n```/g;
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
      let description = '';
      
      if (precedingLine && !precedingLine.startsWith('#')) {
        name = precedingLine;
      }
      
      // Try to extract description from surrounding text
      const surroundingText = content.substring(Math.max(0, match.index - 200), match.index);
      const paragraphMatch = surroundingText.match(/([^.!?]*[.!?])(?:\s+[^.!?]*[.!?])*$/);
      if (paragraphMatch) {
        description = paragraphMatch[0].trim();
      }
      
      // Extract language from code block
      const languageMatch = content.substring(match.index, match.index + 20).match(/```([a-z]+)/);
      const language = languageMatch ? languageMatch[1] : 'unknown';
      
      patterns.push({
        name,
        description,
        content: codeContent,
        tags: [language]
      });
    }
    
    return patterns;
  }
  
  /**
   * Extract APIs from content
   * @param {string} content - Content to extract APIs from
   * @returns {Array} Extracted APIs
   */
  extractAPIs(content) {
    if (!content) {
      return [];
    }
    
    const apis = [];
    
    // Extract API endpoints
    const apiRegex = /\b(GET|POST|PUT|DELETE|PATCH)\s+([\/\w\-_{}]+)(?:\s+HTTP\/[0-9.]+)?/g;
    let match;
    
    while ((match = apiRegex.exec(content)) !== null) {
      const method = match[1];
      const endpoint = match[2];
      
      // Skip if already extracted
      if (apis.some(a => a.name === `${method} ${endpoint}`)) {
        continue;
      }
      
      // Try to extract description from surrounding text
      const surroundingText = content.substring(Math.max(0, match.index - 100), match.index + match[0].length + 100);
      const descriptionMatch = surroundingText.match(/([^.!?]*\b(endpoint|API|route)\b[^.!?]*[.!?])/i);
      const description = descriptionMatch ? descriptionMatch[0].trim() : '';
      
      apis.push({
        name: `${method} ${endpoint}`,
        description,
        content: '',
        tags: [method.toLowerCase(), 'api', 'endpoint'],
        version: ''
      });
    }
    
    return apis;
  }
}
