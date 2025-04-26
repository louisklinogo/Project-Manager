import { jest } from '@jest/globals';
import { AIProvider } from '../../../src/providers/ai-provider.js';

// Create mock functions
const mockCompletionsCreate = jest.fn().mockResolvedValue({
  completion: 'This is a mock completion from Claude'
});

const mockMessagesCreate = jest.fn().mockResolvedValue({
  content: [{ text: 'This is a mock message from Claude' }]
});

const mockMessagesStream = jest.fn().mockImplementation(() => {
  return {
    [Symbol.asyncIterator]: async function* () {
      yield { type: 'content_block_delta', delta: { text: 'This ' } };
      yield { type: 'content_block_delta', delta: { text: 'is ' } };
      yield { type: 'content_block_delta', delta: { text: 'a ' } };
      yield { type: 'content_block_delta', delta: { text: 'mock ' } };
      yield { type: 'content_block_delta', delta: { text: 'streaming ' } };
      yield { type: 'content_block_delta', delta: { text: 'response ' } };
      yield { type: 'content_block_delta', delta: { text: 'from ' } };
      yield { type: 'content_block_delta', delta: { text: 'Claude' } };
    }
  };
});

// Mock the Anthropic SDK
jest.unstable_mockModule('@anthropic-ai/sdk', () => {
  return {
    Anthropic: jest.fn().mockImplementation(() => ({
      completions: {
        create: mockCompletionsCreate
      },
      messages: {
        create: mockMessagesCreate,
        stream: mockMessagesStream
      }
    }))
  };
});

