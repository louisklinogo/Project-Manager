/**
 * Tests for decision justifier
 */

import { DecisionJustifier } from '../../../../src/research/integration/decision-justifier.js';
import { ResearchReference } from '../../../../src/models/research-reference.js';
import { jest } from '@jest/globals';

// Mock the getBestAvailableProvider function
jest.mock('../../../../src/providers/index.js', () => ({
  getBestAvailableProvider: jest.fn().mockResolvedValue({
    name: 'mock',
    generateChatCompletion: jest.fn().mockResolvedValue({
      message: {
        justification: 'This decision is justified by the research.',
        confidence: 0.8,
        references: [
          {
            researchId: 'research-1',
            type: 'source',
            content: '',
            relevance: 0.9
          },
          {
            researchId: 'research-1',
            type: 'finding',
            content: 'Key finding from research',
            relevance: 0.8
          }
        ]
      }
    })
  })
}));

describe('DecisionJustifier', () => {
  // Sample research items for testing
  const researchItem1 = {
    id: 'research-1',
    title: 'JavaScript Best Practices',
    content: 'Use const and let instead of var. Arrow functions are preferred for better this binding. Always use strict mode.\n\n- Use descriptive variable names\n- Keep functions small and focused\n- Use modern ES6+ features',
    url: 'https://example.com/js-best-practices',
    metadata: {
      publishedDate: new Date().toISOString(),
      confidence: 0.9
    }
  };
  
  const researchItem2 = {
    id: 'research-2',
    title: 'Modern JavaScript Development',
    content: 'Modern JavaScript development relies on tools like webpack, Babel, and ESLint. Use npm or yarn for package management.\n\n- Set up proper tooling\n- Use a consistent code style\n- Implement automated testing',
    url: 'https://example.com/modern-js',
    metadata: {
      publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days old
      confidence: 0.8
    }
  };
  
  const researchItems = [researchItem1, researchItem2];
  
  test('should create a decision justifier with default options', () => {
    const justifier = new DecisionJustifier();
    
    expect(justifier).toBeInstanceOf(DecisionJustifier);
    expect(justifier.useAI).toBe(true);
  });
  
  test('should create a decision justifier with custom options', () => {
    const justifier = new DecisionJustifier({
      useAI: false
    });
    
    expect(justifier).toBeInstanceOf(DecisionJustifier);
    expect(justifier.useAI).toBe(false);
  });
  
  test('justifyDecision should justify a decision using AI', async () => {
    const justifier = new DecisionJustifier();
    
    const decision = {
      id: 'decision-1',
      title: 'Use ES6 Features',
      description: 'We will use modern JavaScript ES6 features in this project.'
    };
    
    const justification = await justifier.justifyDecision(decision, researchItems);
    
    expect(justification).toHaveProperty('decision');
    expect(justification).toHaveProperty('justification');
    expect(justification).toHaveProperty('confidence');
    expect(justification).toHaveProperty('references');
    
    expect(justification.decision).toEqual(decision);
    expect(typeof justification.justification).toBe('string');
    expect(typeof justification.confidence).toBe('number');
    expect(Array.isArray(justification.references)).toBe(true);
    
    // References should be ResearchReference instances
    justification.references.forEach(reference => {
      expect(reference).toBeInstanceOf(ResearchReference);
    });
  });
  
  test('justifyDecision should handle empty research items', async () => {
    const justifier = new DecisionJustifier();
    
    const decision = {
      id: 'decision-1',
      title: 'Use ES6 Features',
      description: 'We will use modern JavaScript ES6 features in this project.'
    };
    
    const justification = await justifier.justifyDecision(decision, []);
    
    expect(justification).toHaveProperty('decision');
    expect(justification).toHaveProperty('justification');
    expect(justification).toHaveProperty('confidence');
    expect(justification).toHaveProperty('references');
    
    expect(justification.decision).toEqual(decision);
    expect(justification.justification).toContain('No research available');
    expect(justification.confidence).toBe(0);
    expect(justification.references).toEqual([]);
  });
  
  test('justifyWithRules should justify a decision using rule-based methods', async () => {
    const justifier = new DecisionJustifier({ useAI: false });
    
    const decision = {
      id: 'decision-1',
      title: 'Use ES6 Features',
      description: 'We will use modern JavaScript ES6 features in this project.'
    };
    
    const justification = await justifier.justifyDecision(decision, researchItems);
    
    expect(justification).toHaveProperty('decision');
    expect(justification).toHaveProperty('justification');
    expect(justification).toHaveProperty('confidence');
    expect(justification).toHaveProperty('references');
    
    expect(justification.decision).toEqual(decision);
    expect(typeof justification.justification).toBe('string');
    expect(typeof justification.confidence).toBe('number');
    expect(Array.isArray(justification.references)).toBe(true);
  });
  
  test('extractDecisionText should extract text from different decision formats', () => {
    const justifier = new DecisionJustifier();
    
    // String decision
    expect(justifier.extractDecisionText('Test decision')).toBe('Test decision');
    
    // Object with text property
    expect(justifier.extractDecisionText({ text: 'Test decision' })).toBe('Test decision');
    
    // Object with description property
    expect(justifier.extractDecisionText({ description: 'Test decision' })).toBe('Test decision');
    
    // Object with content property
    expect(justifier.extractDecisionText({ content: 'Test decision' })).toBe('Test decision');
    
    // Object with title property
    expect(justifier.extractDecisionText({ title: 'Test decision' })).toBe('Test decision');
    
    // Complex object
    expect(justifier.extractDecisionText({ id: 'test', name: 'Test' })).toBe('{"id":"test","name":"Test"}');
    
    // Non-string, non-object
    expect(justifier.extractDecisionText(123)).toBe('123');
  });
  
  test('findRelevantResearch should find research items relevant to a decision', () => {
    const justifier = new DecisionJustifier();
    
    const decisionText = 'We will use modern JavaScript ES6 features in this project.';
    
    const relevantItems = justifier.findRelevantResearch(decisionText, researchItems);
    
    expect(Array.isArray(relevantItems)).toBe(true);
    expect(relevantItems.length).toBeGreaterThan(0);
    
    // Items should be sorted by relevance
    for (let i = 1; i < relevantItems.length; i++) {
      expect(relevantItems[i - 1].relevance).toBeGreaterThanOrEqual(relevantItems[i].relevance);
    }
    
    // Each item should have required properties
    relevantItems.forEach(item => {
      expect(item).toHaveProperty('item');
      expect(item).toHaveProperty('relevance');
      
      expect(typeof item.relevance).toBe('number');
      expect(item.relevance).toBeGreaterThan(0);
      expect(item.relevance).toBeLessThanOrEqual(1);
    });
  });
  
  test('calculateRelevance should return appropriate relevance score', () => {
    const justifier = new DecisionJustifier();
    
    // High relevance
    const highRelevanceText = 'JavaScript ES6 features and best practices';
    expect(justifier.calculateRelevance(highRelevanceText, researchItem1)).toBeGreaterThan(0.5);
    
    // Medium relevance
    const mediumRelevanceText = 'Modern development tools';
    expect(justifier.calculateRelevance(mediumRelevanceText, researchItem2)).toBeGreaterThan(0.3);
    
    // Low relevance
    const lowRelevanceText = 'Python data analysis';
    expect(justifier.calculateRelevance(lowRelevanceText, researchItem1)).toBeLessThan(0.3);
    
    // Use relevance from metadata if available
    const itemWithRelevance = {
      ...researchItem1,
      metadata: {
        ...researchItem1.metadata,
        relevance: 0.75
      }
    };
    expect(justifier.calculateRelevance('Any text', itemWithRelevance)).toBe(0.75);
  });
  
  test('extractRelevantSentences should extract sentences relevant to a decision', () => {
    const justifier = new DecisionJustifier();
    
    const decisionText = 'JavaScript ES6 features';
    const content = 'JavaScript ES6 was released in 2015. It introduced many new features like arrow functions and let/const declarations. Python is another popular programming language.';
    
    const sentences = justifier.extractRelevantSentences(decisionText, content);
    
    expect(Array.isArray(sentences)).toBe(true);
    expect(sentences.length).toBeGreaterThan(0);
    
    // Most relevant sentence should be first
    expect(sentences[0]).toContain('JavaScript ES6');
    
    // Less relevant sentence should not be included
    expect(sentences.some(s => s.includes('Python'))).toBe(false);
  });
  
  test('extractKeyFindings should extract findings from content', () => {
    const justifier = new DecisionJustifier();
    
    const findings = justifier.extractKeyFindings(researchItem1.content);
    
    expect(Array.isArray(findings)).toBe(true);
    expect(findings.length).toBeGreaterThan(0);
    
    // Should extract bullet points
    expect(findings.some(finding => finding.includes('descriptive variable names'))).toBe(true);
    
    // Should extract sentences with key phrases
    const contentWithKeyPhrases = 'It is important to validate user input. You should always sanitize data from external sources.';
    const phrasesFindings = justifier.extractKeyFindings(contentWithKeyPhrases);
    
    expect(phrasesFindings.some(finding => finding.includes('important to validate'))).toBe(true);
    expect(phrasesFindings.some(finding => finding.includes('should always sanitize'))).toBe(true);
  });
  
  test('createJustificationPrompt should generate a valid prompt', () => {
    const justifier = new DecisionJustifier();
    
    const decision = {
      id: 'decision-1',
      title: 'Use ES6 Features',
      description: 'We will use modern JavaScript ES6 features in this project.'
    };
    
    const prompt = justifier.createJustificationPrompt(decision, researchItems);
    
    expect(prompt).toContain('We will use modern JavaScript ES6 features in this project');
    expect(prompt).toContain(researchItem1.title);
    expect(prompt).toContain(researchItem2.title);
    expect(prompt).toContain('justification');
    expect(prompt).toContain('confidence');
    expect(prompt).toContain('references');
  });
  
  test('parseJustificationResult should handle various formats', () => {
    const justifier = new DecisionJustifier();
    
    // Test with object
    const objectResult = {
      justification: 'Test justification',
      confidence: 0.8,
      references: [{ researchId: 'test', type: 'source' }]
    };
    
    const parsed1 = justifier.parseJustificationResult(objectResult);
    expect(parsed1.justification).toBe(objectResult.justification);
    expect(parsed1.confidence).toBe(objectResult.confidence);
    expect(parsed1.references).toEqual(objectResult.references);
    
    // Test with JSON string in code block
    const jsonBlockResult = '```json\n{"justification":"Test justification","confidence":0.8,"references":[{"researchId":"test","type":"source"}]}\n```';
    
    const parsed2 = justifier.parseJustificationResult(jsonBlockResult);
    expect(parsed2.justification).toBe('Test justification');
    expect(parsed2.confidence).toBe(0.8);
    expect(parsed2.references).toEqual([{ researchId: 'test', type: 'source' }]);
    
    // Test with plain text
    const textResult = 'Justification: This is a justification.\n\nConfidence: 0.7';
    
    const parsed3 = justifier.parseJustificationResult(textResult);
    expect(parsed3.justification).toContain('This is a justification');
    expect(parsed3.confidence).toBe(0.7);
  });
});
