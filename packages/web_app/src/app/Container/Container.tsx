import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { connect } from 'react-redux';

import CanvasContainer from './Canvas/CanvasContainer';
import Overlay from './Overlay';
import SideBar from './Overlay/Tabs/SideTab/SideBar';
import { StateType as SaveState } from '../../store/types';
import ColorTheme from '../../theme/ColorTheme';

import './titlebar.css';

type GlobalProps = {
  theme: ColorTheme;
};
type DispatchProps = Record<string, never>;
type ComponentProps = Record<string, never>;
type PropsType = GlobalProps & DispatchProps & ComponentProps;

type StateType = Record<string, never>;

// eslint-disable-next-line react/prefer-stateless-function
class Container extends React.Component<PropsType, StateType> {
  render() {
    return (
      <DndProvider backend={HTML5Backend}>
        <div
          id="overlay"
          style={{
            display: 'flex',
            flexFlow: 'row nowrap',
            width: '100%',
            height: '100%',
            background: this.props.theme.get('background')
          }}
        >
          <div style={{ height: '100%' }}>
            <SideBar theme={this.props.theme} />
          </div>
          <div
            id="main-container"
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '40px 0px 0px 40px',
              boxShadow: '-15px 8px 5px rgba(0,0,0, 0.05)'
            }}
          >
            <CanvasContainer />
            <Overlay style={{ zIndex: 1, position: 'relative', pointerEvents: 'none' }} />
          </div>
        </div>
      </DndProvider>
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
