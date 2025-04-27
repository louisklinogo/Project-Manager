# Project-Manager MVP

This directory contains the Minimum Viable Product (MVP) implementation of the Project-Manager. The MVP provides a simplified version of the blueprint generation functionality that you can use while the full implementation is being developed.

## Features

- Simple project initialization
- Basic research capabilities
- Simplified blueprint generation
- Blueprint storage and retrieval
- Dependency visualization

## Usage

The MVP can be used through the following npm scripts:

### Generate a New Blueprint

```bash
npm run mvp "Project Name" "Project Description" "Project Requirements"
```

This will:
1. Initialize a new project
2. Research the project
3. Generate a simple blueprint
4. Display the blueprint with tasks and dependency visualization

**Example:**

```bash
npm run mvp "E-commerce Website" "An online store for selling products" "User authentication, product catalog, shopping cart, payment processing, order management"
```

Output:

```text
 Project-Manager MVP Demo

ℹ Project Name: E-commerce Website
ℹ Description: An online store for selling products
ℹ Requirements: User authentication, product catalog, shopping cart, payment processing, order management

 Step 1: Initialize Project

ℹ Initializing project with ID: project-a1b2c3d4-e5f6-7890-abcd-ef1234567890
✓ Project initialized successfully: project-a1b2c3d4-e5f6-7890-abcd-ef1234567890

 Step 2: Research Project

ℹ Researching project: E-commerce Website
✓ Project research completed successfully

 Research Key Points

1. E-commerce Website is an important topic in modern development.
2. Best practices include thorough planning and documentation.
3. Implementation should follow industry standards.
4. Testing is crucial for ensuring quality.
5. Maintenance and updates should be planned from the start.

 Step 3: Generate Blueprint

ℹ Generating blueprint for project: E-commerce Website
✓ Blueprint generated successfully

 Blueprint Summary

ID: blueprint-b1c2d3e4-f5g6-7890-abcd-ef1234567890
Name: Blueprint for E-commerce Website
Description: Generated blueprint for E-commerce Website: An online store for selling products
Created At: 27/04/2025, 12:50:00 pm

 Tasks

1. Task 1: User authentication
   Description: User authentication
   Status: pending
   Priority: medium

2. Task 2: Product catalog
   Description: Product catalog
   Status: pending
   Priority: medium
   Depends On: Task 1: User authentication

3. Task 3: Shopping cart
   Description: Shopping cart
   Status: pending
   Priority: medium
   Depends On: Task 2: Product catalog

4. Task 4: Payment processing
   Description: Payment processing
   Status: pending
   Priority: medium
   Depends On: Task 3: Shopping cart

5. Task 5: Order management
   Description: Order management
   Status: pending
   Priority: medium
   Depends On: Task 4: Payment processing

 Dependency Graph

graph TD;
  task_1["Task 1: User authentication"];
  task_2["Task 2: Product catalog"];
  task_3["Task 3: Shopping cart"];
  task_4["Task 4: Payment processing"];
  task_5["Task 5: Order management"];
  task_1 --> task_2;
  task_2 --> task_3;
  task_3 --> task_4;
  task_4 --> task_5;
```

### List All Blueprints

```bash
npm run mvp:list-blueprints
```

This will display a list of all existing blueprints with their IDs, names, and other metadata.

**Example:**

```bash
npm run mvp:list-blueprints
```

Output:

```text
 List Blueprints Demo

Listing all blueprints...
✓ Found 2 blueprints

 Blueprints

1. Blueprint for E-commerce Website
   ID: blueprint-b1c2d3e4-f5g6-7890-abcd-ef1234567890
   Project ID: project-a1b2c3d4-e5f6-7890-abcd-ef1234567890
   Description: Generated blueprint for E-commerce Website: An online store for selling products
   Created: 27/04/2025, 12:50:00 pm
   Tasks: 5

2. Blueprint for Mobile App
   ID: blueprint-c2d3e4f5-g6h7-8901-bcde-f12345678901
   Project ID: project-b2c3d4e5-f6g7-8901-bcde-f12345678901
   Description: Generated blueprint for Mobile App: A cross-platform mobile application
   Created: 27/04/2025, 01:15:30 pm
   Tasks: 3

To view a specific blueprint, use:
npm run mvp:load-blueprint <blueprint-id>
```

