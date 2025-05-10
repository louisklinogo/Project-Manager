/**
 * Enhanced Dependency Visualization Demonstration
 *
 * This script demonstrates the enhanced dependency visualization features,
 * including Mermaid diagrams and interactive visualizations.
 */

import { Task } from "../project-manager/src/models/task.js";
import { DependencyVisualizer } from "../project-manager/src/utils/dependency-visualizer.js";
import { GeminiProvider } from "../project-manager/src/providers/gemini-provider.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize the Gemini provider
const geminiProvider = new GeminiProvider({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate tasks with dependencies using Gemini
 * @returns {Promise<Array>} - Array of tasks
 */
async function generateTasksWithDependencies() {
  console.log("Generating tasks with dependencies using Gemini...\n");

  const prompt = `
  Create a set of tasks for a software development project with dependencies between them.
  
  Please provide a JSON array of tasks with the following structure:
  [
    {
      "id": "task-1",
      "title": "Task 1",
      "description": "Description of task 1",
      "status": "pending",
      "priority": "high",
      "dependencies": ["task-2"]
    }
  ]
  
  Include 8-10 tasks with various dependencies between them. Make sure to include:
  1. At least one circular dependency (e.g., task-1 depends on task-2, which depends on task-1)
  2. At least one missing dependency (e.g., a task depends on a non-existent task)
  3. At least one self-dependency (e.g., a task depends on itself)
  4. A mix of valid dependencies
  5. Tasks with different statuses (pending, in-progress, done)
  
  Make sure each task has a unique ID, title, description, status (pending, in-progress, done), and priority (high, medium, low).
  
  IMPORTANT: Your response must be ONLY the JSON array, with no additional text, explanations, or markdown formatting.
  `;

  try {
    const response = await geminiProvider.generateChatCompletion({
      model: "gemini-1.5-pro",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    // Extract the JSON from the response
    console.log("Raw response:", JSON.stringify(response, null, 2));

    // Handle different response formats from different providers
    let content = "";
    if (
      response.choices &&
      response.choices[0] &&
      response.choices[0].message
    ) {
      // OpenAI format
      content = response.choices[0].message.content;
    } else if (
      response.candidates &&
      response.candidates[0] &&
      response.candidates[0].content
    ) {
      // Gemini format
      content = response.candidates[0].content.parts[0].text;
    } else if (response.message) {
      // Simple format
      content = response.message;
    } else {
      console.log("Unexpected response format:", response);
      throw new Error("Unexpected response format");
    }

    console.log("Extracted content:", content);

    // Try to extract JSON from the content
    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);

    if (!jsonMatch) {
      console.log("Could not extract JSON pattern from content");
      // Try to parse the entire content as JSON
      try {
        return JSON.parse(content);
      } catch (e) {
        throw new Error("Could not extract JSON from response");
      }
    }

    const jsonString = jsonMatch[0];
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating tasks with dependencies:", error);
    // Return a fallback set of tasks
    return [
      {
        id: "task-1",
        title: "Setup Development Environment",
        description:
          "Install and configure all necessary tools and dependencies",
        status: "done",
        priority: "high",
        dependencies: [],
      },
      {
        id: "task-2",
        title: "Design Database Schema",
        description: "Create the database schema for the application",
        status: "done",
        priority: "high",
        dependencies: ["task-1"],
      },
      {
        id: "task-3",
        title: "Implement API Endpoints",
        description: "Develop the API endpoints for the application",
        status: "in-progress",
        priority: "medium",
        dependencies: ["task-2", "task-4"], // Circular dependency with task-4
      },
      {
        id: "task-4",
        title: "Create Frontend Components",
        description: "Develop the frontend components for the application",
        status: "in-progress",
        priority: "medium",
        dependencies: ["task-3"], // Circular dependency with task-3
      },
      {
        id: "task-5",
        title: "Write Unit Tests",
        description: "Create unit tests for all components",
        status: "pending",
        priority: "low",
        dependencies: ["task-5"], // Self-dependency
      },
      {
        id: "task-6",
        title: "Deploy to Production",
        description: "Deploy the application to the production environment",
        status: "pending",
        priority: "low",
        dependencies: ["task-3", "task-4", "task-5", "task-7"], // Missing dependency on task-7
      },
      {
        id: "task-8",
        title: "Write Documentation",
        description: "Create comprehensive documentation for the application",
        status: "pending",
        priority: "medium",
        dependencies: ["task-2", "task-3", "task-4"],
      },
      {
        id: "task-9",
        title: "Conduct User Testing",
        description: "Perform user testing to gather feedback",
        status: "pending",
        priority: "high",
        dependencies: ["task-4", "task-8"],
      },
      {
        id: "task-10",
        title: "Implement User Feedback",
        description: "Incorporate user feedback into the application",
        status: "pending",
        priority: "medium",
        dependencies: ["task-9"],
      },
    ];
  }
}

/**
 * Convert the generated tasks to Task objects
 * @param {Array} generatedTasks - Tasks generated by the AI
 * @returns {Array} - Array of Task objects
 */
function convertToTaskObjects(generatedTasks) {
  return generatedTasks.map((taskData) => new Task(taskData));
}

/**
 * Generate and save visualizations
 * @param {Array} tasks - Tasks to visualize
 */
function generateAndSaveVisualizations(tasks) {
  console.log("Generating and saving visualizations...\n");

  const outputDir = path.join(process.cwd(), "demos", "output");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate Mermaid visualization
  console.log("Generating Mermaid visualization...");
  const mermaidVisualizer = new DependencyVisualizer({
    format: "mermaid",
    highlightCircularDependencies: true,
  });
  const mermaidOutput = mermaidVisualizer.visualizeDependencies(tasks);
  fs.writeFileSync(
    path.join(outputDir, "dependency-mermaid.md"),
    mermaidOutput,
  );
  console.log(
    `Saved Mermaid visualization to ${path.join(outputDir, "dependency-mermaid.md")}`,
  );

  // Generate interactive HTML visualization
  console.log("Generating interactive HTML visualization...");
  const interactiveVisualizer = new DependencyVisualizer({
    format: "html",
    highlightCircularDependencies: true,
    interactive: true,
    collapsible: true,
    theme: "default",
  });
  const interactiveOutput = interactiveVisualizer.visualizeDependencies(tasks);
  fs.writeFileSync(
    path.join(outputDir, "dependency-interactive.html"),
    interactiveOutput,
  );
  console.log(
    `Saved interactive visualization to ${path.join(outputDir, "dependency-interactive.html")}`,
  );

  // Generate collapsible HTML visualization
  console.log("Generating collapsible HTML visualization...");
  const collapsibleVisualizer = new DependencyVisualizer({
    format: "html",
    highlightCircularDependencies: true,
    interactive: true,
    collapsible: true,
    theme: "forest",
  });
  const collapsibleOutput = collapsibleVisualizer.visualizeDependencies(tasks);
  fs.writeFileSync(
    path.join(outputDir, "dependency-collapsible.html"),
    collapsibleOutput,
  );
  console.log(
    `Saved collapsible visualization to ${path.join(outputDir, "dependency-collapsible.html")}`,
  );
}

/**
 * Main function to run the demonstration
 */
async function runDemo() {
  console.log("Enhanced Dependency Visualization Demonstration\n");

  try {
    // Generate tasks with dependencies
    const generatedTasks = await generateTasksWithDependencies();
    console.log("Generated tasks:");
    console.log(JSON.stringify(generatedTasks, null, 2));

    // Convert to Task objects
    const tasks = convertToTaskObjects(generatedTasks);
    console.log("\nConverted to Task objects:");
    console.log(`Created ${tasks.length} tasks`);

    // Generate and save visualizations
    generateAndSaveVisualizations(tasks);

    console.log("\nEnhanced Dependency Visualization Demonstration Complete!");
    console.log(
      "Check the demos/output directory for the generated visualizations.",
    );
  } catch (error) {
    console.error("Error in demonstration:", error);
  }
}

// Run the demonstration
runDemo();
