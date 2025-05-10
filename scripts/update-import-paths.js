/**
 * Update Import Paths Script
 *
 * This script updates import paths in JavaScript files to reflect the new directory structure.
 * It replaces paths like '../src/models/task.js' with '../project-manager/src/models/task.js'.
 */

import fs from "fs";
import path from "path";

// Define the directories to search for JavaScript files
const directories = [
  "project-manager/src",
  "project-manager/tests",
  "demos",
  "scripts",
];

// Define the path replacements
const pathReplacements = [
  { from: "../src/", to: "../project-manager/src/" },
  { from: "../../src/", to: "../../project-manager/src/" },
  { from: "../../../src/", to: "../../../project-manager/src/" },
  { from: "../tests/", to: "../project-manager/tests/" },
  { from: "../../tests/", to: "../../project-manager/tests/" },
  { from: "../../../tests/", to: "../../../project-manager/tests/" },
  { from: "../demos/", to: "../demos/" },
  { from: "../../demos/", to: "../../demos/" },
  { from: "../../../demos/", to: "../../../demos/" },
];

// Function to recursively find all JavaScript files in a directory
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith(".js")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to update import paths in a file
function updateImportPaths(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let updated = false;

  // Find import statements
  const importRegex =
    /import\s+(?:(?:\{[^}]*\})|(?:[^{}\s,]+))?\s*(?:,\s*(?:\{[^}]*\})|(?:[^{}\s,]+))?\s*from\s+['"]([^'"]+)['"]/g;

  // Replace paths in import statements
  content = content.replace(importRegex, (match, importPath) => {
    for (const replacement of pathReplacements) {
      if (importPath.startsWith(replacement.from)) {
        updated = true;
        return match.replace(
          importPath,
          importPath.replace(replacement.from, replacement.to),
        );
      }
    }
    return match;
  });

  // Write the updated content back to the file if changes were made
  if (updated) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated import paths in ${filePath}`);
  }
}

// Main function
function main() {
  console.log("Updating import paths...");

  // Find all JavaScript files in the specified directories
  const jsFiles = [];
  directories.forEach((dir) => {
    try {
      findJsFiles(dir, jsFiles);
    } catch (error) {
      console.error(
        `Error finding JavaScript files in ${dir}: ${error.message}`,
      );
    }
  });

  console.log(`Found ${jsFiles.length} JavaScript files`);

  // Update import paths in each file
  jsFiles.forEach((file) => {
    try {
      updateImportPaths(file);
    } catch (error) {
      console.error(`Error updating import paths in ${file}: ${error.message}`);
    }
  });

  console.log("Import path update complete");
}

// Run the main function
main();
