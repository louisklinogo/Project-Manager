/**
 * @fileoverview Demo script for the integration between ResearchOrchestrator and ResearchProgressVisualizer.
 *
 * This script demonstrates how the ResearchProgressVisualizer can be used to visualize
 * the progress of research operations executed by the ResearchOrchestrator.
 */

import { ResearchOrchestrator } from "../project-manager/src/research/phase/research-orchestrator.js";
import {
  ResearchProgressVisualizer,
  OutputFormat,
  VisualizationMode,
} from "../project-manager/src/ui/components/research-progress-visualizer.js";
import ConsoleFormatters from "../project-manager/src/ui/components/console-formatters.js";
import HTMLFormatters from "../project-manager/src/ui/components/html-formatters.js";
import FileFormatters from "../project-manager/src/ui/components/file-formatters.js";
import ResearchProgressProtocol from "../project-manager/src/ide/file-protocol/research-progress-protocol.js";
import fs from "fs";
import path from "path";

// Create output directory
const outputDir = path.join(
  process.cwd(),
  "demos",
  "output",
  "orchestrator-visualizer",
);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create instances of the components
const orchestrator = new ResearchOrchestrator({
  verbose: true,
  trackProgress: true,
  providers: {
    // Mock providers for demo
    tavily: { apiKey: "demo-key" },
    openai: { apiKey: "demo-key" },
  },
});

const visualizer = new ResearchProgressVisualizer({
  mode: VisualizationMode.DETAILED,
  accessibilityFeatures: true,
});

// Create formatters
const consoleFormatters = new ConsoleFormatters();
const htmlFormatters = new HTMLFormatters();
const fileFormatters = new FileFormatters();

