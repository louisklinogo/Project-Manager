/**
 * @fileoverview Demo for Research Synthesis
 *
 * This demo showcases the enhanced research synthesis components,
 * including the Priority Ranker and Conflict Resolver.
 *
 * It demonstrates how to use these components to rank research items
 * by priority and resolve conflicts between them.
 */

import { PriorityRanker } from "../project-manager/src/research/synthesis/priority-ranker.js";
import { ConflictResolver } from "../project-manager/src/research/synthesis/conflict-resolver.js";
import ConfidenceScoreAPI from "../project-manager/src/api/confidence-score-api.js";

// Sample research items
const researchItems = [
  {
    id: "1",
    title: "JavaScript Best Practices",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Best_Practices",
    content: `# JavaScript Best Practices
    
JavaScript has many best practices that can help you write better code. Here are some of them:

1. Use strict mode
2. Use let and const instead of var
3. Use arrow functions
4. Use template literals
5. Use destructuring
6. Use spread and rest operators
7. Use async/await for asynchronous code
8. Use modules
9. Use classes
10. Use promises

Following these best practices will help you write more maintainable and efficient code.
`,
    metadata: {
      publishDate: "2023-05-15",
      author: "MDN Contributors",
      sourceType: "documentation",
    },
  },
  {
    id: "2",
    title: "JavaScript Best Practices for 2023",
    url: "https://blog.example.com/javascript-best-practices-2023",
    content: `# JavaScript Best Practices for 2023
    
As JavaScript continues to evolve, so do the best practices for writing it. Here are the top best practices for 2023:

1. Use TypeScript for type safety
2. Use ESLint and Prettier for code quality
3. Use React or Vue for UI development
4. Use Next.js or Nuxt.js for server-side rendering
5. Use Jest for testing
6. Use Webpack or Vite for bundling
7. Use npm or yarn for package management
8. Use GitHub Actions for CI/CD
9. Use Vercel or Netlify for deployment
10. Use Tailwind CSS for styling

Following these best practices will help you build modern, maintainable JavaScript applications.
`,
    metadata: {
      publishDate: "2023-01-10",
      author: "John Doe",
      sourceType: "blog",
    },
  },
  {
    id: "3",
    title: "JavaScript Performance Tips",
    url: "https://javascript.info/performance",
    content: `# JavaScript Performance Tips
    
JavaScript performance is crucial for building fast web applications. Here are some tips to improve performance:

1. Minimize DOM manipulation
2. Use event delegation
3. Debounce and throttle event handlers
4. Use requestAnimationFrame for animations
5. Use Web Workers for CPU-intensive tasks
6. Use memory profiling to detect leaks
7. Use code splitting to reduce bundle size
8. Use lazy loading for images and components
9. Use caching strategies
10. Use performance monitoring tools

Following these tips will help you build faster JavaScript applications.
`,
    metadata: {
      publishDate: "2022-11-20",
      author: "JavaScript.info",
      sourceType: "tutorial",
    },
  },
  {
    id: "4",
    title: "JavaScript Best Practices",
    url: "https://example.com/outdated-js-tutorial",
    content: `# JavaScript Best Practices
    
Here are some best practices for JavaScript:

1. Use var for variable declarations
2. Use function declarations instead of function expressions
3. Use jQuery for DOM manipulation
4. Use callbacks for asynchronous code
5. Use IIFE for module pattern
6. Use prototype inheritance
7. Use hoisting to your advantage
8. Use global variables sparingly
9. Use strict equality (===) instead of loose equality (==)
10. Use try-catch for error handling

Following these best practices will help you write better JavaScript code.
`,
    metadata: {
      publishDate: "2015-05-20",
      author: "Unknown",
      sourceType: "blog",
    },
  },
  {
    id: "5",
    title: "JavaScript Version History",
    url: "https://en.wikipedia.org/wiki/JavaScript#Version_history",
    content: `# JavaScript Version History
    
JavaScript has evolved significantly since its creation in 1995. Here's a brief history of its versions:

- JavaScript 1.0: Released in 1996
- JavaScript 1.1: Released in 1997
- JavaScript 1.2: Released in 1998
- JavaScript 1.3: Released in 1999
- JavaScript 1.4: Released in 2000
- JavaScript 1.5: Released in 2001
- JavaScript 1.6: Released in 2005
- JavaScript 1.7: Released in 2006
- JavaScript 1.8: Released in 2008
- ECMAScript 5: Released in 2009
- ECMAScript 6 (ES2015): Released in 2015
- ECMAScript 7 (ES2016): Released in 2016
- ECMAScript 8 (ES2017): Released in 2017
- ECMAScript 9 (ES2018): Released in 2018
- ECMAScript 10 (ES2019): Released in 2019
- ECMAScript 11 (ES2020): Released in 2020
- ECMAScript 12 (ES2021): Released in 2021
- ECMAScript 13 (ES2022): Released in 2022
- ECMAScript 14 (ES2023): Released in 2023

Each version has added new features and improvements to the language.
`,
    metadata: {
      publishDate: "2023-03-15",
      author: "Wikipedia Contributors",
      sourceType: "encyclopedia",
    },
  },
];

