import React, {Component} from 'react';
import { Rect, Line } from 'react-konva';
import Konva from 'konva';
type KonvaEventObject<T> = Konva.KonvaEventObject<T>;

import { Vector2D, DirectionType } from '@compx/common/Types';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';

import { WheelHandler, MouseOnBlockExtracted, CalculateScreenBlockSizeAndPosition } from '../../utils'
import { ThemeType } from "../../../../../types";
import { HexToRgbA } from "../../../../../theme/helpers";
import PortList from "./PortList";

type ArrowDirectionType = "ew" | "ns" | "nesw" | "nwse";
const lineDict: Record<DirectionType, ArrowDirectionType> = {'n': 'ns', 's': 'ns', 'e': 'ew', 'w': 'ew', 'nw': 'nwse', 'se': 'nwse', 'ne': 'nesw', 'sw': 'nesw'}
type PropType = {
    konvaStage: Konva.Stage,
    onSelectBlock?: (blockId: string, selectMultiple: boolean, selectedOn: MouseOnBlockExtracted<"BLOCK" | "BLOCK_EDGE">)=>void,
    onMouseDown: ( on: MouseOnBlockExtracted<"BLOCK" | "BLOCK_EDGE" | "PORT">) => void,
    onMouseUp?: (on?: { mouseOn: "PORT", portId: string, isOutput: boolean}) => void,
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
            this.props.onSelectBlock?.(this.props.block.id, true, {mouseOn: "BLOCK"});
            this.setState({mouseDownRect: true}, ()=>this.props.onMouseDown?.({mouseOn: "BLOCK"}));
        } else if (e.evt.button === 0) {
            this.props.onSelectBlock?.(this.props.block.id, false, {mouseOn: "BLOCK"});
            this.setState({mouseDownRect: true}, ()=>this.props.onMouseDown?.({mouseOn: "BLOCK"}));
        }
    }

    onMouseUpRectHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.stopPropagation();
        this.setState({mouseDownRect: false}, this.props.onMouseUp);
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
        this.props.onSelectBlock?.(this.props.block.id, false, {mouseOn: "BLOCK_EDGE", direction: dir});
        this.setState({mouseDownBorder: dir},
            ()=>this.props.onMouseDown?.({mouseOn: "BLOCK_EDGE", direction: dir}));
    }

    onMouseUpBorderHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.stopPropagation();
        this.setState({mouseDownBorder: undefined}, this.props.onMouseUp);
    }

    onMouseDownPort = (e: KonvaEventObject<MouseEvent>, portId: string, isOutput: boolean) => {
        // this.props.onSelectBlock?.(this.props.block.id, false, {
        //     mouseOn: "PORT", blockId: this.props.block.id, portId: portId, isOutput: isOutput
        // });
        this.props.onMouseDown?.({mouseOn: "PORT", blockId: this.props.block.id, portId: portId, isOutput: isOutput});
    }

    render() {
        const blockShape = CalculateScreenBlockSizeAndPosition(
            this.props.canvasTranslation, this.props.canvasZoom, this.props.screenSize,
            this.props.block.size, this.props.block.position
        );
        const width = blockShape.size.x; const height = blockShape.size.y;
        const x = blockShape.position.x; const y = blockShape.position.y
        if (width <= 25 || height <= 25) return <React.Fragment/>

        let radius = 5;
        radius = (width > (2.2*radius) && height > (2.2*radius)) ? radius : 5;

        const lineProps = (borderDir: DirectionType): Konva.LineConfig => ({
            stroke: "transparent",
            strokeWidth: this.resizeSize,
            onMouseDown: (e: KonvaEventObject<MouseEvent>)=>this.onMouseDownBorderHandler(e, borderDir),
            onMouseUp: this.onMouseUpBorderHandler,
            onMouseEnter: (e: KonvaEventObject<MouseEvent>)=>this.onResizeHoverEnter(e, lineDict[borderDir]),
            onMouseLeave: this.onResizeHoverLeave
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
                    onMouseDown={this.onMouseDownRectHandler}
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

                <PortList blockPosition={new Vector2D(x, y)} blockSize={new Vector2D(width, height)}
                          inputPorts={this.props.block.inputPorts} outputPorts={this.props.block.outputPorts}
                          onMouseDown={this.onMouseDownPort}
                          onMouseUp={(e, portId, isOutput) =>
                              this.props.onMouseUp?.({mouseOn: "PORT", portId: portId, isOutput})}
                />
            </React.Fragment>
        )
    }
}