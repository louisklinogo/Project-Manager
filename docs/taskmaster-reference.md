# TaskMaster Reference Guide

This document provides an analysis of the TaskMaster codebase's logic, prompts, and architecture to serve as a reference for the Project-Manager implementation.

## Core Components

### 1. AI Provider Abstraction

TaskMaster implements a provider abstraction layer that allows it to work with multiple AI providers:

- **OpenAI Provider**: Handles communication with OpenAI models
- **Claude Provider**: Handles communication with Anthropic's Claude models
- **Gemini Provider**: Handles communication with Google's Gemini models
- **Mock Provider**: Used for testing without making actual API calls

The abstraction layer provides a consistent interface for:
- Model selection
- Prompt formatting
- Response parsing
- Error handling

### 2. Research Module

The research module is responsible for gathering information about:
- Domain knowledge
- Similar projects
- Best practices

Key components:
- **ResearchManager**: Coordinates research queries and results
- **ResearchQuery**: Represents a single research query
- **ResearchResult**: Stores the results of a research query

### 3. Direct Functions

Direct functions provide the core functionality of TaskMaster:
- **initialize-project-direct.js**: Sets up a new project
- **research-project-direct.js**: Conducts research on a project
- **generate-blueprint-direct.js**: Creates a blueprint based on research
- **list-projects-direct.js**: Lists all projects

### 4. MCP Server Integration

The MCP (Multi-Context Protocol) server integration allows TaskMaster to be used from various IDEs:
- Tool registration
- Request handling
- Response formatting

### 5. CLI Implementation

The CLI provides a command-line interface for TaskMaster:
- Command registration
- Argument parsing
- Output formatting

## Key Prompts Analysis

### Project Initialization Prompt

```javascript
// No specific prompt for initialization, but it creates the project structure
```

### Research Prompt

```javascript
// From research-project-direct.js
const messages = [
  { role: 'system', content: 'You are a helpful research assistant. Provide detailed, accurate information based on the user\'s query.' },
  { role: 'user', content: query.query }
];
```

This prompt is simple but effective:
- Sets the AI as a "research assistant"
- Asks for detailed and accurate information
- Passes the user's query directly

### Blueprint Generation Prompt

```javascript
// From generate-blueprint-direct.js
const prompt = `
You are a software architect tasked with creating a detailed blueprint for a new project.

PROJECT DETAILS:
Name: ${projectData.name}
Description: ${projectData.description}
Requirements: ${projectData.requirements}

RESEARCH FINDINGS:
${projectData.research.domain_knowledge.map(item => `- ${item.query}: ${item.summary}`).join('\n')}
${projectData.research.similar_projects.map(item => `- ${item.query}: ${item.summary}`).join('\n')}
${projectData.research.best_practices.map(item => `- ${item.query}: ${item.summary}`).join('\n')}

Based on the project details and research findings, create a comprehensive blueprint that includes:

1. Architecture components (frontend, backend, database, etc.)
2. Component relationships and interactions
3. Technology stack recommendations
4. Project structure (directories, files, etc.)
5. Development workflow
6. Task breakdown (at least 10 tasks)

For each task, include:
- Task ID
- Task title
- Task description
- Dependencies (if any)
- Estimated complexity (low, medium, high)

Format your response as a JSON object with the following structure:
{
  "architecture": {
    "components": [
      {
        "id": "component-1",
        "name": "Component Name",
        "type": "frontend|backend|database|etc",
        "description": "Component description",
        "technologies": ["Tech1", "Tech2"]
      }
    ],
    "relationships": [
      {
        "source": "component-1",
        "target": "component-2",
        "type": "depends-on|communicates-with|etc",
        "description": "Relationship description"
      }
    ]
  },
  "project_structure": {
    "directories": [
      {
        "path": "/path/to/directory",
        "purpose": "Purpose of this directory"
      }
    ],
    "files": [
      {
        "path": "/path/to/file",
        "purpose": "Purpose of this file"
      }
    ]
  },
  "workflow": {
    "steps": [
      {
        "id": "step-1",
        "name": "Step Name",
        "description": "Step description"
      }
    ],
    "checkpoints": [
      {
        "id": "checkpoint-1",
        "name": "Checkpoint Name",
        "description": "Checkpoint description",
        "criteria": ["Criterion 1", "Criterion 2"]
      }
    ]
  },
  "tasks": [
    {
      "id": "task-1",
      "title": "Task Title",
      "description": "Task description",
      "dependencies": ["task-id-1", "task-id-2"],
      "complexity": "low|medium|high"
    }
  ]
}
`;
```

