import React, { Component } from 'react';
import { Search, XSquare } from 'react-feather';
// import { throttle } from 'lodash';

type State = {
  searchText: {
    value: string;
    throttledValue: string;
  };
};

export default class LibraryDetailComponent extends Component<Record<string, never>, State> {
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
      <div style={{ padding: '12px', backgroundColor: '#696969', borderRadius: '20px', width: '100%' }}>
        <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
          <style>{`
            input:focus,
            select:focus,
            textarea:focus,
            button:focus {
                outline: none;
            },
            .blockSearchInput::placeholder {
              color: #BEBEBE;
              opacity: 0.4;
            }
        `}</style>
          <Search style={{ marginRight: '5px', color: '#BEBEBE' }} />
          <input
            className="blockSearchInput"
            type="text"
            placeholder="Block Search"
            value={this.state.searchText.value}
            onChange={(evt) =>
              this.setState((prevState) => ({ searchText: { ...prevState.searchText, value: evt.target.value } }))
            }
            style={{ width: '100%', background: 'transparent', border: 'none' }}
          />
          {this.state.searchText.value !== '' ? (
            <XSquare
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
