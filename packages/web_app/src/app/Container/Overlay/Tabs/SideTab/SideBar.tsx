import React, { Component } from 'react';
import { BatteryCharging, BookOpen, Settings, Trash, User } from 'react-feather';

import { NavbarComponent, NavbarType } from './NavbarItemComponent';

type PropsType = Record<string, never>;
type StateType = {
  selected?: string;
};

export default class SideBar extends Component<PropsType, StateType> {
  private readonly Nav1: NavbarType[];
  private readonly Nav2: NavbarType[];
  private readonly minimizedWidth: string = '75px';
  private readonly maximizedWidth: string = '350px';

  constructor(props: PropsType) {
    super(props);

    this.Nav1 = [
      { type: 'spacer', height: '15%' },
      { type: 'icon', icon: BookOpen, openSidebar: { type: 'tab', element: <React.Fragment /> } },
      { type: 'icon', icon: Trash, openSidebar: { type: 'tab', element: <React.Fragment /> } },
      { type: 'icon', icon: BatteryCharging, openSidebar: { type: 'tab', element: <React.Fragment /> } }
    ];

    this.Nav2 = [
      { type: 'icon', icon: User, openSidebar: { type: 'tab', element: <React.Fragment /> } },
      { type: 'icon', icon: Settings, openSidebar: { type: 'tab', element: <React.Fragment /> } }
    ];

    this.state = {
      selected: undefined
    };
  }

  selectTabHandler = (tabName?: string) => {
    if (tabName === undefined) return;
    if (this.state.selected !== undefined && this.state.selected === tabName) this.setState({ selected: undefined });
    else this.setState({ selected: tabName });
  };

  NavWrap = (nav: NavbarType[]): React.ReactElement[] =>
    nav.map((t, ind) => {
      switch (t.type) {
        case 'icon': {
          return (
            <NavbarComponent
              key={`icon_${t.icon.displayName}`}
              icon={t.icon}
              onCLick={() => this.selectTabHandler(t.icon.displayName)}
              isSelected={this.state.selected !== undefined && t.icon.displayName === this.state.selected}
            />
          );
        }
        case 'spacer': {
          return <div key={`spacer_${ind}`} style={{ width: '100%', height: t.height }} />;
        }
        default: {
          return <React.Fragment />;
        }
      }
    });

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          width: this.state.selected !== undefined ? this.maximizedWidth : this.minimizedWidth,
          height: '100%'
        }}
      >
        <div style={{ display: 'flex', flexFlow: 'column nowrap', width: this.minimizedWidth, height: '100%' }}>
          <div style={{ height: '75%', width: this.minimizedWidth, display: 'flex', flexFlow: 'column nowrap' }}>
            {this.NavWrap(this.Nav1)}
          </div>
          <div
            style={{ height: '25%', width: this.minimizedWidth, display: 'flex', flexFlow: 'column-reverse nowrap' }}
          >
            {this.NavWrap(this.Nav2)}
          </div>
        </div>
        {this.state.selected !== undefined ? (
          <div style={{ borderLeft: '1px solid black', width: '100%', height: '100%' }} />
        ) : (
          <React.Fragment />
        )}
      </div>
    );
  }
}
