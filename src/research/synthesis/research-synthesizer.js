/**
 * Research Synthesizer
 * 
 * This module provides utilities for synthesizing research from multiple sources.
 */

import { PriorityRanker } from './priority-ranker.js';
import { ConflictResolver } from './conflict-resolver.js';
import { getBestAvailableProvider } from '../../providers/index.js';

/**
 * Research Synthesizer class
 */
export class ResearchSynthesizer {
  /**
   * Create a new research synthesizer
   * @param {Object} options - Synthesizer options
   * @param {PriorityRanker} [options.ranker] - Priority ranker for scoring items
   * @param {ConflictResolver} [options.conflictResolver] - Conflict resolver for resolving conflicts
   * @param {boolean} [options.useAI=true] - Whether to use AI for synthesis
   */
  constructor(options = {}) {
    this.ranker = options.ranker || new PriorityRanker();
    this.conflictResolver = options.conflictResolver || new ConflictResolver({ ranker: this.ranker });
    this.useAI = options.useAI !== false;
  }
  
  /**
   * Synthesize research from multiple items
   * @param {Array} researchItems - Research items to synthesize
   * @param {Object} options - Synthesis options
   * @param {string} [options.query] - Query for relevance calculation
   * @param {string} [options.domain] - Domain for domain-specific synthesis
   * @param {boolean} [options.resolveConflicts=true] - Whether to resolve conflicts
   * @returns {Promise<Object>} Synthesized research
   */
  async synthesizeResearch(researchItems, options = {}) {
    if (!researchItems || !Array.isArray(researchItems) || researchItems.length === 0) {
      return {
        summary: '',
        keyFindings: [],
        sources: []
      };
    }
    
    // Rank research items by priority
    const rankedItems = this.ranker.rankItems(researchItems, options);
    
    // Resolve conflicts if enabled
    let processedItems = researchItems;
    let conflictResolution = null;
    
    if (options.resolveConflicts !== false) {
      const conflicts = this.conflictResolver.detectConflicts(researchItems, options);
      conflictResolution = this.conflictResolver.resolveConflicts(conflicts, options);
      processedItems = this.conflictResolver.applyResolutions(researchItems, conflictResolution);
    }
    
    // Use AI for synthesis if enabled
    if (this.useAI) {
      return this.synthesizeWithAI(processedItems, rankedItems, conflictResolution, options);
    } else {
      return this.synthesizeWithRules(processedItems, rankedItems, conflictResolution, options);
    }
  }
  