This prompt is comprehensive:
- Sets the AI as a "software architect"
- Provides project details and research findings
- Specifies exactly what should be included in the blueprint
- Provides a detailed JSON structure for the response

### Planning Utilities Prompts

In the new planning-utils.js file, we've implemented several prompts:

#### Project Plan Generation

```javascript
const messages = [
  {
    role: 'system',
    content: `You are a project planning assistant. Based on the research provided, generate a detailed project plan with phases, tasks, and estimated timelines. The plan should be structured, comprehensive, and follow best practices for the domain.`
  },
  {
    role: 'user',
    content: `I need a project plan based on the following research:\n\n${researchSummary}\n\nPlease generate a detailed plan with phases, tasks, and estimated timelines.`
  }
];
```

#### Architecture Recommendations

```javascript
const messages = [
  {
    role: 'system',
    content: `You are a software architecture expert. Based on the research provided, generate architecture recommendations for the project. Include components, relationships, technologies, and patterns that would be appropriate for this project.`
  },
  {
    role: 'user',
    content: `I need architecture recommendations based on the following research:\n\n${researchSummary}\n\nPlease generate detailed architecture recommendations.`
  }
];
```

#### Task Breakdown

```javascript
const messages = [
  {
    role: 'system',
    content: `You are a project management expert. Based on the research and project plan provided, generate a detailed task breakdown for the project. Include task dependencies, acceptance criteria, and implementation guides.`
  },
  {
    role: 'user',
    content: `I need a detailed task breakdown based on the following research and project plan:\n\n${researchSummary}\n\n${planSummary}\n\nPlease generate a detailed task breakdown.`
  }
];
```

## Data Models

### Project Model

```json
{
  "id": "unique-project-id",
  "name": "Project Name",
  "description": "Project description",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp",
  "requirements": "Detailed project requirements",
  "research": {
    "domain_knowledge": [],
    "similar_projects": [],
    "best_practices": []
  },
  "blueprint": "blueprint-id"
}
```

### Blueprint Model

```json
{
  "id": "unique-blueprint-id",
  "project_id": "project-id",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp",
  "architecture": {
    "components": [],
    "relationships": []
  },
  "tasks": [
    {
      "id": "task-id",
      "title": "Task title",
      "description": "Task description",
      "dependencies": [],
      "acceptance_criteria": [],
      "implementation_guide": "Detailed implementation instructions"
    }
  ],
  "workflow": {
    "steps": [],
    "checkpoints": []
  }
}
```

## Key Lessons from TaskMaster

1. **Provider Abstraction**: The provider abstraction layer allows for flexibility in choosing AI models.

2. **Research-Driven Approach**: TaskMaster uses research to inform blueprint generation, making the blueprints more accurate and comprehensive.

3. **Direct Functions**: The direct functions provide a clean separation of concerns and make the code more testable.

4. **MCP Integration**: The MCP integration allows TaskMaster to be used from various IDEs.

5. **CLI Implementation**: The CLI provides a convenient way to use TaskMaster from the command line.

6. **Prompt Engineering**: The prompts are carefully crafted to guide the AI models to produce the desired output.

7. **Data Models**: The data models provide a clear structure for the project and blueprint data.

## Improvements for Project-Manager

1. **Enhanced Research**: Implement more sophisticated research techniques, such as using multiple providers and combining results.

2. **Better Blueprint Generation**: Use a multi-step approach to generate more detailed and accurate blueprints.

3. **Improved Planning Utilities**: Implement more planning utilities, such as risk assessment and resource allocation.

4. **More Comprehensive Testing**: Implement more comprehensive testing, including integration tests and end-to-end tests.

5. **Better Documentation**: Provide more comprehensive documentation, including examples and tutorials.

6. **Enhanced MCP Integration**: Implement more MCP tools and improve the existing ones.

7. **Improved CLI**: Enhance the CLI with more commands and better output formatting.

8. **Better Error Handling**: Implement more robust error handling and recovery mechanisms.

9. **Performance Optimization**: Optimize the performance of the code, especially for large projects.

10. **Security Enhancements**: Implement better security measures, such as API key management and rate limiting.
