import { BlockStorageType } from '../Network/GraphItemStorage/BlockStorage';

const constant: BlockStorageType<[], ['NUMBER']> = {
  name: 'constant',
  description: 'A constant signal',
  tags: ['math'],
  outputPorts: [{ name: 'c', type: 'NUMBER' }],
  inputPorts: [],
  callbackString: 'return [5]'
};

export default constant;
