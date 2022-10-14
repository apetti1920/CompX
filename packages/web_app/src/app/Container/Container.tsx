import React from 'react';
import { connect } from 'react-redux';

import { StateType as SaveState } from '../../store/types';
import { ThemeType } from '../../types';
import CanvasContainer from './Canvas/CanvasContainer';
import Overlay from './Overlay';
import SideBar, { IconsType } from './Overlay/Tabs/SideTab';

type GlobalProps = {
  theme: ThemeType;
};
type DispatchProps = Record<string, never>;
type ComponentProps = Record<string, never>;
type PropsType = GlobalProps & DispatchProps & ComponentProps;

type StateType = {
  sidebarTabSelected?: IconsType;
};

class Container extends React.Component<PropsType, StateType> {
  private readonly minimizedSidebarWidth = '75px';

  constructor(props: PropsType) {
    super(props);

    this.state = {
      sidebarTabSelected: undefined
    };
  }

  tabSelectedHandler = (tab?: IconsType) => {
    if (tab !== undefined && tab === this.state.sidebarTabSelected) this.setState({ sidebarTabSelected: undefined });
    else this.setState({ sidebarTabSelected: tab });
  };

  render() {
    const sideBarWidth = this.state.sidebarTabSelected !== undefined ? '350px' : this.minimizedSidebarWidth;

    return (
      <div
        id="overlay"
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          width: '100%',
          height: '100%',
          background: this.props.theme.palette.text
        }}
      >
        <div style={{ height: '100%', width: sideBarWidth }}>
          <SideBar
            theme={this.props.theme}
            sidebarTabSelected={this.state.sidebarTabSelected}
            sidebarWidth={this.minimizedSidebarWidth}
            onSelectedTab={this.tabSelectedHandler}
          />
        </div>
        <div
          id="main-container"
          style={{
            width: `calc(100% - ${sideBarWidth})`,
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '35px 0px 0px 35px',
            boxShadow: '-15px 8px 5px rgba(0,0,0, 0.05)'
          }}
        >
          <CanvasContainer />
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <Overlay style={{ zIndex: 1, position: 'relative', pointerEvents: 'none' }} />
        </div>
      </div>
    );
  }
}

// Creates a function to map the redux state to the redux props
function mapStateToProps(state: SaveState): GlobalProps {
  return {
    theme: state.userStorage.theme
  };
}

// Exports the redux connected component
export default connect(mapStateToProps)(Container);
