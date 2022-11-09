import { BlockStorageType } from '../Network/GraphItemStorage/BlockStorage';

const sum: BlockStorageType<['NUMBER', 'NUMBER'], ['NUMBER']> = {
  name: 'sum',
  description: 'Sum two signals',
  tags: ['math'],
  outputPorts: [{ name: 'z', type: 'NUMBER' }],
  inputPorts: [
    { name: 'x', type: 'NUMBER' },
    { name: 'y', type: 'NUMBER' }
  ],
  callbackString: 'return [inputPort[x] + inputPort[y]]'
};

export default sum;
