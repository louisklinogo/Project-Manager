/**
 * Tests for the PocketFlow implementation
 */

import { describe, test, expect, jest } from '@jest/globals';
import {
  Node,
  Flow,
  Memory,
  BatchNode,
  AsyncNode,
  AsyncFlow,
  AsyncBatchNode
} from '../../../../src/core/flow/index.js';

describe('PocketFlow', () => {
  describe('Node', () => {
    test('should create a node with default options', () => {
      const node = new Node();
      expect(node).toBeInstanceOf(Node);
      expect(node.id).toBeDefined();
      expect(node.name).toBe('Node');
    });

    test('should create a node with custom options', () => {
      const node = new Node({ id: 'test-id', name: 'TestNode', description: 'Test node' });
      expect(node.id).toBe('test-id');
      expect(node.name).toBe('TestNode');
      expect(node.description).toBe('Test node');
    });

    test('should process data through prep, exec, and post methods', () => {
      const node = new Node();

      // Spy on the methods
      jest.spyOn(node, 'prep');
      jest.spyOn(node, 'exec');
      jest.spyOn(node, 'post');

      const data = { value: 42 };
      const result = node.process(data);

      expect(node.prep).toHaveBeenCalledWith(data);
      expect(node.exec).toHaveBeenCalledWith(data);
      expect(node.post).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });

    test('should allow overriding prep, exec, and post methods', () => {
      class CustomNode extends Node {
        prep(data) {
          return { ...data, prepped: true };
        }

        exec(data) {
          return { ...data, executed: true };
        }

        post(data) {
          return { ...data, posted: true };
        }
      }

      const node = new CustomNode();
      const data = { value: 42 };
      const result = node.process(data);

      expect(result).toEqual({
        value: 42,
        prepped: true,
        executed: true,
        posted: true
      });
    });
  });

  describe('Memory', () => {
    test('should create a memory with default options', () => {
      const memory = new Memory();
      expect(memory).toBeInstanceOf(Memory);
      expect(memory.size()).toBe(0);
    });

    test('should create a memory with initial data', () => {
      const memory = new Memory({ key1: 'value1', key2: 'value2' });
      expect(memory.size()).toBe(2);
      expect(memory.get('key1')).toBe('value1');
      expect(memory.get('key2')).toBe('value2');
    });

    test('should set and get values', () => {
      const memory = new Memory();
      memory.set('key', 'value');
      expect(memory.get('key')).toBe('value');
    });

    test('should check if a key exists', () => {
      const memory = new Memory();
      memory.set('key', 'value');
      expect(memory.has('key')).toBe(true);
      expect(memory.has('nonexistent')).toBe(false);
    });

    test('should delete a value', () => {
      const memory = new Memory();
      memory.set('key', 'value');
      expect(memory.has('key')).toBe(true);
      memory.delete('key');
      expect(memory.has('key')).toBe(false);
    });

    test('should clear all values', () => {
      const memory = new Memory();
      memory.set('key1', 'value1');
      memory.set('key2', 'value2');
      expect(memory.size()).toBe(2);
      memory.clear();
      expect(memory.size()).toBe(0);
    });

    test('should get keys, values, and entries', () => {
      const memory = new Memory();
      memory.set('key1', 'value1');
      memory.set('key2', 'value2');

      expect(memory.keys()).toEqual(['key1', 'key2']);
      expect(memory.values()).toEqual(['value1', 'value2']);
      expect(memory.entries()).toEqual([['key1', 'value1'], ['key2', 'value2']]);
    });

    test('should convert to a plain object', () => {
      const memory = new Memory();
      memory.set('key1', 'value1');
      memory.set('key2', 'value2');

      expect(memory.toObject()).toEqual({ key1: 'value1', key2: 'value2' });
    });

    test('should set multiple values at once', () => {
      const memory = new Memory();
      memory.setAll({ key1: 'value1', key2: 'value2', key3: 'value3' });

      expect(memory.get('key1')).toBe('value1');
      expect(memory.get('key2')).toBe('value2');
      expect(memory.get('key3')).toBe('value3');
    });

    test('should get multiple values at once', () => {
      const memory = new Memory();
      memory.set('key1', 'value1');
      memory.set('key2', 'value2');
      memory.set('key3', 'value3');

      expect(memory.getAll(['key1', 'key3'])).toEqual({
        key1: 'value1',
        key3: 'value3'
      });

      expect(memory.getAll(['key1', 'nonexistent'])).toEqual({
        key1: 'value1',
        nonexistent: undefined
      });
    });

    test('should delete multiple values at once', () => {
      const memory = new Memory();
      memory.set('key1', 'value1');
      memory.set('key2', 'value2');
      memory.set('key3', 'value3');

      memory.deleteAll(['key1', 'key3']);

      expect(memory.has('key1')).toBe(false);
      expect(memory.has('key2')).toBe(true);
      expect(memory.has('key3')).toBe(false);
    });

    test('should generate a string representation', () => {
      const memory = new Memory();
      memory.set('key1', 'value1');
      memory.set('key2', 'value2');

      const str = memory.toString();
      expect(str).toContain('"key1": "value1"');
      expect(str).toContain('"key2": "value2"');
    });
  });

  describe('Flow', () => {
    test('should create a flow with default options', () => {
      const flow = new Flow();
      expect(flow).toBeInstanceOf(Flow);
      expect(flow.id).toBeDefined();
      expect(flow.name).toBe('Flow');
      expect(flow.nodes).toEqual([]);
      expect(flow.memory).toBeInstanceOf(Memory);
    });

    test('should create a flow with custom options', () => {
      const memory = new Memory();
      const flow = new Flow({
        id: 'test-id',
        name: 'TestFlow',
        description: 'Test flow',
        memory,
        storeIntermediateResults: true
      });

      expect(flow.id).toBe('test-id');
      expect(flow.name).toBe('TestFlow');
      expect(flow.description).toBe('Test flow');
      expect(flow.memory).toBe(memory);
      expect(flow.storeIntermediateResults).toBe(true);
    });

    test('should add nodes to the flow', () => {
      const flow = new Flow();
      const node1 = new Node({ name: 'Node1' });
      const node2 = new Node({ name: 'Node2' });

      flow.add(node1).add(node2);

      expect(flow.nodes).toEqual([node1, node2]);
      expect(flow.size()).toBe(2);
    });

    test('should throw an error when adding a non-node', () => {
      const flow = new Flow();
      expect(() => flow.add({})).toThrow('Node must be an instance of Node class');
    });

    test('should run the flow with input data', () => {
      const flow = new Flow({ storeIntermediateResults: true });

      // Create nodes that modify the data
      class Node1 extends Node {
        exec(data) {
          return { ...data, node1: true };
        }
      }

      class Node2 extends Node {
        exec(data) {
          return { ...data, node2: true };
        }
      }

      flow.add(new Node1({ name: 'Node1' })).add(new Node2({ name: 'Node2' }));

      const data = { value: 42 };
      const result = flow.run(data);

      expect(result).toEqual({
        value: 42,
        node1: true,
        node2: true
      });

      // Check that intermediate results were stored
      expect(flow.memory.get('input')).toEqual(data);
      expect(flow.memory.get('output')).toEqual(result);
    });

    test('should handle errors in nodes', () => {
      const flow = new Flow({
        storeIntermediateResults: true,
        continueOnError: true
      });

      // Create nodes, one of which throws an error
      class Node1 extends Node {
        exec(data) {
          return { ...data, node1: true };
        }
      }

      class Node2 extends Node {
        exec() {
          throw new Error('Node2 error');
        }
      }

      class Node3 extends Node {
        exec(data) {
          return { ...data, node3: true };
        }
      }

      const node1 = new Node1({ name: 'Node1' });
      const node2 = new Node2({ name: 'Node2' });
      const node3 = new Node3({ name: 'Node3' });

      flow.add(node1).add(node2).add(node3);

      const data = { value: 42 };
      const result = flow.run(data);

      // The flow should continue after the error
      expect(result).toEqual({
        value: 42,
        node1: true,
        node3: true
      });

      // Check that the error was stored
      expect(flow.memory.get('node_1_' + node2.id + '_error')).toBeInstanceOf(Error);
    });

    test('should throw errors by default', () => {
      const flow = new Flow();

      // Create a node that throws an error
      class ErrorNode extends Node {
        exec() {
          throw new Error('Test error');
        }
      }

      flow.add(new ErrorNode({ name: 'ErrorNode' }));

      expect(() => flow.run({ value: 42 })).toThrow('Test error');
    });

    test('should get nodes by index and ID', () => {
      const flow = new Flow();
      const node1 = new Node({ id: 'node1', name: 'Node1' });
      const node2 = new Node({ id: 'node2', name: 'Node2' });

      flow.add(node1).add(node2);

      expect(flow.getNode(0)).toBe(node1);
      expect(flow.getNode(1)).toBe(node2);
      expect(flow.getNodeById('node1')).toBe(node1);
      expect(flow.getNodeById('node2')).toBe(node2);
    });

    test('should throw errors for invalid node indices and IDs', () => {
      const flow = new Flow();
      const node = new Node({ id: 'node1', name: 'Node1' });

      flow.add(node);

      expect(() => flow.getNode(-1)).toThrow('Node index -1 out of bounds');
      expect(() => flow.getNode(1)).toThrow('Node index 1 out of bounds');
      expect(() => flow.getNodeById('nonexistent')).toThrow('Node with ID nonexistent not found');
    });

    test('should clear all nodes', () => {
      const flow = new Flow();
      flow.add(new Node()).add(new Node());

      expect(flow.size()).toBe(2);
      flow.clear();
      expect(flow.size()).toBe(0);
    });

    test('should add multiple nodes at once', () => {
      const flow = new Flow();
      const node1 = new Node({ name: 'Node1' });
      const node2 = new Node({ name: 'Node2' });
      const node3 = new Node({ name: 'Node3' });

      flow.addAll([node1, node2, node3]);

      expect(flow.size()).toBe(3);
      expect(flow.getNode(0)).toBe(node1);
      expect(flow.getNode(1)).toBe(node2);
      expect(flow.getNode(2)).toBe(node3);
    });

    test('should insert a node at a specific position', () => {
      const flow = new Flow();
      const node1 = new Node({ name: 'Node1' });
      const node2 = new Node({ name: 'Node2' });
      const node3 = new Node({ name: 'Node3' });

      flow.add(node1).add(node3);
      flow.insert(1, node2);

      expect(flow.size()).toBe(3);
      expect(flow.getNode(0)).toBe(node1);
      expect(flow.getNode(1)).toBe(node2);
      expect(flow.getNode(2)).toBe(node3);
    });

    test('should throw an error when inserting at an invalid index', () => {
      const flow = new Flow();
      const node = new Node();

      expect(() => flow.insert(-1, node)).toThrow('Index -1 out of bounds');
      expect(() => flow.insert(1, node)).toThrow('Index 1 out of bounds');
    });

    test('should remove a node by reference', () => {
      const flow = new Flow();
      const node1 = new Node({ name: 'Node1' });
      const node2 = new Node({ name: 'Node2' });
      const node3 = new Node({ name: 'Node3' });

      flow.add(node1).add(node2).add(node3);
      flow.remove(node2);

      expect(flow.size()).toBe(2);
      expect(flow.getNode(0)).toBe(node1);
      expect(flow.getNode(1)).toBe(node3);
    });

    test('should remove a node by ID', () => {
      const flow = new Flow();
      const node1 = new Node({ id: 'node1', name: 'Node1' });
      const node2 = new Node({ id: 'node2', name: 'Node2' });
      const node3 = new Node({ id: 'node3', name: 'Node3' });

      flow.add(node1).add(node2).add(node3);
      flow.remove('node2');

      expect(flow.size()).toBe(2);
      expect(flow.getNode(0)).toBe(node1);
      expect(flow.getNode(1)).toBe(node3);
    });

    test('should get nodes by name', () => {
      const flow = new Flow();
      const node1 = new Node({ name: 'TestNode' });
      const node2 = new Node({ name: 'OtherNode' });
      const node3 = new Node({ name: 'TestNode' });

      flow.add(node1).add(node2).add(node3);

      const testNodes = flow.getNodesByName('TestNode');
      expect(testNodes).toHaveLength(2);
      expect(testNodes).toContain(node1);
      expect(testNodes).toContain(node3);

      const otherNodes = flow.getNodesByName('OtherNode');
      expect(otherNodes).toHaveLength(1);
      expect(otherNodes).toContain(node2);

      const nonexistentNodes = flow.getNodesByName('NonexistentNode');
      expect(nonexistentNodes).toHaveLength(0);
    });

    test('should generate a string representation', () => {
      const flow = new Flow({ id: 'test-flow', name: 'TestFlow' });
      flow.add(new Node()).add(new Node());

      expect(flow.toString()).toBe('TestFlow (test-flow) with 2 nodes');
    });

    test('should generate a detailed description', () => {
      const flow = new Flow({
        id: 'test-flow',
        name: 'TestFlow',
        description: 'A test flow'
      });

      const node1 = new Node({ id: 'node1', name: 'Node1', description: 'First node' });
      const node2 = new Node({ id: 'node2', name: 'Node2' });

      flow.add(node1).add(node2);

      const description = flow.describe();
      expect(description).toContain('Flow: TestFlow (test-flow)');
      expect(description).toContain('Description: A test flow');
      expect(description).toContain('Nodes: 2');
      expect(description).toContain('1. Node1 (node1)');
      expect(description).toContain('First node');
      expect(description).toContain('2. Node2 (node2)');
    });
  });

  // Additional tests for BatchNode, AsyncNode, AsyncFlow, and AsyncBatchNode
  // would be added here in a real implementation
});