  /**
   * Synthesize research using AI
   * @param {Array} processedItems - Processed research items
   * @param {Array} rankedItems - Ranked research items
   * @param {Object} conflictResolution - Conflict resolution results
   * @param {Object} options - Synthesis options
   * @returns {Promise<Object>} Synthesized research
   */
  async synthesizeWithAI(processedItems, rankedItems, conflictResolution, options = {}) {
    try {
      // Get AI provider
      const provider = options.aiProvider || await getBestAvailableProvider({ allowMock: true });
      
      // Prepare content for synthesis
      const topItems = rankedItems.slice(0, 5); // Use top 5 items for synthesis
      
      // Create synthesis prompt
      const synthesisPrompt = this.createSynthesisPrompt(topItems, conflictResolution, options);
      
      // Generate synthesis using AI
      const synthesisResult = await provider.generateChatCompletion({
        messages: [
          {
            role: 'system',
            content: `You are a research synthesis assistant. Synthesize the provided research materials into a coherent summary, extracting key findings and insights. Focus on creating a comprehensive and accurate synthesis that resolves conflicts and highlights the most important information.`
          },
          {
            role: 'user',
            content: synthesisPrompt
          }
        ],
        temperature: 0.3,
        maxTokens: 2000,
        responseFormat: { type: 'json_object' }
      });
      
      // Parse synthesis result
      const synthesisData = this.parseSynthesisResult(synthesisResult.message);
      
      // Add sources to synthesis
      synthesisData.sources = processedItems.map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
        score: rankedItems.find(ri => ri.item.id === item.id)?.weightedScore || 0.5
      }));
      
      return synthesisData;
    } catch (error) {
      console.error('Error synthesizing research with AI:', error);
      
      // Fall back to rule-based synthesis
      return this.synthesizeWithRules(processedItems, rankedItems, conflictResolution, options);
    }
  }
  
  /**
   * Synthesize research using rule-based methods
   * @param {Array} processedItems - Processed research items
   * @param {Array} rankedItems - Ranked research items
   * @param {Object} conflictResolution - Conflict resolution results
   * @param {Object} options - Synthesis options
   * @returns {Promise<Object>} Synthesized research
   */
  async synthesizeWithRules(processedItems, rankedItems, conflictResolution, options = {}) {
    // Use top items for synthesis
    const topItems = rankedItems.slice(0, 5).map(item => item.item);
    
    // Extract key findings from top items
    const keyFindings = this.extractKeyFindings(topItems);
    
    // Generate summary from top items
    const summary = this.generateSummary(topItems, keyFindings);
    
    // Create synthesis result
    return {
      summary,
      keyFindings,
      sources: processedItems.map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
        score: rankedItems.find(ri => ri.item.id === item.id)?.weightedScore || 0.5
      }))
    };
  }
  
  /**
   * Create a synthesis prompt for AI
   * @param {Array} topItems - Top ranked items
   * @param {Object} conflictResolution - Conflict resolution results
   * @param {Object} options - Synthesis options
   * @returns {string} Synthesis prompt
   */
  createSynthesisPrompt(topItems, conflictResolution, options = {}) {
    const domain = options.domain || 'general';
    const query = options.query || '';
    
    let prompt = `
Synthesize the following research materials into a coherent summary.

Query: ${query}
Domain: ${domain}

Research Materials:
`;
    
    // Add top items to prompt
    topItems.forEach((item, index) => {
      prompt += `
Item ${index + 1}: ${item.item.title || 'Untitled'}
Source: ${item.item.url || 'Unknown'}
Score: ${item.weightedScore.toFixed(2)}
Content:
${item.item.content || 'No content available'}

`;
    });
    
    // Add conflict resolution information if available
    if (conflictResolution && conflictResolution.resolvedConflicts.length > 0) {
      prompt += `
Resolved Conflicts:
`;
      
      conflictResolution.resolvedConflicts.forEach((resolution, index) => {
        prompt += `
Conflict ${index + 1}:
- Topic: ${resolution.conflict.topic}
- Key: ${resolution.conflict.conflict.key}
- Value 1: ${resolution.conflict.conflict.value1}
- Value 2: ${resolution.conflict.conflict.value2}
- Resolved Value: ${resolution.resolution.value}
- Resolution Method: ${resolution.resolution.method}
- Confidence: ${resolution.resolution.confidence.toFixed(2)}

`;
      });
    }
    
    prompt += `
Please synthesize this information into:
1. A comprehensive summary (1-2 paragraphs)
2. A list of key findings (5-10 bullet points)

Return the synthesis in the following JSON format:
{
  "summary": "string",
  "keyFindings": [
    "string"
  ]
}
`;
    
    return prompt;
  }
  
  /**
   * Parse synthesis result from AI
   * @param {string} result - Synthesis result
   * @returns {Object} Parsed synthesis data
   */
  parseSynthesisResult(result) {
    try {
      // If result is already an object, return it
      if (typeof result === 'object' && result !== null) {
        return {
          summary: result.summary || '',
          keyFindings: result.keyFindings || [],
          sources: []
        };
      }
      
      // Try to parse JSON from the result
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || 
                        result.match(/```\n([\s\S]*?)\n```/) ||
                        result.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        return {
          summary: parsedData.summary || '',
          keyFindings: parsedData.keyFindings || [],
          sources: []
        };
      }
      
      // If no JSON found, extract summary and key findings using regex
      const summaryMatch = result.match(/summary:?\s*(.*?)(?=key\s*findings|\n\n|$)/is);
      const keyFindingsMatch = result.match(/key\s*findings:?\s*([\s\S]*?)(?=\n\n|$)/i);
      
      const summary = summaryMatch ? summaryMatch[1].trim() : '';
      const keyFindingsText = keyFindingsMatch ? keyFindingsMatch[1].trim() : '';
      
      // Extract bullet points
      const keyFindings = keyFindingsText
        .split(/\n+/)
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .filter(line => line.length > 0);
      
      return {
        summary,
        keyFindings,
        sources: []
      };
    } catch (error) {
      console.error('Error parsing synthesis result:', error);
      
      // Return empty synthesis on error
      return {
        summary: '',
        keyFindings: [],
        sources: []
      };
    }
  }
  
  /**
   * Extract key findings from research items
   * @param {Array} items - Research items
   * @returns {Array} Key findings
   */
  extractKeyFindings(items) {
    const findings = new Set();
    
    for (const item of items) {
      const content = item.content || '';
      
      // Extract bullet points
      const bulletPoints = content.match(/[-*•]\s*([^\n]+)/g) || [];
      
      for (const point of bulletPoints) {
        const cleanPoint = point.replace(/^[-*•]\s*/, '').trim();
        
        // Skip short points
        if (cleanPoint.length < 10) {
          continue;
        }
        
        findings.add(cleanPoint);
      }
      
      // Extract sentences with key phrases
      const keyPhrases = [
        'important', 'significant', 'key', 'critical', 'essential',
        'best practice', 'recommended', 'should', 'must', 'need to',
        'advantage', 'benefit', 'drawback', 'limitation', 'challenge'
      ];
      
      for (const phrase of keyPhrases) {
        const regex = new RegExp(`[^.!?]*\\b${phrase}\\b[^.!?]*[.!?]`, 'gi');
        const matches = content.match(regex) || [];
        
        for (const match of matches) {
          const cleanMatch = match.trim();
          
          // Skip short matches
          if (cleanMatch.length < 20) {
            continue;
          }
          
          findings.add(cleanMatch);
        }
      }
    }
    
    // Convert to array and limit to 10 findings
    return Array.from(findings).slice(0, 10);
  }
  
  /**
   * Generate summary from research items
   * @param {Array} items - Research items
   * @param {Array} keyFindings - Key findings
   * @returns {string} Generated summary
   */
  generateSummary(items, keyFindings) {
    if (items.length === 0) {
      return '';
    }
    
    // Extract first sentences from each item
    const firstSentences = items.map(item => {
      const content = item.content || '';
      const firstSentenceMatch = content.match(/^[^.!?]*[.!?]/);
      return firstSentenceMatch ? firstSentenceMatch[0].trim() : '';
    }).filter(sentence => sentence.length > 0);
    
    // If no first sentences, use title
    if (firstSentences.length === 0) {
      return items[0].title || '';
    }
    
    // Combine first sentences
    let summary = firstSentences.join(' ');
    
    // If summary is too short, add a sentence about key findings
    if (summary.length < 100 && keyFindings.length > 0) {
      summary += ` Key findings include: ${keyFindings[0]}`;
      
      if (keyFindings.length > 1) {
        summary += ` and ${keyFindings[1]}.`;
      } else {
        summary += '.';
      }
    }
    
    return summary;
  }
  
  /**
   * Group research items by topic
   * @param {Array} researchItems - Research items to group
   * @returns {Object} Grouped research items
   */
  groupByTopic(researchItems) {
    const groups = {};
    
    for (const item of researchItems) {
      // Extract topics from item
      const topics = this.extractTopics(item);
      
      for (const topic of topics) {
        if (!groups[topic]) {
          groups[topic] = [];
        }
        
        groups[topic].push(item);
      }
    }
    
    return groups;
  }
  
  /**
   * Extract topics from a research item
   * @param {Object} item - Research item
   * @returns {Array} Extracted topics
   */
  extractTopics(item) {
    const topics = new Set();
    
    // Extract from title
    if (item.title) {
      // Extract main topic from title (usually the first few words)
      const titleTopic = item.title.split(/\s+/).slice(0, 3).join(' ').toLowerCase();
      topics.add(titleTopic);
      
      // Extract keywords from title
      const titleWords = item.title.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      titleWords.forEach(word => topics.add(word));
    }
    
    // Extract from tags
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => topics.add(tag.toLowerCase()));
    }
    
    // Extract from metadata
    if (item.metadata && item.metadata.topics) {
      if (Array.isArray(item.metadata.topics)) {
        item.metadata.topics.forEach(topic => topics.add(topic.toLowerCase()));
      } else if (typeof item.metadata.topics === 'string') {
        topics.add(item.metadata.topics.toLowerCase());
      }
    }
    
    return Array.from(topics);
  }
}
