import { compose } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import allReducers from './reducers';

const composeEnhancers = (window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
export default configureStore({
  reducer: allReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }),
  enhancers: composeEnhancers
});
