import React, { Component } from 'react';
import { BatteryCharging, BookOpen, Settings, Trash, User } from 'react-feather';

import LibraryDetailComponent from './Details/LibraryDetailComponent';
import { NavbarComponent, NavbarType } from './NavbarItemComponent';
import ColorTheme from '../../../../../theme/ColorTheme';

const GetNavList = (theme: ColorTheme): Record<string, NavbarType[]> => ({
  nav1: [
    { type: 'spacer', height: '15%' },
    { type: 'icon', icon: BookOpen, openSidebar: { type: 'tab', element: <LibraryDetailComponent theme={theme} /> } },
    { type: 'icon', icon: Trash, openSidebar: { type: 'tab', element: <React.Fragment /> } },
    { type: 'icon', icon: BatteryCharging, openSidebar: { type: 'tab', element: <React.Fragment /> } }
  ],
  nav2: [
    { type: 'icon', icon: User, openSidebar: { type: 'tab', element: <React.Fragment /> } },
    { type: 'icon', icon: Settings, openSidebar: { type: 'tab', element: <React.Fragment /> } }
  ]
});

type PropsType = { theme: ColorTheme };
type StateType = {
  selected?: {
    nav: keyof ReturnType<typeof GetNavList>;
    ind: number;
  };
};

export default class SideBar extends Component<PropsType, StateType> {
  private readonly minimizedWidth: string = '75px';
  private readonly maximizedWidth: string = '350px';
  private readonly navList = GetNavList(this.props.theme);

  constructor(props: PropsType) {
    super(props);

    this.state = {
      selected: undefined
    };
  }

  selectTabHandler = (props: typeof this.state.selected) => {
    if (props === undefined) return;

    if (
      this.state.selected !== undefined &&
      this.state.selected.nav === props.nav &&
      this.state.selected.ind === props.ind
    )
      this.setState({ selected: undefined });
    else this.setState({ selected: props });
  };

  NavWrap = (nav: keyof ReturnType<typeof GetNavList>, listNav: NavbarType[]): React.ReactElement[] =>
    listNav.map((t, ind) => {
      switch (t.type) {
        case 'icon': {
          return (
            <NavbarComponent
              key={`icon_${t.icon.displayName}`}
              icon={t.icon}
              theme={this.props.theme}
              onCLick={() => this.selectTabHandler({ nav: nav, ind: ind })}
              isSelected={
                this.state.selected !== undefined && this.state.selected.nav === nav && this.state.selected.ind === ind
              }
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
    let OpenComp = <React.Fragment />;
    if (this.state.selected !== undefined) {
      const openCompTmp = this.navList[this.state.selected.nav][this.state.selected.ind];
      if (
        openCompTmp.type === 'icon' &&
        openCompTmp.openSidebar !== undefined &&
        openCompTmp.openSidebar.type === 'tab'
      ) {
        OpenComp = (
          <div
            style={{
              borderLeft: '1px solid black',
              width: '100%',
              height: '100%',
              padding: '15px',
              paddingTop: '24px',
              pointerEvents: 'auto',
              overflowY: 'scroll'
            }}
          >
            {openCompTmp.openSidebar.element}
          </div>
        );
      }
    }

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
            {this.NavWrap('nav1', this.navList.nav1)}
          </div>
          <div
            style={{ height: '25%', width: this.minimizedWidth, display: 'flex', flexFlow: 'column-reverse nowrap' }}
          >
            {this.NavWrap('nav2', this.navList.nav2)}
          </div>
        </div>
        {OpenComp}
      </div>
    );
  }
}
