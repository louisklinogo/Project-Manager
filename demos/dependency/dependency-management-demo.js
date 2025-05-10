/**
 * Dependency Management Demonstration
 *
 * This script demonstrates the dependency management functionality in a real-world scenario.
 * It creates a sample project with tasks and dependencies, validates and resolves dependency issues,
 * and visualizes the dependencies.
 */

import { Task } from "../project-manager/src/models/task.js";
import { TaskHierarchyManager } from "../project-manager/src/utils/task-hierarchy-manager.js";
import { DependencyValidator } from "../project-manager/src/utils/dependency-validator.js";
import { DependencyResolver } from "../project-manager/src/utils/dependency-resolver.js";
import { DependencyVisualizer } from "../project-manager/src/utils/dependency-visualizer.js";
import { GeminiProvider } from "../project-manager/src/providers/gemini-provider.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create utility instances
const hierarchyManager = new TaskHierarchyManager();
const validator = new DependencyValidator();
const resolver = new DependencyResolver();
const visualizer = new DependencyVisualizer({
  format: "text",
  highlightCircularDependencies: true,
});

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
  
  Include 6-8 tasks with various dependencies between them. Make sure to include:
  1. At least one circular dependency (e.g., task-1 depends on task-2, which depends on task-1)
  2. At least one missing dependency (e.g., a task depends on a non-existent task)
  3. At least one self-dependency (e.g., a task depends on itself)
  4. A mix of valid dependencies
  
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
        status: "pending",
        priority: "high",
        dependencies: [],
      },
      {
        id: "task-2",
        title: "Design Database Schema",
        description: "Create the database schema for the application",
        status: "pending",
        priority: "high",
        dependencies: ["task-1"],
      },
      {
        id: "task-3",
        title: "Implement API Endpoints",
        description: "Develop the API endpoints for the application",
        status: "pending",
        priority: "medium",
        dependencies: ["task-2", "task-4"], // Circular dependency with task-4
      },
      {
        id: "task-4",
        title: "Create Frontend Components",
        description: "Develop the frontend components for the application",
        status: "pending",
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
 * Validate task dependencies
 * @param {Array} tasks - Tasks to validate
 * @returns {object} - Validation result
 */
function validateDependencies(tasks) {
  console.log("Validating task dependencies...\n");

  const result = validator.validateDependencies(tasks);

  console.log(`Validation result: ${result.valid ? "Valid" : "Invalid"}`);

  if (!result.valid) {
    console.log("Issues found:");
    result.issues.forEach((issue) => {
      console.log(`- ${issue.message}`);
    });
  }

  return result;
}

/**
 * Resolve dependency issues
 * @param {Array} tasks - Tasks to resolve
 * @param {object} validationResult - Validation result
 * @returns {object} - Resolution result
 */
function resolveDependencyIssues(tasks, validationResult) {
  if (validationResult.valid) {
    console.log("No dependency issues to resolve.\n");
    return { tasks, changes: [] };
  }

  console.log("Resolving dependency issues...\n");

  const result = resolver.resolveDependencyIssues(tasks);

  console.log("Changes made:");
  result.changes.forEach((change) => {
    console.log(`- ${change.message}`);
  });

  return result;
}

/**
 * Optimize dependency chains
 * @param {Array} tasks - Tasks to optimize
 * @returns {object} - Optimization result
 */
function optimizeDependencyChains(tasks) {
  console.log("Optimizing dependency chains...\n");

  const result = resolver.optimizeDependencyChains(tasks);

  if (result.changes.length > 0) {
    console.log("Optimizations made:");
    result.changes.forEach((change) => {
      console.log(`- ${change.message}`);
    });
  } else {
    console.log("No optimizations needed.\n");
  }

  return result;
}

/**
 * Analyze dependency impact
 * @param {Array} tasks - All tasks
 * @param {string} taskId - ID of the task to analyze
 */
function analyzeDependencyImpact(tasks, taskId) {
  console.log(`Analyzing dependency impact for task ${taskId}...\n`);

  const result = resolver.analyzeDependencyImpact(tasks, taskId);

  console.log(`Task: ${result.task.title}`);
  console.log(`Impact Score: ${result.impactScore}`);

  console.log("\nDepends On:");
  if (result.dependsOn.length > 0) {
    result.dependsOn.forEach((task) => {
      console.log(`- ${task.id}: ${task.title}`);
    });
  } else {
    console.log("- No dependencies");
  }

  console.log("\nRequired By:");
  if (result.dependedOnBy.length > 0) {
    result.dependedOnBy.forEach((task) => {
      console.log(`- ${task.id}: ${task.title}`);
    });
  } else {
    console.log("- Not required by any task");
  }

  console.log("\nCritical Path:");
  if (result.criticalPath.length > 0) {
    result.criticalPath.forEach((task) => {
      console.log(`- ${task.id}: ${task.title}`);
    });
  } else {
    console.log("- No critical path found");
  }
}

/**
 * Visualize task dependencies
 * @param {Array} tasks - Tasks to visualize
 */
function visualizeDependencies(tasks) {
  console.log("Visualizing task dependencies...\n");

  // Text visualization
  console.log("Text Visualization:");
  const textVisualizer = new DependencyVisualizer({
    format: "text",
    highlightCircularDependencies: true,
  });
  console.log(textVisualizer.visualizeDependencies(tasks));

  // Markdown visualization
  console.log("\nMarkdown Visualization:");
  const markdownVisualizer = new DependencyVisualizer({
    format: "markdown",
    highlightCircularDependencies: true,
  });
  console.log(markdownVisualizer.visualizeDependencies(tasks));

  // JSON visualization
  console.log("\nJSON Visualization (truncated):");
  const jsonVisualizer = new DependencyVisualizer({
    format: "json",
    highlightCircularDependencies: true,
  });
  const jsonOutput = jsonVisualizer.visualizeDependencies(tasks);
  console.log(JSON.stringify(jsonOutput, null, 2).substring(0, 500) + "...");
}

/**
 * Main function to run the demonstration
 */
async function runDemo() {
  console.log("Dependency Management Demonstration\n");

  try {
    // Generate tasks with dependencies
    const generatedTasks = await generateTasksWithDependencies();
    console.log("Generated tasks:");
    console.log(JSON.stringify(generatedTasks, null, 2));

    // Convert to Task objects
    const tasks = convertToTaskObjects(generatedTasks);
    console.log("\nConverted to Task objects:");
    console.log(`Created ${tasks.length} tasks`);

    // Validate dependencies
    const validationResult = validateDependencies(tasks);

    // Resolve dependency issues
    const resolutionResult = resolveDependencyIssues(tasks, validationResult);

    // Validate again after resolution
    console.log("\nValidating dependencies after resolution...\n");
    const revalidationResult = validator.validateDependencies(
      resolutionResult.tasks,
    );
    console.log(
      `Validation result: ${revalidationResult.valid ? "Valid" : "Invalid"}`,
    );

    if (!revalidationResult.valid) {
      console.log("Remaining issues:");
      revalidationResult.issues.forEach((issue) => {
        console.log(`- ${issue.message}`);
      });
    }

    // Optimize dependency chains
    const optimizationResult = optimizeDependencyChains(resolutionResult.tasks);

    // Analyze dependency impact for a specific task
    if (optimizationResult.tasks.length > 0) {
      analyzeDependencyImpact(
        optimizationResult.tasks,
        optimizationResult.tasks[0].id,
      );
    }

    // Visualize dependencies
    visualizeDependencies(optimizationResult.tasks);

    console.log("\nDependency Management Demonstration Complete!");
  } catch (error) {
    console.error("Error in demonstration:", error);
  }
}

// Run the demonstration
runDemo();
