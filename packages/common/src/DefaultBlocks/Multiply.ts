import { BlockStorageType } from '../Network/GraphItemStorage/BlockStorage';

const multiply: BlockStorageType<['NUMBER', 'NUMBER'], ['NUMBER']> = {
  name: 'multiply',
  description: 'Multiply two signals',
  tags: ['math'],
  outputPorts: [{ name: 'z', type: 'NUMBER' }],
  inputPorts: [
    { name: 'x', type: 'NUMBER' },
    { name: 'y', type: 'NUMBER' }
  ],
  callbackString: 'return [inputPort[x] * inputPort[y]]'
};

export default multiply;
