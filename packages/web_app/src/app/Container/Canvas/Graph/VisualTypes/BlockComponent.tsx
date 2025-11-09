import React, { Component } from 'react';
import { Rect, Line } from 'react-konva';
import Konva from 'konva';
type KonvaEventObject<T> = Konva.KonvaEventObject<T>;

import { Vector2D, DirectionType } from '@compx/common/Types';

import { WheelHandler, MouseOnBlockExtracted, ArrowDirectionType } from '../../utils';

const lineDict: Record<DirectionType, ArrowDirectionType> = {
  n: 'ns',
  s: 'ns',
  e: 'ew',
  w: 'ew',
  nw: 'nwse',
  se: 'nwse',
  ne: 'nesw',
  sw: 'nesw'
};
type PropType = {
  id: string;
  onSelectBlock?: (
    blockId: string,
    selectMultiple: boolean,
    selectedOn: MouseOnBlockExtracted<'BLOCK' | 'BLOCK_EDGE'>
  ) => void;
  onMouseDown: (on: MouseOnBlockExtracted<'BLOCK' | 'BLOCK_EDGE'>) => void;
  onDoubleClick?: (blockId: string) => void;
  onSetCursorStyle: (side?: ArrowDirectionType) => void;
  screenSize: Vector2D;
  canvasTranslation: Vector2D;
  canvasZoom: number;
  blockShape: { position: Vector2D; size: Vector2D };
  color: string;
  selected: boolean;
  onZoom: (delta: number, around: Vector2D) => void;
};
type StateType = {
  mouseDownRect: boolean;
  mouseDownBorder?: DirectionType;
};

export default class BlockComponent extends Component<PropType, StateType> {
  private readonly resizeSize: number = 8;
  private clickTimeout: NodeJS.Timeout | null = null;
  private lastClickTime: number = 0;

  constructor(props: PropType) {
    super(props);

    this.state = {
      mouseDownRect: false,
      mouseDownBorder: undefined
    };
  }

  onMouseDownRectHandler = (e: KonvaEventObject<MouseEvent>) => {
    // Don't prevent double-click - let it bubble up
    // Only handle single clicks here

    // Detect double-click on mouse down instead of mouse up
    const now = Date.now();
    const timeSinceLastClick = now - this.lastClickTime;

    if (timeSinceLastClick < 300 && timeSinceLastClick > 0 && this.lastClickTime > 0) {
      // Double-click detected on mouse down!
      this.lastClickTime = 0;
      e.evt.stopPropagation();
      this.props.onDoubleClick?.(this.props.id);
      return; // Don't process as single click
    }

    // Record this click time for potential double-click
    this.lastClickTime = now;

    e.evt.stopPropagation();

    if (e.evt.shiftKey) {
      this.props.onSelectBlock?.(this.props.id, true, { mouseOn: 'BLOCK' });
      this.setState({ mouseDownRect: true }, () => this.props.onMouseDown?.({ mouseOn: 'BLOCK' }));
    } else if (e.evt.button === 0) {
      this.props.onSelectBlock?.(this.props.id, false, { mouseOn: 'BLOCK' });
      this.setState({ mouseDownRect: true }, () => this.props.onMouseDown?.({ mouseOn: 'BLOCK' }));
    }
  };

  onMouseUpRectHandler = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    const now = Date.now();
    this.setState({ mouseDownRect: false });

    // Detect double-click manually using class property (not state) for reliable timing
    const timeSinceLastClick = now - this.lastClickTime;

