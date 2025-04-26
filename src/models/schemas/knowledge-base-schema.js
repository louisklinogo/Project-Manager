/**
 * JSON Schema for Knowledge Base model
 */

export const knowledgeBaseSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Knowledge Base",
  description: "A knowledge base for a domain",
  type: "object",
  required: ["id", "domain"],
  properties: {
    id: {
      type: "string",
      description: "Unique identifier for the knowledge base"
    },
    domain: {
      type: "string",
      description: "Domain of the knowledge base"
    },
    created_at: {
      type: "string",
      format: "date-time",
      description: "Creation timestamp"
    },
    updated_at: {
      type: "string",
      format: "date-time",
      description: "Last update timestamp"
    },
    concepts: {
      type: "array",
      description: "Concepts in the knowledge base",
      items: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for the concept"
          },
          name: {
            type: "string",
            description: "Name of the concept"
          },
          description: {
            type: "string",
            description: "Description of the concept"
          },
          examples: {
            type: "array",
            description: "Examples of the concept",
            items: {
              type: "string"
            }
          },
          related_concepts: {
            type: "array",
            description: "IDs of related concepts",
            items: {
              type: "string"
            }
          }
        }
      }
    },
    patterns: {
      type: "array",
      description: "Patterns in the knowledge base",
      items: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for the pattern"
          },
          name: {
            type: "string",
            description: "Name of the pattern"
          },
          description: {
            type: "string",
            description: "Description of the pattern"
          },
          examples: {
            type: "array",
            description: "Examples of the pattern",
            items: {
              type: "string"
            }
          },
          related_patterns: {
            type: "array",
            description: "IDs of related patterns",
            items: {
              type: "string"
            }
          }
        }
      }
    },
    best_practices: {
      type: "array",
      description: "Best practices in the knowledge base",
      items: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for the best practice"
          },
          name: {
            type: "string",
            description: "Name of the best practice"
          },
          description: {
            type: "string",
            description: "Description of the best practice"
          },
          rationale: {
            type: "string",
            description: "Rationale for the best practice"
          },
          examples: {
            type: "array",
            description: "Examples of the best practice",
            items: {
              type: "string"
            }
          }
        }
      }
    },
    examples: {
      type: "array",
      description: "Examples in the knowledge base",
      items: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for the example"
          },
          name: {
            type: "string",
            description: "Name of the example"
          },
          description: {
            type: "string",
            description: "Description of the example"
          },
          code: {
            type: "string",
            description: "Code for the example"
          },
          related_concepts: {
            type: "array",
            description: "IDs of related concepts",
            items: {
              type: "string"
            }
          },
          related_patterns: {
            type: "array",
            description: "IDs of related patterns",
            items: {
              type: "string"
            }
          }
        }
      }
    }
  },
  additionalProperties: false
};
