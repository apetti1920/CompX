import React, {Component} from 'react';
import { Rect, Line } from 'react-konva';
import Konva from 'konva';
type KonvaEventObject<T> = Konva.KonvaEventObject<T>;

import { Vector2D, DirectionType } from '@compx/common/Types';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { WheelHandler } from  '../../utils'
import { ThemeType } from "../../../../../types";
import { HexToRgbA } from "../../../../../theme/helpers";

type ArrowDirectionType = "ew" | "ns" | "nesw" | "nwse"
const lineDict: Record<DirectionType, ArrowDirectionType> = {'n': 'ns', 's': 'ns', 'e': 'ew', 'w': 'ew', 'nw': 'nwse', 'se': 'nwse', 'ne': 'nesw', 'sw': 'nesw'}
type PropType = {
    konvaStage: Konva.Stage,
    onSelectBlock: (blockId: string, selectMultiple: boolean)=>void,
    onMouseMoveRect: (delta: Vector2D)=>void,
    onMouseResize: (blockId: string, resizeDirection: DirectionType, delta: Vector2D)=>void,
    screenSize: Vector2D,
    canvasTranslation: Vector2D,
    canvasZoom: number,
    block: VisualBlockStorageType<any, any>,
    theme: ThemeType,
    onZoom: (delta: number, around: Vector2D) => void
};
type StateType = {
    mouseDownRect: boolean,
    mouseDownBorder?: DirectionType
};

export default class BlockComponent extends Component<PropType, StateType> {
    private readonly resizeSize: number = 8;

    constructor(props: PropType) {
        super(props);

        this.state = {
            mouseDownRect: false,
            mouseDownBorder: undefined
        }
    }

    onMouseDownRectHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.stopPropagation();

        if (e.evt.shiftKey) {
            this.props.onSelectBlock(this.props.block.id, true);
        } else if (e.evt.button === 0) {
            this.props.onSelectBlock(this.props.block.id, false);
        }

        this.setState({mouseDownRect: true});
    }

    onMouseMoveRectHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.stopPropagation();
        if (!this.state.mouseDownRect) return;

        const delta = new Vector2D(e.evt.movementX/this.props.canvasZoom, -e.evt.movementY/this.props.canvasZoom);
        this.props.onMouseMoveRect(delta);
    }

    onMouseUpRectHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.stopPropagation();
        this.setState({mouseDownRect: false});
    }

    onResizeHoverEnter = (e: KonvaEventObject<MouseEvent>, side: ArrowDirectionType) => {
        e.evt.stopPropagation();
        this.props.konvaStage.container().style.cursor = `${side}-resize`;
    }

    onResizeHoverLeave = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.stopPropagation();
        this.props.konvaStage.container().style.cursor = 'default';
    }

    onMouseDownBorderHandler = (e: KonvaEventObject<MouseEvent>, dir: DirectionType) => {
        e.evt.stopPropagation();
        this.setState({mouseDownBorder: dir});
    }

    onMouseMoveBorderHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.stopPropagation();
        if (this.state.mouseDownBorder === undefined) return;

        const delta = new Vector2D(e.evt.movementX/this.props.canvasZoom, -e.evt.movementY/this.props.canvasZoom);
        this.props.onMouseResize(this.props.block.id, this.state.mouseDownBorder, delta);
    }

    onMouseUpBorderHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.stopPropagation();
        this.setState({mouseDownBorder: undefined});
    }

    render() {
        const width = this.props.block.size.x * this.props.canvasZoom;
        const height = this.props.block.size.y * this.props.canvasZoom;
        if (width < 5 || height < 5) return <React.Fragment />;

        const x = (this.props.screenSize.x/2.0) + this.props.canvasTranslation.x - (0.5*width) +
            (this.props.block.position.x * this.props.canvasZoom);
        const y = (this.props.screenSize.y/2.0) + this.props.canvasTranslation.y - (0.5*height) -
            (this.props.block.position.y * this.props.canvasZoom);

        let radius = 5;
        radius = (width > (2.2*radius) && height > (2.2*radius)) ? radius : 5;

        const lineProps = (borderDir: DirectionType): Konva.LineConfig => ({
            stroke: "transparent",
            strokeWidth: this.resizeSize,
            onMouseOut: this.onResizeHoverLeave,
            onMouseOver: (e: KonvaEventObject<MouseEvent>)=>this.onResizeHoverEnter(e, lineDict[borderDir]),
            onMouseDown: (e: KonvaEventObject<MouseEvent>)=>this.onMouseDownBorderHandler(e, borderDir),
            onMouseMove: this.onMouseMoveBorderHandler,
            onMouseUp: this.onMouseUpBorderHandler
        });

        return (
            <React.Fragment>
                <Rect
                    x={x} y={y} width={width} height={height}
                    cornerRadius={radius} fill={this.props.block.color ?? this.props.theme.palette.background}
                    stroke={!this.props.block.selected?HexToRgbA(this.props.theme.palette.text, 0.5):"red"}
                    strokeWidth={!this.props.block.selected?1:3} shadowColor={this.props.theme.palette.shadow}
                    shadowOffsetY={2.5} shadowOffsetX={2.5} shadowBlur={2.5} perfectDrawEnabled={false}
                    shadowEnabled={false} shadowForStrokeEnabled={false} hitStrokeWidth={0}
                    onMouseUp={this.onMouseUpRectHandler}
                    onMouseMove={this.onMouseMoveRectHandler} onMouseDown={this.onMouseDownRectHandler}
                    onMouseLeave={this.onMouseUpRectHandler} onMouseOut={this.onMouseUpRectHandler}
                    onWheel={(e)=>WheelHandler(
                        e, this.props.onZoom, this.props.canvasTranslation,
                        this.props.canvasZoom, this.props.screenSize
                    )}
                />
                <Line points={[x+this.resizeSize, y, x+width-this.resizeSize, y]}
                      {...lineProps("n")} />
                <Line points={[x+width-this.resizeSize, y, x+width, y, x+width, y+this.resizeSize]}
                      {...lineProps("ne")}/>
                <Line points={[x+width, y+this.resizeSize, x+width, y-this.resizeSize+height]}
                      {...lineProps("e")}/>
                <Line points={[x+width, y-this.resizeSize+height, x+width, y+height, x+width-this.resizeSize, y+height]}
                      {...lineProps("se")} />
                <Line points={[x+width-this.resizeSize, y+height, x+this.resizeSize, y+height]}
                      {...lineProps("s")}/>
                <Line points={[x+this.resizeSize, y+height, x, y+height, x, y+height-this.resizeSize]}
                      {...lineProps("sw")}/>
                <Line points={[x, y+height-this.resizeSize, x, y+this.resizeSize]}
                      {...lineProps("w")} />
                <Line points={[x, y+this.resizeSize, x, y, x+this.resizeSize, y]}
                      {...lineProps("nw")}/>
            </React.Fragment>
        )
    }
}