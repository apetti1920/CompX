import React from 'react';

import Container from './Container/Container';

export default function App(): React.ReactElement {
  console.log(`HEEEEEERE ${process.env.BUILD_TYPE}`);
  return <Container />;
}
