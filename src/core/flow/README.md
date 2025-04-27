# PocketFlow

PocketFlow is a lightweight flow-based programming framework for JavaScript. It provides a simple but powerful abstraction for building applications using a graph/flow model where nodes process data and pass it to successors.

## Overview

PocketFlow is designed to be:

- **Lightweight**: Core implementation is around 100 lines of code
- **Flexible**: Supports synchronous and asynchronous processing
- **Composable**: Nodes can be combined in various ways to create complex flows
- **Extensible**: Easy to create custom nodes for specific use cases

## Core Components

- **Node**: Base class for processing data
- **Flow**: Class for orchestrating nodes
- **Memory**: Class for storing and retrieving data
- **BatchNode**: Class for processing multiple items
- **AsyncNode**: Class for asynchronous processing
- **AsyncFlow**: Class for orchestrating async nodes
- **AsyncBatchNode**: Class for asynchronous batch processing

## Usage

### Basic Example

```javascript
import { Node, Flow } from '../core/flow/index.js';

// Create a simple node that adds a property to the data
class AddPropertyNode extends Node {
  constructor(options = {}) {
    super(options);
    this.key = options.key || 'defaultKey';
    this.value = options.value || 'defaultValue';
  }

  exec(data) {
    return {
      ...data,
      [this.key]: this.value
    };
  }
}

// Create a flow
const flow = new Flow({
  name: 'SimpleFlow',
  storeIntermediateResults: true
});

// Add nodes to the flow
flow
  .add(new AddPropertyNode({ key: 'greeting', value: 'Hello' }))
  .add(new AddPropertyNode({ key: 'farewell', value: 'Goodbye' }));

// Run the flow
const result = flow.run({ name: 'World' });
console.log(result); // { name: 'World', greeting: 'Hello', farewell: 'Goodbye' }
```

### Asynchronous Example

```javascript
import { AsyncNode, AsyncFlow } from '../core/flow/index.js';

// Create a simple async node that simulates an API call
class ApiNode extends AsyncNode {
  constructor(options = {}) {
    super(options);
    this.delay = options.delay || 1000;
    this.apiName = options.apiName || 'API';
  }

  async exec(data) {
    console.log(`${this.apiName}: Starting API call...`);
    
    // Simulate an API call with a delay
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    console.log(`${this.apiName}: API call completed`);
    
    return {
      ...data,
      apiResult: {
        success: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Create an async flow
const flow = new AsyncFlow({
  name: 'AsyncFlow'
});

// Add nodes to the flow
flow
  .add(new ApiNode({ apiName: 'UserAPI', delay: 1000 }))
  .add(new ApiNode({ apiName: 'DataAPI', delay: 500 }));

// Run the flow
const result = await flow.run({ userId: 123 });
console.log(result);
```

### Batch Processing Example

```javascript
import { BatchNode, Flow } from '../core/flow/index.js';

// Create a batch node that processes items
class UppercaseNode extends BatchNode {
  constructor(options = {}) {
    super(options);
    this.itemsKey = options.itemsKey || 'strings';
    this.resultsKey = options.resultsKey || 'uppercaseStrings';
  }

  processItem(item) {
    if (typeof item === 'string') {
      return item.toUpperCase();
    }
    return item;
  }
}

// Create a flow
const flow = new Flow({
  name: 'BatchFlow'
});

// Add nodes to the flow
flow.add(new UppercaseNode({ batchSize: 2 }));

// Run the flow
const result = flow.run({
  strings: ['hello', 'world', 'this', 'is', 'a', 'test']
});

console.log(result.uppercaseStrings); // ['HELLO', 'WORLD', 'THIS', 'IS', 'A', 'TEST']
```

## Advanced Features

### Error Handling

PocketFlow provides robust error handling with options for continuing on error:

```javascript
const flow = new Flow({
  name: 'ErrorHandlingFlow',
  continueOnError: true,
  errorHandler: (node, error, index) => {
    console.error(`Error in node ${node.name} at index ${index}:`, error);
  }
});
```

### Shared Memory

PocketFlow provides a shared memory mechanism for passing data between nodes:

```javascript
const memory = new Memory({
  initialData: { key1: 'value1' }
});

const flow = new Flow({
  name: 'MemoryFlow',
  memory
});

// Access memory in nodes
class MemoryNode extends Node {
  exec(data) {
    // Get value from memory
    const value = this.flow.memory.get('key1');
    
    // Set value in memory
    this.flow.memory.set('key2', 'value2');
    
    return data;
  }
}
```

### Intermediate Results

PocketFlow can store intermediate results for debugging:

```javascript
const flow = new Flow({
  name: 'DebugFlow',
  storeIntermediateResults: true
});

// Run the flow
flow.run(data);

// Access intermediate results
console.log(flow.memory.get('node_0_result'));
```

## Use Cases

PocketFlow is particularly useful for:

- **Data Processing Pipelines**: Process data through a series of transformations
- **API Orchestration**: Coordinate calls to multiple APIs
- **Task Automation**: Automate complex tasks with multiple steps
- **Workflow Management**: Manage workflows with branching and conditional logic

## License

MIT
