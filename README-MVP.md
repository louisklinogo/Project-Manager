# Project-Manager MVP

This is the Minimum Viable Product (MVP) implementation of the Project-Manager. The MVP provides a simplified version of the blueprint generation functionality that you can use while the full implementation is being developed.

## Quick Start

To generate a new blueprint:

```bash
npm run mvp "Project Name" "Project Description" "Project Requirements"
```

Example:

```bash
npm run mvp "E-commerce Website" "An online store for selling products" "User authentication, product catalog, shopping cart, payment processing, order management"
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run mvp "Name" "Description" "Requirements"` | Generate a new blueprint |
| `npm run mvp:list-blueprints` | List all existing blueprints |
| `npm run mvp:load-blueprint <blueprint-id>` | Load and display a specific blueprint |

## Features

- Simple project initialization
- Basic research capabilities
- Simplified blueprint generation
- Blueprint storage and retrieval
- Dependency visualization

## Implementation

The MVP implementation consists of the following components:

- `src/mvp/simple-blueprint-generator.js`: A simplified implementation of blueprint generation
- `src/mvp/simple-blueprint-direct.js`: Direct functions for generating and managing simple blueprints
- `demos/mvp-demo.js`: Demo script for generating blueprints
- `demos/load-blueprint-demo.js`: Demo script for loading blueprints
- `demos/list-blueprints-demo.js`: Demo script for listing blueprints

## Detailed Documentation

For more detailed documentation, including examples and implementation details, see:

- [MVP Documentation](src/mvp/README.md)

## Next Steps

After using the MVP, you can continue with the full implementation as outlined in the tasks.md file, focusing on:

1. Completing Task 5.1: Enhanced Research Model
2. Implementing Task 5.2: Instruction Protocol
3. Implementing Task 5.3: Blueprint Generation and Refinement

The MVP provides a foundation that can be extended and enhanced as the full implementation progresses.
