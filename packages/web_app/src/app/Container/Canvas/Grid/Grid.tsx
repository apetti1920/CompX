import React, { Component } from 'react';

import { Rect, Line, Shape } from 'react-konva';
import Konva from 'konva';
type KonvaEventObject<T> = Konva.KonvaEventObject<T>;

import { PointType } from '@compx/common/Types';
import { Clamp, LinearInterp } from '@compx/common/Helpers/Other';
import { WheelHandler } from '../utils'
import { ThemeType } from "../../../../types";
import { HexToRgbA, SetOpacityHex } from "../../../../theme/helpers";


// ----------------------------------- Grid Helpers --------------------------------------------------------------------
const TWO_PI = 2 * Math.PI;
function CircleGrid(canvasSize: PointType, position: PointType,
    spacing: number, radius: number, color: string
): React.ReactElement {
    // Calculations for how many dots across have to appear on screen
    const halfSizeX = canvasSize.x / 2.0; const halfSizeY = canvasSize.y / 2.0;
    const xLow = spacing*Math.ceil((position.x-halfSizeX)/spacing);
    const xHigh = spacing*Math.floor((position.x + halfSizeX)/spacing);

    // Calculations for how many dots high have to appear on screen
    const yLow = spacing*Math.ceil((position.y-halfSizeY)/spacing);
    const yHigh = spacing*Math.floor((position.y+halfSizeY)/spacing);

    return <Shape sceneFunc={(context, _) => {
            context.beginPath();

            for (let ix=xLow-spacing; ix<=xHigh+spacing; ix+=spacing) {
                for (let iy=yLow-spacing; iy<=yHigh+spacing; iy+=spacing) {
                    // Calculate the location of the specified dot
                    const xPos = halfSizeX - (ix - position.x);
                    const yPos = halfSizeY - (iy - position.y);

                    context.moveTo(xPos, yPos);
                    context._context.arc(xPos, yPos, radius, 0, TWO_PI, false)
                }
            }

            context._context.fillStyle = color;
            context.fill();
        }}
      listening={false} perfectDrawEnabled={false} shadowEnabled={false}
      shadowForStrokeEnabled={false} hitStrokeWidth={0} />
}

function CenterTarget(props: {screenSize: PointType, canvasTranslation: PointType}): React.ReactElement {
    const center = {
        x: (props.screenSize.x/2.0) + props.canvasTranslation.x,
        y: (props.screenSize.y/2.0) + props.canvasTranslation.y
    };

    return (
        <React.Fragment>
            <Line
                points={[center.x, center.y, center.x + 75, center.y]}
                stroke="green" lineWidth={3} lineCap="round" lineJoin='round'
            />
            <Line
                points={[center.x, center.y, center.x, center.y - 75]}
                stroke="red" lineWidth={3} lineCap="round" lineJoin='round'
            />
        </React.Fragment>

    )
}

type GridPropType = {
    screenSize: PointType, theme: ThemeType,
    canvasTranslation: PointType, canvasZoom: number
};
type DrawGridArgType = {
    pct: number, spacing: number, color: string,
    CircleGridBind: (spacing: number, radius: number, color: string)=>React.ReactElement,
    rgba1: string
}
class GridInt extends Component<GridPropType, {}> {
    private readonly zoomInterval: number = 8;

    constructor(props: GridPropType) {
        super(props);
    }

    DrawGrid1 = (props: DrawGridArgType): React.ReactElement => {
        if (props.pct >= 0.0 && props.pct < (2/5)) {
            // hold 1
            return props.CircleGridBind(props.spacing, 1.0, props.rgba1);
        } else if (props.pct >= (2/5) && props.pct < (3/5)) {
            // grow 1
            const radius = LinearInterp(props.pct, (2/5), (3/5), 1.0, 3.0);
            return props.CircleGridBind(props.spacing, radius, props.rgba1);
        } else if (props.pct >= (3/5) && props.pct < (5/5)) {
            // hold 1
            return props.CircleGridBind(props.spacing, 3.0, props.rgba1);
        } else {
            return <React.Fragment />
        }
    }

