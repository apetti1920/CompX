import { BlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { VisualGraphStorageType } from '@compx/common/Network/GraphItemStorage/GraphStorage';
import { Vector2D } from '@compx/common/Types';

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
