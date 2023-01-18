import React from 'react';
import { Container, Form } from 'react-bootstrap';
import { Play } from 'react-feather';

import { SetOpacityHex } from '../../../../../theme/helpers';
import { ThemeType } from '../../../../../types';

type PropsType = {
  theme: ThemeType;
};

export default function TopTab(props: PropsType) {
  return (
    <div
      style={{
        width: '100%',
        height: '150px',
        background: `linear-gradient(to top, ${SetOpacityHex(props.theme.palette.background, 0.0)}, 
                                    ${SetOpacityHex(props.theme.palette.background, 1.0)})`,
        pointerEvents: 'auto'
      }}
    >
      <Container fluid style={{ height: '40px', margin: '24px', padding: '0px 40px 0px 0px' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: props.theme.palette.text,
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
            <Play stroke={props.theme.palette.shadow} fill={SetOpacityHex(props.theme.palette.shadow, 0.5)} />
            <style>{`
                  #simTimeInput::placeholder {
                    color: ${props.theme.palette.text};
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
                backgroundColor: props.theme.palette.shadow,
                color: props.theme.palette.text
              }}
              onChange={() => console.log('Changed')}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