describe('ClaudeProvider', () => {
  let ClaudeProvider;
  let Anthropic;
  let provider;
  let originalEnv;

  beforeEach(async () => {
    // Save original environment variables
    originalEnv = { ...process.env };

    // Set up environment variables for testing
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    process.env.DEFAULT_MODEL = 'claude-3-7-sonnet-20250219';
    process.env.MAX_TOKENS = '1000';
    process.env.TEMPERATURE = '0.5';

    // Import the modules after mocking
    const anthropicModule = await import('@anthropic-ai/sdk');
    Anthropic = anthropicModule.Anthropic;

    const claudeModule = await import('../../../src/providers/claude-provider.js');
    ClaudeProvider = claudeModule.ClaudeProvider;

    // Create a new provider instance
    provider = new ClaudeProvider();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;

    // Clear all mocks
    jest.clearAllMocks();
  });

  test('should initialize with environment variables', () => {
    expect(provider.name).toBe('claude');
    expect(provider.apiKey).toBe('test-api-key');
    expect(provider.defaultModel).toBe('claude-3-7-sonnet-20250219');
    expect(provider.defaultMaxTokens).toBe(1000);
    expect(provider.defaultTemperature).toBe(0.5);
  });

  test('should initialize with provided config', () => {
    const config = {
      apiKey: 'custom-api-key',
      model: 'claude-3-opus-20240229',
      maxTokens: 2000,
      temperature: 0.7
    };

    const customProvider = new ClaudeProvider(config);

    expect(customProvider.name).toBe('claude');
    expect(customProvider.apiKey).toBe('custom-api-key');
    expect(customProvider.defaultModel).toBe('claude-3-opus-20240229');
    expect(customProvider.defaultMaxTokens).toBe(2000);
    expect(customProvider.defaultTemperature).toBe(0.7);
  });

  test('should throw error if API key is not provided', () => {
    delete process.env.ANTHROPIC_API_KEY;

    expect(() => new ClaudeProvider()).toThrow('ANTHROPIC_API_KEY is required but not provided');
  });

  test('should get available models', async () => {
    const models = await provider.getAvailableModels();

    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);
    expect(models).toContain('claude-3-7-sonnet-20250219');
    expect(models).toContain('claude-3-opus-20240229');
  });

  test('should generate a completion', async () => {
    const params = {
      prompt: 'Hello, Claude!',
      model: 'claude-3-7-sonnet-20250219',
      maxTokens: 500,
      temperature: 0.3
    };

    const result = await provider.generateCompletion(params);

    // Check that the Anthropic SDK was called with the correct parameters
    expect(Anthropic).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
    expect(Anthropic.mock.results[0].value.completions.create).toHaveBeenCalledWith({
      model: 'claude-3-7-sonnet-20250219',
      prompt: 'Hello, Claude!',
      max_tokens_to_sample: 500,
      temperature: 0.3,
      options: undefined
    });

    // Check the result structure
    expect(result.provider).toBe('claude');
    expect(result.model).toBe('claude-3-7-sonnet-20250219');
    expect(result.completion).toBe('This is a mock completion from Claude');
    expect(result.raw).toBeDefined();
  });

  test('should generate a chat completion', async () => {
    const params = {
      messages: [
        { role: 'user', content: 'Hello, Claude!' }
      ],
      model: 'claude-3-7-sonnet-20250219',
      maxTokens: 500,
      temperature: 0.3
    };

    const result = await provider.generateChatCompletion(params);

    // Check that the Anthropic SDK was called with the correct parameters
    expect(Anthropic).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
    expect(Anthropic.mock.results[0].value.messages.create).toHaveBeenCalledWith({
      model: 'claude-3-7-sonnet-20250219',
      messages: [
        { role: 'user', content: 'Hello, Claude!' }
      ],
      max_tokens: 500,
      temperature: 0.3,
      options: undefined
    });

    // Check the result structure
    expect(result.provider).toBe('claude');
    expect(result.model).toBe('claude-3-7-sonnet-20250219');
    expect(result.message).toBeDefined();
    expect(result.raw).toBeDefined();
  });

  test('should generate a streaming chat completion', async () => {
    const params = {
      messages: [
        { role: 'user', content: 'Hello, Claude!' }
      ],
      model: 'claude-3-7-sonnet-20250219',
      maxTokens: 500,
      temperature: 0.3
    };

    const callback = jest.fn();

    await provider.generateStreamingChatCompletion(params, callback);

    // Check that the Anthropic SDK was called with the correct parameters
    expect(Anthropic).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
    expect(Anthropic.mock.results[0].value.messages.stream).toHaveBeenCalledWith({
      model: 'claude-3-7-sonnet-20250219',
      messages: [
        { role: 'user', content: 'Hello, Claude!' }
      ],
      max_tokens: 500,
      temperature: 0.3,
      options: undefined
    });

    // Check that the callback was called for each chunk
    expect(callback).toHaveBeenCalledTimes(8);
    expect(callback).toHaveBeenCalledWith({
      provider: 'claude',
      model: 'claude-3-7-sonnet-20250219',
      chunk: 'This ',
      raw: { type: 'content_block_delta', delta: { text: 'This ' } }
    });
    expect(callback).toHaveBeenCalledWith({
      provider: 'claude',
      model: 'claude-3-7-sonnet-20250219',
      chunk: 'Claude',
      raw: { type: 'content_block_delta', delta: { text: 'Claude' } }
    });
  });

  test('should use default values if not provided', async () => {
    const params = {
      prompt: 'Hello, Claude!'
    };

    await provider.generateCompletion(params);

    // Check that the Anthropic SDK was called with the default parameters
    expect(Anthropic.mock.results[0].value.completions.create).toHaveBeenCalledWith({
      model: 'claude-3-7-sonnet-20250219',
      prompt: 'Hello, Claude!',
      max_tokens_to_sample: 1000,
      temperature: 0.5,
      options: undefined
    });
  });

  test('should pass additional options to the API', async () => {
    const params = {
      prompt: 'Hello, Claude!',
      options: {
        stop_sequences: ['\n'],
        top_p: 0.9
      }
    };

    await provider.generateCompletion(params);

    // Check that the Anthropic SDK was called with the additional options
    expect(Anthropic.mock.results[0].value.completions.create).toHaveBeenCalledWith({
      model: 'claude-3-7-sonnet-20250219',
      prompt: 'Hello, Claude!',
      max_tokens_to_sample: 1000,
      temperature: 0.5,
      stop_sequences: ['\n'],
      top_p: 0.9
    });
  });
});
