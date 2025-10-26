import { BlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import React from 'react';
import { useDrag } from 'react-dnd';

import ColorTheme from '../../../../../../../theme/ColorTheme';

type PropsType = {
  theme: ColorTheme;
  block: BlockStorageType<any, any>;
};

export default function CardComponent(props: PropsType) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: { type: 'block', blockTemplate: props.block },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      style={{
        width: '100%',
        minHeight: '60px',
        padding: '8px',
        backgroundColor: props.theme.get('support'),
        border: 'solid 1px black',
        borderRadius: '6px',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
      }}
      ref={drag}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontWeight: '600', fontSize: '13px', color: props.theme.get('heading'), lineHeight: '1.2' }}>
        {props.block.name}
      </div>
      <div style={{ fontSize: '11px', color: props.theme.get('heading'), opacity: 0.65, lineHeight: '1.3' }}>
        {props.block.description}
      </div>
      <div style={{ fontSize: '9px', display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
        {props.block.tags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '1px 5px',
              backgroundColor: props.theme.get('action'),
              color: 'white',
              borderRadius: '3px',
              fontWeight: '500'
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
