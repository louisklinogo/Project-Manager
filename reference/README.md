# Project Manager [![GitHub stars](https://img.shields.io/github/stars/eyaltoledano/claude-project-manager?style=social)](https://github.com/eyaltoledano/claude-project-manager/stargazers)

[![CI](https://github.com/eyaltoledano/claude-project-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/eyaltoledano/claude-project-manager/actions/workflows/ci.yml) [![npm version](https://badge.fury.io/js/project-manager-ai.svg)](https://badge.fury.io/js/project-manager-ai) [![Discord Follow](https://dcbadge.limes.pink/api/server/https://discord.gg/2ms58QJjqp?style=flat)](https://discord.gg/2ms58QJjqp) [![License: MIT with Commons Clause](https://img.shields.io/badge/license-MIT%20with%20Commons%20Clause-blue.svg)](LICENSE)

### By [@eyaltoledano](https://x.com/eyaltoledano) & [@RalphEcom](https://x.com/RalphEcom)

[![Twitter Follow](https://img.shields.io/twitter/follow/eyaltoledano?style=flat)](https://x.com/eyaltoledano)
[![Twitter Follow](https://img.shields.io/twitter/follow/RalphEcom?style=flat)](https://x.com/RalphEcom)

A task management system for AI-driven development with Claude, designed to work seamlessly with Cursor AI.

## Requirements

- Anthropic API key (Claude API)
- OpenAI SDK (for Perplexity API integration, optional)

## Quick Start

### Option 1 | MCP (Recommended):

MCP (Model Control Protocol) provides the easiest way to get started with Project Manager directly in your editor.

1. **Add the MCP config to your editor** (Cursor recommended, but it works with other text editors):

```json
{
  "mcpServers": {
    "project-manager-ai": {
      "command": "npx",
      "args": ["-y", "--package=project-manager-ai", "project-manager-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
        "PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
        "MODEL": "claude-3-7-sonnet-20250219",
        "PERPLEXITY_MODEL": "sonar-pro",
        "MAX_TOKENS": "64000",
        "TEMPERATURE": "0.2",
        "DEFAULT_SUBTASKS": "5",
        "DEFAULT_PRIORITY": "medium"
      }
    }
  }
}
```

2. **Enable the MCP** in your editor

3. **Prompt the AI** to initialize Project Manager:

```
Can you please initialize project-manager-ai into my project?
```

4. **Use common commands** directly through your AI assistant:

```txt
Can you parse my PRD at scripts/prd.txt?
What's the next task I should work on?
Can you help me implement task 3?
Can you help me expand task 4?
```

### Option 2: Using Command Line

#### Installation

```bash
# Install globally
npm install -g project-manager-ai

# OR install locally within your project
npm install project-manager-ai
```

#### Initialize a new project

```bash
# If installed globally
project-manager init

# If installed locally
npx project-manager-init
```

This will prompt you for project details and set up a new project with the necessary files and structure.

#### Common Commands

```bash
# Initialize a new project
project-manager init

# Parse a PRD and generate tasks
project-manager parse-prd your-prd.txt

# List all tasks
project-manager list

# Show the next task to work on
project-manager next

# Generate task files
project-manager generate
```

## Documentation

For more detailed information, check out the documentation in the `docs` directory:

- [Configuration Guide](docs/configuration.md) - Set up environment variables and customize Project Manager
- [Tutorial](docs/tutorial.md) - Step-by-step guide to getting started with Project Manager
- [Command Reference](docs/command-reference.md) - Complete list of all available commands
- [Task Structure](docs/task-structure.md) - Understanding the task format and features
- [Example Interactions](docs/examples.md) - Common Cursor AI interaction examples

## Troubleshooting

### If `project-manager init` doesn't respond:

Try running it with Node directly:

```bash
node node_modules/claude-project-manager/scripts/init.js
```

Or clone the repository and run:

```bash
git clone https://github.com/eyaltoledano/claude-project-manager.git
cd claude-project-manager
node scripts/init.js
```

## Contributors

<a href="https://github.com/eyaltoledano/claude-project-manager/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=eyaltoledano/claude-project-manager" alt="Project Manager project contributors" />
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=eyaltoledano/claude-project-manager&type=Timeline)](https://www.star-history.com/#eyaltoledano/claude-project-manager&Timeline)

## Licensing

Project Manager is licensed under the MIT License with Commons Clause. This means you can:

✅ **Allowed**:

- Use Project Manager for any purpose (personal, commercial, academic)
- Modify the code
- Distribute copies
- Create and sell products built using Project Manager

❌ **Not Allowed**:

- Sell Project Manager itself
- Offer Project Manager as a hosted service
- Create competing products based on Project Manager

See the [LICENSE](LICENSE) file for the complete license text and [licensing details](docs/licensing.md) for more information.
