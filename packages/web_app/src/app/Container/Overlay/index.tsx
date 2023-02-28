import React from 'react';
import { connect } from 'react-redux';

import TopTab from './Tabs/TopTab';
import { StateType as SaveState } from '../../../store/types';
import { ThemeType } from '../../../types';

type GlobalProps = {
  theme: ThemeType;
};
type ComponentProps = {
  style?: React.CSSProperties;
};

type PropsType = GlobalProps & ComponentProps;

function Overlay(props: PropsType) {
  return (
    <div
      id="overlay"
      style={{
        ...props.style,
        display: 'flex',
        flexFlow: 'column nowrap',
        width: '100%',
        height: '100%'
      }}
    >
      <TopTab theme={props.theme} />
    </div>
  );
}

// Creates a function to map the redux state to the redux props
function mapStateToProps(state: SaveState): GlobalProps {
  return {
    theme: state.userStorage.theme
  };
}

// Exports the redux connected component
export default connect(mapStateToProps)(Overlay);
