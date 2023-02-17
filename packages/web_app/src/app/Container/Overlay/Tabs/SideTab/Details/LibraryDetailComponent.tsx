import React, { Component } from 'react';
import { Search as SearchIcon, XSquare as XSquareIcon } from 'react-feather';

import { ThemeType } from '../../../../../../types';
// import { throttle } from 'lodash';

type State = {
  searchText: {
    value: string;
    throttledValue: string;
  };
};

type Props = {
  theme: ThemeType;
};

export default class LibraryDetailComponent extends Component<Props, State> {
  constructor(props: never) {
    super(props);

    this.state = {
      searchText: {
        value: '',
        throttledValue: ''
      }
    };
  }

  // handleInputChangeThrottled = throttle((text: string) => {
  //   this.setState(
  //     (prevState: State) => ({ searchText: { ...prevState.searchText, throttledValue: text } }),
  //     console.log(this.state.searchText.throttledValue)
  //   );
  // }, 1000);

  // componentDidUpdate(prevProps: never, prevState: State) {
  //   if (this.state.searchText.value !== prevState.searchText.value) {
  //     this.setState({ searchText: { ...prevState.searchText, throttledValue: prevState.searchText.value } });
  //   }
  // }

  render() {
    return (
      <div
        style={{
          padding: '12px',
          borderRadius: '20px',
          width: '100%',
          height: '40px',
          backgroundColor: this.props.theme.palette.elements.button,
          color: this.props.theme.palette.elements.button_text,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
          <style>{`
            input:focus,
            select:focus,
            textarea:focus,
            button:focus {
                outline: none;
            },
            .blockSearchInput::placeholder {
              color: ${this.props.theme.palette.elements.headline};
              opacity: 0.4;
            }
        `}</style>
          <SearchIcon style={{ marginRight: '5px' }} />
          <input
            className="blockSearchInput"
            type="text"
            placeholder="Block Search"
            value={this.state.searchText.value}
            onChange={(evt) =>
              this.setState((prevState) => ({ searchText: { ...prevState.searchText, value: evt.target.value } }))
            }
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none'
            }}
          />
          {this.state.searchText.value !== '' ? (
            <XSquareIcon
              onClick={() => this.setState({ searchText: { value: '', throttledValue: '' } })}
              style={{ marginLeft: '5px', color: '#CC5500' }}
            />
          ) : (
            <React.Fragment />
          )}
        </div>
      </div>
    );
  }
}
