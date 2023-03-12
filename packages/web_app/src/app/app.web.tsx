import React from 'react';

import Container from './Container/Container';
import './electron-bar.css';

export default function App(): React.ReactElement {
  return (
    <React.Fragment>
      <Container />
      {process.env.BUILD_TYPE === 'electron' ? (
        <div
          id="electron-drag-bar"
          style={{ top: 0, width: '100%', height: '30px', position: 'fixed', backgroundColor: 'transparent' }}
        />
      ) : (
        <React.Fragment />
      )}
    </React.Fragment>
  );
}
