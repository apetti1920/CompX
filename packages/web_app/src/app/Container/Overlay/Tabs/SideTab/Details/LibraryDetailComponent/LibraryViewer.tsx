import { range } from 'lodash';
import React, { Component } from 'react';

import CardComponent from './CardComponent';
import ColorTheme from '../../../../../../../theme/ColorTheme';

type PropsType = {
  theme: ColorTheme;
};

// eslint-disable-next-line react/prefer-stateless-function
export default class LibraryViewer extends Component<PropsType, Record<string, never>> {
  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          borderTop: '1px solid black',
          backgroundColor: this.props.theme.value.primary.background.tint(30).hexString(),
          borderRadius: '0px 0px 20px 20px'
        }}
      >
        <div
          style={{
            paddingTop: '5px',
            paddingBottom: '25px',
            display: 'grid',
            alignItems: 'center',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 2fr))'
          }}
        >
          {range(1, 40).map((i) => (
            <CardComponent key={`card-comp-${i}`} theme={this.props.theme} />
          ))}
        </div>
      </div>
    );
  }
}
