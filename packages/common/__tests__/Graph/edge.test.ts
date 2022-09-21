import { EdgeStorageType, isEdgeStorageType } from '../../src/Network/GraphItemStorage/EdgeStorage';
import { Edge } from '../../src/Graph/Edge';

describe('Edge Tests', () => {
  const testEdgeStorage: EdgeStorageType<'NUMBER'> = {
    id: '',
    type: 'NUMBER',
    output: {
      blockID: 'b1',
      portID: 'p1'
    },
    input: {
      blockID: 'b2',
      portID: 'p1'
    }
  };

  describe('Edge Tests', () => {
    const edge = Edge.InitializeFromStorage(testEdgeStorage);

    test('Can Convert to Storage', () => {
      expect(isEdgeStorageType(edge.ToStorage())).toBeTruthy();
    });
  });

  describe('Edge Storage Tests', () => {
    test('Is Edge Storage Type', () => {
      expect(isEdgeStorageType(testEdgeStorage)).toBeTruthy();
    });

    test('Is not edge storage', () => {
      const t1 = { ...testEdgeStorage } as any;
      expect(isEdgeStorageType(1)).not.toBeTruthy();
      expect(isEdgeStorageType([])).not.toBeTruthy();

      const t2 = { ...t1 };
      delete t2['type'];
      expect(isEdgeStorageType(t2)).not.toBeTruthy();

      const t3 = { ...t1 };
      t3['type'] = 'TEST';
      expect(isEdgeStorageType(t3)).not.toBeTruthy();

      const t4 = { ...t1 };
      delete t4['input']['blockID'];
      expect(isEdgeStorageType(t4)).not.toBeTruthy();
    });
  });
});
