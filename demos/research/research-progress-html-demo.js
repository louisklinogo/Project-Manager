/**
 * @fileoverview Demo script for the Research Progress Visualizer HTML output.
 *
 * This script demonstrates the HTML output capabilities of the Research Progress Visualizer,
 * including progress bars, status messages, and interactive elements.
 */

import fs from "fs";
import path from "path";
import {
  ResearchProgressVisualizer,
  OutputFormat,
  VisualizationMode,
} from "../project-manager/src/ui/components/research-progress-visualizer.js";
import HTMLFormatters from "../project-manager/src/ui/components/html-formatters.js";
import ProgressTracker from "../project-manager/src/research/phase/feedback/progress-tracker.js";
import StatusTracker, {
  StatusType,
} from "../project-manager/src/research/phase/feedback/status-tracker.js";

// Create instances of the components
const visualizer = new ResearchProgressVisualizer();
const htmlFormatters = new HTMLFormatters();
const progressTracker = new ProgressTracker();
const statusTracker = new StatusTracker();

// Register the HTML formatter with the visualizer
visualizer.registerRenderer(OutputFormat.HTML, {
  render: (data, options) => {
    return htmlFormatters.formatProgressSummary(data);
  },
  renderSimple: (data, options) => {
    return htmlFormatters.formatProgressSummary(data);
  },
  renderDetailed: (data, options) => {
    const summary = htmlFormatters.formatProgressSummary(data);
    const statusHistory = data.context?.recentStatus
      ? htmlFormatters.formatStatusHistory(data.context.recentStatus)
      : "";
    return summary + statusHistory;
  },
  renderExpert: (data, options) => {
    const summary = htmlFormatters.formatProgressSummary(data);
    const statusHistory = data.context?.recentStatus
      ? htmlFormatters.formatStatusHistory(data.context.recentStatus)
      : "";
    const memoryAid = data.context?.recentOperations
      ? htmlFormatters.formatMemoryAid(data.context.recentOperations)
      : "";
    return summary + statusHistory + memoryAid;
  },
});

// Create output directory if it doesn't exist
const outputDir = path.join(process.cwd(), "demos", "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Simulate a research operation
async function simulateResearchOperation() {
  const operationId = "demo-research-operation";

  console.log("Starting research operation HTML demo...");

  // Initialize progress and status
  progressTracker.trackProgress(operationId, 0, { phase: "initialization" });
  statusTracker.info(operationId, "Initializing research operation");

  // Generate initial HTML
  generateHTML("initial", operationId, VisualizationMode.SIMPLE);

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

  // Generate final HTML in all modes
  generateHTML("final-simple", operationId, VisualizationMode.SIMPLE);
  generateHTML("final-detailed", operationId, VisualizationMode.DETAILED);
  generateHTML("final-expert", operationId, VisualizationMode.EXPERT);

  // Generate a complete HTML page
  generateCompletePage(operationId);

  console.log("HTML demo completed. Output files saved to demos/output/");
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

    // Generate HTML for this step
    generateHTML(
      `${phaseName.toLowerCase()}-step-${i + 1}`,
      operationId,
      VisualizationMode.DETAILED,
    );

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Generate HTML output and save to file
function generateHTML(filename, operationId, mode) {
  visualizer.setMode(mode);

  const progress = progressTracker.getProgress(operationId);
  const status = statusTracker.getStatus(operationId);

  const html = visualizer.renderToHTML({
    operation: operationId,
    progress: progress ? progress.progress : 0,
    status: status ? status.message : "In progress",
    context: {
      recentStatus: statusTracker.getStatusHistory(operationId) || [],
      recentOperations: [operationId],
    },
  });

  const outputPath = path.join(outputDir, `${filename}.html`);
  fs.writeFileSync(outputPath, html);
  console.log(`Generated ${outputPath}`);
}

// Generate a complete HTML page
function generateCompletePage(operationId) {
  const progress = progressTracker.getProgress(operationId);
  const status = statusTracker.getStatus(operationId);

  const html = htmlFormatters.createHTMLPage(
    {
      operation: operationId,
      progress: progress ? progress.progress : 0,
      status: status ? status.message : "In progress",
      context: {
        recentStatus: statusTracker.getStatusHistory(operationId) || [],
        recentOperations: [operationId],
      },
    },
    {
      title: "Research Progress Visualization Demo",
      includeStatusHistory: true,
      includeMemoryAid: true,
    },
  );

  const outputPath = path.join(outputDir, "complete-page.html");
  fs.writeFileSync(outputPath, html);
  console.log(`Generated ${outputPath}`);
}

// Run the demo
simulateResearchOperation().catch((error) => {
  console.error("Demo error:", error);
});
