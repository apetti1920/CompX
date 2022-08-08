import React, {Component} from 'react';

import {bindActionCreators, Dispatch} from "redux";
import {connect} from "react-redux";
import {throttle} from "lodash";
import Konva from 'konva';
import {Stage, Layer, Rect} from 'react-konva';

import { PortStringListType } from '@compx/common/Graph/Port'
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { PointType } from '@compx/common/Types'
import {StateType as SaveState} from "../../../store/types";
import {TranslatedCanvasAction, ZoomedCanvasAction} from "../../../store/actions/canvasactions";
import Grid from "./Grid/Grid";
import {ThemeType} from "../../../types";
import GraphComponent from "./Graph/GraphComponent";
import {DeselectBlockAction, MovedBlocksAction, SelectBlockAction} from "../../../store/actions/graphactions";


type GlobalProps = {
    canvasZoom: number,
    canvasTranslation: PointType,
    blocks:  VisualBlockStorageType<PortStringListType, PortStringListType>[]
    theme: ThemeType
}
type DispatchProps = {
    onSelectBlock: (blockId: string, selectMultiple: boolean) => void,
    onDeselectBlocks: () => void
    onMoveBlocks: (delta: PointType) => void,
    onZoom: (delta: number, around: PointType) => void,
    onTranslate: (point: PointType) => void
}
type ComponentProps = {};
type PropsType = GlobalProps & DispatchProps & ComponentProps
type StateType = {
    canvasSize: PointType,
    dragging: boolean
    // selectedBlockIdsCache: string[]
};

class CanvasContainer extends Component<PropsType, StateType> {
    // Initialize some class variables
    private readonly wrapperRef: React.MutableRefObject<HTMLDivElement | null>;

    // Create the Component
    constructor(props: PropsType) {
        super(props);

        // Set the refs
        this.wrapperRef = React.createRef();
        Konva.pixelRatio = 1;

        this.state = {
            canvasSize: { x: 0.0, y: 0.0 },
            dragging: false
            // selectedBlockIdsCache: []
        }
    }

    componentDidMount() {
        // --------------------------------- State Setting -------------------------------------------------------------
        const SetWindowSize = () => {
            // Check if the refs are present
            if (this.wrapperRef.current === null || this.wrapperRef.current === undefined) return;

            this.setState({
                canvasSize: {x: this.wrapperRef.current.clientWidth, y: this.wrapperRef.current.clientHeight}
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
        // this.setState({
        //     selectedBlockIdsCache: this.props.blocks.filter(block => block.selected).map(block => block.id)
        // });
    }

    onDeselectBlocks = () => {
        // TODO: Only call deselect if cache is present
        // if (this.state.selectedBlockIdsCache.length > 0) {
        this.props.onDeselectBlocks();
        //     this.setState({selectedBlockIdsCache: []});
        // }
    }

    render() {
        return (
            <div ref={this.wrapperRef} style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}>
                <Stage width={window.innerWidth} height={window.innerHeight}>
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

                    {this.props.blocks.length > 0 ? (
                        <Layer id="graph">
                            <GraphComponent
                                blocks={this.props.blocks}
                                onSelectedBlock={this.onSelectBlock} onMoveBlocks={this.props.onMoveBlocks}
                                screenSize={this.state.canvasSize} canvasTranslation={this.props.canvasTranslation}
                                canvasZoom={this.props.canvasZoom} theme={this.props.theme} onZoom={this.props.onZoom} />
                        </Layer>
                    ) : <React.Fragment /> }

                    {/*TODO: Impliment Moving Layer*/}
                    {/*{this.props.blocks.filter(blo).length > 0 ? (*/}
                    {/*    <Layer id="dragging-graph">*/}
                    {/*        <GraphComponent*/}
                    {/*            blocks={this.state.draggingBlocks}*/}
                    {/*            dragEvent={{dragging: {onDrag: this.onBlockDrag, onDragEng: this.onBlockDragEnd}}}*/}
                    {/*            screenSize={this.state.canvasSize} canvasTranslation={this.props.canvasTranslation}*/}
                    {/*            canvasZoom={this.props.canvasZoom} theme={this.props.theme} onZoom={this.props.onZoom} />*/}
                    {/*    </Layer>*/}
                    {/*) : <React.Fragment /> }*/}
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
        onTranslate: TranslatedCanvasAction,
        onZoom: ZoomedCanvasAction
    }, dispatch)
}

// Exports the redux connected component
export default connect(mapStateToProps, mapDispatchToProps)(CanvasContainer);