/**
 * Change Tracker
 * 
 * This module provides utilities for tracking changes in research.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Change Tracker class
 */
export class ChangeTracker {
  /**
   * Create a new change tracker
   * @param {Object} options - Tracker options
   * @param {Object} [options.storage] - Storage provider for changes
   */
  constructor(options = {}) {
    this.storage = options.storage || null;
  }
  
  /**
   * Track a change in research
   * @param {Object} change - Change information
   * @param {string} change.type - Change type (add, update, delete)
   * @param {string} change.entityType - Entity type (node, source, reference, etc.)
   * @param {string} change.entityId - Entity ID
   * @param {Object} [change.data] - Change data
   * @param {string} [author] - Author of the change
   * @returns {Promise<Object>} Change record
   */
  async trackChange(change, author = 'system') {
    if (!change || !change.type || !change.entityType || !change.entityId) {
      throw new Error('Valid change information is required');
    }
    
    // Create change record
    const changeRecord = {
      id: `c-${uuidv4()}`,
      timestamp: new Date().toISOString(),
      author,
      ...change
    };
    
    // Store change if storage is available
    if (this.storage) {
      await this.storage.saveChange(changeRecord);
    }
    
    return changeRecord;
  }
  
  /**
   * Get change history for an entity
   * @param {string} entityId - Entity ID
   * @param {Object} [options] - Query options
   * @param {string} [options.entityType] - Filter by entity type
   * @param {string} [options.changeType] - Filter by change type
   * @param {number} [options.limit] - Limit number of results
   * @returns {Promise<Array>} Change history
   */
  async getChangeHistory(entityId, options = {}) {
    if (!entityId) {
      throw new Error('Entity ID is required');
    }
    
    // Get changes from storage if available
    if (this.storage) {
      return this.storage.getChanges(entityId, options);
    }
    
    return [];
  }
  
  /**
   * Get recent changes
   * @param {Object} [options] - Query options
   * @param {string} [options.entityType] - Filter by entity type
   * @param {string} [options.changeType] - Filter by change type
   * @param {string} [options.author] - Filter by author
   * @param {number} [options.limit=10] - Limit number of results
   * @param {number} [options.offset=0] - Offset for pagination
   * @returns {Promise<Array>} Recent changes
   */
  async getRecentChanges(options = {}) {
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    
    // Get changes from storage if available
    if (this.storage) {
      return this.storage.getRecentChanges({
        ...options,
        limit,
        offset
      });
    }
    
    return [];
  }
  
  /**
   * Get change statistics
   * @param {Object} [options] - Query options
   * @param {string} [options.entityType] - Filter by entity type
   * @param {string} [options.changeType] - Filter by change type
   * @param {string} [options.author] - Filter by author
   * @param {string} [options.timeframe] - Timeframe (day, week, month, year)
   * @returns {Promise<Object>} Change statistics
   */
  async getChangeStatistics(options = {}) {
    // Get statistics from storage if available
    if (this.storage) {
      return this.storage.getChangeStatistics(options);
    }
    
    return {
      total: 0,
      byType: {},
      byEntityType: {},
      byAuthor: {}
    };
  }
  
  /**
   * Track multiple changes in a batch
   * @param {Array} changes - Array of change information
   * @param {string} [author] - Author of the changes
   * @returns {Promise<Array>} Change records
   */
  async trackChanges(changes, author = 'system') {
    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return [];
    }
    
    const changeRecords = [];
    
    // Track each change
    for (const change of changes) {
      const record = await this.trackChange(change, author);
      changeRecords.push(record);
    }
    
