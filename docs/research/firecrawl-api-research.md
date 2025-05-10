# Firecrawl API Research Findings

## Overview

This document provides a comprehensive analysis of the Firecrawl API based on official documentation and testing. It aims to inform our implementation of the Firecrawl provider in the Project-Manager system.

## Research Methodology

- **Research Tools**: Web search, Web fetch
- **Search Terms**: "Firecrawl API documentation", "Firecrawl API endpoints", "Firecrawl question answering", "Firecrawl research capabilities"
- **Date Conducted**: April 28, 2025

## Key Findings

### API Structure and Endpoints

#### Finding 1.1: Available Endpoints in v1 API

The Firecrawl v1 API provides several endpoints, but notably does not include dedicated question answering or research endpoints:

- `/v1/search` - Search endpoint that combines web search with scraping capabilities
- `/v1/scrape` - Scrapes a single URL
- `/v1/crawl` - Crawls a URL and all accessible subpages
- `/v1/map` - Gets all URLs from a website
- `/v1/extract` - Extracts structured data from web pages

**Sources**:

- [Firecrawl API Documentation](https://docs.firecrawl.dev/api-reference/introduction)
- [Firecrawl Search Endpoint Documentation](https://docs.firecrawl.dev/api-reference/endpoint/search)

**Implications for Implementation**:

- We need to adapt our provider implementation to use the `/v1/search` endpoint for both web search and question answering
- There is no direct equivalent for research topics, so we may need to implement this using a combination of search and extraction

#### Finding 1.2: Authentication Method

Firecrawl uses Bearer token authentication with API keys that have an `fc-` prefix:

```
Authorization: Bearer fc-YOUR_API_KEY
```

**Sources**:

- [Firecrawl API Documentation](https://docs.firecrawl.dev/api-reference/introduction)
- [Firecrawl Search Endpoint Documentation](https://docs.firecrawl.dev/api-reference/endpoint/search)

**Implications for Implementation**:

- Our authentication implementation is correct, using Bearer token with the full API key (including the `fc-` prefix)

### Search Endpoint Capabilities

#### Finding 2.1: Search Parameters

The `/v1/search` endpoint accepts the following parameters:

- `query` (required) - The search query
- `limit` (default: 5) - Maximum number of results to return (1-50)
- `tbs` - Time-based search parameter
- `lang` (default: "en") - Language code for search results
- `country` (default: "us") - Country code for search results
- `location` - Location parameter for search results
- `timeout` (default: 60000) - Timeout in milliseconds
- `scrapeOptions` - Options for scraping search results

**Sources**:

- [Firecrawl Search Endpoint Documentation](https://docs.firecrawl.dev/api-reference/endpoint/search)

**Implications for Implementation**:

- Our search implementation should include these parameters
- The `mode` parameter we were using is not supported and should be removed
- The `full_content` parameter we were using is not supported and should be removed

#### Finding 2.2: Search Response Format

The search endpoint returns results in the following format:

```json
{
  "success": true,
  "data": [
    {
      "title": "<string>",
      "description": "<string>",
      "url": "<string>",
      "markdown": "<string>",
      "html": "<string>",
      "rawHtml": "<string>",
      "links": ["<string>"],
      "screenshot": "<string>",
      "metadata": {
        "title": "<string>",
        "description": "<string>",
        "sourceURL": "<string>",
        "statusCode": 123,
        "error": "<string>"
      }
    }
  ],
  "warning": "<string>"
}
```

**Sources**:

- [Firecrawl Search Endpoint Documentation](https://docs.firecrawl.dev/api-reference/endpoint/search)

**Implications for Implementation**:

- Our response parsing needs to handle this format
- We should extract title, description, URL, and snippet from the results

### Advanced Features

#### Finding 3.1: FIRE-1 AI Agent

Firecrawl offers an AI agent called FIRE-1 that can navigate and interact with web pages:

- Can plan and take actions to uncover data
- Can interact with buttons, links, inputs, and dynamic elements
- Can get multiple pages of data that require pagination

**Sources**:

- [Firecrawl FIRE-1 Documentation](https://docs.firecrawl.dev/agents/fire-1)

**Implications for Implementation**:

- This could be useful for more complex research tasks in the future
- Currently not needed for our basic search and question answering implementation

#### Finding 3.2: Deep Research API (Alpha)

Firecrawl mentions a "Deep Research API" in their documentation, but there are no detailed docs available yet as it's in alpha:

**Sources**:

- [Firecrawl Documentation Navigation](https://docs.firecrawl.dev/introduction)

**Implications for Implementation**:

- This could potentially be useful for our research phase in the future
- We should monitor for when this moves out of alpha

### Rate Limits and Billing

#### Finding 4.1: Rate Limits

Firecrawl has the following rate limits:

- Standard endpoints: Varies by tier (free tier appears to be around 30 requests per minute)
- FIRE-1 agent: 10 requests per minute

**Sources**:

- [Firecrawl FIRE-1 Documentation](https://docs.firecrawl.dev/agents/fire-1)
- Our testing results

**Implications for Implementation**:

- Our rate limiting implementation with token bucket is appropriate
- We should configure the free tier to approximately 30 requests per minute

## Answers to Key Questions

### Question 1: What endpoints are available in the Firecrawl v1 API?

The Firecrawl v1 API provides the following endpoints:

- `/v1/search` - Search endpoint that combines web search with scraping capabilities
- `/v1/scrape` - Scrapes a single URL
- `/v1/crawl` - Crawls a URL and all accessible subpages
- `/v1/map` - Gets all URLs from a website
- `/v1/extract` - Extracts structured data from web pages

Notably, there are no dedicated question answering or research endpoints in the v1 API.

### Question 2: How should we implement question answering with Firecrawl?

Since there is no dedicated question answering endpoint, we should use the `/v1/search` endpoint with the question as the query. We can then construct an answer from the search results, using the first result's snippet as the answer and including the other results as sources.

### Question 3: What parameters are supported by the search endpoint?

The search endpoint supports the following parameters:

- `query` (required) - The search query
- `limit` (default: 5) - Maximum number of results to return (1-50)
- `tbs` - Time-based search parameter
- `lang` (default: "en") - Language code for search results
- `country` (default: "us") - Country code for search results
- `location` - Location parameter for search results
- `timeout` (default: 60000) - Timeout in milliseconds
- `scrapeOptions` - Options for scraping search results

The `mode` and `full_content` parameters we were using are not supported in the v1 API.

## Summary of Recommendations

Based on the research findings, we recommend the following approach for implementing the Firecrawl provider:

1. **Authentication**: Continue using Bearer token authentication with the full API key (including the `fc-` prefix)

2. **Web Search**: Use the `/v1/search` endpoint with the following parameters:

   - `query`: The search query
   - `limit`: Number of results to return (default: 5)
   - Remove unsupported parameters like `mode` and `full_content`

3. **Question Answering**: Use the `/v1/search` endpoint with the question as the query, then construct an answer from the search results:

   - Use the first result's snippet as the answer
   - Include the other results as sources
   - Set a default confidence score since Firecrawl doesn't provide one

4. **Research Topics**: For now, implement this using multiple search queries:

   - Break down the research topic into individual questions
   - Use the search endpoint for each question
   - Combine the results into a comprehensive research report

5. **Rate Limiting**: Configure the rate limiter for the free tier to approximately 30 requests per minute

6. **Error Handling**: Implement robust error handling for:

   - Empty search results
   - Rate limit errors (429)
   - Server errors (500+)
   - Network errors

7. **Future Enhancements**: Monitor the development of the Deep Research API and consider integrating it when it moves out of alpha

## Next Steps

1. Update the Firecrawl provider implementation based on these recommendations
2. Test the updated implementation with real API calls
3. Document the limitations and capabilities of the Firecrawl provider
4. Implement robust error handling and fallback mechanisms
