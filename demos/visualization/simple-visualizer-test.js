/**
 * @fileoverview Simple test script for the Research Progress Visualizer.
 */

import {
  ResearchProgressVisualizer,
  OutputFormat,
  VisualizationMode,
} from "../project-manager/src/ui/components/research-progress-visualizer.js";

// Create a simple visualizer instance
const visualizer = new ResearchProgressVisualizer({
  mode: VisualizationMode.SIMPLE,
  accessibilityFeatures: true,
});

// Register a simple console renderer
visualizer.registerRenderer(OutputFormat.CONSOLE, {
  render: (data, options) => {
    return `Operation: ${data.operation || "Unknown"}\nProgress: ${data.progress || 0}%\nStatus: ${data.status || "No status"}`;
  },
});

// Create some test data
const testData = {
  operation: "test-operation",
  progress: 50,
  status: "Testing in progress",
};

// Render to console
const output = visualizer.renderToConsole(testData);

// Display the output
console.log("=== Simple Visualizer Test ===");
console.log(output);
console.log("=============================");

// Test with different modes
visualizer.setMode(VisualizationMode.DETAILED);
console.log("=== Detailed Mode ===");
console.log(visualizer.renderToConsole(testData));
console.log("====================");

visualizer.setMode(VisualizationMode.EXPERT);
console.log("=== Expert Mode ===");
console.log(visualizer.renderToConsole(testData));
console.log("==================");

console.log("Test completed successfully!");
