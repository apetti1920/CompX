import React, { Component } from 'react';
import { Search as SearchIcon, XSquare as XSquareIcon } from 'react-feather';

import LibraryViewer from './LibraryViewer';
import ColorTheme from '../../../../../../../theme/ColorTheme';

type State = {
  searchText: {
    value: string;
    throttledValue: string;
  };
};

type Props = {
  theme: ColorTheme;
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
    const backgroundColor = this.props.theme.value.primary.background.tint(30).hexString();

    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'column',
          backgroundColor: backgroundColor,
          padding: '5px',
          borderRadius: '25px',
          width: '100%'
        }}
      >
        <div
          style={{
            padding: '12px',
            borderRadius: this.state.searchText.value === '' ? '20px' : '20px 20px 0px 0px',
            width: '100%',
            height: '40px',
            backgroundColor: backgroundColor,
            color: this.props.theme.get('heading'),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
            <style>{`
              #block-search-input::placeholder {
                color: ${this.props.theme.get('heading')};
                opacity: 0.4;
              }
              
              input:focus,
              select:focus,
              textarea:focus,
              button:focus {
                  outline: none;
              }
          `}</style>
            <SearchIcon style={{ marginRight: '5px' }} />
            <input
              id="block-search-input"
              type="text"
              placeholder="Block Search"
              value={this.state.searchText.value}
              onChange={(evt) =>
                this.setState((prevState) => ({ searchText: { ...prevState.searchText, value: evt.target.value } }))
              }
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: this.props.theme.get('heading')
              }}
            />
            {this.state.searchText.value !== '' ? (
              <XSquareIcon
                onClick={() => this.setState({ searchText: { value: '', throttledValue: '' } })}
                style={{ marginLeft: '5px', color: this.props.theme.get('action') }}
              />
            ) : (
              <React.Fragment />
            )}
          </div>
        </div>
        {this.state.searchText.value !== '' ? <LibraryViewer theme={this.props.theme} /> : <React.Fragment />}
      </div>
    );
  }
}
