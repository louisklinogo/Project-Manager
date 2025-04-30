# Project-Manager File Structure Reorganization: Implementation Plan

This document tracks the progress of the file structure reorganization for the Project-Manager codebase.

## Phase 1: Preparation and Backup

- [x] 1.1. Create a backup of the current structure (using git branch)
- [x] 1.2. Document current import paths and dependencies
- [x] 1.3. Analyze file references that will need updating

## Phase 2: Create New Directory Structure

- [ ] 2.1. Create top-level directories
  - [ ] 2.1.1. Create `/project-manager` directory
  - [ ] 2.1.2. Create `/reference` directory
  - [ ] 2.1.3. Create `/docs` directory
  - [ ] 2.1.4. Create `/demos` directory
  - [ ] 2.1.5. Create `/scripts` directory
  - [ ] 2.1.6. Create `/reports` directory

- [ ] 2.2. Create subdirectories within project-manager
  - [ ] 2.2.1. Create `/project-manager/src` with all subdirectories
  - [ ] 2.2.2. Create `/project-manager/bin`
  - [ ] 2.2.3. Create `/project-manager/data` with subdirectories
  - [ ] 2.2.4. Create `/project-manager/templates`
  - [ ] 2.2.5. Create `/project-manager/tests` with subdirectories

- [ ] 2.3. Create subdirectories within docs
  - [ ] 2.3.1. Create `/docs/api-reference`
  - [ ] 2.3.2. Create `/docs/guides`
  - [ ] 2.3.3. Create `/docs/research`
  - [ ] 2.3.4. Create `/docs/implementation-checklists`
  - [ ] 2.3.5. Create `/docs/reconciliation`
  - [ ] 2.3.6. Create `/docs/test-findings`
  - [ ] 2.3.7. Create `/docs/test-templates`

- [ ] 2.4. Create subdirectories within demos
  - [ ] 2.4.1. Create `/demos/blueprint`
  - [ ] 2.4.2. Create `/demos/research`
  - [ ] 2.4.3. Create `/demos/visualization`
  - [ ] 2.4.4. Create `/demos/dependency`
  - [ ] 2.4.5. Create `/demos/flow`
  - [ ] 2.4.6. Create `/demos/output`

- [ ] 2.5. Create subdirectories within reports
  - [ ] 2.5.1. Create `/reports/coverage`
  - [ ] 2.5.2. Create `/reports/test`

## Phase 3: Move Source Code

- [ ] 3.1. Move project-manager source code
  - [ ] 3.1.1. Move `/project-manager/src` to `/project-manager/src`
  - [ ] 3.1.2. Move `/project-manager/bin` to `/project-manager/bin`
  - [ ] 3.1.3. Move `/project-manager/data` to `/project-manager/data`
  - [ ] 3.1.4. Move `/project-manager/templates` to `/project-manager/templates`
  - [ ] 3.1.5. Move `/project-manager/tests` to `/project-manager/tests`

## Phase 4: Consolidate Documentation

- [ ] 4.1. Move and organize documentation
  - [ ] 4.1.1. Move `/project-manager/docs/api-reference` to `/docs/api-reference`
  - [ ] 4.1.2. Move `/project-manager/docs/guides` to `/docs/guides`
  - [ ] 4.1.3. Move `/project-manager/docs/research` to `/docs/research`
  - [ ] 4.1.4. Move `/project-manager/docs/implementation-checklists` to `/docs/implementation-checklists`
  - [ ] 4.1.5. Move `/project-manager/docs/reconciliation` to `/docs/reconciliation`
  - [ ] 4.1.6. Move `/project-manager/docs/test-findings` to `/docs/test-findings`
  - [ ] 4.1.7. Move `/project-manager/docs/test-templates` to `/docs/test-templates`
  - [ ] 4.1.8. Move `/project-manager/docs/VISION.md` to `/docs/VISION.md`
  - [ ] 4.1.9. Move any remaining root `/docs` files to `/docs`
  - [ ] 4.1.10. Create `/docs/README.md` with documentation index

## Phase 5: Consolidate Demo Files

- [ ] 5.1. Move and organize demo files
  - [ ] 5.1.1. Categorize and move blueprint-related demos to `/demos/blueprint`
  - [ ] 5.1.2. Categorize and move research-related demos to `/demos/research`
  - [ ] 5.1.3. Categorize and move visualization demos to `/demos/visualization`
  - [ ] 5.1.4. Categorize and move dependency management demos to `/demos/dependency`
  - [ ] 5.1.5. Categorize and move flow framework demos to `/demos/flow`
  - [ ] 5.1.6. Move output files to `/demos/output`
  - [ ] 5.1.7. Create `/demos/README.md` with demo index

## Phase 6: Move Reference Code

- [ ] 6.1. Rename and move reference code
  - [ ] 6.1.1. Rename `/claude-task-master` to `/reference`
  - [ ] 6.1.2. Create `/reference/README.md` explaining the reference code

## Phase 7: Move Configuration Files

- [ ] 7.1. Move and update configuration files
  - [ ] 7.1.1. Move `/project-manager/.env` to `/.env`
  - [ ] 7.1.2. Move `/project-manager/package.json` to `/package.json` (merge if needed)
  - [ ] 7.1.3. Move `/project-manager/.cursor` to `/.cursor`
  - [ ] 7.1.4. Update paths in configuration files

## Phase 8: Move Generated Files

- [ ] 8.1. Move and organize generated files
  - [ ] 8.1.1. Move `/project-manager/coverage` to `/reports/coverage`
  - [ ] 8.1.2. Move `/project-manager/test-report` to `/reports/test`
  - [ ] 8.1.3. Create `/reports/README.md` explaining the reports

## Phase 9: Update File References

- [ ] 9.1. Update import paths in source files
  - [ ] 9.1.1. Update import paths in `/project-manager/src` files
  - [ ] 9.1.2. Update import paths in test files
  - [ ] 9.1.3. Update import paths in demo files

- [ ] 9.2. Update references in configuration files
  - [ ] 9.2.1. Update paths in `package.json` scripts
  - [ ] 9.2.2. Update paths in `.cursor/mcp.json`
  - [ ] 9.2.3. Update paths in any other configuration files

- [ ] 9.3. Update documentation references
  - [ ] 9.3.1. Update links in markdown files
  - [ ] 9.3.2. Update file paths mentioned in documentation

## Phase 10: Clean Up and Finalize

- [ ] 10.1. Clean up temporary files
  - [ ] 10.1.1. Move `/project-manager/temp` to `/.temp` or remove if not needed
  - [ ] 10.1.2. Remove any other temporary or generated files

- [ ] 10.2. Update root README.md
  - [ ] 10.2.1. Update project structure documentation
  - [ ] 10.2.2. Update installation and usage instructions

- [ ] 10.3. Final verification
  - [ ] 10.3.1. Run all tests to ensure functionality is preserved
  - [ ] 10.3.2. Run demo scripts to verify they work
  - [ ] 10.3.3. Test CLI commands
  - [ ] 10.3.4. Test MCP server
  - [ ] 10.3.5. Verify documentation links

## Phase 11: Documentation and Handover

- [ ] 11.1. Document the reorganization
  - [ ] 11.1.1. Create a migration guide for developers
  - [ ] 11.1.2. Document any known issues or limitations
  - [ ] 11.1.3. Update contribution guidelines if needed

- [ ] 11.2. Final report
  - [ ] 11.2.1. Summarize changes made
  - [ ] 11.2.2. Highlight any areas that need further attention
  - [ ] 11.2.3. Provide recommendations for future improvements