    DrawGrid2 = (props: DrawGridArgType): React.ReactElement => {
        if (props.pct >= 0.0 && props.pct < (1/5)) {
            // Hold
            return props.CircleGridBind(props.spacing*10, 3.0, props.rgba1);
        } else if (props.pct >= (1/5) && props.pct < (7/15)) {
            // Fade Out
            const radius = LinearInterp(props.pct, (1/5), (7/15), 3.0, 1.0);
            const opacity = Clamp(LinearInterp(props.pct, (1/5), (7/15), 0.8, 0.0), 0.0, 1.0);
            const rgba = HexToRgbA(props.color, opacity);
            return props.CircleGridBind(props.spacing*10, radius, rgba);
        } else if (props.pct >= (7/15) && props.pct < (4/5)) {
            // Fade in
            const opacity = Clamp(LinearInterp(props.pct, (7 / 15), (4 / 5), 0.0, 0.8), 0.0, 1.0);
            const rgba = HexToRgbA(props.color, opacity);
            return props.CircleGridBind(props.spacing/10, 1.0, rgba);
        } else if (props.pct >= (4/5) && props.pct < (5/5)) {
            // Hold
            return props.CircleGridBind(props.spacing/10, 1.0, props.rgba1);
        } else {
            return <React.Fragment />
        }
    }

    DrawGrids = (): React.ReactElement => {
        // Calculates the percentage of the way through any single zoom level
        // Calculates which level the zoom is on
        const pct =  (this.props.canvasZoom % this.zoomInterval) / this.zoomInterval;
        const level = Math.ceil(this.props.canvasZoom / this.zoomInterval);

        // Color Calculator
        const color = this.props.theme.palette.shadow;
        const rgba1 = HexToRgbA(SetOpacityHex(color, 0.8));

        // Calculates the spacinging between any two dots
        // TODO: This imploads at higher zoom levels but works fine for our purposes. May wnat to fix in future
        const spacing = 50 * this.props.canvasZoom / Math.pow(10, (level - 1));

        // Function Binding for easier use
        const CircleGridBind = (spacing: number, radius: number, color: string): React.ReactElement => CircleGrid(
            this.props.screenSize, this.props.canvasTranslation, spacing,
            radius, color
        );

        return (
            <React.Fragment>
                <this.DrawGrid1
                    pct={pct} spacing={spacing} color={this.props.theme.palette.shadow}
                    CircleGridBind={CircleGridBind} rgba1={rgba1} />
                <this.DrawGrid2
                    pct={pct} spacing={spacing} color={this.props.theme.palette.shadow}
                    CircleGridBind={CircleGridBind} rgba1={rgba1} />
            </React.Fragment>
        )
    }

    render() {
        return <this.DrawGrids />;
    }
}

// --------------------------------- Full Grid -------------------------------------------------------------------------
type PropType = {
    screenSize: PointType, canvasTranslation: PointType, canvasZoom: number,
    theme: ThemeType, onTranslate: (position: PointType)=>void,
    onZoom: (delta: number, zoomAround: PointType) => void,
    onClick: ()=>void
};

type StateType = {
    mouseDown: boolean
};

export default class Grid extends Component<PropType, StateType> {
    constructor(props: PropType) {
        super(props);
        this.state = {
            mouseDown: false
        }
    }

    // -------------------------------- Mouse Click Handlers -----------------------------------------------------------
    MouseDownHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.preventDefault()

        if (e.evt.button !== 0) return;
        this.setState({ mouseDown: true });
        e.cancelBubble = true;
    }

    MouseMoveHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.preventDefault();

        if (!this.state.mouseDown) return;
        this.props.onTranslate({
            x: this.props.canvasTranslation.x + e.evt.movementX,
            y: this.props.canvasTranslation.y + e.evt.movementY
        });
        e.cancelBubble = true;
    }

    MouseUpHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.preventDefault();

        if (e.evt.button !== 0) return;
        this.setState({mouseDown: false});
        e.cancelBubble = true;
    }

    MouseOutHandler = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.preventDefault();

        this.setState({mouseDown: false});
        e.cancelBubble = true;
    }

    render() {
        return (
            <React.Fragment>
                <GridInt
                    screenSize={this.props.screenSize} theme={this.props.theme}
                    canvasTranslation={this.props.canvasTranslation}
                    canvasZoom={this.props.canvasZoom}
                />
                <CenterTarget screenSize={this.props.screenSize} canvasTranslation={this.props.canvasTranslation} />
                <Rect
                    x={0} y={0} width={this.props.screenSize.x} height={this.props.screenSize.y}
                    onMouseDown={this.MouseDownHandler} onMouseMove={this.MouseMoveHandler}
                    onMouseUp={this.MouseUpHandler} onMouseOut={this.MouseOutHandler}
                    onWheel={(e)=>WheelHandler(
                        e, this.props.onZoom, this.props.canvasTranslation,
                        this.props.canvasZoom, this.props.screenSize
                    )} onClick={this.props.onClick}
                />
            </React.Fragment>
        )
    }
}