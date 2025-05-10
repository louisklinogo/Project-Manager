/**
 * @fileoverview Demo script for the Research Progress Visualizer console output.
 *
 * This script demonstrates the console output capabilities of the Research Progress Visualizer,
 * including progress bars, status messages, and memory aids.
 */

import {
  ResearchProgressVisualizer,
  OutputFormat,
  VisualizationMode,
} from "../project-manager/src/ui/components/research-progress-visualizer.js";
import ConsoleFormatters from "../project-manager/src/ui/components/console-formatters.js";
import ProgressTracker from "../project-manager/src/research/phase/feedback/progress-tracker.js";
import StatusTracker, {
  StatusType,
} from "../project-manager/src/research/phase/feedback/status-tracker.js";

// Create instances of the components
const visualizer = new ResearchProgressVisualizer();
const consoleFormatters = new ConsoleFormatters();
const progressTracker = new ProgressTracker();
const statusTracker = new StatusTracker();

// Register the console formatter with the visualizer
visualizer.registerRenderer(OutputFormat.CONSOLE, {
  render: (data, options) => {
    try {
      // Create a proper status object for formatProgressSummary
      const statusObj = {
        type: StatusType.INFO,
        message: data.status || "No status",
      };

      // Create a modified data object with the status object
      const modifiedData = {
        ...data,
        statusObj,
      };

      return consoleFormatters.formatProgressSummary(modifiedData);
    } catch (error) {
      console.error(`ResearchProgressVisualizer Error: ${error.message}`);
      return (
        `Research Progress: ${data.progress !== undefined ? `${data.progress}%` : "Unknown"}\n` +
        `Status: ${data.status || "No status"}\n` +
        `Operation: ${data.operation || "Unknown"}`
      );
    }
  },
  renderSimple: (data, options) => {
    return `${data.operation}: ${data.progress}% - ${data.status}`;
  },
  renderDetailed: (data, options) => {
    try {
      // Create a proper status object for formatProgressSummary
      const statusObj = {
        type: StatusType.INFO,
        message: data.status || "No status",
      };

      // Create a modified data object with the status object
      const modifiedData = {
        ...data,
        statusObj,
      };

      return (
        consoleFormatters.formatProgressSummary(modifiedData) +
        "\n" +
        (data.context?.recentStatus
          ? consoleFormatters.formatStatusHistory(data.context.recentStatus)
          : "")
      );
    } catch (error) {
      console.error(`ResearchProgressVisualizer Error: ${error.message}`);
      return (
        `Research Progress: ${data.progress !== undefined ? `${data.progress}%` : "Unknown"}\n` +
        `Status: ${data.status || "No status"}\n` +
        `Operation: ${data.operation || "Unknown"}`
      );
    }
  },
  renderExpert: (data, options) => {
    try {
      // Create a proper status object for formatProgressSummary
      const statusObj = {
        type: StatusType.INFO,
        message: data.status || "No status",
      };

      // Create a modified data object with the status object
      const modifiedData = {
        ...data,
        statusObj,
      };

      return (
        consoleFormatters.formatProgressSummary(modifiedData) +
        "\n" +
        (data.context?.recentStatus
          ? consoleFormatters.formatStatusHistory(data.context.recentStatus)
          : "") +
        "\n" +
        (data.context?.recentOperations
          ? consoleFormatters.formatMemoryAid(data.context.recentOperations)
          : "")
      );
    } catch (error) {
      console.error(`ResearchProgressVisualizer Error: ${error.message}`);
      return (
        `Research Progress: ${data.progress !== undefined ? `${data.progress}%` : "Unknown"}\n` +
        `Status: ${data.status || "No status"}\n` +
        `Operation: ${data.operation || "Unknown"}`
      );
    }
  },
});

// Simulate a research operation
async function simulateResearchOperation() {
  const operationId = "demo-research-operation";

  console.log("Starting research operation demo...\n");

  // Initialize progress and status
  progressTracker.trackProgress(operationId, 0, { phase: "initialization" });
  statusTracker.info(operationId, "Initializing research operation");

  // Render initial state
  console.log("Simple Mode:");
  visualizer.setMode(VisualizationMode.SIMPLE);
  const progress = progressTracker.getProgress(operationId);
  const status = statusTracker.getStatus(operationId);

  console.log(
    visualizer.renderToConsole({
      operation: operationId,
      progress: progress ? progress.progress : 0,
      status: status ? status.message : "Initializing",
    }),
  );
  console.log();

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

  // Render final state in all modes
  console.log("Simple Mode:");
  visualizer.setMode(VisualizationMode.SIMPLE);
  const finalProgress = progressTracker.getProgress(operationId);
  const finalStatus = statusTracker.getStatus(operationId);

  console.log(
    visualizer.renderToConsole({
      operation: operationId,
      progress: finalProgress ? finalProgress.progress : 100,
      status: finalStatus
        ? finalStatus.message
        : "Research operation completed successfully",
    }),
  );
  console.log();

  console.log("Detailed Mode:");
  visualizer.setMode(VisualizationMode.DETAILED);
  console.log(
    visualizer.renderToConsole({
      operation: operationId,
      progress: finalProgress ? finalProgress.progress : 100,
      status: finalStatus
        ? finalStatus.message
        : "Research operation completed successfully",
      context: {
        recentStatus: statusTracker.getStatusHistory(operationId) || [],
      },
    }),
  );
  console.log();

  console.log("Expert Mode:");
  visualizer.setMode(VisualizationMode.EXPERT);
  console.log(
    visualizer.renderToConsole({
      operation: operationId,
      progress: finalProgress ? finalProgress.progress : 100,
      status: finalStatus
        ? finalStatus.message
        : "Research operation completed successfully",
      context: {
        recentStatus: statusTracker.getStatusHistory(operationId) || [],
        recentOperations: ["demo-research-operation"],
      },
    }),
  );

  console.log("\nDemo completed.");
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

    // Render progress
    console.log(`${phaseName} - Step ${i + 1}/${steps}:`);
    visualizer.setMode(VisualizationMode.DETAILED);
    const phaseProgress = progressTracker.getProgress(operationId);
    const phaseStatus = statusTracker.getStatus(operationId);

    // Create a proper status object for formatProgressSummary
    const statusObj = {
      type: phaseStatus ? phaseStatus.type : StatusType.INFO,
      message: phaseStatus ? phaseStatus.message : "In progress",
    };

    console.log(
      visualizer.renderToConsole({
        operation: operationId,
        progress: phaseProgress ? phaseProgress.progress : 0,
        status: statusObj.message,
        statusObj: statusObj,
        context: {
          recentStatus: statusTracker.getStatusHistory(operationId) || [],
        },
      }),
    );
    console.log();

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Run the demo
simulateResearchOperation().catch((error) => {
  console.error("Demo error:", error);
});
