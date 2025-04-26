# TaskMaster Logic and Prompts Analysis

This document provides a detailed analysis of the core logic and prompts used in the TaskMaster codebase, focusing on the most important aspects that should be considered for the Project-Manager implementation.

## Core Architecture

TaskMaster follows a modular architecture with clear separation of concerns:

1. **CLI Interface** (`commands.js`): Handles user commands and arguments
2. **Task Management** (`task-manager.js`): Core logic for task operations
3. **AI Services** (`ai-services.js`): Handles interactions with AI providers
4. **Utilities** (`utils.js`): Common utility functions
5. **UI Components** (`ui.js`): User interface elements and formatting

## Key AI Providers Integration

TaskMaster integrates with multiple AI providers with a sophisticated fallback mechanism:

```javascript
// From ai-services.js
function getAvailableAIModel(options = {}) {
  const { claudeOverloaded = false, requiresResearch = false } = options;

  // First choice: Perplexity if research is required and it's available
  if (requiresResearch && process.env.PERPLEXITY_API_KEY) {
    try {
      const client = getPerplexityClient();
      return { type: 'perplexity', client };
    } catch (error) {
      log('warn', `Perplexity not available: ${error.message}`);
      // Fall through to Claude
    }
  }

  // Second choice: Claude if not overloaded
  if (!claudeOverloaded && process.env.ANTHROPIC_API_KEY) {
    return { type: 'claude', client: anthropic };
  }

  // Third choice: Perplexity as Claude fallback (even if research not required)
  if (process.env.PERPLEXITY_API_KEY) {
    try {
      const client = getPerplexityClient();
      log('info', 'Claude is overloaded, falling back to Perplexity');
      return { type: 'perplexity', client };
    } catch (error) {
      log('warn', `Perplexity fallback not available: ${error.message}`);
      // Fall through to Claude anyway with warning
    }
  }

  // Last resort: Use Claude even if overloaded (might fail)
  if (process.env.ANTHROPIC_API_KEY) {
    if (claudeOverloaded) {
      log(
        'warn',
        'Claude is overloaded but no alternatives are available. Proceeding with Claude anyway.'
      );
    }
    return { type: 'claude', client: anthropic };
  }

  // No models available
  throw new Error(
    'No AI models available. Please set ANTHROPIC_API_KEY and/or PERPLEXITY_API_KEY.'
  );
}
```

This approach ensures:
1. The best provider is selected based on the task requirements
2. Graceful fallback when a provider is unavailable
3. Research-specific tasks use Perplexity when available
4. Clear error messages when no providers are available

## Critical Prompts Analysis

### 1. Task Generation from PRD

The most important prompt in TaskMaster is the one used to generate tasks from a PRD:

```javascript
// From ai-services.js
const systemPrompt = `You are an AI assistant tasked with breaking down a Product Requirements Document (PRD) into a set of sequential development tasks. Your goal is to create exactly <num_tasks>${numTasks}</num_tasks> well-structured, actionable development tasks based on the PRD provided.

First, carefully read and analyze the attached PRD

Before creating the task list, work through the following steps inside <prd_breakdown> tags in your thinking block:

1. List the key components of the PRD
2. Identify the main features and functionalities described
3. Note any specific technical requirements or constraints mentioned
4. Outline a high-level sequence of tasks that would be needed to implement the PRD

Consider dependencies, maintainability, and the fact that you don't have access to any existing codebase. Balance between providing detailed task descriptions and maintaining a high-level perspective.

After your breakdown, create a JSON object containing an array of tasks and a metadata object. Each task should follow this structure:

{
  "id": number,
  "title": string,
  "description": string,
  "status": "pending",
  "dependencies": number[] (IDs of tasks this depends on),
  "priority": "high" | "medium" | "low",
  "details": string (implementation details),
  "testStrategy": string (validation approach)
}

Guidelines for creating tasks:
1. Number tasks from 1 to <num_tasks>${numTasks}</num_tasks>.
2. Make each task atomic and focused on a single responsibility.
3. Order tasks logically, considering dependencies and implementation sequence.
4. Start with setup and core functionality, then move to advanced features.
5. Provide a clear validation/testing approach for each task.
6. Set appropriate dependency IDs (tasks can only depend on lower-numbered tasks).
7. Assign priority based on criticality and dependency order.
8. Include detailed implementation guidance in the "details" field.
9. Strictly adhere to any specific requirements for libraries, database schemas, frameworks, tech stacks, or other implementation details mentioned in the PRD.
10. Fill in gaps left by the PRD while preserving all explicit requirements.
11. Provide the most direct path to implementation, avoiding over-engineering.

The final output should be valid JSON with this structure:

{
  "tasks": [
    {
      "id": 1,
      "title": "Example Task Title",
      "description": "Brief description of the task",
      "status": "pending",
      "dependencies": [0],
      "priority": "high",
      "details": "Detailed implementation guidance",
      "testStrategy": "Approach for validating this task"
    },
    // ... more tasks ...
  ],
  "metadata": {
    "projectName": "PRD Implementation",
    "totalTasks": <num_tasks>${numTasks}</num_tasks>,
    "sourceFile": "<prd_path>${prdPath}</prd_path>",
    "generatedAt": "YYYY-MM-DD"
  }
}