// Register renderers
visualizer.registerRenderer(OutputFormat.CONSOLE, {
  render: (data, options) => {
    try {
      // Create a proper status object for formatProgressSummary
      const statusObj = {
        type: data.statusType || "info",
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
        type: data.statusType || "info",
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
        type: data.statusType || "info",
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

visualizer.registerRenderer(OutputFormat.HTML, {
  render: (data, options) => {
    try {
      return htmlFormatters.formatProgressSummary(data);
    } catch (error) {
      console.error(`ResearchProgressVisualizer Error: ${error.message}`);
      return `<div>
        <h1>Research Progress</h1>
        <p>Operation: ${data.operation || "Unknown"}</p>
        <p>Progress: ${data.progress !== undefined ? `${data.progress}%` : "Unknown"}</p>
        <p>Status: ${data.status || "No status"}</p>
      </div>`;
    }
  },
});

visualizer.registerRenderer(OutputFormat.FILE, {
  render: (data, options) => {
    try {
      return fileFormatters.format(data, options?.format || "json");
    } catch (error) {
      console.error(`ResearchProgressVisualizer Error: ${error.message}`);
      return JSON.stringify(
        {
          operation: data.operation || "Unknown",
          progress: data.progress !== undefined ? data.progress : 0,
          status: data.status || "No status",
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      );
    }
  },
});

// Create protocol for file-based output
const protocol = new ResearchProgressProtocol({
  outputDir: path.join(outputDir, "protocol"),
  enableWatching: true,
});

// Connect orchestrator events to visualizer
orchestrator.on("progress", (data) => {
  console.log(
    `Progress update: ${data.operation} - ${data.progress.toFixed(1)}%`,
  );

  // Render to console
  const consoleOutput = visualizer.renderToConsole({
    operation: data.operation,
    progress: data.progress,
    status: orchestrator.getStatus(data.operation)?.message || "In progress",
    estimatedTimeRemaining: data.estimatedTimeRemaining,
    context: {
      recentStatus: orchestrator.statusTracker.getStatusHistory(data.operation),
      recentOperations: [data.operation],
    },
  });

  console.log(consoleOutput);

  // Write to file protocol
  try {
    protocol.writeProgress({
      operation: data.operation,
      progress: data.progress,
      status: orchestrator.getStatus(data.operation)?.message || "In progress",
      estimatedTimeRemaining: data.estimatedTimeRemaining,
      context: {
        recentStatus: orchestrator.statusTracker.getStatusHistory(
          data.operation,
        ),
        recentOperations: [data.operation],
      },
    });
  } catch (error) {
    console.warn(`Failed to write to protocol file: ${error.message}`);
  }

  // Generate HTML output
  try {
    const htmlContent = visualizer.renderToHTML({
      operation: data.operation,
      progress: data.progress,
      status: orchestrator.getStatus(data.operation)?.message || "In progress",
      estimatedTimeRemaining: data.estimatedTimeRemaining,
      context: {
        recentStatus: orchestrator.statusTracker.getStatusHistory(
          data.operation,
        ),
        recentOperations: [data.operation],
      },
    });

    fs.writeFileSync(
      path.join(outputDir, `progress-${data.progress.toFixed(0)}.html`),
      htmlContent,
    );
  } catch (error) {
    console.warn(`Failed to generate HTML output: ${error.message}`);
  }
});

orchestrator.on("status", (data) => {
  console.log(
    `Status update: ${data.operation} - ${data.type}: ${data.message}`,
  );
});

orchestrator.on("researchComplete", (data) => {
  console.log(`Research completed: ${data.operationId}`);

  // Generate final HTML report
  try {
    const htmlFormatter = new HTMLFormatters();
    const finalReport = htmlFormatter.createHTMLPage(
      {
        operation: data.operationId,
        progress: 100,
        status: "Research completed successfully",
        context: {
          recentStatus: orchestrator.statusTracker.getStatusHistory(
            data.operationId,
          ),
          recentOperations: [data.operationId],
        },
      },
      {
        title: "Research Results",
        includeStatusHistory: true,
        includeMemoryAid: true,
      },
    );

    fs.writeFileSync(path.join(outputDir, "final-report.html"), finalReport);

    // Write final JSON report
    fs.writeFileSync(
      path.join(outputDir, "research-results.json"),
      JSON.stringify(data.result, null, 2),
    );
  } catch (error) {
    console.warn(`Failed to generate final reports: ${error.message}`);
  }
});

orchestrator.on("researchError", (data) => {
  console.error(`Research error: ${data.operationId} - ${data.error.message}`);
});

// Create a sample research plan
const researchPlan = {
  id: "plan-123",
  taskName: "Research JavaScript Frameworks",
  taskDescription: "Research popular JavaScript frameworks for web development",
  topics: [
    {
      id: "topic-1",
      name: "React",
      importance: "high",
      questions: [
        { id: "q1", text: "What are the key features of React?" },
        { id: "q2", text: "How does React compare to other frameworks?" },
      ],
      sources: [
        {
          id: "source-1",
          type: "web-search",
          provider: "tavily",
          query: "React key features",
        },
        {
          id: "source-2",
          type: "question-answering",
          provider: "openai",
          query: "What makes React popular?",
        },
      ],
    },
    {
      id: "topic-2",
      name: "Vue.js",
      importance: "medium",
      questions: [
        { id: "q3", text: "What are the key features of Vue.js?" },
        { id: "q4", text: "How does Vue.js compare to React?" },
      ],
      sources: [
        {
          id: "source-3",
          type: "web-search",
          provider: "tavily",
          query: "Vue.js key features",
        },
        {
          id: "source-4",
          type: "question-answering",
          provider: "openai",
          query: "What makes Vue.js unique?",
        },
      ],
    },
    {
      id: "topic-3",
      name: "Angular",
      importance: "medium",
      questions: [
        { id: "q5", text: "What are the key features of Angular?" },
        { id: "q6", text: "How does Angular compare to React and Vue.js?" },
      ],
      sources: [
        {
          id: "source-5",
          type: "web-search",
          provider: "tavily",
          query: "Angular key features",
        },
        {
          id: "source-6",
          type: "question-answering",
          provider: "openai",
          query: "What makes Angular different?",
        },
      ],
    },
  ],
};

// Execute the research plan
async function runDemo() {
  console.log("Starting research orchestrator visualizer demo...");

  try {
    // Start watching protocol files
    protocol.startWatching();

    // Execute research
    const result = await orchestrator.executeResearch(researchPlan, {
      operationId: "demo-research-operation",
    });

    console.log("Research completed successfully");
    console.log(
      `Results saved to ${path.join(outputDir, "research-results.json")}`,
    );
    console.log(
      `Final report saved to ${path.join(outputDir, "final-report.html")}`,
    );

    // Stop watching protocol files
    protocol.stopWatching();
  } catch (error) {
    console.error("Research failed:", error);
  }
}

// Run the demo
runDemo().catch((error) => {
  console.error("Demo error:", error);
});
