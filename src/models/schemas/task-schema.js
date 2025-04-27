/**
 * JSON Schema for Task model
 */

export const taskSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Task",
  description: "A task in a project",
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
    status: {
      type: "string",
      description: "Status of the task",
      enum: ["pending", "in-progress", "done", "deferred", "blocked"]
    },
    priority: {
      type: "string",
      description: "Priority of the task",
      enum: ["high", "medium", "low"]
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
    subtasks: {
      type: "array",
      description: "Subtasks of this task",
      items: {
        type: "object",
        required: ["id", "title"],
        properties: {
          id: {
            type: ["string", "number"],
            description: "Unique identifier for the subtask"
          },
          title: {
            type: "string",
            description: "Title of the subtask"
          },
          description: {
            type: "string",
            description: "Description of the subtask"
          },
          status: {
            type: "string",
            description: "Status of the subtask",
            enum: ["pending", "in-progress", "done", "deferred", "blocked"]
          },
          dependencies: {
            type: "array",
            description: "IDs of subtasks that this subtask depends on",
            items: {
              type: ["string", "number"]
            }
          },
          acceptance_criteria: {
            type: "array",
            description: "Acceptance criteria for the subtask",
            items: {
              type: "string"
            }
          },
          implementation_guide: {
            type: "string",
            description: "Detailed implementation instructions for the subtask"
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
          }
        }
      }
    },
    validation_plan: {
      type: ["object", "null"],
      description: "Validation plan for the task",
      properties: {
        item_id: {
          type: "string",
          description: "ID of the item being validated"
        },
        item_type: {
          type: "string",
          description: "Type of the item being validated"
        },
        item_name: {
          type: "string",
          description: "Name of the item being validated"
        },
        criteria: {
          type: "array",
          description: "Validation criteria",
          items: {
            type: "string"
          }
        },
        validation_steps: {
          type: "array",
          description: "Steps for validating the item",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Name of the validation step"
              },
              description: {
                type: "string",
                description: "Description of the validation step"
              },
              actions: {
                type: "array",
                description: "Actions to perform for validation",
                items: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    },
    parent_id: {
      type: ["string", "null"],
      description: "ID of the parent task (if this is a subtask)"
    },
    completion_percentage: {
      type: "number",
      description: "Percentage of completion (0-100)",
      minimum: 0,
      maximum: 100
    }
  },
  additionalProperties: false
};

export const subtaskSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Subtask",
  description: "A subtask in a task",
  type: "object",
  required: ["id", "title"],
  properties: {
    id: {
      type: ["string", "number"],
      description: "Unique identifier for the subtask"
    },
    title: {
      type: "string",
      description: "Title of the subtask"
    },
    description: {
      type: "string",
      description: "Description of the subtask"
    },
    status: {
      type: "string",
      description: "Status of the subtask",
      enum: ["pending", "in-progress", "done", "deferred", "blocked"]
    },
    dependencies: {
      type: "array",
      description: "IDs of subtasks that this subtask depends on",
      items: {
        type: ["string", "number"]
      }
    },
    acceptance_criteria: {
      type: "array",
      description: "Acceptance criteria for the subtask",
      items: {
        type: "string"
      }
    },
    implementation_guide: {
      type: "string",
      description: "Detailed implementation instructions for the subtask"
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
    parent_id: {
      type: "string",
      description: "ID of the parent task"
    }
  },
  additionalProperties: false
};
