import { EdgePointType, EdgeStorageType } from '../Network/GraphItemStorage/EdgeStorage';
import { PortTypes } from './Port';
import GraphObject from './GraphObjectBase';

const EdgeTypesStringList = ['TREE', 'BACK', 'FORWARD', 'CROSS'] as const;
export type EdgeTypes = typeof EdgeTypesStringList[number];

export class Edge<U extends keyof PortTypes> implements EdgeStorageType<U>, GraphObject<Edge<U>> {
  public readonly id: string;
  public type: U;
  public input: EdgePointType;
  public output: EdgePointType;

  private constructor(id: string, edgeType: U, input: EdgePointType, output: EdgePointType) {
    this.id = id;
    this.type = edgeType;
    this.input = input;
    this.output = output;
  }

  public static InitializeFromStorage<U extends keyof PortTypes>(edgeStorage: EdgeStorageType<U>): Edge<U> {
    return new Edge(edgeStorage.id, edgeStorage.type, edgeStorage.input, edgeStorage.output);
  }

  ToStorage(): EdgeStorageType<U> {
    return {
      id: this.id,
      type: this.type,
      input: {
        blockID: this.input.blockID,
        portID: this.input.portID
      },
      output: {
        blockID: this.output.blockID,
        portID: this.output.portID
      }
    };
  }
}