    // Clear any pending timeout
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }

    if (timeSinceLastClick < 300 && timeSinceLastClick > 0 && this.lastClickTime > 0) {
      // Double-click detected!
      this.lastClickTime = 0; // Reset
      this.props.onDoubleClick?.(this.props.id);
    } else {
      // Single click - wait to see if another click comes
      const clickTime = now;
      this.lastClickTime = clickTime;

      // Clear the click count after a delay if no second click
      this.clickTimeout = setTimeout(() => {
        // Only clear if this is still the same click (not overwritten by a second click)
        if (this.lastClickTime === clickTime) {
          this.lastClickTime = 0;
        }
        this.clickTimeout = null;
      }, 300);
    }
  };

  onDoubleClickHandler = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    this.props.onDoubleClick?.(this.props.id);
  };

  onResizeHoverEnter = (e: KonvaEventObject<MouseEvent>, side: ArrowDirectionType) => {
    e.evt.stopPropagation();
    this.props.onSetCursorStyle(side);
  };

  onResizeHoverLeave = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    this.props.onSetCursorStyle();
    // this.props.konvaStage.container().style.cursor = 'default';
  };

  onMouseDownBorderHandler = (e: KonvaEventObject<MouseEvent>, dir: DirectionType) => {
    e.evt.stopPropagation();
    this.props.onSelectBlock?.(this.props.id, false, {
      mouseOn: 'BLOCK_EDGE',
      direction: dir
    });
    this.setState({ mouseDownBorder: dir }, () => this.props.onMouseDown?.({ mouseOn: 'BLOCK_EDGE', direction: dir }));
  };

  onMouseUpBorderHandler = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    this.setState({ mouseDownBorder: undefined });
  };

  render() {
    let radius = 5;
    radius = this.props.blockShape.size.x > 2.2 * radius && this.props.blockShape.size.y > 2.2 * radius ? radius : 5;

    const lineProps = (borderDir: DirectionType): Konva.LineConfig => ({
      stroke: 'transparent',
      strokeWidth: this.resizeSize,
      onMouseDown: (e: KonvaEventObject<MouseEvent>) => this.onMouseDownBorderHandler(e, borderDir),
      onMouseUp: this.onMouseUpBorderHandler,
      onMouseEnter: (e: KonvaEventObject<MouseEvent>) => this.onResizeHoverEnter(e, lineDict[borderDir]),
      onMouseLeave: this.onResizeHoverLeave
    });

    return (
      <React.Fragment>
        <Rect
          x={this.props.blockShape.position.x}
          y={this.props.blockShape.position.y}
          width={this.props.blockShape.size.x}
          height={this.props.blockShape.size.y}
          cornerRadius={radius}
          fill={this.props.color}
          stroke={!this.props.selected ? 'white' : 'red'}
          strokeWidth={!this.props.selected ? 1 : 3}
          shadowColor="gray"
          shadowOffsetY={2.5}
          shadowOffsetX={2.5}
          shadowBlur={2.5}
          perfectDrawEnabled={false}
          shadowEnabled={false}
          shadowForStrokeEnabled={false}
          hitStrokeWidth={10}
          listening={true}
          onMouseUp={this.onMouseUpRectHandler}
          onMouseDown={this.onMouseDownRectHandler}
          onDblClick={this.onDoubleClickHandler}
          onDblTap={this.onDoubleClickHandler}
          onClick={() => {}}
          onWheel={(e) =>
            WheelHandler(
              e,
              this.props.onZoom,
              this.props.canvasTranslation,
              this.props.canvasZoom,
              this.props.screenSize
            )
          }
        />
        <Line
          points={[
            this.props.blockShape.position.x + this.resizeSize,
            this.props.blockShape.position.y,
            this.props.blockShape.position.x + this.props.blockShape.size.x - this.resizeSize,
            this.props.blockShape.position.y
          ]}
          {...lineProps('n')}
        />
        <Line
          points={[
            this.props.blockShape.position.x + this.props.blockShape.size.x - this.resizeSize,
            this.props.blockShape.position.y,
            this.props.blockShape.position.x + this.props.blockShape.size.x,
            this.props.blockShape.position.y,
            this.props.blockShape.position.x + this.props.blockShape.size.x,
            this.props.blockShape.position.y + this.resizeSize
          ]}
          {...lineProps('ne')}
        />
        <Line
          points={[
            this.props.blockShape.position.x + this.props.blockShape.size.x,
            this.props.blockShape.position.y + this.resizeSize,
            this.props.blockShape.position.x + this.props.blockShape.size.x,
            this.props.blockShape.position.y - this.resizeSize + this.props.blockShape.size.y
          ]}
          {...lineProps('e')}
        />
        <Line
          points={[
            this.props.blockShape.position.x + this.props.blockShape.size.x,
            this.props.blockShape.position.y - this.resizeSize + this.props.blockShape.size.y,
            this.props.blockShape.position.x + this.props.blockShape.size.x,
            this.props.blockShape.position.y + this.props.blockShape.size.y,
            this.props.blockShape.position.x + this.props.blockShape.size.x - this.resizeSize,
            this.props.blockShape.position.y + this.props.blockShape.size.y
          ]}
          {...lineProps('se')}
        />
        <Line
          points={[
            this.props.blockShape.position.x + this.props.blockShape.size.x - this.resizeSize,
            this.props.blockShape.position.y + this.props.blockShape.size.y,
            this.props.blockShape.size.x + this.resizeSize,
            this.props.blockShape.size.y + this.props.blockShape.position.y
          ]}
          {...lineProps('s')}
        />
        <Line
          points={[
            this.props.blockShape.position.x + this.resizeSize,
            this.props.blockShape.position.y + this.props.blockShape.size.y,
            this.props.blockShape.position.x,
            this.props.blockShape.position.y + this.props.blockShape.size.y,
            this.props.blockShape.position.x,
            this.props.blockShape.position.y + this.props.blockShape.size.y - this.resizeSize
          ]}
          {...lineProps('sw')}
        />
        <Line
          points={[
            this.props.blockShape.position.x,
            this.props.blockShape.position.y + this.props.blockShape.size.y - this.resizeSize,
            this.props.blockShape.position.x,
            this.props.blockShape.position.y + this.resizeSize
          ]}
          {...lineProps('w')}
        />
        <Line
          points={[
            this.props.blockShape.position.x,
            this.props.blockShape.position.y + this.resizeSize,
            this.props.blockShape.position.x,
            this.props.blockShape.position.y,
            this.props.blockShape.position.x + this.resizeSize,
            this.props.blockShape.position.y
          ]}
          {...lineProps('nw')}
        />
      </React.Fragment>
    );
  }
}
