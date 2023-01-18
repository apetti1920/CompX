import { BlockStorageType } from '../Network/GraphItemStorage/BlockStorage';

const constant: BlockStorageType<['NUMBER'], []> = {
  name: 'scope',
  description: 'Visualize a signal',
  tags: [],
  outputPorts: [],
  inputPorts: [{ name: 'x', type: 'NUMBER' }],
  callbackString: 'return [console.log(inputPort[x])]'
};

export default constant;
