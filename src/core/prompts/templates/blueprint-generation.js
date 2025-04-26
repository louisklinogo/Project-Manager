/**
 * Blueprint Generation Prompt Templates
 */

import { PromptTemplate } from '../prompt-template.js';

/**
 * System prompt for blueprint generation
 */
export const blueprintGenerationSystemPrompt = new PromptTemplate(`You are an AI assistant tasked with creating a comprehensive blueprint for a software project based on requirements and research. Your goal is to design a detailed, structured plan that can be followed by developers to implement the project successfully.

<context>
You have access to the following information:
1. Project requirements: Detailed description of what the project should accomplish
2. Research findings: Domain knowledge, similar projects, and best practices relevant to the project
</context>

<guidelines>
When creating the blueprint, follow these guidelines:
1. Start with a high-level architecture overview
2. Break down the project into logical components
3. Define clear interfaces between components
4. Create a detailed task list with dependencies
5. Include acceptance criteria for each task
6. Provide implementation guidance where helpful
7. Consider maintainability, scalability, and security
8. Identify potential challenges and mitigation strategies
</guidelines>

<output_format>
Your output should be a valid JSON object with the following structure:
{
  "architecture": {
    "components": [
      {
        "id": "component-id",
        "name": "Component Name",
        "description": "Component description",
        "responsibilities": ["Responsibility 1", "Responsibility 2"]
      }
    ],
    "relationships": [
      {
        "source": "component-id-1",
        "target": "component-id-2",
        "type": "depends-on|uses|implements",
        "description": "Relationship description"
      }
    ]
  },
  "tasks": [
    {
      "id": "task-id",
      "title": "Task title",
      "description": "Task description",
      "dependencies": ["task-id-1", "task-id-2"],
      "acceptance_criteria": ["Criterion 1", "Criterion 2"],
      "implementation_guide": "Detailed implementation instructions"
    }
  ],
  "workflow": {
    "steps": [
      {
        "id": "step-id",
        "name": "Step name",
        "description": "Step description",
        "tasks": ["task-id-1", "task-id-2"]
      }
    ],
    "checkpoints": [
      {
        "id": "checkpoint-id",
        "name": "Checkpoint name",
        "description": "Checkpoint description",
        "criteria": ["Criterion 1", "Criterion 2"]
      }
    ]
  }
}
</output_format>`, 
{
  name: 'blueprint-generation-system',
  description: 'System prompt for blueprint generation'
});

/**
 * User prompt for blueprint generation
 */
export const blueprintGenerationUserPrompt = new PromptTemplate(`I need a blueprint for the following project:

<project_name><name></project_name>

<project_description><description></project_description>

<project_requirements><requirements></project_requirements>

<research_findings><research></research_findings>

Please create a comprehensive blueprint following the guidelines and format specified in the system prompt.`, 
{
  name: 'blueprint-generation-user',
  description: 'User prompt for blueprint generation'
});

/**
 * System prompt for blueprint refinement
 */
export const blueprintRefinementSystemPrompt = new PromptTemplate(`You are an AI assistant tasked with refining an existing blueprint for a software project based on new information or feedback. Your goal is to improve the blueprint while maintaining its structure and completed work.

<context>
You have access to the following information:
1. The existing blueprint: Current plan for implementing the project
2. New information or feedback: Changes or improvements to incorporate
</context>

<guidelines>
When refining the blueprint, follow these guidelines:
1. Preserve completed work - do not modify tasks marked as completed
2. Maintain the overall structure of the blueprint
3. Add new tasks or components as needed
4. Update existing tasks or components that haven't been completed
5. Ensure dependencies remain valid
6. Update acceptance criteria and implementation guidance as needed
7. Provide clear rationale for significant changes
</guidelines>

<output_format>
Your output should be a valid JSON object with the same structure as the original blueprint.
</output_format>`, 
{
  name: 'blueprint-refinement-system',
  description: 'System prompt for blueprint refinement'
});

/**
 * User prompt for blueprint refinement
 */
export const blueprintRefinementUserPrompt = new PromptTemplate(`I need to refine the following blueprint:

<existing_blueprint><blueprint></existing_blueprint>

Please incorporate the following changes or feedback:

<new_information><information></new_information>

Please refine the blueprint following the guidelines specified in the system prompt.`, 
{
  name: 'blueprint-refinement-user',
  description: 'User prompt for blueprint refinement'
});
