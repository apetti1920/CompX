import React, { useState } from 'react';
import { Icon } from 'react-feather';

import NormalCurve from './NormalCurve';

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

export function NavbarComponent(props: { icon: Icon; isSelected: boolean; onCLick: () => void }) {
  const [isHover, setHover] = useState(false);
  const IconComponent = props.icon;
  const iconShift: React.CSSProperties = props.isSelected
    ? {
        position: 'relative',
        top: '0px',
        left: '-40%',
        zIndex: 2
      }
    : {};

  return (
    <React.Fragment>
      <div style={{ width: '100%', height: '24px' }} />
      <div
        role="presentation"
        style={{
          width: '100%',
          // borderLeft: props.isSelected ? '4px solid black' : undefined,
          // paddingLeft: props.isSelected ? '8px' : undefined,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={props.onCLick}
      >
        {props.isSelected ? <NormalCurve color="black" /> : <React.Fragment />}
        <IconComponent
          style={{
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '40%',
            ...iconShift
          }}
          stroke={isHover || props.isSelected ? 'white' : 'gray'}
        />
      </div>
    </React.Fragment>
  );
}
