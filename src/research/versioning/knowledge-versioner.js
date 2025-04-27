/**
 * Knowledge Versioner
 * 
 * This module provides utilities for versioning knowledge base.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Knowledge Versioner class
 */
export class KnowledgeVersioner {
  /**
   * Create a new knowledge versioner
   * @param {Object} options - Versioner options
   * @param {Object} [options.storage] - Storage provider for versions
   */
  constructor(options = {}) {
    this.storage = options.storage || null;
  }
  
  /**
   * Create a new version of a knowledge node
   * @param {Object} node - Knowledge node to version
   * @param {Object} changes - Changes made to the node
   * @param {string} [author] - Author of the changes
   * @returns {Promise<Object>} Version information
   */
  async createVersion(node, changes, author = 'system') {
    if (!node || !node.id) {
      throw new Error('Valid knowledge node is required');
    }
    
    // Create version information
    const version = {
      id: `v-${uuidv4()}`,
      nodeId: node.id,
      timestamp: new Date().toISOString(),
      author,
      changes: this.normalizeChanges(changes),
      previousVersion: node.version || null
    };
    
    // Store version if storage is available
    if (this.storage) {
      await this.storage.saveVersion(version);
    }
    
    return version;
  }
  
  /**
   * Get version history for a knowledge node
   * @param {string} nodeId - Knowledge node ID
   * @returns {Promise<Array>} Version history
   */
  async getVersionHistory(nodeId) {
    if (!nodeId) {
      throw new Error('Node ID is required');
    }
    
    // Get versions from storage if available
    if (this.storage) {
      return this.storage.getVersions(nodeId);
    }
    
    return [];
  }
  
  /**
   * Compare two versions of a knowledge node
   * @param {Object} oldVersion - Old version
   * @param {Object} newVersion - New version
   * @returns {Object} Comparison result
   */
  compareVersions(oldVersion, newVersion) {
    if (!oldVersion || !newVersion) {
      throw new Error('Both versions are required for comparison');
    }
    
    // Get node content from versions
    const oldNode = oldVersion.node || {};
    const newNode = newVersion.node || {};
    
    // Compare basic properties
    const comparison = {
      id: newNode.id,
      properties: this.compareProperties(oldNode, newNode),
      content: this.compareContent(oldNode.content, newNode.content),
      metadata: this.compareMetadata(oldNode.metadata, newNode.metadata),
      relations: this.compareRelations(oldNode.relations, newNode.relations),
      sources: this.compareSources(oldNode.sources, newNode.sources)
    };
    
    return comparison;
  }
  
  /**
   * Restore a knowledge node to a specific version
   * @param {string} nodeId - Knowledge node ID
   * @param {string} versionId - Version ID to restore
   * @returns {Promise<Object>} Restored node
   */
  async restoreVersion(nodeId, versionId) {
    if (!nodeId || !versionId) {
      throw new Error('Node ID and version ID are required');
    }
    
    // Get version from storage if available
    if (this.storage) {
      const version = await this.storage.getVersion(nodeId, versionId);
      
      if (!version) {
        throw new Error(`Version ${versionId} not found for node ${nodeId}`);
      }
      
      // Get original node
      const node = await this.storage.getNode(nodeId);
      
      if (!node) {
        throw new Error(`Node ${nodeId} not found`);
      }
      
      // Apply version changes in reverse
      const restoredNode = this.applyReverseChanges(node, version);
      
      // Save restored node
      await this.storage.saveNode(restoredNode);
      
      // Create new version for the restoration
      await this.createVersion(restoredNode, {
        type: 'restore',
        versionId
      }, 'system');
      
      return restoredNode;
    }
    
    throw new Error('Storage provider is required for version restoration');
  }
  
  /**
   * Normalize changes object
   * @param {Object} changes - Changes to normalize
   * @returns {Object} Normalized changes
   */
  normalizeChanges(changes) {
    if (!changes) {
      return { type: 'update' };
    }
    
    if (typeof changes === 'string') {
      return { type: changes };
    }
    
    if (!changes.type) {
      return { ...changes, type: 'update' };
    }
    
    return changes;
  }
  
  /**
   * Compare basic properties between two nodes
   * @param {Object} oldNode - Old node
   * @param {Object} newNode - New node
   * @returns {Object} Property comparison
   */
  compareProperties(oldNode, newNode) {
    const properties = ['name', 'description', 'type', 'confidence'];
    const comparison = {};
    
    for (const prop of properties) {
      if (oldNode[prop] !== newNode[prop]) {
        comparison[prop] = {
          old: oldNode[prop],
          new: newNode[prop]
        };
      }
    }
    
    return comparison;
  }
  
  /**
   * Compare content between two nodes
   * @param {string} oldContent - Old content
   * @param {string} newContent - New content
   * @returns {Object} Content comparison
   */
  compareContent(oldContent, newContent) {
    if (oldContent === newContent) {
      return { changed: false };
    }
    
    // Simple diff for now, could be enhanced with more sophisticated diff algorithm
    return {
      changed: true,
      old: oldContent,
      new: newContent,
      // Calculate a simple similarity score
      similarity: this.calculateSimilarity(oldContent || '', newContent || '')
    };
  }
  
