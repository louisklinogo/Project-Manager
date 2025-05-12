/**
 * Conflict Resolver for research synthesis
 * 
 * This module provides utilities for resolving conflicting information in research.
 */

import { PriorityRanker } from './priority-ranker.js';

/**
 * Conflict Resolver class
 */
export class ConflictResolver {
  /**
   * Create a new conflict resolver
   * @param {Object} options - Resolver options
   * @param {PriorityRanker} [options.ranker] - Priority ranker for scoring items
   * @param {number} [options.confidenceThreshold=0.7] - Confidence threshold for resolution
   */
  constructor(options = {}) {
    this.ranker = options.ranker || new PriorityRanker();
    this.confidenceThreshold = options.confidenceThreshold || 0.7;
  }
  
  /**
   * Detect conflicts in research items
   * @param {Array} researchItems - Research items to check for conflicts
   * @param {Object} options - Detection options
   * @returns {Array} Detected conflicts
   */
  detectConflicts(researchItems, options = {}) {
    if (!researchItems || !Array.isArray(researchItems) || researchItems.length < 2) {
      return [];
    }
    
    const conflicts = [];
    
    // Group items by topic/category
    const itemGroups = this.groupItemsByTopic(researchItems);
    
    // Check each group for conflicts
    for (const [topic, items] of itemGroups.entries()) {
      if (items.length < 2) {
        continue; // Need at least 2 items to have a conflict
      }
      
      // Check for conflicts within the group
      const groupConflicts = this.detectConflictsInGroup(topic, items);
      
      if (groupConflicts.length > 0) {
        conflicts.push(...groupConflicts);
      }
    }
    
    return conflicts;
  }
  
