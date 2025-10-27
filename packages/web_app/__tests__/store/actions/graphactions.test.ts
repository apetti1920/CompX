import { Vector2D } from '@compx/common/Types';
import { BlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { AddBlockAction } from '../../../src/store/actions/graphactions';
import { AddBlockActionType } from '../../../src/store/actions/actiontypes';

describe('Graph Actions - AddBlockAction', () => {
  const mockBlockTemplate: BlockStorageType<['NUMBER'], ['NUMBER']> = {
    name: 'TestBlock',
    description: 'A test block',
    tags: ['test'],
    inputPorts: [{ name: 'input', type: 'NUMBER', initialValue: 0 }],
    outputPorts: [{ name: 'output', type: 'NUMBER', initialValue: 0 }],
    callbackString: 'return [inputPort[input]]'
  };

  test('should create an ADD_BLOCK action with correct type', () => {
    const position = new Vector2D(100, 200);
    const action = AddBlockAction(mockBlockTemplate, position);

    expect(action.type).toBe(AddBlockActionType);
  });

  test('should include blockTemplate in payload', () => {
    const position = new Vector2D(50, 75);
    const action = AddBlockAction(mockBlockTemplate, position);

    expect(action.payload.blockTemplate).toBeDefined();
    expect(action.payload.blockTemplate).toEqual(mockBlockTemplate);
  });

  test('should include position in payload', () => {
    const position = new Vector2D(300, 400);
    const action = AddBlockAction(mockBlockTemplate, position);

    expect(action.payload.position).toBeDefined();
    expect(action.payload.position).toEqual(position);
  });

  test('should preserve all blockTemplate properties', () => {
    const complexTemplate: BlockStorageType<['NUMBER', 'STRING'], ['BOOLEAN']> = {
      name: 'ComplexBlock',
      description: 'A complex test block',
      tags: ['complex', 'test', 'multi'],
      inputPorts: [
        { name: 'numInput', type: 'NUMBER', initialValue: 42 },
        { name: 'strInput', type: 'STRING', initialValue: 'test' }
      ],
      outputPorts: [{ name: 'boolOutput', type: 'BOOLEAN', initialValue: true }],
      callbackString: 'return [inputPort[numInput] > 0]'
    };

    const position = new Vector2D(0, 0);
    const action = AddBlockAction(complexTemplate, position);

    expect(action.payload.blockTemplate.name).toBe('ComplexBlock');
    expect(action.payload.blockTemplate.description).toBe('A complex test block');
    expect(action.payload.blockTemplate.tags).toEqual(['complex', 'test', 'multi']);
    expect(action.payload.blockTemplate.inputPorts.length).toBe(2);
    expect(action.payload.blockTemplate.outputPorts.length).toBe(1);
    expect(action.payload.blockTemplate.callbackString).toBe('return [inputPort[numInput] > 0]');
  });

  test('should handle different position values', () => {
    const positions = [
      new Vector2D(0, 0),
      new Vector2D(100, -100),
      new Vector2D(-500, 300),
      new Vector2D(9999, -9999)
    ];

    positions.forEach((position) => {
      const action = AddBlockAction(mockBlockTemplate, position);
      expect(action.payload.position).toEqual(position);
    });
  });

  test('should create unique actions for multiple calls', () => {
    const position1 = new Vector2D(0, 0);
    const position2 = new Vector2D(100, 100);

    const action1 = AddBlockAction(mockBlockTemplate, position1);
    const action2 = AddBlockAction(mockBlockTemplate, position2);

    // Actions should have same type
    expect(action1.type).toBe(action2.type);

    // But different positions
    expect(action1.payload.position).not.toEqual(action2.payload.position);

    // And same template reference
    expect(action1.payload.blockTemplate).toEqual(action2.payload.blockTemplate);
  });
});
