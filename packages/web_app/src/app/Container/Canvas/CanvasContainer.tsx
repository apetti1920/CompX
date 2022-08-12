import React, {Component} from 'react';

import {bindActionCreators, Dispatch} from "redux";
import {connect} from "react-redux";
import {throttle} from "lodash";
import Konva from 'konva';
import {Stage, Layer, Rect} from 'react-konva';

import { PortStringListType } from '@compx/common/Graph/Port'
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import {DirectionType, Vector2D} from '@compx/common/Types'
import {StateType as SaveState} from "../../../store/types";
import {TranslatedCanvasAction, ZoomedCanvasAction} from "../../../store/actions/canvasactions";
import Grid from "./Grid/Grid";
import {ThemeType} from "../../../types";
import GraphComponent from "./Graph/GraphComponent";
import {
    DeselectBlockAction,
    MovedBlocksAction,
    ResizedBlocksAction,
    SelectBlockAction
} from "../../../store/actions/graphactions";


type GlobalProps = {
    canvasZoom: number,
    canvasTranslation: Vector2D,
    blocks:  VisualBlockStorageType<PortStringListType, PortStringListType>[]
    theme: ThemeType
}
type DispatchProps = {
    onSelectBlock: (blockId: string, selectMultiple: boolean) => void,
    onDeselectBlocks: () => void
    onMoveBlocks: (delta: Vector2D) => void,
    onResizeBlocks: (blockId: string, resizeDirection: DirectionType, delta: Vector2D)=>void
    onZoom: (delta: number, around: Vector2D) => void,
    onTranslate: (point: Vector2D) => void
}
type ComponentProps = {};
type PropsType = GlobalProps & DispatchProps & ComponentProps
type StateType = {
    canvasSize: Vector2D,
    dragging: boolean
    // selectedBlockIdsCache: string[]
};

class CanvasContainer extends Component<PropsType, StateType> {
    // Initialize some class variables
    private readonly wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
    private readonly stageRef: React.MutableRefObject<Konva.Stage | null>

    // Create the Component
    constructor(props: PropsType) {
        super(props);

        // Set the refs
        this.wrapperRef = React.createRef();
        this.stageRef = React.createRef();
        Konva.pixelRatio = 1;

        this.state = {
            canvasSize: new Vector2D(),
            dragging: false
            // selectedBlockIdsCache: []
        }
    }

    componentDidMount() {
        // --------------------------------- State Setting -------------------------------------------------------------
        const SetWindowSize = () => {
            // Check if the refs are present
            if (this.wrapperRef.current === null || this.wrapperRef.current === undefined) return;

            const canvasSize = new Vector2D(this.wrapperRef.current.clientWidth, this.wrapperRef.current.clientHeight)
            this.setState({
                canvasSize: canvasSize
            });
        };
        SetWindowSize();

        // ----------------------------- Resize Event ------------------------------------------------------------------
        window.addEventListener('resize', throttle(() => requestAnimationFrame(SetWindowSize), 180));

        // --------------------------------- Initialize Blocks ---------------------------------------------------------
        // blocks.filter(block => block.selected).map(block => block.id)
    }

    // -------------------------------------- Block Events -------------------------------------------------------------
    onSelectBlock = (blockId: string, selectMultiple: boolean) => {
        this.props.onSelectBlock(blockId, selectMultiple);
    }

    onDeselectBlocks = () => {
        this.props.onDeselectBlocks();
    }

    render() {
        return (
            <div ref={this.wrapperRef} style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}>
                <Stage width={window.innerWidth} height={window.innerHeight} ref={this.stageRef}>
                    <Layer id="background" listening={false}>
                        <Rect x={0} y={0} listening={false}
                              width={this.state.canvasSize.x}
                              height={this.state.canvasSize.y}
                              fill={this.props.theme.palette.background} shadowBlur={10}
                        />
                    </Layer>

                    <Layer id="grid">
                        <Grid screenSize={this.state.canvasSize}
                              canvasTranslation={this.props.canvasTranslation}
                              onTranslate={this.props.onTranslate}
                              canvasZoom={this.props.canvasZoom}
                              onZoom={this.props.onZoom}
                              theme={this.props.theme} onClick={this.onDeselectBlocks}
                        />
                    </Layer>

                    {(this.stageRef.current !== null && this.props.blocks.length > 0) ? (
                        <Layer id="graph">
                            <GraphComponent
                                blocks={this.props.blocks} konvaStage={this.stageRef.current}
                                onMouseResize={this.props.onResizeBlocks}
                                onSelectedBlock={this.onSelectBlock} onMoveBlocks={this.props.onMoveBlocks}
                                screenSize={this.state.canvasSize} canvasTranslation={this.props.canvasTranslation}
                                canvasZoom={this.props.canvasZoom} theme={this.props.theme} onZoom={this.props.onZoom} />
                        </Layer>
                    ) : <React.Fragment /> }
                </Stage>
            </div>
        )
    }
}

// Creates a function to map the redux state to the redux props
function mapStateToProps(state: SaveState): GlobalProps {
    return {
        blocks: state.currentGraph.blocks,
        canvasZoom: state.userStorage.canvas.zoom,
        canvasTranslation: state.userStorage.canvas.translation,
        theme: state.userStorage.theme
    };
}

// Creates  a function to map the redux actions to props
function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
    return bindActionCreators({
        onSelectBlock: SelectBlockAction,
        onDeselectBlocks: DeselectBlockAction,
        onMoveBlocks: MovedBlocksAction,
        onResizeBlocks: ResizedBlocksAction,
        onTranslate: TranslatedCanvasAction,
        onZoom: ZoomedCanvasAction
    }, dispatch)
}

// Exports the redux connected component
export default connect(mapStateToProps, mapDispatchToProps)(CanvasContainer);