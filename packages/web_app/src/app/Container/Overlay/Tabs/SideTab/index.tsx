import React from 'react';
import { BatteryCharging, BookOpen, Settings, Trash } from 'react-feather';

import Logo from '../../../Helpers/Logo';

type PropTypes = Record<string, never>;
type StateType = {
  sideBarState: 'closed';
};

const iconCSS: React.CSSProperties = {
  marginTop: '24px',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'inline-block',
  width: '25px',
  height: '25px'
};

export default class SideBar extends React.Component<PropTypes, StateType> {
  constructor(props: PropTypes) {
    super(props);

    this.state = {
      sideBarState: 'closed'
    };
  }

  render() {
    if (this.state.sideBarState === 'closed') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexFlow: 'column nowrap' }}>
          <div style={{ width: '100%', height: '75%', display: 'flex', flexFlow: 'column nowrap' }}>
            <div style={{ ...iconCSS, width: '40px', height: '40px', backgroundColor: 'black', borderRadius: '10%' }}>
              <Logo style={{ width: '100%', height: '100%', color: 'white' }} />
            </div>
            <div style={{ width: '100%', height: '100px' }} />
            <BookOpen style={iconCSS} />
            <Trash style={iconCSS} />
            <BatteryCharging style={iconCSS} />
          </div>

          <div style={{ width: '100%', height: '25%', display: 'flex', flexFlow: 'column-reverse nowrap' }}>
            <div
              style={{
                ...iconCSS,
                width: '50px',
                height: '50px',
                borderRadius: '10%',
                border: '1px solid black',
                marginBottom: '24px'
              }}
            >
              <div
                style={{
                  margin: '4px 4px',
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'black',
                  borderRadius: '10%',
                  background:
                    'url(https://image.shutterstock.com/shutterstock/photos/1655747050/display_1500/stock-photo-young-adult-profile-picture-with-red-hair-1655747050.jpg)',
                  backgroundPosition: '50% 50%',
                  backgroundSize: 'cover'
                }}
              />
            </div>
            <Settings style={iconCSS} />
          </div>
        </div>
      );
    }

    return <React.Fragment />;
  }
}
