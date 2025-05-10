/**
 * PocketFlow Demo
 *
 * This script demonstrates how to use the PocketFlow framework
 * to create a simple flow for processing data.
 */

import {
  Node,
  Flow,
  AsyncNode,
  AsyncFlow,
  BatchNode,
  AsyncBatchNode,
} from "../project-manager/src/core/flow/index.js";

// Create a simple node that adds a property to the data
class AddPropertyNode extends Node {
  constructor(options = {}) {
    super(options);
    this.key = options.key || "defaultKey";
    this.value = options.value || "defaultValue";
  }

  exec(data) {
    return {
      ...data,
      [this.key]: this.value,
    };
  }
}

// Create a simple node that logs the data
class LogNode extends Node {
  constructor(options = {}) {
    super(options);
    this.prefix = options.prefix || "LogNode:";
  }

  exec(data) {
    console.log(`${this.prefix}`, data);
    return data;
  }
}

// Create a simple node that filters properties
class FilterNode extends Node {
  constructor(options = {}) {
    super(options);
    this.allowedKeys = options.allowedKeys || [];
  }

  exec(data) {
    const result = {};

    for (const key of this.allowedKeys) {
      if (key in data) {
        result[key] = data[key];
      }
    }

    return result;
  }
}

// Create a simple batch node that processes items
class UppercaseNode extends BatchNode {
  constructor(options = {}) {
    super(options);
    this.itemsKey = options.itemsKey || "strings";
    this.resultsKey = options.resultsKey || "uppercaseStrings";
  }

  processItem(item) {
    if (typeof item === "string") {
      return item.toUpperCase();
    }
    return item;
  }
}

// Create a simple async node that simulates an API call
class SimulatedApiNode extends AsyncNode {
  constructor(options = {}) {
    super(options);
    this.delay = options.delay || 1000;
    this.apiName = options.apiName || "SimulatedAPI";
  }

  async exec(data) {
    console.log(`${this.apiName}: Starting API call...`);

    // Simulate an API call with a delay
    await new Promise((resolve) => setTimeout(resolve, this.delay));

    console.log(`${this.apiName}: API call completed`);

    return {
      ...data,
      apiResult: {
        success: true,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Create a simple async batch node that processes items asynchronously
class AsyncTransformNode extends AsyncBatchNode {
  constructor(options = {}) {
    super(options);
    this.delay = options.delay || 500;
    this.transform = options.transform || ((item) => item);
  }

  async processItem(item, index) {
    console.log(`Processing item ${index}...`);

    // Simulate async processing with a delay
    await new Promise((resolve) => setTimeout(resolve, this.delay));

    const result = this.transform(item);
    console.log(`Item ${index} processed: ${result}`);

    return result;
  }
}

// Demo 1: Simple Flow
async function demoSimpleFlow() {
  console.log("\n=== Demo 1: Simple Flow ===\n");

  // Create a flow
  const flow = new Flow({
    name: "SimpleFlow",
    storeIntermediateResults: true,
  });

  // Add nodes to the flow
  flow
    .add(new LogNode({ prefix: "Input:" }))
    .add(new AddPropertyNode({ key: "greeting", value: "Hello" }))
    .add(new AddPropertyNode({ key: "farewell", value: "Goodbye" }))
    .add(new LogNode({ prefix: "Before filtering:" }))
    .add(new FilterNode({ allowedKeys: ["name", "greeting"] }))
    .add(new LogNode({ prefix: "Output:" }));

  // Run the flow
  const result = flow.run({ name: "World" });

  console.log("\nFinal result:", result);
  console.log("Memory:", flow.memory.toObject());
}

// Demo 2: Batch Processing
async function demoBatchProcessing() {
  console.log("\n=== Demo 2: Batch Processing ===\n");

  // Create a flow
  const flow = new Flow({
    name: "BatchFlow",
  });

  // Add nodes to the flow
  flow
    .add(new LogNode({ prefix: "Input:" }))
    .add(new UppercaseNode({ batchSize: 2 }))
    .add(new LogNode({ prefix: "Output:" }));

  // Run the flow
  const result = flow.run({
    strings: ["hello", "world", "this", "is", "a", "test"],
  });

  console.log("\nFinal result:", result);
}

// Demo 3: Async Flow
async function demoAsyncFlow() {
  console.log("\n=== Demo 3: Async Flow ===\n");

  // Create an async flow
  const flow = new AsyncFlow({
    name: "AsyncFlow",
  });

  // Add nodes to the flow
  flow
    .add(new LogNode({ prefix: "Input:" }))
    .add(new SimulatedApiNode({ delay: 1000, apiName: "UserAPI" }))
    .add(new SimulatedApiNode({ delay: 500, apiName: "DataAPI" }))
    .add(new LogNode({ prefix: "Output:" }));

  // Run the flow
  console.log("Starting async flow...");
  const result = await flow.run({ userId: 123 });

  console.log("\nFinal result:", result);
}

// Demo 4: Async Batch Processing
async function demoAsyncBatchProcessing() {
  console.log("\n=== Demo 4: Async Batch Processing ===\n");

  // Create an async flow
  const flow = new AsyncFlow({
    name: "AsyncBatchFlow",
  });

  // Add nodes to the flow
  flow
    .add(new LogNode({ prefix: "Input:" }))
    .add(
      new AsyncTransformNode({
        itemsKey: "numbers",
        resultsKey: "doubled",
        batchSize: 3,
        concurrency: 2,
        delay: 500,
        transform: (n) => n * 2,
      }),
    )
    .add(new LogNode({ prefix: "Output:" }));

  // Run the flow
  console.log("Starting async batch flow...");
  const result = await flow.run({
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  });

  console.log("\nFinal result:", result);
}

// Run all demos
async function runAllDemos() {
  await demoSimpleFlow();
  await demoBatchProcessing();
  await demoAsyncFlow();
  await demoAsyncBatchProcessing();
}

// Run the demos
runAllDemos().catch((error) => {
  console.error("Error running demos:", error);
});
