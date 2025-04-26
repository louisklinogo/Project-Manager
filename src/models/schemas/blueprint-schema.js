/**
 * JSON Schema for Blueprint model
 */

export const blueprintSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Blueprint",
  description: "A blueprint for a project",
  type: "object",
  required: ["id", "project_id"],
  properties: {
    id: {
      type: "string",
      description: "Unique identifier for the blueprint"
    },
    project_id: {
      type: "string",
      description: "ID of the associated project"
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
    architecture: {
      type: "object",
      description: "Architecture design for the project",
      properties: {
        components: {
          type: "array",
          description: "Components of the architecture",
          items: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: {
                type: "string",
                description: "Unique identifier for the component"
              },
              name: {
                type: "string",
                description: "Name of the component"
              },
              description: {
                type: "string",
                description: "Description of the component"
              },
              type: {
                type: "string",
                description: "Type of the component"
              },
              properties: {
                type: "object",
                description: "Additional properties of the component"
              }
            }
          }
        },
        relationships: {
          type: "array",
          description: "Relationships between components",
          items: {
            type: "object",
            required: ["id", "source", "target"],
            properties: {
              id: {
                type: "string",
                description: "Unique identifier for the relationship"
              },
              source: {
                type: "string",
                description: "ID of the source component"
              },
              target: {
                type: "string",
                description: "ID of the target component"
              },
              type: {
                type: "string",
                description: "Type of the relationship"
              },
              properties: {
                type: "object",
                description: "Additional properties of the relationship"
              }
            }
          }
        }
      }
    },
    tasks: {
      type: "array",
      description: "Tasks for implementing the project",
      items: {
        type: "object",
        required: ["id", "title"],
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for the task"
          },
          title: {
            type: "string",
            description: "Title of the task"
          },
          description: {
            type: "string",
            description: "Description of the task"
          },
          dependencies: {
            type: "array",
            description: "IDs of tasks that this task depends on",
            items: {
              type: "string"
            }
          },
          acceptance_criteria: {
            type: "array",
            description: "Acceptance criteria for the task",
            items: {
              type: "string"
            }
          },
          implementation_guide: {
            type: "string",
            description: "Detailed implementation instructions"
          }
        }
      }
    },
    workflow: {
      type: "object",
      description: "Workflow for implementing the project",
      properties: {
        steps: {
          type: "array",
          description: "Steps in the workflow",
          items: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: {
                type: "string",
                description: "Unique identifier for the step"
              },
              name: {
                type: "string",
                description: "Name of the step"
              },
              description: {
                type: "string",
                description: "Description of the step"
              },
              tasks: {
                type: "array",
                description: "IDs of tasks associated with this step",
                items: {
                  type: "string"
                }
              }
            }
          }
        },
        checkpoints: {
          type: "array",
          description: "Checkpoints in the workflow",
          items: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: {
                type: "string",
                description: "Unique identifier for the checkpoint"
              },
              name: {
                type: "string",
                description: "Name of the checkpoint"
              },
              description: {
                type: "string",
                description: "Description of the checkpoint"
              },
              criteria: {
                type: "array",
                description: "Criteria for passing the checkpoint",
                items: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    }
  },
  additionalProperties: false
};
