# Research Progress Visualizer Architecture

## Component Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Research Progress Visualizer                     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐│
│  │                   │    │                   │    │                   ││
│  │  Console Renderer │    │   HTML Renderer   │    │   File Renderer   ││
│  │                   │    │                   │    │                   ││
│  └───────────────────┘    └───────────────────┘    └───────────────────┘│
│                                                                         │
└───────────────┬─────────────────────────────────────┬─────────────────┬─┘
                │                                     │                 │
                │                                     │                 │
                ▼                                     ▼                 ▼
┌───────────────────────┐             ┌───────────────────────┐    ┌───────────────────┐
│                       │             │                       │    │                   │
│  Progress Tracker     │◄────────────┤  Research Orchestrator│    │  Status Tracker   │
│                       │             │                       │    │                   │
└───────────────────────┘             └───────────────┬───────┘    └───────────────────┘
                                                     │
                                                     │
                                                     ▼
                                      ┌───────────────────────────────┐
                                      │                               │
                                      │  Research Phase Components     │
                                      │  - ResearchPhase              │
                                      │  - ResearchPlanGenerator      │
                                      │  - ArtifactGenerator          │
                                      │                               │
                                      └───────────────────────────────┘
```

## Component Descriptions

### ResearchProgressVisualizer

The core component responsible for visualizing research progress. It provides a unified interface for different visualization modes and output formats.

**Key Responsibilities:**

- Manage visualization modes (simple, detailed, expert)
- Coordinate rendering across different output formats
- Process and format research progress data
- Provide accessibility features for users with executive function and memory issues

**Interfaces:**

- `render(data, options)`: Render progress data with specified options
- `renderToConsole(data, options)`: Render to console output
- `renderToHTML(data, options)`: Render to HTML output
- `renderToFile(data, options, filePath)`: Render to file for IDE integration

### Console Renderer

Handles rendering of research progress to the console.

**Key Responsibilities:**

- Format progress data for console display
- Create progress bars, tables, and boxed sections
- Support color coding and styling
- Implement memory aids for console output

**Dependencies:**

- chalk: For color coding and styling
- boxen: For creating boxed sections
- cli-table3: For tabular data presentation
- ora: For loading indicators

### HTML Renderer

Handles rendering of research progress to HTML format.

**Key Responsibilities:**

- Generate semantic HTML with appropriate ARIA attributes
- Create CSS styling for visual differentiation
- Implement interactive elements for exploring research details
- Support printing and export to PDF

**Dependencies:**

- CSS templates for styling
- HTML templates for structure
- Accessibility guidelines for ARIA attributes

### File Renderer

Handles rendering of research progress to files for IDE integration.

**Key Responsibilities:**

- Generate standardized file formats (JSON, Markdown)
- Implement file watching for real-time updates
- Create IDE-agnostic interfaces for different environments
- Support future integration with VS Code extension

**Dependencies:**

- File system utilities
- JSON schema for structured data
- Markdown templates for human-readable reports

### Progress Tracker

Tracks and reports progress during research operations.

**Key Responsibilities:**

- Monitor progress of research operations
- Calculate completion percentages
- Track time spent and estimate remaining time
- Emit progress events for real-time updates

**Interfaces:**

- `trackProgress(operation, progress)`: Update progress for an operation
- `getProgress(operation)`: Get current progress for an operation
- `estimateTimeRemaining(operation)`: Estimate time remaining for an operation

### Status Tracker

Tracks and reports status information during research operations.

**Key Responsibilities:**

- Monitor status of research operations
- Track errors and warnings
- Provide context-sensitive status messages
- Support different status types (info, warning, error, success)

**Interfaces:**

- `updateStatus(operation, status)`: Update status for an operation
- `getStatus(operation)`: Get current status for an operation
- `clearStatus(operation)`: Clear status for an operation

### Research Orchestrator

Coordinates research operations and reports progress.

**Key Responsibilities:**

- Orchestrate research execution across multiple providers
- Report progress and status updates
- Manage research phases and transitions
- Handle errors and recovery

**Interfaces:**

- `executeResearch(query, options)`: Execute a research operation
- `cancelResearch(operationId)`: Cancel a research operation
- `getResearchStatus(operationId)`: Get status of a research operation
- `onProgress(callback)`: Register a progress callback
- `onStatus(callback)`: Register a status callback

### Research Phase Components

Existing components that perform the actual research operations.

**Components:**

- ResearchPhase: Base class for research phases
- ResearchPlanGenerator: Generates research plans
- ArtifactGenerator: Generates research artifacts

## Integration Points

1. **ResearchProgressVisualizer ↔ Research Orchestrator**

   - The visualizer subscribes to progress and status events from the orchestrator
   - The orchestrator emits events when progress or status changes
   - The visualizer renders the progress and status information

2. **ResearchProgressVisualizer ↔ Progress Tracker**

   - The visualizer uses the progress tracker to get detailed progress information
   - The progress tracker provides completion percentages and time estimates
   - The visualizer renders progress information in different formats

3. **ResearchProgressVisualizer ↔ Status Tracker**

   - The visualizer uses the status tracker to get detailed status information
   - The status tracker provides context-sensitive status messages
   - The visualizer renders status information in different formats

4. **Research Orchestrator ↔ Progress Tracker**

   - The orchestrator updates the progress tracker as research operations progress
   - The progress tracker calculates completion percentages and time estimates
   - The orchestrator uses the progress tracker to report progress to clients

5. **Research Orchestrator ↔ Status Tracker**

   - The orchestrator updates the status tracker as research operations progress
   - The status tracker provides context-sensitive status messages
   - The orchestrator uses the status tracker to report status to clients

6. **Research Orchestrator ↔ Research Phase Components**
   - The orchestrator coordinates the execution of research phases
   - The research phase components report progress and status to the orchestrator
   - The orchestrator manages transitions between research phases

## File Structure

```
src/
├── ui/
│   └── components/
│       ├── research-progress-visualizer.js
│       ├── console-formatters.js
│       ├── html-formatters.js
│       └── file-formatters.js
├── research/
│   └── phase/
│       ├── research-orchestrator.js
│       ├── research-phase.js
│       ├── feedback/
│       │   ├── progress-tracker.js
│       │   └── status-tracker.js
│       └── ...
└── ide/
    └── file-protocol/
        └── research-progress-protocol.js
