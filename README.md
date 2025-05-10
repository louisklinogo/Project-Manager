# Project-Manager

A blueprint generator that researches, plans, and creates structured guidance for IDE coding LLMs to follow.

> **Important Note**: While this GitHub repository is correctly named "Project-Manager", your local directory might still be named "Project-Manager". Please see [LOCAL-DIRECTORY-ALIGNMENT-GUIDE.md](LOCAL-DIRECTORY-ALIGNMENT-GUIDE.md) for instructions on aligning your local environment.

## Repository Structure

This repository contains the Project-Manager application with the following structure:

- [project-manager/](project-manager/): **Main project implementation** - All active development happens here
- [reference/](reference/): Reference code from the original Project-Manager project
- [docs/](docs/): Repository-level documentation (most documentation is in project-manager/docs/)
- [demos/](demos/): Demo scripts (most demos are in project-manager/demos/)
- [scripts/](scripts/): Utility scripts
- [reports/](reports/): Test and coverage reports

## Development Focus

All active development should focus on the `project-manager/` directory, which contains the main project implementation. The other directories are primarily for reference and support.

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the `.env.example` file to `.env` and add your API keys:

   ```bash
   cp project-manager/.env.example project-manager/.env
   ```

## Usage

All commands should be run from the `project-manager` directory:

```bash
cd project-manager
```

### Running the MVP

```bash
npm run mvp "Project Name" "Project Description" "Requirements"
```

### Running Demo Scripts

```bash
npm run demo:task-hierarchy
npm run demo:research-module
npm run demo:dependency-management
npm run demo:flow
npm run demo:research-flow
```

### Running Tests

```bash
npm test
npm run test:flow
npm run test:coverage
npm run test:comprehensive
```

### Documentation Management

```bash
# Initialize documentation structure
npm run docs:init

# Create documentation for a feature
npm run docs:feature feature-name

# Reorganize documentation
npm run docs:reorganize
```

## Documentation

The main project documentation is located in the [project-manager/docs/](project-manager/docs/) directory, which follows the Ascension documentation pattern:

- **Research**: Initial investigation and findings
- **Architecture**: System design and component relationships
- **Decisions**: Implementation decisions with rationale
- **Implementation Plan**: Detailed plan for implementation
- **Implementation Checklist**: Tasks to complete during implementation
- **Test Findings**: Results of testing and validation
- **Reconciliation**: Final review and reconciliation of implementation against plans

For more information on the documentation structure, see [project-manager/docs/DOCUMENTATION-STRUCTURE.md](project-manager/docs/DOCUMENTATION-STRUCTURE.md).

## License

MIT
