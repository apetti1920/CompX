import React from 'react';
// import Container from './Container/Container';
import './electron-bar.css';
import Color from 'values.js';

export default function App(): React.ReactElement {
  const col = new Color('#232946');

  return (
    <React.Fragment>
      {/* <Container /> */}
      <div style={{ display: 'flex', flexFlow: 'column nowrap', width: '50vw', height: '500px' }}>
        <div style={{ backgroundColor: col.hexString(), width: '100%', height: '20%', margin: '5px' }} />
        <div style={{ backgroundColor: col.tint(25).hexString(), width: '100%', height: '20%', margin: '5px' }} />
        <div style={{ backgroundColor: col.tint(50).hexString(), width: '100%', height: '20%', margin: '5px' }} />
        <div style={{ backgroundColor: col.tint(75).hexString(), width: '100%', height: '20%', margin: '5px' }} />
        <div style={{ backgroundColor: col.tint(100).hexString(), width: '100%', height: '20%', margin: '5px' }} />
      </div>

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