  /**
   * Group research items by topic/category
   * @param {Array} researchItems - Research items to group
   * @returns {Map} Map of topics to items
   */
  groupItemsByTopic(researchItems) {
    const groups = new Map();
    
    for (const item of researchItems) {
      // Determine topic from item
      const topics = this.extractTopics(item);
      
      for (const topic of topics) {
        if (!groups.has(topic)) {
          groups.set(topic, []);
        }
        
        groups.get(topic).push(item);
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
  
  /**
   * Detect conflicts within a group of items
   * @param {string} topic - Group topic
   * @param {Array} items - Items in the group
   * @returns {Array} Detected conflicts
   */
  detectConflictsInGroup(topic, items) {
    const conflicts = [];
    
    // Compare each pair of items
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1 = items[i];
        const item2 = items[j];
        
        // Check for conflicts between the two items
        const conflict = this.detectConflictBetweenItems(item1, item2);
        
        if (conflict) {
          conflicts.push({
            topic,
            items: [item1, item2],
            conflict,
            severity: conflict.severity
          });
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * Detect conflict between two items
   * @param {Object} item1 - First item
   * @param {Object} item2 - Second item
   * @returns {Object|null} Detected conflict or null if no conflict
   */
  detectConflictBetweenItems(item1, item2) {
    // Extract key information from items
    const info1 = this.extractKeyInformation(item1);
    const info2 = this.extractKeyInformation(item2);
    
    // Check for conflicts in key information
    for (const key in info1) {
      if (info2[key] && info1[key] !== info2[key]) {
        // Found a potential conflict
        
        // Calculate conflict severity
        const severity = this.calculateConflictSeverity(info1[key], info2[key]);
        
        if (severity > 0.3) { // Only report significant conflicts
          return {
            key,
            value1: info1[key],
            value2: info2[key],
            severity
          };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Extract key information from a research item
   * @param {Object} item - Research item
   * @returns {Object} Extracted key information
   */
  extractKeyInformation(item) {
    const info = {};
    
    // Extract from content using simple pattern matching
    const content = item.content || '';
    
    // Extract version numbers
    const versionMatch = content.match(/version\s+([0-9]+(?:\.[0-9]+)*)/i);
    if (versionMatch) {
      info.version = versionMatch[1];
    }
    
    // Extract dates
    const dateMatch = content.match(/(?:released|published|updated|as of)\s+(\w+\s+\d{1,2},?\s+\d{4})/i);
    if (dateMatch) {
      info.date = dateMatch[1];
    }
    
    // Extract measurements/statistics
    const measurementMatches = content.matchAll(/(\d+(?:\.\d+)?)\s*(%|ms|seconds|minutes|hours|days|kb|mb|gb)/gi);
    for (const match of measurementMatches) {
      const key = match[2].toLowerCase();
      info[`measurement_${key}`] = match[1];
    }
    
    // Extract from metadata
    if (item.metadata) {
      for (const key in item.metadata) {
        if (typeof item.metadata[key] === 'string' || typeof item.metadata[key] === 'number') {
          info[key] = item.metadata[key];
        }
      }
    }
    
    return info;
  }
  
  /**
   * Calculate conflict severity between two values
   * @param {*} value1 - First value
   * @param {*} value2 - Second value
   * @returns {number} Conflict severity (0-1)
   */
  calculateConflictSeverity(value1, value2) {
    // If values are numbers, calculate relative difference
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      const max = Math.max(Math.abs(value1), Math.abs(value2));
      if (max === 0) return 0; // Both values are 0, no conflict
      
      const diff = Math.abs(value1 - value2);
      return Math.min(1, diff / max);
    }
    
    // If values are strings, check for similarity
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      // If strings are completely different, maximum severity
      if (value1.toLowerCase() !== value2.toLowerCase()) {
        return 1;
      }
      
      // If strings differ only in case, low severity
      if (value1 !== value2) {
        return 0.2;
      }
      
      return 0; // Identical strings, no conflict
    }
    
    // Different types, maximum severity
    return 1;
  }
  
  /**
   * Resolve conflicts in research items
   * @param {Array} conflicts - Detected conflicts
   * @param {Object} options - Resolution options
   * @returns {Object} Resolution results
   */
  resolveConflicts(conflicts, options = {}) {
    if (!conflicts || !Array.isArray(conflicts) || conflicts.length === 0) {
      return {
        resolvedConflicts: [],
        unresolvedConflicts: []
      };
    }
    
    const resolvedConflicts = [];
    const unresolvedConflicts = [];
    
    for (const conflict of conflicts) {
      const resolution = this.resolveConflict(conflict, options);
      
      if (resolution.resolved) {
        resolvedConflicts.push({
          conflict,
          resolution
        });
      } else {
        unresolvedConflicts.push({
          conflict,
          resolution
        });
      }
    }
    
    return {
      resolvedConflicts,
      unresolvedConflicts
    };
  }
  
  /**
   * Resolve a single conflict
   * @param {Object} conflict - Conflict to resolve
   * @param {Object} options - Resolution options
   * @returns {Object} Resolution result
   */
  resolveConflict(conflict, options = {}) {
    const { topic, items, conflict: conflictDetails } = conflict;
    
    // Rank the conflicting items
    const rankedItems = this.ranker.rankItems(items, options);
    
    // If one item has significantly higher score, use its value
    if (rankedItems.length >= 2 && 
        rankedItems[0].weightedScore - rankedItems[1].weightedScore > 0.2) {
      
      return {
        resolved: true,
        method: 'higher_score',
        value: rankedItems[0].item.id === items[0].id ? 
               conflictDetails.value1 : 
               conflictDetails.value2,
        confidence: rankedItems[0].weightedScore,
        preferredItem: rankedItems[0].item
      };
    }
    
    // If recency is important, prefer the more recent item
    if (options.preferRecent) {
      const recencyScores = items.map(item => this.ranker.calculateRecencyScore(item));
      
      if (Math.abs(recencyScores[0] - recencyScores[1]) > 0.3) {
        const moreRecentIndex = recencyScores[0] > recencyScores[1] ? 0 : 1;
        
        return {
          resolved: true,
          method: 'more_recent',
          value: moreRecentIndex === 0 ? conflictDetails.value1 : conflictDetails.value2,
          confidence: recencyScores[moreRecentIndex],
          preferredItem: items[moreRecentIndex]
        };
      }
    }
    
    // If confidence is important, prefer the item with higher confidence
    if (options.preferConfident) {
      const confidenceScores = items.map(item => this.ranker.calculateConfidenceScore(item));
      
      if (Math.abs(confidenceScores[0] - confidenceScores[1]) > 0.3) {
        const moreConfidentIndex = confidenceScores[0] > confidenceScores[1] ? 0 : 1;
        
        return {
          resolved: true,
          method: 'more_confident',
          value: moreConfidentIndex === 0 ? conflictDetails.value1 : conflictDetails.value2,
          confidence: confidenceScores[moreConfidentIndex],
          preferredItem: items[moreConfidentIndex]
        };
      }
    }
    
    // If specificity is important, prefer the more specific item
    if (options.preferSpecific) {
      const specificityScores = items.map(item => this.ranker.calculateSpecificityScore(item));
      
      if (Math.abs(specificityScores[0] - specificityScores[1]) > 0.3) {
        const moreSpecificIndex = specificityScores[0] > specificityScores[1] ? 0 : 1;
        
        return {
          resolved: true,
          method: 'more_specific',
          value: moreSpecificIndex === 0 ? conflictDetails.value1 : conflictDetails.value2,
          confidence: specificityScores[moreSpecificIndex],
          preferredItem: items[moreSpecificIndex]
        };
      }
    }
    
    // If values are numbers, use average with confidence based on agreement
    if (typeof conflictDetails.value1 === 'number' && typeof conflictDetails.value2 === 'number') {
      const average = (conflictDetails.value1 + conflictDetails.value2) / 2;
      const difference = Math.abs(conflictDetails.value1 - conflictDetails.value2);
      const max = Math.max(Math.abs(conflictDetails.value1), Math.abs(conflictDetails.value2));
      const agreement = max === 0 ? 1 : Math.max(0, 1 - (difference / max));
      
      return {
        resolved: true,
        method: 'average',
        value: average,
        confidence: agreement,
        preferredItem: null
      };
    }
    
    // If values are strings and conflict severity is low, use the longer value
    if (typeof conflictDetails.value1 === 'string' && 
        typeof conflictDetails.value2 === 'string' && 
        conflictDetails.severity < 0.5) {
      
      const longerIndex = conflictDetails.value1.length >= conflictDetails.value2.length ? 0 : 1;
      
      return {
        resolved: true,
        method: 'longer_value',
        value: longerIndex === 0 ? conflictDetails.value1 : conflictDetails.value2,
        confidence: 0.6,
        preferredItem: items[longerIndex]
      };
    }
    
    // Cannot resolve the conflict
    return {
      resolved: false,
      method: 'unresolved',
      value: null,
      confidence: 0,
      preferredItem: null
    };
  }
  
  /**
   * Apply resolutions to research items
   * @param {Array} researchItems - Original research items
   * @param {Object} resolutionResults - Resolution results
   * @returns {Array} Updated research items
   */
  applyResolutions(researchItems, resolutionResults) {
    if (!resolutionResults || !resolutionResults.resolvedConflicts) {
      return researchItems;
    }
    
    // Create a copy of the research items
    const updatedItems = [...researchItems];
    
    // Apply each resolution
    for (const { conflict, resolution } of resolutionResults.resolvedConflicts) {
      if (!resolution.resolved) {
        continue;
      }
      
      // Find the preferred item
      const preferredItem = resolution.preferredItem || conflict.items[0];
      
      // Find the index of the preferred item
      const itemIndex = updatedItems.findIndex(item => item.id === preferredItem.id);
      
      if (itemIndex === -1) {
        continue;
      }
      
      // Update the item with the resolved value
      if (!updatedItems[itemIndex].metadata) {
        updatedItems[itemIndex].metadata = {};
      }
      
      // Add resolution to metadata
      updatedItems[itemIndex].metadata[`resolved_${conflict.conflict.key}`] = resolution.value;
      updatedItems[itemIndex].metadata[`resolution_confidence_${conflict.conflict.key}`] = resolution.confidence;
      updatedItems[itemIndex].metadata[`resolution_method_${conflict.conflict.key}`] = resolution.method;
    }
    
    return updatedItems;
  }
}
