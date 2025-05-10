# Project Manager Command Reference

Here's a comprehensive reference of all available commands:

## Parse PRD

```bash
# Parse a PRD file and generate tasks
project-manager parse-prd <prd-file.txt>

# Limit the number of tasks generated
project-manager parse-prd <prd-file.txt> --num-tasks=10
```

## List Tasks

```bash
# List all tasks
project-manager list

# List tasks with a specific status
project-manager list --status=<status>

# List tasks with subtasks
project-manager list --with-subtasks

# List tasks with a specific status and include subtasks
project-manager list --status=<status> --with-subtasks
```

## Show Next Task

```bash
# Show the next task to work on based on dependencies and status
project-manager next
```

## Show Specific Task

```bash
# Show details of a specific task
project-manager show <id>
# or
project-manager show --id=<id>

# View a specific subtask (e.g., subtask 2 of task 1)
project-manager show 1.2
```

## Update Tasks

```bash
# Update tasks from a specific ID and provide context
project-manager update --from=<id> --prompt="<prompt>"
```

## Update a Specific Task

```bash
# Update a single task by ID with new information
project-manager update-task --id=<id> --prompt="<prompt>"

# Use research-backed updates with Perplexity AI
project-manager update-task --id=<id> --prompt="<prompt>" --research
```

## Update a Subtask

```bash
# Append additional information to a specific subtask
project-manager update-subtask --id=<parentId.subtaskId> --prompt="<prompt>"

# Example: Add details about API rate limiting to subtask 2 of task 5
project-manager update-subtask --id=5.2 --prompt="Add rate limiting of 100 requests per minute"

# Use research-backed updates with Perplexity AI
project-manager update-subtask --id=<parentId.subtaskId> --prompt="<prompt>" --research
```

Unlike the `update-task` command which replaces task information, the `update-subtask` command _appends_ new information to the existing subtask details, marking it with a timestamp. This is useful for iteratively enhancing subtasks while preserving the original content.

## Generate Task Files

```bash
# Generate individual task files from tasks.json
project-manager generate
```

## Set Task Status

```bash
# Set status of a single task
project-manager set-status --id=<id> --status=<status>

# Set status for multiple tasks
project-manager set-status --id=1,2,3 --status=<status>

# Set status for subtasks
project-manager set-status --id=1.1,1.2 --status=<status>
```

When marking a task as "done", all of its subtasks will automatically be marked as "done" as well.

## Expand Tasks

```bash
# Expand a specific task with subtasks
project-manager expand --id=<id> --num=<number>

# Expand with additional context
project-manager expand --id=<id> --prompt="<context>"

# Expand all pending tasks
project-manager expand --all

# Force regeneration of subtasks for tasks that already have them
project-manager expand --all --force

# Research-backed subtask generation for a specific task
project-manager expand --id=<id> --research

# Research-backed generation for all tasks
project-manager expand --all --research
```

## Clear Subtasks

```bash
# Clear subtasks from a specific task
project-manager clear-subtasks --id=<id>

# Clear subtasks from multiple tasks
project-manager clear-subtasks --id=1,2,3

# Clear subtasks from all tasks
project-manager clear-subtasks --all
```

## Analyze Task Complexity

```bash
# Analyze complexity of all tasks
project-manager analyze-complexity

# Save report to a custom location
project-manager analyze-complexity --output=my-report.json

# Use a specific LLM model
project-manager analyze-complexity --model=claude-3-opus-20240229

# Set a custom complexity threshold (1-10)
project-manager analyze-complexity --threshold=6

# Use an alternative tasks file
project-manager analyze-complexity --file=custom-tasks.json

# Use Perplexity AI for research-backed complexity analysis
project-manager analyze-complexity --research
```

## View Complexity Report

```bash
# Display the task complexity analysis report
project-manager complexity-report

# View a report at a custom location
project-manager complexity-report --file=my-report.json
```

## Managing Task Dependencies

```bash
# Add a dependency to a task
project-manager add-dependency --id=<id> --depends-on=<id>

# Remove a dependency from a task
project-manager remove-dependency --id=<id> --depends-on=<id>

# Validate dependencies without fixing them
project-manager validate-dependencies

# Find and fix invalid dependencies automatically
project-manager fix-dependencies
```

## Add a New Task

```bash
# Add a new task using AI
project-manager add-task --prompt="Description of the new task"

# Add a task with dependencies
project-manager add-task --prompt="Description" --dependencies=1,2,3

# Add a task with priority
project-manager add-task --prompt="Description" --priority=high
```

## Initialize a Project

```bash
# Initialize a new project with Project Manager structure
project-manager init
```
