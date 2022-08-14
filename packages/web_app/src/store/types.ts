import { VisualGraphStorageType } from '@compx/common/Network/GraphItemStorage/GraphStorage';
import { Vector2D } from '@compx/common/Types'
import {ThemeType} from "../types";
import DarkTheme from "../theme/DarkTheme";
import {MakeVisualGraph} from "./testGraph";

export type StateType = {
    currentGraph: VisualGraphStorageType,
    userStorage: {
        theme: ThemeType,
        canvas: {
            zoom: number,
            translation: Vector2D
        }
    }
};

export const defaultState: StateType = {
    currentGraph: { blocks: MakeVisualGraph(10).blocks },
    userStorage: {
        theme:  DarkTheme,
        canvas: {
            zoom: 1, // 4.8
            translation: new Vector2D()
        }
    }
}

export type ActionPayloadType = { type: string, payload: {[key: string]: any} }
export type ActionType = (...args: any) => ActionPayloadType;