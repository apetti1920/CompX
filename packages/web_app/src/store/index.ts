import { configureStore } from '@reduxjs/toolkit';

import allReducers from './reducers';

export default configureStore({
  reducer: allReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }),
  devTools: true
});