  /**
   * Compare metadata between two nodes
   * @param {Object} oldMetadata - Old metadata
   * @param {Object} newMetadata - New metadata
   * @returns {Object} Metadata comparison
   */
  compareMetadata(oldMetadata = {}, newMetadata = {}) {
    const comparison = {
      added: {},
      removed: {},
      changed: {}
    };
    
    // Find added and changed properties
    for (const key in newMetadata) {
      if (!(key in oldMetadata)) {
        comparison.added[key] = newMetadata[key];
      } else if (JSON.stringify(oldMetadata[key]) !== JSON.stringify(newMetadata[key])) {
        comparison.changed[key] = {
          old: oldMetadata[key],
          new: newMetadata[key]
        };
      }
    }
    
    // Find removed properties
    for (const key in oldMetadata) {
      if (!(key in newMetadata)) {
        comparison.removed[key] = oldMetadata[key];
      }
    }
    
    return comparison;
  }
  
  /**
   * Compare relations between two nodes
   * @param {Array} oldRelations - Old relations
   * @param {Array} newRelations - New relations
   * @returns {Object} Relations comparison
   */
  compareRelations(oldRelations = [], newRelations = []) {
    const comparison = {
      added: [],
      removed: []
    };
    
    // Find added relations
    for (const newRelation of newRelations) {
      const exists = oldRelations.some(oldRelation => 
        oldRelation.targetId === newRelation.targetId && 
        oldRelation.type === newRelation.type
      );
      
      if (!exists) {
        comparison.added.push(newRelation);
      }
    }
    
    // Find removed relations
    for (const oldRelation of oldRelations) {
      const exists = newRelations.some(newRelation => 
        newRelation.targetId === oldRelation.targetId && 
        newRelation.type === oldRelation.type
      );
      
      if (!exists) {
        comparison.removed.push(oldRelation);
      }
    }
    
    return comparison;
  }
  
  /**
   * Compare sources between two nodes
   * @param {Array} oldSources - Old sources
   * @param {Array} newSources - New sources
   * @returns {Object} Sources comparison
   */
  compareSources(oldSources = [], newSources = []) {
    const comparison = {
      added: [],
      removed: []
    };
    
    // Find added sources
    for (const newSource of newSources) {
      const exists = oldSources.some(oldSource => oldSource.id === newSource.id);
      
      if (!exists) {
        comparison.added.push(newSource);
      }
    }
    
    // Find removed sources
    for (const oldSource of oldSources) {
      const exists = newSources.some(newSource => newSource.id === oldSource.id);
      
      if (!exists) {
        comparison.removed.push(oldSource);
      }
    }
    
    return comparison;
  }
  
  /**
   * Apply reverse changes to restore a node to a previous version
   * @param {Object} node - Current node
   * @param {Object} version - Version to restore
   * @returns {Object} Restored node
   */
  applyReverseChanges(node, version) {
    // Create a copy of the node
    const restoredNode = JSON.parse(JSON.stringify(node));
    
    // Apply changes in reverse
    if (version.changes) {
      // Restore basic properties
      if (version.changes.properties) {
        for (const prop in version.changes.properties) {
          restoredNode[prop] = version.changes.properties[prop].old;
        }
      }
      
      // Restore content
      if (version.changes.content && version.changes.content.changed) {
        restoredNode.content = version.changes.content.old;
      }
      
      // Restore metadata
      if (version.changes.metadata) {
        // Remove added properties
        for (const key in version.changes.metadata.added) {
          delete restoredNode.metadata[key];
        }
        
        // Restore changed properties
        for (const key in version.changes.metadata.changed) {
          restoredNode.metadata[key] = version.changes.metadata.changed[key].old;
        }
        
        // Add back removed properties
        for (const key in version.changes.metadata.removed) {
          restoredNode.metadata[key] = version.changes.metadata.removed[key];
        }
      }
      
      // Restore relations
      if (version.changes.relations) {
        // Remove added relations
        restoredNode.relations = restoredNode.relations.filter(relation => 
          !version.changes.relations.added.some(added => 
            added.targetId === relation.targetId && added.type === relation.type
          )
        );
        
        // Add back removed relations
        restoredNode.relations.push(...version.changes.relations.removed);
      }
      
      // Restore sources
      if (version.changes.sources) {
        // Remove added sources
        restoredNode.sources = restoredNode.sources.filter(source => 
          !version.changes.sources.added.some(added => added.id === source.id)
        );
        
        // Add back removed sources
        restoredNode.sources.push(...version.changes.sources.removed);
      }
    }
    
    // Update version information
    restoredNode.version = version.id;
    restoredNode.updatedAt = new Date().toISOString();
    
    return restoredNode;
  }
  
  /**
   * Calculate similarity between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    if (!str1 && !str2) {
      return 1; // Both empty, perfect match
    }
    
    if (!str1 || !str2) {
      return 0; // One empty, no match
    }
    
    // Simple Jaccard similarity for now
    const set1 = new Set(str1.toLowerCase().split(/\W+/).filter(w => w.length > 0));
    const set2 = new Set(str2.toLowerCase().split(/\W+/).filter(w => w.length > 0));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
}