Remember to provide comprehensive task details that are LLM-friendly, consider dependencies and maintainability carefully, and keep in mind that you don't have the existing codebase as context. Aim for a balance between detailed guidance and high-level planning.

Your response should be valid JSON only, with no additional explanation or comments. Do not duplicate or rehash any of the work you did in the prd_breakdown section in your final output.`;
```

**Key Insights:**
1. The prompt uses a structured thinking approach with explicit steps
2. It enforces a specific JSON schema for consistency
3. It provides detailed guidelines for task creation
4. It emphasizes dependencies and logical ordering
5. It requires both implementation details and test strategies
6. It uses XML-like tags for variable substitution

### 2. Task Update Prompt

When updating tasks based on new information:

```javascript
// From task-manager.js
const systemPrompt = `You are an AI assistant helping to update software development tasks based on new context.
You will be given a set of tasks and a prompt describing changes or new implementation details.
Your job is to update the tasks to reflect these changes, while preserving their basic structure.

Guidelines:
1. Maintain the same IDs, statuses, and dependencies unless specifically mentioned in the prompt
2. Update titles, descriptions, details, and test strategies to reflect the new information
3. Do not change anything unnecessarily - just adapt what needs to change based on the prompt
4. You should return ALL the tasks in order, not just the modified ones
5. Return a complete valid JSON object with the updated tasks array
6. VERY IMPORTANT: Preserve all subtasks marked as "done" or "completed" - do not modify their content
7. For tasks with completed subtasks, build upon what has already been done rather than rewriting everything
8. If an existing completed subtask needs to be changed/undone based on the new context, DO NOT modify it directly
9. Instead, add a new subtask that clearly indicates what needs to be changed or replaced
10. Use the existence of completed subtasks as an opportunity to make new subtasks more specific and targeted

The changes described in the prompt should be applied to ALL tasks in the list.`;
```

**Key Insights:**
1. Emphasizes preserving existing structure
2. Explicitly protects completed work
3. Provides clear guidelines for handling changes to completed work
4. Requires returning all tasks, not just modified ones
5. Focuses on minimal necessary changes

### 3. Subtask Generation Prompt

For breaking down tasks into subtasks:

```javascript
// From ai-services.js (reconstructed from function calls)
const subtaskSystemPrompt = `You are an AI assistant helping to break down a software development task into detailed subtasks.
You will be given a task description and your job is to create ${numSubtasks} specific, actionable subtasks that together will complete the main task.

Guidelines:
1. Create exactly ${numSubtasks} subtasks
2. Make each subtask specific, clear, and actionable
3. Ensure the subtasks cover all aspects of the main task
4. Order subtasks logically, considering dependencies and implementation sequence
5. Include any necessary technical details for implementation
6. Consider edge cases and error handling
7. Include testing/validation steps as appropriate
8. If the main task already has subtasks, build upon them rather than replacing them

Each subtask should have:
- A clear title
- A detailed description
- Implementation guidance
- Any dependencies on other subtasks (by number)

Return the subtasks as a valid JSON array with this structure:
[
  {
    "id": 1,
    "title": "Subtask Title",
    "description": "Detailed description",
    "status": "pending",
    "dependencies": []
  },
  // More subtasks...
]`;
```

**Key Insights:**
1. Enforces a specific number of subtasks
2. Requires logical ordering and dependencies
3. Emphasizes actionable, specific subtasks
4. Includes technical implementation details
5. Considers testing and validation
6. Preserves existing subtasks when present

### 4. Research-Backed Task Updates

When using Perplexity for research-backed updates:

```javascript
// From task-manager.js
const perplexitySystemPrompt = `${systemPrompt}\n\nAdditionally, please research the latest best practices, implementation details, and considerations when updating these tasks. Use your online search capabilities to gather relevant information. Remember to strictly follow the guidelines about preserving completed subtasks and building upon what has already been done rather than modifying or replacing it.`;
```

**Key Insights:**
1. Builds on the base update prompt
2. Explicitly requests research on best practices
3. Emphasizes preserving completed work
4. Leverages Perplexity's search capabilities

## Task Data Model

TaskMaster uses a consistent data model for tasks:

```javascript
// Task structure
{
  "id": number,
  "title": string,
  "description": string,
  "status": "pending" | "in-progress" | "review" | "done",
  "dependencies": number[],
  "priority": "high" | "medium" | "low",
  "details": string,
  "testStrategy": string,
  "subtasks": [
    {
      "id": number,
      "title": string,
      "description": string,
      "status": "pending" | "in-progress" | "review" | "done",
      "dependencies": (number | string)[]
    }
  ]
}
```

**Key Insights:**
1. Hierarchical structure with main tasks and subtasks
2. Consistent status tracking
3. Explicit dependencies
4. Priority levels
5. Implementation details and test strategies
6. Subtasks can have dependencies on other subtasks

## Error Handling and Fallbacks

TaskMaster implements sophisticated error handling:

