# Migration Guide: Project-Manager Reorganization

This document provides guidance for developers working with the reorganized Project-Manager codebase.

## Overview of Changes

The Project-Manager codebase has been reorganized to improve its structure, reduce duplication, and make it easier to navigate and maintain. The main changes are:

1. **Clear Top-Level Structure**: Created a clear separation between the main project implementation, reference code, documentation, demos, scripts, and reports.
2. **Consolidated Documentation**: Moved all documentation to a central `/docs` directory.
3. **Organized Demo Files**: Categorized demo files by functionality in the `/demos` directory.
4. **Renamed Reference Code**: Renamed `/claude-project-manager` to `/reference` for clarity.
5. **Updated Configuration Files**: Updated paths in configuration files to reflect the new structure.
6. **Moved Generated Files**: Moved coverage and test reports to a dedicated `/reports` directory.

## Directory Structure

```
/
├── project-manager/        # Main project implementation
├── reference/              # Reference code (renamed from claude-project-manager)
├── docs/                   # Consolidated documentation
├── demos/                  # Consolidated demo files
├── scripts/                # Utility scripts
├── reports/                # Test and coverage reports
├── .env                    # Environment variables
├── package.json            # Main package.json
└── README.md               # Main README
```

## Import Path Changes

If you're working with the codebase, you'll need to update your import paths to reflect the new structure. Here are some examples:

### Before

```javascript
import { Task } from "../src/models/task.js";
import { TaskHierarchyManager } from "../src/utils/task-hierarchy-manager.js";
```

### After

```javascript
import { Task } from "../project-manager/src/models/task.js";
import { TaskHierarchyManager } from "../project-manager/src/utils/task-hierarchy-manager.js";
```

## Running Scripts

The `package.json` scripts have been updated to reflect the new directory structure. For example:

### Before

```bash
npm run demo:task-hierarchy
```

### After

```bash
npm run demo:task-hierarchy
```

The script names remain the same, but the paths they reference have been updated.

## Known Issues and Limitations

- Some import paths may still need to be updated manually.
- Some tests may need to be updated to reflect the new directory structure.
- The MCP server configuration may need to be updated to reflect the new structure.

## Future Improvements

- Further consolidation of duplicate code
- Improved documentation of the new structure
- Additional tests to ensure the reorganization didn't break any functionality
