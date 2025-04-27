/**
 * Tests for the prompt template system
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { PromptTemplate, promptManager } from '../../../src/core/prompts/prompt-template.js';

describe('PromptTemplate', () => {
  test('should create a template with variables', () => {
    const template = new PromptTemplate('Hello, <name>World</name>!', { name: 'greeting' });
    expect(template.variables).toContain('name');
    expect(template.name).toBe('greeting');
  });

  test('should render a template with variables', () => {
    const template = new PromptTemplate('Hello, <name>World</name>!');
    const rendered = template.render({ name: 'John' });
    expect(rendered).toBe('Hello, John!');
  });

  test('should throw an error if required variables are missing', () => {
    const template = new PromptTemplate('Hello, <name>World</name>!');
    expect(() => template.render({})).toThrow('Missing required variables: name');
  });

  test('should extend a template', () => {
    const template = new PromptTemplate('Hello, <name>World</name>!');
    const extended = template.extend('How are you?');
    expect(extended.template).toBe('Hello, <name>World</name>!\n\nHow are you?');
    expect(extended.variables).toContain('name');
  });
});

describe('PromptTemplateManager', () => {
  beforeEach(() => {
    // Clear all templates before each test
    promptManager.templates.clear();
  });

  test('should register a template', () => {
    const template = new PromptTemplate('Hello, <name>World</name>!', { name: 'greeting' });
    promptManager.register('greeting', template);
    expect(promptManager.has('greeting')).toBe(true);
  });

  test('should get a template by name', () => {
    const template = new PromptTemplate('Hello, <name>World</name>!', { name: 'greeting' });
    promptManager.register('greeting', template);
    const retrieved = promptManager.get('greeting');
    expect(retrieved).toBe(template);
  });

  test('should render a template with variables', () => {
    const template = new PromptTemplate('Hello, <name>World</name>!', { name: 'greeting' });
    promptManager.register('greeting', template);
    const rendered = promptManager.render('greeting', { name: 'John' });
    expect(rendered).toBe('Hello, John!');
  });

  test('should throw an error if template does not exist', () => {
    expect(() => promptManager.render('nonexistent', {})).toThrow('Template not found: nonexistent');
  });

  test('should remove a template', () => {
    const template = new PromptTemplate('Hello, <name>World</name>!', { name: 'greeting' });
    promptManager.register('greeting', template);
    expect(promptManager.has('greeting')).toBe(true);
    promptManager.remove('greeting');
    expect(promptManager.has('greeting')).toBe(false);
  });

  test('should get all template names', () => {
    promptManager.register('greeting1', new PromptTemplate('Hello, <name>World</name>!'));
    promptManager.register('greeting2', new PromptTemplate('Hi, <name>World</name>!'));
    const names = promptManager.getTemplateNames();
    expect(names).toContain('greeting1');
    expect(names).toContain('greeting2');
    expect(names.length).toBe(2);
  });
});
