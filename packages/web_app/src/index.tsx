import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app/app.web';
import store from './store';

import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';

const el = document.getElementById('app-root');
if (el === null) throw new Error('Root container missing in index.html');

const root = ReactDOM.createRoot(el);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
