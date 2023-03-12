import { BlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { VisualGraphStorageType } from '@compx/common/Network/GraphItemStorage/GraphStorage';
import { Vector2D } from '@compx/common/Types';

import MakeVisualGraph from './testGraph';
import ColorTheme from '../theme/ColorTheme';
import Theme from '../theme/DarkTheme1';

export type SelectableItemTypes = 'BLOCK' | 'EDGE';
export type SelectedItemsType = { itemType: SelectableItemTypes; id: string };
export type StateType = {
  currentGraph: {
    graph: VisualGraphStorageType;
    selected: SelectedItemsType[];
    libraryBlocks: BlockStorageType<any, any>[];
  };
  userStorage: {
    theme: ColorTheme;
    canvas: {
      zoom: number;
      translation: Vector2D;
    };
  };
};

export const defaultState: StateType = {
  currentGraph: {
    graph: MakeVisualGraph(0),
    selected: [],
    libraryBlocks: []
  },
  userStorage: {
    theme: new ColorTheme(Theme),
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
