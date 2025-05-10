# Local Directory Alignment Guide

## Overview

The GitHub repository is already correctly named "[Project-Manager](https://github.com/louisklinogo/Project-Manager)", but your local directory might still be named "Project-Manager". This guide provides instructions for aligning your local directory and references with the GitHub repository name.

## Updating Your Local Repository

1. Navigate to your local repository directory:

   ```bash
   cd path/to/Project-Manager
   ```

2. Update the remote URL to point to the correct GitHub repository:

   ```bash
   git remote set-url origin https://github.com/louisklinogo/Project-Manager.git
   ```

3. Verify the remote URL:

   ```bash
   git remote -v
   ```

4. Pull the latest changes:

   ```bash
   git pull
   ```

### Optional: Rename Your Local Directory

If you want to rename your local directory to match the repository name:

1. Navigate to the parent directory:

   ```bash
   cd ..
   ```

2. Clone the repository with the correct name:

   ```bash
   git clone https://github.com/louisklinogo/Project-Manager.git
   ```

3. Copy any uncommitted changes from the old directory
4. Delete the old directory or keep it as a backup

## Changes Made to Align the Codebase

1. **Removed Duplicate Configuration Files**: Removed duplicate configuration files from the repository root
2. **Updated Documentation**: Updated documentation to reference the correct repository name
3. **Clarified Structure**: Clarified the relationship between the repository and the project
4. **Created Tools**: Created tools to help update references and maintain consistency

## Working with the Project

All active development should focus on the `project-manager/` directory, which contains the main project implementation:

```bash
cd project-manager
```

For more information, see the [README.md](README.md) file.

## Running the Reference Update Tool

To update references to the repository name throughout the codebase:

```bash
cd project-manager
npm run repo:update-references
```

This will scan the codebase for references to "Project-Manager" and update them to "Project-Manager".

## Troubleshooting

### Issue: "Remote origin already exists"

If you get an error saying "remote origin already exists" when trying to update the remote URL:

```bash
git remote remove origin
git remote add origin https://github.com/louisklinogo/Project-Manager.git
```

### Issue: "Could not rename config section 'remote.origin'"

If you get an error about renaming the config section:

```bash
git config --local --unset-all remote.origin.url
git config --local --add remote.origin.url https://github.com/louisklinogo/Project-Manager.git
```

### Issue: "Fatal: Not a git repository"

Make sure you're in the correct directory:

```bash
pwd
cd path/to/Project-Manager  # or Project-Manager if you've renamed it
```

## Conclusion

Aligning the local directory name and references with the GitHub repository name reduces confusion and makes the codebase cleaner and more maintainable. The GitHub repository is already correctly named "Project-Manager", and these steps help ensure that your local environment is consistent with it.