### Load a Specific Blueprint

```bash
npm run mvp:load-blueprint <blueprint-id>
```

This will load and display a specific blueprint by its ID.

**Example:**

```bash
npm run mvp:load-blueprint blueprint-b1c2d3e4-f5g6-7890-abcd-ef1234567890
```

Output:

```text
 Load Blueprint Demo

Loading blueprint: blueprint-b1c2d3e4-f5g6-7890-abcd-ef1234567890
✓ Blueprint loaded successfully: blueprint-b1c2d3e4-f5g6-7890-abcd-ef1234567890

 Blueprint Summary

ID: blueprint-b1c2d3e4-f5g6-7890-abcd-ef1234567890
Name: Blueprint for E-commerce Website
Description: Generated blueprint for E-commerce Website: An online store for selling products
Created At: 27/04/2025, 12:50:00 pm

 Tasks

1. Task 1: User authentication
   Description: User authentication
   Status: pending
   Priority: medium

2. Task 2: Product catalog
   Description: Product catalog
   Status: pending
   Priority: medium
   Depends On: Task 1: User authentication

3. Task 3: Shopping cart
   Description: Shopping cart
   Status: pending
   Priority: medium
   Depends On: Task 2: Product catalog

4. Task 4: Payment processing
   Description: Payment processing
   Status: pending
   Priority: medium
   Depends On: Task 3: Shopping cart

5. Task 5: Order management
   Description: Order management
   Status: pending
   Priority: medium
   Depends On: Task 4: Payment processing

 Dependency Graph

graph TD;
  task_1["Task 1: User authentication"];
  task_2["Task 2: Product catalog"];
  task_3["Task 3: Shopping cart"];
  task_4["Task 4: Payment processing"];
  task_5["Task 5: Order management"];
  task_1 --> task_2;
  task_2 --> task_3;
  task_3 --> task_4;
  task_4 --> task_5;
```

## Real-World Use Cases

Here are some examples of how to use the MVP for different types of projects:

### Creating a Web Application Blueprint

```bash
npm run mvp "Personal Blog" "A blog website with user authentication and content management" "User registration, login system, blog post creation, comments, admin dashboard"
```

### Creating a Mobile App Blueprint

```bash
npm run mvp "Fitness Tracker" "A mobile app for tracking fitness activities" "User profiles, activity tracking, goal setting, progress visualization, social sharing"
```

### Creating a Backend Service Blueprint

```bash
npm run mvp "API Gateway" "A centralized API gateway service" "Authentication, rate limiting, request routing, service discovery, logging and monitoring"
```

## Implementation Details

The MVP implementation consists of the following components:

- `simple-blueprint-generator.js`: A simplified implementation of blueprint generation
- `simple-blueprint-direct.js`: Direct functions for generating and managing simple blueprints

These components use the existing research module and task hierarchy system from the main implementation, but with simplified logic for blueprint generation.

## Limitations

The MVP implementation has the following limitations:

- Limited task breakdown capabilities
- Simple dependency generation
- Basic visualization
- No advanced features like blueprint refinement or co-design

These limitations will be addressed in the full implementation as outlined in the tasks.md file.

## Next Steps

After using the MVP, you can continue with the full implementation as outlined in the tasks.md file, focusing on:

1. Completing Task 5.1: Enhanced Research Model
2. Implementing Task 5.2: Instruction Protocol
3. Implementing Task 5.3: Blueprint Generation and Refinement

The MVP provides a foundation that can be extended and enhanced as the full implementation progresses.
