import { StateType, defaultState, ActionPayloadType } from '../types';
import { GraphReducerName, CanvasReducerName } from '../actions/actionnames';
import CanvasReducers from './canvasreducers';
import GraphReducers from './graphreducers';

// eslint-disable-next-line default-param-last
export default (state: StateType = defaultState, action: ActionPayloadType): StateType => {
  let reducer = action.type.split('/')[0];
  if (reducer.substring(0, 2) !== '@@') return state;
  reducer = reducer.substring(2);

  switch (reducer) {
    case CanvasReducerName: {
      return CanvasReducers(state, action);
    }
    case GraphReducerName: {
      return GraphReducers(state, action);
    }
    default: {
      return state;
    }
  }
};
