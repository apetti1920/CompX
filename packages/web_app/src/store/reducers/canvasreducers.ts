import { Clamp } from '@compx/common/Helpers/Other';
import { Vector2D } from '@compx/common/Types';
import _ from 'lodash';

import { TranslatedCanvasActionType, ZoomedCanvasActionType } from '../actions/actiontypes';
import { ActionPayloadType, StateType } from '../types';

export default (state: StateType, action: ActionPayloadType): StateType => {
  switch (action.type) {
    case TranslatedCanvasActionType: {
      const tempState = _.cloneDeep(state);
      tempState.userStorage.canvas.translation = action.payload['point'];

      return tempState;
    }
    case ZoomedCanvasActionType: {
      const tempState = _.cloneDeep(state);

      // Get the zoom delta and zoom around point
      const delta: number = action.payload['delta'] * 1.25;
      const zoomAround: Vector2D = action.payload['around'];

      // Calculate the zoom and ultimate scale change
      // Have to recalculate delta becuase clamping may limit delta
      // TODO: Set this to some env variable
      const clampedZoom = Clamp(state.userStorage.canvas.zoom + delta, 1, 10);
      const scaleChange = clampedZoom - state.userStorage.canvas.zoom;

      // Calculate the translation to keep the center of the zoom around the mouse
      const newTranslation = {
        x: state.userStorage.canvas.translation.x - zoomAround.x * scaleChange,
        y: state.userStorage.canvas.translation.y + zoomAround.y * scaleChange
      };

      // Set the new state
      tempState.userStorage.canvas.zoom = clampedZoom;
      tempState.userStorage.canvas.translation = new Vector2D(newTranslation.x, newTranslation.y);

      return tempState;
    }
    default: {
      return state;
    }
  }
};
