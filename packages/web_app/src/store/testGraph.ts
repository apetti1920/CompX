// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { PortTypes } from 'compx_common/Graph/Port';
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { VisualBlockStorageType } from 'compx_common/Network/GraphItemStorage/BlockStorage';
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
// eslint-disable-next-line import/no-unresolved
import { VisualEdgeStorageType } from 'compx_common/Network/GraphItemStorage/EdgeStorage';
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { VisualGraphStorageType } from 'compx_common/Network/GraphItemStorage/GraphStorage';
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { PortStorageWithIDType } from 'compx_common/Network/GraphItemStorage/PortStorage';
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { Vector2D } from 'compx_common/Types';
import { v4 as uuidv4 } from 'uuid';

function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function CreatePort(): PortStorageWithIDType<any> {
  return {
    id: uuidv4(),
    name: '',
    type: 'NUMBER',
    initialValue: 0.0
  };
}

function CreateBlock(): VisualBlockStorageType<any, any> {
  return {
    id: uuidv4(),
    visualName: '',
    name: '',
    inputPorts: Array(getRandom(0, 5))
      .fill(0)
      .map(() => CreatePort()),
    outputPorts: Array(getRandom(0, 5))
      .fill(0)
      .map(() => CreatePort()),
    callbackString: '',
    tags: [],
    description: '',
    mirrored: false,
    position: new Vector2D(getRandom(-20.0, 20.0), getRandom(-20.0, 20.0)),
    size: new Vector2D(getRandom(10.0, 30.0), getRandom(10.0, 30.0)),
    shape: 'rect',
    // eslint-disable-next-line prefer-template
    color: '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')
  };
}

export default function MakeVisualGraph(numBlocks = 1): VisualGraphStorageType {
  const blocks = Array(numBlocks)
    .fill(0)
    .map(() => CreateBlock());

  return {
    blocks: blocks,
    edges: [] as VisualEdgeStorageType<keyof PortTypes>[]
  };
}