```javascript
// From ai-services.js
function handleClaudeError(error) {
  // Check if it's a structured error response
  if (error.type === 'error' && error.error) {
    switch (error.error.type) {
      case 'overloaded_error':
        // Check if we can use Perplexity as a fallback
        if (process.env.PERPLEXITY_API_KEY) {
          return 'Claude is currently overloaded. Trying to fall back to Perplexity AI.';
        }
        return 'Claude is currently experiencing high demand and is overloaded. Please wait a few minutes and try again.';
      case 'rate_limit_error':
        return 'You have exceeded the rate limit. Please wait a few minutes before making more requests.';
      case 'invalid_request_error':
        return 'There was an issue with the request format. If this persists, please report it as a bug.';
      default:
        return `Claude API error: ${error.error.message}`;
    }
  }

  // Check for network/timeout errors
  if (error.message?.toLowerCase().includes('timeout')) {
    return 'The request to Claude timed out. Please try again.';
  }
  if (error.message?.toLowerCase().includes('network')) {
    return 'There was a network error connecting to Claude. Please check your internet connection and try again.';
  }

  // Default error message
  return `Error communicating with Claude: ${error.message}`;
}
```

**Key Insights:**
1. Detailed error categorization
2. User-friendly error messages
3. Provider-specific error handling
4. Automatic fallback to alternative providers
5. Retry logic for transient errors

## Streaming Response Handling

TaskMaster uses streaming for large responses:

```javascript
// From ai-services.js
// Process the stream
for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta' && chunk.delta.text) {
    responseText += chunk.delta.text;
  }
  if (reportProgress) {
    await reportProgress({
      progress: (responseText.length / maxTokens) * 100
    });
  }
  if (mcpLog) {
    mcpLog.info(`Progress: ${(responseText.length / maxTokens) * 100}%`);
  }
}
```

**Key Insights:**
1. Handles large responses efficiently
2. Provides progress reporting
3. Works with both CLI and MCP interfaces
4. Graceful error handling for streaming

## Dependency Management

TaskMaster includes sophisticated dependency validation:

```javascript
// From dependency-manager.js (reconstructed from function calls)
function validateTaskDependencies(tasks) {
  const issues = [];
  
  // Check for circular dependencies
  const dependencyGraph = buildDependencyGraph(tasks);
  const circularDependencies = findCircularDependencies(dependencyGraph);
  
  if (circularDependencies.length > 0) {
    issues.push({
      type: 'circular_dependency',
      tasks: circularDependencies,
      message: `Circular dependency detected: ${circularDependencies.join(' -> ')} -> ${circularDependencies[0]}`
    });
  }
  
  // Check for missing dependencies
  tasks.forEach(task => {
    if (task.dependencies) {
      task.dependencies.forEach(depId => {
        const dependencyExists = tasks.some(t => t.id === depId);
        if (!dependencyExists) {
          issues.push({
            type: 'missing_dependency',
            taskId: task.id,
            dependencyId: depId,
            message: `Task ${task.id} depends on non-existent task ${depId}`
          });
        }
      });
    }
  });
  
  return issues;
}
```

**Key Insights:**
1. Detects circular dependencies
2. Identifies missing dependencies
3. Provides detailed issue reporting
4. Can automatically fix certain dependency issues

## Key Lessons for Project-Manager

1. **Provider Abstraction**: Implement a robust provider abstraction layer with fallback mechanisms.

2. **Structured Prompts**: Use detailed, structured prompts with clear guidelines and expected output formats.

3. **Error Handling**: Implement comprehensive error handling with user-friendly messages and automatic retries.

4. **Streaming Support**: Use streaming for large responses with progress reporting.

5. **Dependency Management**: Include sophisticated dependency validation and resolution.

6. **Task Hierarchy**: Support hierarchical task structures with main tasks and subtasks.

7. **Preservation of Work**: Emphasize preserving completed work when updating tasks.

8. **Research Integration**: Leverage Perplexity for research-backed task generation and updates.

9. **Consistent Data Model**: Use a consistent data model across all components.

10. **Modular Architecture**: Maintain a clean separation of concerns with modular components.

## Implementation Recommendations for Project-Manager

1. **Enhanced Provider Abstraction**: Expand the provider abstraction to include more providers (OpenAI, Gemini) with more sophisticated fallback mechanisms.

2. **Improved Prompts**: Refine the prompts based on the latest best practices and model capabilities.

3. **Better Error Recovery**: Implement more robust error recovery mechanisms, including automatic retries with exponential backoff.

4. **Advanced Dependency Management**: Enhance dependency management with visualization and automatic resolution of complex dependency issues.

5. **Research-Driven Planning**: Make research a core part of the planning process, not just an optional feature.

6. **Enhanced Task Model**: Extend the task model to include more metadata, such as estimated complexity, time estimates, and resource requirements.

7. **Multi-Model Collaboration**: Implement a system where multiple models can collaborate on different aspects of the planning process.

8. **Contextual Awareness**: Improve the system's awareness of the existing codebase and project context.

9. **Adaptive Planning**: Implement adaptive planning that can adjust to changing requirements and constraints.

10. **Comprehensive Testing**: Include more comprehensive testing of the generated plans and tasks.
