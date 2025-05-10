/**
 * Research-Integrated Blueprint Demo
 *
 * This script demonstrates the Research-Integrated Blueprint Generator by generating
 * a blueprint with integrated research for a sample project.
 */

import { ResearchIntegratedBlueprintGenerator } from "../project-manager/src/blueprint/research-integrated-blueprint-generator.js";
import path from "path";
import fs from "fs";

// Create output directory if it doesn't exist
const outputDir = path.join(process.cwd(), "data", "blueprint-demo");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Sample project
const project = {
  name: "E-commerce API",
  description:
    "Create a RESTful API for an e-commerce platform with product catalog, shopping cart, user authentication, and order processing capabilities.",
};

// Create a mock context
const context = {
  session: {
    workspaceRoot: process.cwd(),
  },
  reportProgress: (message) => console.log(`[PROGRESS] ${message}`),
};

/**
 * Run the demo
 */
async function runDemo() {
  console.log("=== Research-Integrated Blueprint Demo ===");
  console.log(`Project: ${project.name}`);
  console.log(`Description: ${project.description}`);
  console.log(`Output Directory: ${outputDir}`);
  console.log("");

  // Create the generator
  console.log("Creating generator...");
  const generator = new ResearchIntegratedBlueprintGenerator({
    automaticResearch: true,
    researchDepth: "medium",
    verbose: true,
  });

  // Generate the blueprint
  console.log("Generating blueprint with research...");
  console.log("This may take a few moments...");
  console.log("");

  const result = await generator.generateBlueprint(
    {
      name: project.name,
      description: project.description,
      outputDir,
    },
    context,
  );

  // Print results
  console.log("");
  console.log("=== Blueprint Generated ===");
  console.log(`ID: ${result.id}`);
  console.log(`Name: ${result.name}`);
  console.log(`File: ${path.join(outputDir, result.filename)}`);
  console.log("");

  // Print research metadata if available
  if (result.researchMetadata) {
    console.log("=== Research Metadata ===");
    console.log(`Research ID: ${result.researchMetadata.researchId}`);
    console.log(`Topics: ${result.researchMetadata.topicCount}`);
    console.log(
      `Completed Tasks: ${result.researchMetadata.completedTaskCount}`,
    );
    console.log(
      `Overall Confidence: ${result.researchMetadata.overallConfidence}`,
    );
    console.log("");
  }

  console.log("Demo completed successfully!");
}

// Run the demo
runDemo().catch((error) => {
  console.error("Error running demo:", error);
});
