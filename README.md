# Project Manager

A blueprint generator that researches, plans, and creates structured guidance for IDE coding LLMs to follow.

> **🚀 MVP Now Available!** Try the Minimum Viable Product implementation with `npm run mvp` to generate blueprints while the full implementation is being developed. [Learn more](README-MVP.md).

## Overview

Project Manager leverages powerful AI models for planning and design, enabling even less capable LLMs to deliver excellent results by following the generated blueprints. It focuses on thorough online research before creating plans, avoiding unnecessary complexity, and achieving a 99%+ success rate for project planning.

For a comprehensive understanding of the Project-Manager vision and capabilities, see our [Vision Document](docs/VISION.md).

## Features

- **Comprehensive Research**: Utilizes tools like Perplexity, Tavily, or Exa to research existing projects and best practices
- **Multi-Model Support**: Integrates with OpenRouter, Google Gemini, OpenAI, and Claude
- **Blueprint Generation**: Creates detailed designs and blueprints for IDE coding LLMs to follow
- **Cross-IDE Compatibility**: Works across multiple IDEs (Cursor, VS Code, etc.)
- **MCP Server Integration**: Provides tools for research and blueprint generation

## Installation

```bash
# Clone the repository
git clone https://github.com/louisklinogo/Project-Manager.git
cd Project-Manager

# Install dependencies
npm install

# Link the CLI for local development
npm link

# Configure environment variables
# Create a .env file with your API keys:
# OPENAI_API_KEY=your_openai_api_key
# ANTHROPIC_API_KEY=your_anthropic_api_key
# GEMINI_API_KEY=your_gemini_api_key
# PERPLEXITY_API_KEY=your_perplexity_api_key
```

## Usage

### MVP (Available Now)

The Minimum Viable Product (MVP) implementation is available now and can be used while the full implementation is being developed:

```bash
# Generate a new blueprint
npm run mvp "Project Name" "Project Description" "Project Requirements"

# List all blueprints
npm run mvp:list-blueprints

# Load a specific blueprint
npm run mvp:load-blueprint <blueprint-id>
```

For more information about the MVP, see [README-MVP.md](README-MVP.md).

### Full Implementation (Coming Soon)

```bash
# Initialize a new project
project-manager init [directory]

# Research a project
project-manager research [directory] --requirements "Your project requirements" --depth standard

# Generate a blueprint
project-manager blueprint [directory] --name "my-blueprint"

# List all projects
project-manager list [directory] --detailed
```

## Configuration

Project Manager can be configured through the `.env` file:

- Set your preferred AI models for each provider
- Configure research depth and parameters
- Adjust blueprint generation settings

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test categories
npm test -- --testPathPattern=research
npm test -- --testPathPattern=blueprint
npm test -- --testPathPattern=flow
```

### Running Demos

```bash
# Run the MVP demo
npm run mvp "Test Project" "A test project" "Feature 1, Feature 2, Feature 3"

# Run other demos
npm run demo:research-flow
npm run demo:dependency-management
npm run demo:enhanced-dependency-visualization
```

### Verification Scripts

```bash
# Run verification scripts
node scripts/verify-ai-providers.js
node scripts/verify-research-module.js
node scripts/verify-direct-functions.js
node scripts/verify-mcp-integration.js
node scripts/verify-cli-commands.js
```

## License

MIT
