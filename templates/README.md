# Project Manager

A blueprint generator that researches, plans, and creates structured guidance for IDE coding LLMs to follow.

## Overview

Project Manager leverages powerful AI models for planning and design, enabling even less capable LLMs to deliver excellent results by following the generated blueprints. It focuses on thorough online research before creating plans, avoiding unnecessary complexity, and achieving a 99%+ success rate for project planning.

## Features

- **Comprehensive Research**: Utilizes tools like Perplexity, Tavily, or Exa to research existing projects and best practices
- **Multi-Model Support**: Integrates with OpenRouter, Google Gemini, OpenAI, and Claude
- **Blueprint Generation**: Creates detailed designs and blueprints for IDE coding LLMs to follow
- **Cross-IDE Compatibility**: Works across multiple IDEs (Cursor, VS Code, etc.)
- **MCP Server Integration**: Provides tools for research and blueprint generation

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/project-manager.git
cd project-manager

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys
```

## Usage

```bash
# Initialize a new project
project-manager init

# Research and create a blueprint
project-manager research "Your project description"

# Generate a blueprint
project-manager blueprint
```

## Configuration

Project Manager can be configured through the `.env` file:

- Set your preferred AI models for each provider
- Configure research depth and parameters
- Adjust blueprint generation settings

## Development

```bash
# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## License

MIT
