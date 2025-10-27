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
              stroke={props.theme.get('illustration')}
              fill={props.theme.value.primary.background.tint(50).hexString()}
            />
            <style>{`
                  #simTimeInput::placeholder {
                    color: ${props.theme.get('heading')};
                    opacity: 0.4;
                  }
                  #simTimeInput::focus {
                    outline: none!important
                  }
            `}</style>
            <Form.Control
              id="simTimeInput"
              type="text"
              size="sm"
              placeholder="Simulation Time"
              style={{
                width: '200px',
                backgroundColor: props.theme.value.primary.background.tint(50).hexString(),
                border: 0,
                outline: 0,
                color: props.theme.get('heading')
              }}
              onChange={() => console.log('Changed')}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
