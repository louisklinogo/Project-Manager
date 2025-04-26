/**
 * JSON Schema for Project model
 */

export const projectSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Project",
  description: "A project managed by Project-Manager",
  type: "object",
  required: ["id", "name"],
  properties: {
    id: {
      type: "string",
      description: "Unique identifier for the project"
    },
    name: {
      type: "string",
      description: "Name of the project"
    },
    description: {
      type: "string",
      description: "Description of the project"
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
    requirements: {
      type: "string",
      description: "Detailed project requirements"
    },
    research: {
      type: "object",
      description: "Research data for the project",
      properties: {
        domain_knowledge: {
          type: "array",
          description: "Domain knowledge related to the project",
          items: {
            type: "object"
          }
        },
        similar_projects: {
          type: "array",
          description: "Similar projects for reference",
          items: {
            type: "object"
          }
        },
        best_practices: {
          type: "array",
          description: "Best practices for the project",
          items: {
            type: "object"
          }
        }
      }
    },
    blueprint: {
      type: ["string", "null"],
      description: "ID of the associated blueprint"
    }
  },
  additionalProperties: false
};
