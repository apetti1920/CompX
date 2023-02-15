import React, { useState } from 'react';
import { Icon } from 'react-feather';

import { ThemeType } from '../../../../../types';

export type NavbarType =
  | {
      type: 'icon';
      icon: Icon;
      openSidebar: {
        type: 'tab' | 'modal';
        element: React.ReactElement;
      };
    }
  | {
      type: 'spacer';
      height: string;
    };

export function NavbarComponent(props: { icon: Icon; isSelected: boolean; onCLick: () => void; theme: ThemeType }) {
  const [isHover, setHover] = useState(false);
  const IconComponent = props.icon;

  return (
    <React.Fragment>
      <div style={{ width: '100%', height: '24px' }} />
      <div
        role="presentation"
        style={{
          width: '100%',
          borderLeft: props.isSelected ? '4px solid black' : undefined,
          paddingLeft: props.isSelected ? '8px' : undefined,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={props.onCLick}
      >
        <IconComponent
          style={{
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '40%'
          }}
          stroke={
            isHover || props.isSelected
              ? props.theme.palette.illustration.tertiary
              : props.theme.palette.illustration.secondary
          }
        />
      </div>
    </React.Fragment>
  );
}
