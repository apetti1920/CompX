import { Vector2D } from '@compx/common/Types';
import { BlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import GraphReducer from '../../../src/store/reducers/graphreducers';
import { AddBlockActionType } from '../../../src/store/actions/actiontypes';
import { defaultState, StateType } from '../../../src/store/types';

describe('GraphReducer - ADD_BLOCK Action', () => {
  let initialState: StateType;

  beforeEach(() => {
    // Create a fresh copy of default state for each test
    initialState = JSON.parse(JSON.stringify(defaultState));
  });

  describe('Block Creation', () => {
    const mockBlockTemplate: BlockStorageType<['NUMBER'], ['NUMBER']> = {
      name: 'TestBlock',
      description: 'A test block for unit testing',
      tags: ['test', 'unit'],
      inputPorts: [{ name: 'input1', type: 'NUMBER', initialValue: 0 }],
      outputPorts: [{ name: 'output1', type: 'NUMBER', initialValue: 0 }],
      callbackString: 'return [inputPort[input1]]'
    };

    test('should add a block with correct structure', () => {
      const position = new Vector2D(100, 200);
      const action = {
        type: AddBlockActionType,
        payload: {
          blockTemplate: mockBlockTemplate,
          position
        }
      };

      const newState = GraphReducer(initialState, action);

      expect(newState.currentGraph.graph.blocks.length).toBe(1);
      const addedBlock = newState.currentGraph.graph.blocks[0];

      // Verify block properties
      expect(addedBlock.name).toBe('TestBlock');
      expect(addedBlock.visualName).toBe('TestBlock');
      expect(addedBlock.description).toBe('A test block for unit testing');
      expect(addedBlock.tags).toEqual(['test', 'unit']);
      expect(addedBlock.position).toEqual(position);
      expect(addedBlock.size).toEqual(new Vector2D(30, 30));
      expect(addedBlock.mirrored).toBe(false);
      expect(addedBlock.shape).toBe('rect');
      expect(addedBlock.color).toBe('#3b82f6');
    });

    test('should generate unique IDs for block and ports', () => {
      const position = new Vector2D(50, 75);
      const action = {
        type: AddBlockActionType,
        payload: {
          blockTemplate: mockBlockTemplate,
          position
        }
      };

      const newState = GraphReducer(initialState, action);
      const addedBlock = newState.currentGraph.graph.blocks[0];

      // Block should have an ID
      expect(addedBlock.id).toBeDefined();
      expect(typeof addedBlock.id).toBe('string');

      // Input ports should have IDs
      expect(addedBlock.inputPorts.length).toBe(1);
      expect(addedBlock.inputPorts[0].id).toBeDefined();
      expect(typeof addedBlock.inputPorts[0].id).toBe('string');

      // Output ports should have IDs
      expect(addedBlock.outputPorts.length).toBe(1);
      expect(addedBlock.outputPorts[0].id).toBeDefined();
      expect(typeof addedBlock.outputPorts[0].id).toBe('string');

      // All IDs should be unique
      const ids = [addedBlock.id, addedBlock.inputPorts[0].id, addedBlock.outputPorts[0].id];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    test('should add multiple blocks without conflicts', () => {
      const position1 = new Vector2D(0, 0);
      const position2 = new Vector2D(100, 100);

      const action1 = {
        type: AddBlockActionType,
        payload: { blockTemplate: mockBlockTemplate, position: position1 }
      };

      const action2 = {
        type: AddBlockActionType,
        payload: { blockTemplate: mockBlockTemplate, position: position2 }
      };

      let state = GraphReducer(initialState, action1);
      state = GraphReducer(state, action2);

      expect(state.currentGraph.graph.blocks.length).toBe(2);

      // Verify blocks have different IDs
      const block1 = state.currentGraph.graph.blocks[0];
      const block2 = state.currentGraph.graph.blocks[1];
      expect(block1.id).not.toBe(block2.id);

      // Verify positions are correct
      expect(block1.position).toEqual(position1);
      expect(block2.position).toEqual(position2);
    });
  });

  describe('Port Handling', () => {
    test('should preserve port properties from template', () => {
      const multiPortTemplate: BlockStorageType<['NUMBER', 'STRING'], ['NUMBER', 'BOOLEAN']> = {
        name: 'MultiPort',
        description: 'Block with multiple ports',
        tags: ['multi'],
        inputPorts: [
          { name: 'numInput', type: 'NUMBER', initialValue: 42 },
          { name: 'strInput', type: 'STRING', initialValue: 'test' }
        ],
        outputPorts: [
          { name: 'numOutput', type: 'NUMBER', initialValue: 0 },
          { name: 'boolOutput', type: 'BOOLEAN', initialValue: false }
        ],
        callbackString: 'return [inputPort[numInput], inputPort[strInput] === "test"]'
      };

      const action = {
        type: AddBlockActionType,
        payload: {
          blockTemplate: multiPortTemplate,
          position: new Vector2D(0, 0)
        }
      };

      const newState = GraphReducer(initialState, action);
      const block = newState.currentGraph.graph.blocks[0];

      // Verify input ports
      expect(block.inputPorts.length).toBe(2);
      expect(block.inputPorts[0].name).toBe('numInput');
      expect(block.inputPorts[0].type).toBe('NUMBER');
      expect(block.inputPorts[0].initialValue).toBe(42);
      expect(block.inputPorts[1].name).toBe('strInput');
      expect(block.inputPorts[1].type).toBe('STRING');
      expect(block.inputPorts[1].initialValue).toBe('test');

      // Verify output ports
      expect(block.outputPorts.length).toBe(2);
      expect(block.outputPorts[0].name).toBe('numOutput');
      expect(block.outputPorts[0].type).toBe('NUMBER');
      expect(block.outputPorts[1].name).toBe('boolOutput');
      expect(block.outputPorts[1].type).toBe('BOOLEAN');
    });
  });

  describe('Error Handling', () => {
    test('should return unchanged state when blockTemplate is missing', () => {
      const action = {
        type: AddBlockActionType,
        payload: {
          position: new Vector2D(0, 0)
        }
      };

      // Spy on console.warn
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const newState = GraphReducer(initialState, action);

      // State should be unchanged
      expect(newState.currentGraph.graph.blocks.length).toBe(0);
      expect(newState).toEqual(initialState);

      // Should have warned
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ No blockTemplate in payload, returning state');

      consoleSpy.mockRestore();
    });

    test('should return unchanged state when blockTemplate is null', () => {
      const action = {
        type: AddBlockActionType,
        payload: {
          blockTemplate: null,
          position: new Vector2D(0, 0)
        }
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const newState = GraphReducer(initialState, action);

      expect(newState.currentGraph.graph.blocks.length).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should return unchanged state when blockTemplate is undefined', () => {
      const action = {
        type: AddBlockActionType,
        payload: {
          blockTemplate: undefined,
          position: new Vector2D(0, 0)
        }
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const newState = GraphReducer(initialState, action);

      expect(newState.currentGraph.graph.blocks.length).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Position Handling', () => {
    const mockBlockTemplate: BlockStorageType<['NUMBER'], ['NUMBER']> = {
      name: 'PositionTest',
      description: 'Testing position handling',
      tags: ['test'],
      inputPorts: [{ name: 'in', type: 'NUMBER', initialValue: 0 }],
      outputPorts: [{ name: 'out', type: 'NUMBER', initialValue: 0 }],
      callbackString: 'return [inputPort[in]]'
    };

    test('should handle positive coordinates', () => {
      const position = new Vector2D(500, 300);
      const action = {
        type: AddBlockActionType,
        payload: { blockTemplate: mockBlockTemplate, position }
      };

      const newState = GraphReducer(initialState, action);
      expect(newState.currentGraph.graph.blocks[0].position).toEqual(position);
    });

    test('should handle negative coordinates', () => {
      const position = new Vector2D(-100, -200);
      const action = {
        type: AddBlockActionType,
        payload: { blockTemplate: mockBlockTemplate, position }
      };

      const newState = GraphReducer(initialState, action);
      expect(newState.currentGraph.graph.blocks[0].position).toEqual(position);
    });

    test('should handle zero coordinates', () => {
      const position = new Vector2D(0, 0);
      const action = {
        type: AddBlockActionType,
        payload: { blockTemplate: mockBlockTemplate, position }
      };

      const newState = GraphReducer(initialState, action);
      expect(newState.currentGraph.graph.blocks[0].position).toEqual(position);
    });

    test('should handle large coordinate values', () => {
      const position = new Vector2D(10000, -5000);
      const action = {
        type: AddBlockActionType,
        payload: { blockTemplate: mockBlockTemplate, position }
      };

      const newState = GraphReducer(initialState, action);
      expect(newState.currentGraph.graph.blocks[0].position).toEqual(position);
    });
  });

  describe('State Immutability', () => {
    const mockBlockTemplate: BlockStorageType<['NUMBER'], ['NUMBER']> = {
      name: 'ImmutabilityTest',
      description: 'Testing immutability',
      tags: ['test'],
      inputPorts: [{ name: 'in', type: 'NUMBER', initialValue: 0 }],
      outputPorts: [{ name: 'out', type: 'NUMBER', initialValue: 0 }],
      callbackString: 'return [inputPort[in]]'
    };

    test('should not mutate original state', () => {
      const originalBlockCount = initialState.currentGraph.graph.blocks.length;

      const action = {
        type: AddBlockActionType,
        payload: {
          blockTemplate: mockBlockTemplate,
          position: new Vector2D(0, 0)
        }
      };

      GraphReducer(initialState, action);

      // Original state should be unchanged
      expect(initialState.currentGraph.graph.blocks.length).toBe(originalBlockCount);
    });

    test('should create new state object', () => {
      const action = {
        type: AddBlockActionType,
        payload: {
          blockTemplate: mockBlockTemplate,
          position: new Vector2D(0, 0)
        }
      };

      const newState = GraphReducer(initialState, action);

      // New state should be a different object
      expect(newState).not.toBe(initialState);
      expect(newState.currentGraph).not.toBe(initialState.currentGraph);
      expect(newState.currentGraph.graph).not.toBe(initialState.currentGraph.graph);
      expect(newState.currentGraph.graph.blocks).not.toBe(initialState.currentGraph.graph.blocks);
    });
  });
});
