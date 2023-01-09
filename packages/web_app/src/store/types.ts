// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { BlockStorageType } from 'compx_common/Network/GraphItemStorage/BlockStorage';
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { VisualGraphStorageType } from 'compx_common/Network/GraphItemStorage/GraphStorage';
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { Vector2D } from 'compx_common/Types';

import DarkTheme from '../theme/DarkTheme';
import { ThemeType } from '../types';
import MakeVisualGraph from './testGraph';

export type SelectableItemTypes = 'BLOCK' | 'EDGE';
export type SelectedItemsType = { itemType: SelectableItemTypes; id: string };
export type StateType = {
  currentGraph: {
    graph: VisualGraphStorageType;
    selected: SelectedItemsType[];
    libraryBlocks: BlockStorageType<any, any>[];
  };
  userStorage: {
    theme: ThemeType;
    canvas: {
      zoom: number;
      translation: Vector2D;
    };
  };
};

export const defaultState: StateType = {
  currentGraph: {
    graph: MakeVisualGraph(3),
    selected: [],
    libraryBlocks: []
  },
  userStorage: {
    theme: DarkTheme,
    canvas: {
      zoom: 5.6,
      translation: new Vector2D()
    }
  }
};

export type ActionPayloadType = {
  type: string;
  payload: { [key: string]: any };
};
export type ActionType = (...args: any) => ActionPayloadType;
