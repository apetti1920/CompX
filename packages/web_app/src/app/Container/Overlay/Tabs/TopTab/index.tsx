import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { BookOpen } from 'react-feather';

import { StateType as SaveState } from '../../../../../store/types';
import { ThemeType } from '../../../../../types';

type GlobalProps = {
  theme: ThemeType;
};
type DispatchProps = {};
type ComponentProps = {
  style?: React.CSSProperties;
};

type PropsType = GlobalProps & DispatchProps & ComponentProps;
type StateType = {};

class TopTab extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
  }

  render() {
    return (
      <div
        style={{
          ...this.props.style,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexFlow: 'row nowrap',
          padding: '5px'
        }}
      >
        <BookOpen
          style={{
            backgroundColor: this.props.theme.palette.shadow,
            padding: '10px',
            borderRadius: '15px'
          }}
        />
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

// Creates  a function to map the redux actions to props
function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators({}, dispatch);
}

// Exports the redux connected component
export default connect(mapStateToProps, mapDispatchToProps)(TopTab);
