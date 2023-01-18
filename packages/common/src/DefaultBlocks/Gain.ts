import { BlockStorageType } from '../Network/GraphItemStorage/BlockStorage';

const gain: BlockStorageType<['NUMBER'], ['NUMBER']> = {
  name: 'gain',
  description: 'Multiply a signal by a constant value',
  tags: ['math'],

  outputPorts: [{ name: 'y', type: 'NUMBER' }],
  inputPorts: [{ name: 'x', type: 'NUMBER' }],
  callbackString: 'return [inputPort[x] * 0.75]'
};

export default gain;
