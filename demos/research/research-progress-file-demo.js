/**
 * @fileoverview Demo script for the Research Progress Visualizer file-based output.
 *
 * This script demonstrates the file-based output capabilities of the Research Progress Visualizer,
 * including JSON and Markdown formats for IDE integration.
 */

import fs from "fs";
import path from "path";
import {
  ResearchProgressVisualizer,
  OutputFormat,
  VisualizationMode,
} from "../project-manager/src/ui/components/research-progress-visualizer.js";
import FileFormatters from "../project-manager/src/ui/components/file-formatters.js";
import ResearchProgressProtocol from "../project-manager/src/ide/file-protocol/research-progress-protocol.js";
import ProgressTracker from "../project-manager/src/research/phase/feedback/progress-tracker.js";
import StatusTracker, {
  StatusType,
} from "../project-manager/src/research/phase/feedback/status-tracker.js";

// Create instances of the components
const visualizer = new ResearchProgressVisualizer();
const fileFormatters = new FileFormatters();
const progressTracker = new ProgressTracker();
const statusTracker = new StatusTracker();

// Create output directory
const outputDir = path.join(process.cwd(), "demos", "output", "file-protocol");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create protocol instance
const protocol = new ResearchProgressProtocol({
  outputDir,
  enableWatching: true,
});

// Register the file formatter with the visualizer
visualizer.registerRenderer(OutputFormat.FILE, {
  render: (data, options) => {
    return fileFormatters.format(data, options.format || "json");
  },
  renderSimple: (data, options) => {
    return fileFormatters.format(data, options.format || "json");
  },
  renderDetailed: (data, options) => {
    return fileFormatters.format(data, options.format || "json");
  },
  renderExpert: (data, options) => {
    return fileFormatters.format(data, options.format || "json");
  },
});

// Set up file change listener
protocol.on("fileChange", ({ filePath, content }) => {
  console.log(`File changed: ${filePath}`);
  console.log("New content:", content.substring(0, 100) + "...");
});

// Simulate a research operation
async function simulateResearchOperation() {
  const operationId = "demo-research-operation";

  console.log("Starting research operation file demo...");
  console.log(`JSON output: ${protocol.getJSONFilePath()}`);
  console.log(`Markdown output: ${protocol.getMarkdownFilePath()}`);

  // Start watching protocol files
  protocol.startWatching();

  // Initialize progress and status
  progressTracker.trackProgress(operationId, 0, { phase: "initialization" });
  statusTracker.info(operationId, "Initializing research operation");

  // Write initial progress
  writeProgressToFiles(operationId);

  // Phase 1: Planning
  await simulatePhase("Planning", operationId, 0, 20);

  // Phase 2: Data Collection
  await simulatePhase("Data Collection", operationId, 20, 50);

  // Phase 3: Analysis
  await simulatePhase("Analysis", operationId, 50, 80);

  // Phase 4: Synthesis
  await simulatePhase("Synthesis", operationId, 80, 100);

  // Complete the operation
  progressTracker.trackProgress(operationId, 100, { phase: "complete" });
  statusTracker.success(
    operationId,
    "Research operation completed successfully",
  );

  // Write final progress
  writeProgressToFiles(operationId);

  // Demonstrate format conversion
  demonstrateFormatConversion();

  // Stop watching protocol files
  protocol.stopWatching();

  console.log("File demo completed.");
}

// Simulate a phase of the research operation
async function simulatePhase(
  phaseName,
  operationId,
  startProgress,
  endProgress,
) {
  statusTracker.info(operationId, `Starting ${phaseName} phase`);

  // Simulate progress updates
  const steps = 5;
  const progressIncrement = (endProgress - startProgress) / steps;

  for (let i = 0; i < steps; i++) {
    const progress = startProgress + (i + 1) * progressIncrement;
    const details = { phase: phaseName, step: i + 1, totalSteps: steps };

    // Update progress and status
    progressTracker.trackProgress(operationId, progress, details);

    // Add some variety to status messages
    if (i === 0) {
      statusTracker.info(operationId, `${phaseName}: Step ${i + 1}/${steps}`);
    } else if (i === Math.floor(steps / 2)) {
      statusTracker.warning(
        operationId,
        `${phaseName}: Minor issue detected in step ${i + 1}/${steps}`,
      );
    } else if (i === steps - 1) {
      statusTracker.success(operationId, `${phaseName} phase completed`);
    } else {
      statusTracker.info(
        operationId,
        `${phaseName}: Processing step ${i + 1}/${steps}`,
      );
    }

    // Write progress to files
    writeProgressToFiles(operationId);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Write progress to protocol files
function writeProgressToFiles(operationId) {
  const progress = progressTracker.getProgress(operationId);
  const status = statusTracker.getStatus(operationId);

  const data = {
    operation: operationId,
    progress: progress ? progress.progress : 0,
    status: status ? status.message : "In progress",
    estimatedTimeRemaining: progress
      ? progress.estimatedTimeRemaining
      : undefined,
    context: {
      recentStatus: statusTracker.getStatusHistory(operationId) || [],
      recentOperations: [operationId],
    },
  };

  // Write to protocol files
  protocol.writeProgress(data);

  // Also write using the visualizer
  visualizer.setMode(VisualizationMode.DETAILED);

  // Write JSON file
  const jsonContent = visualizer.render(OutputFormat.FILE, data, {
    format: "json",
  });
  fs.writeFileSync(path.join(outputDir, "visualizer-output.json"), jsonContent);

  // Write Markdown file
  const markdownContent = visualizer.render(OutputFormat.FILE, data, {
    format: "markdown",
  });
  fs.writeFileSync(
    path.join(outputDir, "visualizer-output.md"),
    markdownContent,
  );
}

// Demonstrate format conversion
function demonstrateFormatConversion() {
  console.log("\nDemonstrating format conversion:");

  // Read JSON data
  const jsonData = protocol.readProgress("json");

  // Convert JSON to Markdown
  const convertedMarkdown = protocol.convertFormat(
    jsonData,
    "json",
    "markdown",
  );
  fs.writeFileSync(
    path.join(outputDir, "converted-to-markdown.md"),
    convertedMarkdown,
  );
  console.log("Converted JSON to Markdown: converted-to-markdown.md");

  // Read Markdown data
  const markdownData = protocol.readProgress("markdown");

  // Convert Markdown to JSON
  const convertedJSON = protocol.convertFormat(
    markdownData,
    "markdown",
    "json",
  );
  fs.writeFileSync(
    path.join(outputDir, "converted-to-json.json"),
    convertedJSON,
  );
  console.log("Converted Markdown to JSON: converted-to-json.json");
}

// Run the demo
simulateResearchOperation().catch((error) => {
  console.error("Demo error:", error);
});