```

## Accessibility Considerations

1. **Clear Visual Structure**

   - Consistent layout and organization
   - Hierarchical information presentation
   - Visual grouping of related information

2. **Memory Aids**

   - Context retention across different views
   - Progress summaries and status indicators
   - Breadcrumb navigation for complex workflows

3. **Reduced Cognitive Load**

   - Progressive disclosure of complex information
   - Focused views with minimal distractions
   - Clear indication of current state and progress

4. **Multi-modal Feedback**

   - Visual, textual, and (where appropriate) audio feedback
   - Redundant coding of important information
   - Clear error messages with actionable guidance

5. **Customization Options**
   - Adjustable detail levels (simple, detailed, expert)
   - Preferences for update frequency and notification style
   - Support for different visualization modes

## Implementation Approach

1. **Phase 1: Core Components**

   - Implement ResearchProgressVisualizer base class
   - Implement Console Renderer
   - Implement Progress Tracker and Status Tracker
   - Create basic integration with Research Orchestrator

2. **Phase 2: Enhanced Visualization**

   - Implement HTML Renderer
   - Implement File Renderer
   - Enhance accessibility features
   - Add support for different visualization modes

3. **Phase 3: Integration and Testing**
   - Fully integrate with Research Orchestrator
   - Implement demo scripts
   - Create comprehensive tests
   - Document usage and extension points

## Conclusion

The Research Progress Visualizer architecture provides a flexible and extensible framework for visualizing research progress across different output formats. By separating the visualization logic from the research execution logic, we can provide a consistent user experience while supporting different visualization needs and environments.

The architecture prioritizes accessibility for users with executive function and memory issues, with features like clear visual structure, memory aids, and reduced cognitive load. It also supports different levels of detail and customization options to accommodate different user preferences and needs.

The integration with the Research Orchestrator and other research components ensures that the visualizer has access to real-time progress and status information, enabling accurate and timely feedback to users during research operations.
