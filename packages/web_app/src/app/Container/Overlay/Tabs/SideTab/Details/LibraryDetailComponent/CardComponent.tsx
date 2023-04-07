import React, { Component } from 'react';

import ColorTheme from '../../../../../../../theme/ColorTheme';

type PropsType = {
  theme: ColorTheme;
};

// eslint-disable-next-line react/prefer-stateless-function
export default class CardComponent extends Component<PropsType, Record<string, never>> {
  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '80px',
          backgroundColor: this.props.theme.get('support'),
          border: 'solid 1px black'
        }}
      />
    );
  }
}
