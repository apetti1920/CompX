import { BlockStorageType } from '../Network/GraphItemStorage/BlockStorage';

const integrator: BlockStorageType<['NUMBER'], ['NUMBER']> = {
  name: 'integrator',
  description: 'Integrates a signal',
  tags: ['math', 'diffeq'],
  outputPorts: [{ name: 'x', type: 'NUMBER' }],
  inputPorts: [{ name: 'y', type: 'NUMBER', initialValue: 0 }],
  callbackString: 'return [dt*(prevInput[x] + inputPort[x])/2]'
};

export default integrator;
