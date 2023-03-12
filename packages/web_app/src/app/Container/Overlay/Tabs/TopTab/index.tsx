import React from 'react';
import { Container, Form } from 'react-bootstrap';
import { Play } from 'react-feather';

import ColorTheme from '../../../../../theme/ColorTheme';
import { SetOpacityHex } from '../../../../../theme/helpers';

type PropsType = {
  theme: ColorTheme;
};

export default function TopTab(props: PropsType) {
  return (
    <div
      style={{
        width: '100%',
        height: '150px',
        background: `linear-gradient(to top, ${SetOpacityHex(
          props.theme.value.primary.background.tint(80).hexString(),
          0.0
        )}, ${SetOpacityHex(props.theme.value.primary.background.tint(80).hexString(), 1.0)})`,
        pointerEvents: 'auto'
      }}
    >
      <Container fluid style={{ height: '40px', margin: '24px', padding: '0px 40px 0px 0px' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: props.theme.get('background'),
            borderRadius: '20px',
            display: 'flex',
            flexFlow: 'row nowrap',
            padding: '0px 20px 0px 20px'
          }}
        >
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              flexFlow: 'row nowrap',
              alignItems: 'center',
              gap: '5px'
            }}
          />
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              flexFlow: 'row nowrap',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Play
              stroke={props.theme.value.secondary.illustration.shade(80).hexString()}
              fill={props.theme.get('illustration')}
            />
            <style>{`
                  #simTimeInput::placeholder {
                    color: ${props.theme.get('illustration')};
                    opacity: 0.4;
                  }
            `}</style>
            <Form.Control
              id="simTimeInput"
              type="text"
              size="sm"
              placeholder="Simulation Time"
              style={{
                width: '200px',
                backgroundColor: props.theme.get('illustration'),
                color: props.theme.get('illustration')
              }}
              onChange={() => console.log('Changed')}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
