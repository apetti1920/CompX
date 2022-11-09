import { configureStore } from '@reduxjs/toolkit';
import { compose } from 'redux';

import allReducers from './reducers';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const composeEnhancers = (window && (window as unknown).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
export default configureStore({
  reducer: allReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }),
  enhancers: composeEnhancers
});