    return changeRecords;
  }
  
  /**
   * Track changes between two versions of an entity
   * @param {Object} oldEntity - Old version of the entity
   * @param {Object} newEntity - New version of the entity
   * @param {string} entityType - Entity type
   * @param {string} [author] - Author of the changes
   * @returns {Promise<Array>} Change records
   */
  async trackEntityChanges(oldEntity, newEntity, entityType, author = 'system') {
    if (!oldEntity || !newEntity || !entityType) {
      throw new Error('Both entity versions and entity type are required');
    }
    
    const changes = [];
    
    // Track property changes
    const propertyChanges = this.detectPropertyChanges(oldEntity, newEntity);
    
    if (Object.keys(propertyChanges).length > 0) {
      changes.push({
        type: 'update',
        entityType,
        entityId: newEntity.id,
        data: {
          properties: propertyChanges
        }
      });
    }
    
    // Track content changes
    if (oldEntity.content !== newEntity.content) {
      changes.push({
        type: 'update',
        entityType,
        entityId: newEntity.id,
        data: {
          content: {
            old: oldEntity.content,
            new: newEntity.content
          }
        }
      });
    }
    
    // Track metadata changes
    const metadataChanges = this.detectMetadataChanges(oldEntity.metadata, newEntity.metadata);
    
    if (Object.keys(metadataChanges.added).length > 0 || 
        Object.keys(metadataChanges.removed).length > 0 || 
        Object.keys(metadataChanges.changed).length > 0) {
      changes.push({
        type: 'update',
        entityType,
        entityId: newEntity.id,
        data: {
          metadata: metadataChanges
        }
      });
    }
    
    // Track relation changes
    if (oldEntity.relations && newEntity.relations) {
      const relationChanges = this.detectArrayChanges(
        oldEntity.relations, 
        newEntity.relations, 
        item => `${item.targetId}:${item.type}`
      );
      
      if (relationChanges.added.length > 0) {
        changes.push({
          type: 'add',
          entityType: 'relation',
          entityId: newEntity.id,
          data: {
            relations: relationChanges.added
          }
        });
      }
      
      if (relationChanges.removed.length > 0) {
        changes.push({
          type: 'delete',
          entityType: 'relation',
          entityId: newEntity.id,
          data: {
            relations: relationChanges.removed
          }
        });
      }
    }
    
    // Track source changes
    if (oldEntity.sources && newEntity.sources) {
      const sourceChanges = this.detectArrayChanges(
        oldEntity.sources, 
        newEntity.sources, 
        item => item.id
      );
      
      if (sourceChanges.added.length > 0) {
        changes.push({
          type: 'add',
          entityType: 'source',
          entityId: newEntity.id,
          data: {
            sources: sourceChanges.added
          }
        });
      }
      
      if (sourceChanges.removed.length > 0) {
        changes.push({
          type: 'delete',
          entityType: 'source',
          entityId: newEntity.id,
          data: {
            sources: sourceChanges.removed
          }
        });
      }
    }
    
    // Track the changes
    return this.trackChanges(changes, author);
  }
  
  /**
   * Detect property changes between two entities
   * @param {Object} oldEntity - Old entity
   * @param {Object} newEntity - New entity
   * @returns {Object} Property changes
   */
  detectPropertyChanges(oldEntity, newEntity) {
    const properties = ['name', 'description', 'type', 'confidence'];
    const changes = {};
    
    for (const prop of properties) {
      if (oldEntity[prop] !== newEntity[prop]) {
        changes[prop] = {
          old: oldEntity[prop],
          new: newEntity[prop]
        };
      }
    }
    
    return changes;
  }
  
  /**
   * Detect metadata changes between two entities
   * @param {Object} oldMetadata - Old metadata
   * @param {Object} newMetadata - New metadata
   * @returns {Object} Metadata changes
   */
  detectMetadataChanges(oldMetadata = {}, newMetadata = {}) {
    const changes = {
      added: {},
      removed: {},
      changed: {}
    };
    
    // Find added and changed properties
    for (const key in newMetadata) {
      if (!(key in oldMetadata)) {
        changes.added[key] = newMetadata[key];
      } else if (JSON.stringify(oldMetadata[key]) !== JSON.stringify(newMetadata[key])) {
        changes.changed[key] = {
          old: oldMetadata[key],
          new: newMetadata[key]
        };
      }
    }
    
    // Find removed properties
    for (const key in oldMetadata) {
      if (!(key in newMetadata)) {
        changes.removed[key] = oldMetadata[key];
      }
    }
    
    return changes;
  }
  
  /**
   * Detect changes in arrays
   * @param {Array} oldArray - Old array
   * @param {Array} newArray - New array
   * @param {Function} keyFn - Function to extract key from array item
   * @returns {Object} Array changes
   */
  detectArrayChanges(oldArray, newArray, keyFn) {
    const changes = {
      added: [],
      removed: []
    };
    
    // Create maps for faster lookup
    const oldMap = new Map();
    const newMap = new Map();
    
    for (const item of oldArray) {
      oldMap.set(keyFn(item), item);
    }
    
    for (const item of newArray) {
      newMap.set(keyFn(item), item);
    }
    
    // Find added items
    for (const [key, item] of newMap.entries()) {
      if (!oldMap.has(key)) {
        changes.added.push(item);
      }
    }
    
    // Find removed items
    for (const [key, item] of oldMap.entries()) {
      if (!newMap.has(key)) {
        changes.removed.push(item);
      }
    }
    
    return changes;
  }
}
