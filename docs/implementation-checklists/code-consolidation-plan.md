# Code Consolidation Plan

This document outlines the duplicate code and functionality identified in the Project-Manager codebase and provides a plan for consolidating this code into shared modules.

## 1. Identified Duplicate Code and Functionality

### 1.1. AI Provider Management

#### 1.1.1. Provider Selection Logic

- **Location 1**: `src/core/utils/ai-client-utils.js` - `getBestAvailableAIModel()`
- **Location 2**: `src/providers/provider-utils.js` - `getBestAvailableProvider()`
- **Issue**: Both functions implement similar logic for selecting the best available AI provider based on preferences and availability.

#### 1.1.2. Provider Initialization

- **Location 1**: `src/core/utils/ai-client-utils.js` - Various client initialization functions
- **Location 2**: `scripts/modules/ai/compatibility.js` - `initializeProviders()`
- **Issue**: Multiple implementations of provider initialization with similar configuration handling.

#### 1.1.3. Provider Configuration

- **Location 1**: `src/core/utils/ai-client-utils.js` - Client cache and configuration
- **Location 2**: `src/utils/config.js` - AI provider configuration
- **Issue**: Duplicate provider configuration handling in multiple places.

### 1.2. Error Handling

#### 1.2.1. Error Handling Logic

- **Location 1**: `src/utils/error.js` - Various error handling functions
- **Location 2**: `src/core/utils/error-handler.js` - Error handling functions
- **Issue**: Duplicate error handling logic with similar functionality.

#### 1.2.2. Retry Mechanisms

- **Location 1**: `src/utils/error.js` - `retryWithExponentialBackoff()`
- **Location 2**: Various modules implementing their own retry logic
- **Issue**: Multiple implementations of retry mechanisms with similar functionality.

#### 1.2.3. Error Formatting

- **Location 1**: `src/utils/error.js` - `createErrorFromApiError()`
- **Location 2**: Various modules implementing their own error formatting
- **Issue**: Similar error formatting logic in different places.

### 1.3. Research Module

#### 1.3.1. Research Execution

- **Location 1**: `src/research/phase/research-orchestrator.js` - Research execution logic
- **Location 2**: `src/core/direct-functions/research-project-direct.js` - Research execution logic
- **Location 3**: `demos/research/research-module-demo.js` - Research execution logic
- **Issue**: Duplicate research execution logic in different modules.

#### 1.3.2. Provider Selection for Research

- **Location 1**: `src/research/phase/research-orchestrator.js` - Provider selection
- **Location 2**: `src/core/direct-functions/research-project-direct.js` - Provider selection
- **Issue**: Similar provider selection logic for research tasks.

#### 1.3.3. Caching Mechanisms

- **Location 1**: `src/research/phase/cache` - Caching implementation
- **Location 2**: `src/research/phase/research-phase.js` - Caching usage
- **Issue**: Redundant caching mechanisms with similar functionality.

## 2. Consolidation Plan

### 2.1. Create Unified Provider Management Module

#### 2.1.1. Create Provider Factory

Create a unified provider factory in `src/providers/provider-factory.js` that:

- Registers all available providers
- Provides methods to get providers by name or capability
- Implements provider selection logic

#### 2.1.2. Standardize Provider Configuration

Create a standardized provider configuration in `src/providers/provider-config.js` that:

- Defines a standard configuration format for all providers
- Loads configuration from environment variables
- Provides methods to get and set configuration

#### 2.1.3. Create Provider Interface

Create a standard provider interface in `src/providers/provider-interface.js` that:

- Defines the methods that all providers must implement
- Provides default implementations for common methods
- Ensures consistent behavior across providers

### 2.2. Create Centralized Error Handling Module

#### 2.2.1. Consolidate Error Types

Consolidate all error types in `src/utils/error-types.js`:

- Define standard error types
- Provide methods to create and check error types
- Ensure consistent error handling

#### 2.2.2. Implement Unified Retry Mechanism

Implement a unified retry mechanism in `src/utils/retry.js`:

- Support exponential backoff
- Support custom retry conditions
- Provide hooks for logging and monitoring

#### 2.2.3. Create Error Formatter

Create a standardized error formatter in `src/utils/error-formatter.js`:

- Format errors consistently
- Support different output formats (console, JSON, etc.)
- Include relevant context information

### 2.3. Refactor Research Module

#### 2.3.1. Create Unified Research Execution Flow

Create a unified research execution flow in `src/research/execution/research-executor.js`:

- Support different research strategies
- Use the provider factory for provider selection
- Implement consistent error handling

#### 2.3.2. Standardize Provider Selection for Research

Standardize provider selection for research in `src/research/providers/research-provider-selector.js`:

- Use the provider factory
- Select providers based on research requirements
- Support fallback providers

#### 2.3.3. Implement Consistent Caching Strategy

Implement a consistent caching strategy in `src/research/cache/research-cache-manager.js`:

- Support different cache backends
- Implement cache invalidation
- Provide methods to get and set cache entries

## 3. Implementation Approach

### 3.1. Phase 1: Create Shared Modules

1. Create the unified provider management module
2. Create the centralized error handling module
3. Create the refactored research module

### 3.2. Phase 2: Update Existing Code

1. Update AI provider imports to use the unified provider management module
2. Update error handling imports to use the centralized error handling module
3. Update research module imports to use the unified research execution flow

### 3.3. Phase 3: Remove Duplicate Code

1. Remove duplicate provider management code
2. Remove duplicate error handling code
3. Remove duplicate research execution code

### 3.4. Phase 4: Test and Validate

1. Run tests to ensure functionality is preserved
2. Fix any issues identified during testing
3. Update documentation to reflect the new structure
