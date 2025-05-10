/**
 * Research Phase Demo
 *
 * This script demonstrates the Research Phase system by creating a research phase
 * for a sample task, generating a research plan, executing the research, and
 * generating research artifacts.
 */

import { ResearchPhase } from "../project-manager/src/research/phase/research-phase.js";
import path from "path";
import fs from "fs";

// Create output directory if it doesn't exist
const outputDir = path.join(process.cwd(), "data", "research-demo");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Sample task
const task = {
  name: "Implement Authentication System",
  description:
    "Create a secure authentication system with OAuth2 support, user management, and role-based access control. The system should support social login providers and multi-factor authentication.",
  priority: "high",
  domain: "security",
};

/**
 * Run the research phase demo
 */
async function runDemo() {
  console.log("=== Research Phase Demo ===");
  console.log(`Task: ${task.name}`);
  console.log(`Description: ${task.description}`);
  console.log(`Priority: ${task.priority}`);
  console.log(`Domain: ${task.domain}`);
  console.log("");

  // Create a research phase
  console.log("Creating research phase...");
  const researchPhase = new ResearchPhase({
    taskName: task.name,
    taskDescription: task.description,
    priority: task.priority,
    domain: task.domain,
    outputDir,
    verbose: true,
  });

  // Start the research phase
  console.log("Starting research phase...");
  const result = await researchPhase.start();

  // Print results
  console.log("");
  console.log("=== Research Phase Results ===");
  console.log(`Status: ${result.status}`);
  console.log(`Started: ${result.startTime}`);
  console.log(`Completed: ${result.endTime}`);
  console.log("");

  // Print artifact paths
  console.log("=== Research Artifacts ===");
  console.log(`Research Summary: ${result.artifacts.researchSummary.path}`);
  console.log(
    `Architecture Diagram: ${result.artifacts.architectureDiagram.path}`,
  );
  console.log(`Decision Document: ${result.artifacts.decisionDocument.path}`);
  console.log(
    `Implementation Plan: ${result.artifacts.implementationPlan.path}`,
  );
  console.log("");

  console.log("Demo completed successfully!");
}

// Run the demo
runDemo().catch((error) => {
  console.error("Error running demo:", error);
});
