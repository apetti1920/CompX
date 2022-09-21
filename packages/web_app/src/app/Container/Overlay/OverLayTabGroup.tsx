import React from 'react';

type LocationType = 'Top' | 'Right' | 'Bottom' | 'Left';
export function OverLayTabGroup(
  props: React.PropsWithChildren<{
    style?: React.CSSProperties;
    location: LocationType;
  }>
): React.ReactElement {
  if (React.Children.count(props.children) === 0) return <React.Fragment />;

  const paddingAmount = 30;
  const id = `${props.location}-overlay`;
  const normalStyle: React.CSSProperties = {
    display: 'flex',
    boxSizing: 'border-box',
    padding: `${paddingAmount}px 0px ${paddingAmount}px ${paddingAmount / 2}px`
  };

  switch (props.location) {
    case 'Top':
    case 'Bottom': {
      return (
        <div
          id={id}
          style={{
            ...normalStyle,
            flexFlow: 'column nowrap',
            width: '100%',
            gap: '12px'
          }}
        >
          {React.Children.map(props.children, (c) => {
            const b = c as React.ReactElement;
            return React.cloneElement(b, {
              ...b.props,
              style: { ...b.props.style, ...props.style, width: '100%' }
            });
          })}
        </div>
      );
    }
    case 'Left':
    case 'Right': {
      return (
        <div
          id={id}
          style={{
            ...normalStyle,
            flexFlow: `row${props.location === 'Right' ? '-reverse' : ''} nowrap`,
            height: '100%',
            gap: '12px'
          }}
        >
          {React.Children.map(props.children, (c) => {
            const b = c as React.ReactElement;
            return React.cloneElement(b, {
              ...b.props,
              style: { ...b.props.style, ...props.style, height: '100%' }
            });
          })}
        </div>
      );
    }
  }
}