// Sample conflicts
const conflicts = [
  {
    topic: "JavaScript Best Practices",
    items: [researchItems[0], researchItems[3]],
    conflict: {
      key: "variable_declaration",
      value1: "Use let and const instead of var",
      value2: "Use var for variable declarations",
      severity: 1.0,
    },
  },
  {
    topic: "JavaScript Best Practices",
    items: [researchItems[0], researchItems[3]],
    conflict: {
      key: "async_code",
      value1: "Use async/await for asynchronous code",
      value2: "Use callbacks for asynchronous code",
      severity: 0.8,
    },
  },
  {
    topic: "JavaScript Version",
    items: [researchItems[4], researchItems[1]],
    conflict: {
      key: "latest_version",
      value1: "ECMAScript 14 (ES2023)",
      value2: "TypeScript",
      severity: 0.7,
    },
  },
];

/**
 * Run the demo
 */
async function runDemo() {
  console.log("Research Synthesis Demo");
  console.log("=======================\n");

  // Step 1: Create Confidence Score API
  console.log("Step 1: Creating Confidence Score API...");
  const confidenceApi = new ConfidenceScoreAPI();

  // Step 2: Create Priority Ranker
  console.log("\nStep 2: Creating Priority Ranker...");
  const ranker = new PriorityRanker({ confidenceApi });

  // Step 3: Rank research items
  console.log("\nStep 3: Ranking research items...");
  const rankedItems = await ranker.rankItems(researchItems, {
    query: "JavaScript best practices",
  });

  console.log("Ranked items:");
  for (let i = 0; i < rankedItems.length; i++) {
    const item = rankedItems[i];
    console.log(
      `${i + 1}. ${item.item.title} (Score: ${item.weightedScore.toFixed(2)})`,
    );
    console.log(`   - Confidence: ${item.scores.confidence.toFixed(2)}`);
    console.log(`   - Relevance: ${item.scores.relevance.toFixed(2)}`);
    console.log(`   - Recency: ${item.scores.recency.toFixed(2)}`);
    console.log(`   - Specificity: ${item.scores.specificity.toFixed(2)}`);
  }

  // Step 4: Get top items
  console.log("\nStep 4: Getting top 3 items...");
  const topItems = await ranker.getTopItems(researchItems, 3, {
    query: "JavaScript best practices",
  });

  console.log("Top 3 items:");
  for (let i = 0; i < topItems.length; i++) {
    console.log(`${i + 1}. ${topItems[i].title}`);
  }

  // Step 5: Filter by minimum score
  console.log("\nStep 5: Filtering by minimum score (0.7)...");
  const filteredItems = await ranker.filterByMinScore(researchItems, 0.7, {
    query: "JavaScript best practices",
  });

  console.log("Filtered items:");
  for (let i = 0; i < filteredItems.length; i++) {
    console.log(`${i + 1}. ${filteredItems[i].title}`);
  }

  // Step 6: Create Conflict Resolver
  console.log("\nStep 6: Creating Conflict Resolver...");
  const resolver = new ConflictResolver({ ranker, confidenceApi });

  // Step 7: Resolve conflicts
  console.log("\nStep 7: Resolving conflicts...");
  const resolutionResults = await resolver.resolveConflicts(conflicts, {
    preferRecent: true,
    preferConfident: true,
  });

  console.log("Resolved conflicts:");
  for (let i = 0; i < resolutionResults.resolvedConflicts.length; i++) {
    const { conflict, resolution } = resolutionResults.resolvedConflicts[i];
    console.log(`${i + 1}. ${conflict.topic} - ${conflict.conflict.key}`);
    console.log(`   - Value 1: ${conflict.conflict.value1}`);
    console.log(`   - Value 2: ${conflict.conflict.value2}`);
    console.log(`   - Resolution: ${resolution.value}`);
    console.log(`   - Method: ${resolution.method}`);
    console.log(`   - Confidence: ${resolution.confidence.toFixed(2)}`);
    console.log(
      `   - Explanation: ${resolver.getResolutionExplanation(resolution)}`,
    );
  }

  console.log("\nUnresolved conflicts:");
  for (let i = 0; i < resolutionResults.unresolvedConflicts.length; i++) {
    const { conflict, resolution } = resolutionResults.unresolvedConflicts[i];
    console.log(`${i + 1}. ${conflict.topic} - ${conflict.conflict.key}`);
    console.log(`   - Value 1: ${conflict.conflict.value1}`);
    console.log(`   - Value 2: ${conflict.conflict.value2}`);
    console.log(`   - Method: ${resolution.method}`);
  }

  // Step 8: Apply resolutions
  console.log("\nStep 8: Applying resolutions...");
  const updatedItems = resolver.applyResolutions(
    researchItems,
    resolutionResults,
  );

  console.log("Updated items with resolutions:");
  for (const item of updatedItems) {
    if (item.metadata) {
      const resolutionKeys = Object.keys(item.metadata).filter((key) =>
        key.startsWith("resolved_"),
      );

      if (resolutionKeys.length > 0) {
        console.log(`- ${item.title}:`);

        for (const key of resolutionKeys) {
          const baseKey = key.replace("resolved_", "");
          console.log(`  - ${baseKey}: ${item.metadata[key]}`);
          console.log(
            `    - Confidence: ${item.metadata[`resolution_confidence_${baseKey}`]}`,
          );
          console.log(
            `    - Method: ${item.metadata[`resolution_method_${baseKey}`]}`,
          );
        }
      }
    }
  }

  console.log("\nDemo completed successfully!");
}

// Run the demo
runDemo().catch((error) => {
  console.error("Error running demo:", error);
});
