import React from 'react';
import { useDrag } from 'react-dnd';

import ColorTheme from '../../../../../../../theme/ColorTheme';

type PropsType = {
  theme: ColorTheme;
};

// eslint-disable-next-line react/prefer-stateless-function
export default function CardComponent(props: PropsType) {
  const [_, drag] = useDrag(() => ({
    type: 'card',
    item: { type: 'card', itemID: 1 },
    collect: (monitor) => ({
      item: monitor.getItem(),
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      style={{
        width: '100%',
        height: '80px',
        backgroundColor: props.theme.get('support'),
        border: 'solid 1px black'
      }}
      ref={drag}
    >
      Test
    </div>
  );
}
