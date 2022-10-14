import React from 'react';
import { BatteryCharging, BookOpen, Settings, Trash } from 'react-feather';

import { ThemeType } from '../../../../../types';

const iconCSS: React.CSSProperties = {
  marginTop: '24px',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'inline-block',
  width: '24px',
  height: '24px'
};

const blurCss: React.CSSProperties = {
  filter: 'blur(0.5px)',
  msFilter: 'blur(0.5px)',
  backgroundColor: '#ccc',
  borderRadius: '10%',
  padding: '2px'
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const IconDict = (
  stroke: string,
  onHoverEnter: (icon: IconsType) => void,
  onHoverLeave: () => void,
  onClick: (icon: IconsType) => void
) => {
  const style = (addBackground: boolean) => (addBackground ? { ...iconCSS, ...blurCss } : iconCSS);

  return {
    library: (hovering: boolean, selected: boolean) => (
      <BookOpen
        style={style(hovering || selected)}
        stroke={stroke}
        onClick={() => onClick('library')}
        onMouseEnter={() => onHoverEnter('library')}
        onMouseLeave={onHoverLeave}
      />
    ),
    trash: (hovering: boolean, selected: boolean) => (
      <Trash
        style={style(hovering || selected)}
        stroke={stroke}
        onClick={() => onClick('trash')}
        onMouseEnter={() => onHoverEnter('trash')}
        onMouseLeave={onHoverLeave}
      />
    ),
    charging: (hovering: boolean, selected: boolean) => (
      <BatteryCharging
        style={style(hovering || selected)}
        stroke={stroke}
        onClick={() => onClick('charging')}
        onMouseEnter={() => onHoverEnter('charging')}
        onMouseLeave={onHoverLeave}
      />
    ),
    settings: (hovering: boolean, selected: boolean) => (
      <Settings
        style={style(hovering || selected)}
        stroke={stroke}
        onClick={() => onClick('settings')}
        onMouseEnter={() => onHoverEnter('settings')}
        onMouseLeave={onHoverLeave}
      />
    ),
    user: (hovering: boolean, selected: boolean) => (
      <div
        role="presentation"
        style={{
          ...style(hovering || selected),
          width: '50px',
          height: '50px',
          borderRadius: '10%',
          border: `1px solid ${stroke}`,
          marginBottom: '24px'
        }}
        onClick={() => onClick('user')}
        onMouseEnter={() => onHoverEnter('user')}
        onMouseLeave={onHoverLeave}
      >
        <div
          style={{
            margin: '4px 4px',
            width: '40px',
            height: '40px',
            borderRadius: '10%',
            background:
              'url(https://image.shutterstock.com/shutterstock/photos/1655747050/display_1500/stock-photo-young-adult-profile-picture-with-red-hair-1655747050.jpg)',
            backgroundPosition: '50% 50%',
            backgroundSize: 'cover'
          }}
        />
      </div>
    )
  };
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type IconsType = keyof ReturnType<typeof IconDict>;

type PropTypes = {
  sidebarWidth: string;
  theme: ThemeType;
  sidebarTabSelected?: IconsType;
  onSelectedTab: (tab?: IconsType) => void;
};

function MinimizedSideBar(props: {
  theme: ThemeType;
  sidebarTabSelected?: IconsType;
  onSelectedTab: (tab?: IconsType) => void;
}): React.ReactElement {
  const [hover, setHover] = React.useState<IconsType | undefined>(undefined);
  const iconDict = IconDict(
    props.theme.palette.background,
    (icon: IconsType) => setHover(icon),
    () => setHover(undefined),
    (icon: IconsType) => props.onSelectedTab(icon)
  );

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexFlow: 'column nowrap' }}>
      <div style={{ width: '100%', height: '75%', display: 'flex', flexFlow: 'column nowrap' }}>
        {iconDict['library'](hover === 'library', props.sidebarTabSelected === 'library')}
        {iconDict['trash'](hover === 'trash', props.sidebarTabSelected === 'trash')}
        {iconDict['charging'](hover === 'charging', props.sidebarTabSelected === 'charging')}
      </div>

      <div style={{ width: '100%', height: '25%', display: 'flex', flexFlow: 'column-reverse nowrap' }}>
        {iconDict['user'](hover === 'user', props.sidebarTabSelected === 'user')}
        {iconDict['settings'](hover === 'settings', props.sidebarTabSelected === 'settings')}
      </div>
    </div>
  );
}

export default function SideBar(props: PropTypes): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexFlow: 'row nowrap', width: '100%', height: '100%' }}>
      <div style={{ height: '100%', width: props.sidebarWidth }}>
        <MinimizedSideBar
          theme={props.theme}
          onSelectedTab={props.onSelectedTab}
          sidebarTabSelected={props.sidebarTabSelected}
        />
      </div>
      {props.sidebarTabSelected !== undefined ? (
        <div
          style={{
            height: '100%',
            width: `calc(100% - ${props.sidebarWidth})`,
            borderLeft: `2px solid ${props.theme.palette.shadow}`
          }}
        />
      ) : (
        <React.Fragment />
      )}
    </div>
  );
}
