import React, { Component } from 'react';

import { bindActionCreators, Dispatch  } from "redux";
import { connect } from "react-redux";
import { throttle } from "lodash";
import Konva from 'konva';
type KonvaEventObject<T> = Konva.KonvaEventObject<T>;
import {  Stage, Layer, Rect } from 'react-konva';
import { Portal } from 'react-konva-utils';

import { PortStringListType, PortTypes } from '@compx/common/Graph/Port';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { VisualEdgeStorageType } from '@compx/common/Network/GraphItemStorage/EdgeStorage';
import { DirectionType, Vector2D } from '@compx/common/Types';

import { StateType as SaveState } from "../../../store/types";
import {TranslatedCanvasAction, ZoomedCanvasAction} from "../../../store/actions/canvasactions";
import Grid from "./Grid/Grid";
import EdgeComponent from './Graph/VisualTypes/EdgeComponent';
import {CalculateScreenBlockSizeAndPosition, MouseOnBlockExtracted} from './utils'
import { ThemeType } from "../../../types";
import {
    AddedEdgeAction,
    DeselectBlockAction,
    MovedBlocksAction,
    ResizedBlocksAction,
    SelectBlockAction
} from "../../../store/actions/graphactions";
import BlockComponent from "./Graph/VisualTypes/BlockComponent";
import PortList from "./Graph/VisualTypes/PortList";


type GlobalProps = {
    canvasZoom: number,
    canvasTranslation: Vector2D,
    blocks:  VisualBlockStorageType<PortStringListType, PortStringListType>[]
    edges: VisualEdgeStorageType<keyof PortTypes>[]
    theme: ThemeType
}
type DispatchProps = {
    onSelectBlock: (blockId: string, selectMultiple: boolean) => void,
    onDeselectBlocks: () => void
    onMoveBlocks: (delta: Vector2D) => void,
    onResizeBlock: (resizeDirection: DirectionType, delta: Vector2D)=>void,
    onAddEdge: (output: {blockID: string, portID: string}, input: {blockID: string, portID: string})=>void,
    onZoom: (delta: number, around: Vector2D) => void,
    onTranslate: (point: Vector2D) => void
}
type ComponentProps = {};
type PropsType = GlobalProps & DispatchProps & ComponentProps
type StateType = {
    canvasSize: Vector2D,
    dragging: boolean,
    mouseDown?: MouseOnBlockExtracted<"BLOCK" | "BLOCK_EDGE" | "PORT">
};

class CanvasContainer extends Component<PropsType, StateType> {
    // Initialize some class variables
    private readonly wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
    private readonly stageRef: React.MutableRefObject<Konva.Stage | null>;

    // Create the Component
    constructor(props: PropsType) {
        super(props);

        // Set the refs
        this.wrapperRef = React.createRef();
        this.stageRef = React.createRef();
        Konva.pixelRatio = 1;

        this.state = {
            canvasSize: new Vector2D(),
            dragging: false,
            mouseDown: undefined
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
    }

    // -------------------------------------- Block Events -------------------------------------------------------------
    onMouseDownBlock = (on: MouseOnBlockExtracted<"BLOCK" | "BLOCK_EDGE" | "PORT">) => this.setState({mouseDown: on});
    onMouseUpBlock = (on?: MouseOnBlockExtracted<"PORT">) => {
        if (on !== undefined && this.state.mouseDown?.mouseOn === "PORT") {
            const mouseDownBlock = { blockID: this.state.mouseDown.blockId, portID: this.state.mouseDown.portId  };
            const mouseUpBlock = { blockID: on.blockId, portID: on.portId };

            this.props.onAddEdge(
                this.state.mouseDown.isOutput?mouseDownBlock:mouseUpBlock,
                this.state.mouseDown.isOutput?mouseUpBlock:mouseDownBlock
            )
        }

        this.setState({mouseDown: undefined});
    }
    onMouseMoveBlock = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.stopPropagation();
        if (this.state.mouseDown === undefined) return;

        if (this.state.mouseDown.mouseOn === "BLOCK") {
            const delta = new Vector2D(e.evt.movementX/this.props.canvasZoom, -e.evt.movementY/this.props.canvasZoom);
            this.props.onMoveBlocks(delta);
        } else if (this.state.mouseDown.mouseOn === "BLOCK_EDGE") {
            const delta = new Vector2D(e.evt.movementX/this.props.canvasZoom, -e.evt.movementY/this.props.canvasZoom);
            this.props.onResizeBlock(this.state.mouseDown.direction, delta);
        }
    }

    onMouseMovePort = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.stopPropagation();
        if (this.state.mouseDown === undefined || this.state.mouseDown.mouseOn !== "PORT") return;

        this.setState({mouseDown: {...this.state.mouseDown, mouseLocation: new Vector2D(e.evt.x, e.evt.y)}});
    }

    onSelectBlock = (blockId: string, selectMultiple: boolean, selectedOn: MouseOnBlockExtracted<"BLOCK" | "BLOCK_EDGE">) => {
        this.props.onSelectBlock(blockId, selectMultiple);
        this.setState({mouseDown: selectedOn});
    }

    onDeselectBlocks = () => {
        this.props.onDeselectBlocks();
    }

    BlockPortComponent = (props: { block: VisualBlockStorageType<any, any> }) => {
        const blockShape = CalculateScreenBlockSizeAndPosition(
            this.props.canvasTranslation, this.props.canvasZoom, this.state.canvasSize,
            props.block.size, props.block.position
        );
        if (blockShape.size.x <= 25 || blockShape.size.y <= 25) return <React.Fragment/>

        const PortListWrapper = () => (
            <PortList onMouseUp={(portId, isOutput) =>
                this.onMouseUpBlock({
                    mouseOn: "PORT", blockId: props.block.id, portId: portId, isOutput
                })}
                      onMouseDown={(portId: string, isOutput: boolean,
                                    portLocation: Vector2D)=>this.onMouseDownBlock({
                          mouseOn: "PORT", blockId: props.block.id,
                          portId: portId, isOutput: isOutput, portLocation: portLocation
                      })}
                      inputPorts={props.block.inputPorts} blockShape={blockShape}
                      outputPorts={props.block.outputPorts}
            />
        )

        return (
            <React.Fragment key={`block-${props.block.id}`}>
                {/*------------------------- Draw Blocks ------------------------------------------------------------*/}
                <BlockComponent id={props.block.id} blockShape={blockShape}
                                color={props.block.color??"green"} selected={props.block.selected}
                                konvaStage={this.stageRef.current!}
                                onMouseDown={this.onMouseDownBlock}
                                screenSize={this.state.canvasSize}
                                canvasTranslation={this.props.canvasTranslation}
                                canvasZoom={this.props.canvasZoom}
                                onSelectBlock={this.onSelectBlock}
                                onZoom={this.props.onZoom}
                />

                {/*------------------------------- Draw Ports -------------------------------------------------------*/}
                {this.state.mouseDown?.mouseOn === "PORT" ? (
                    <Portal selector='#selected-block' enabled={true}>
                        <PortListWrapper/>
                    </Portal>
                ):<PortListWrapper/>}
            </React.Fragment>
        )
    }

    render() {
        // Do this so selected blocks are not placed above the active port drag layer
        let notSelectedBlocks: VisualBlockStorageType<any,any>[]; let selectedBlocks: VisualBlockStorageType<any,any>[];
        if (this.state.mouseDown?.mouseOn !== "PORT") {
            notSelectedBlocks = this.props.blocks.filter(b => !b.selected);
            selectedBlocks = this.props.blocks.filter(b => b.selected);
        } else {
            notSelectedBlocks = this.props.blocks;
            selectedBlocks = [];
        }

        return (
            <div ref={this.wrapperRef} style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}>
                <Stage width={window.innerWidth} height={window.innerHeight} ref={this.stageRef}>
                    {/* ------------------------------------ Background ---------------------------------------------*/}
                    <Layer id='static'>
                        <Rect x={0} y={0} listening={false}
                              width={this.state.canvasSize.x}
                              height={this.state.canvasSize.y}
                              fill={this.props.theme.palette.background} shadowBlur={10}
                        />
                    </Layer>

                    {/*--------------------------------- Grid Layer -------------------------------------------------*/}
                    <Layer id="grid">
                        <Grid screenSize={this.state.canvasSize}
                              canvasTranslation={this.props.canvasTranslation}
                              onTranslate={this.props.onTranslate}
                              canvasZoom={this.props.canvasZoom}
                              onZoom={this.props.onZoom}
                              theme={this.props.theme} onClick={this.onDeselectBlocks}
                        />
                    </Layer>

                    {/* ------------------------------- Edge Layer --------------------------------------------------*/}
                    <Layer id='edge'>
                        { this.state.mouseDown?.mouseOn === "PORT" &&
                            this.state.mouseDown.portLocation !== undefined &&
                            this.state.mouseDown.mouseLocation !== undefined ? (
                                <EdgeComponent
                                    outputPortLoc={this.state.mouseDown.isOutput?
                                        this.state.mouseDown.portLocation:this.state.mouseDown.mouseLocation
                                    }
                                    inputPortLoc={this.state.mouseDown.isOutput?
                                        this.state.mouseDown.mouseLocation:this.state.mouseDown.portLocation
                                    } zoomLevel={this.props.canvasZoom} startedFrom={this.state.mouseDown.isOutput?"output":"input"}
                                />
                        ) : <React.Fragment />}
                        {this.props.edges.map(e => {
                            const outputBlock = this.props.blocks.find(b => b.id === e.output.blockID);
                            const inputBlock = this.props.blocks.find(b => b.id === e.input.blockID);
                            if (outputBlock === undefined || inputBlock === undefined)
                                return <React.Fragment key={`edge-${e.id}`}/>

                            const outputPortInd = outputBlock.outputPorts.findIndex(p => p.id === e.output.portID);
                            const inputPortInd = inputBlock.inputPorts.findIndex(p => p.id === e.input.portID);
                            if (outputPortInd === -1 || inputPortInd === -1)
                                return <React.Fragment key={`edge-${e.id}`}/>

                            const outputBlockShape = CalculateScreenBlockSizeAndPosition(
                                this.props.canvasTranslation, this.props.canvasZoom, this.state.canvasSize,
                                outputBlock.size, outputBlock.position
                            );
                            const inputBlockShape = CalculateScreenBlockSizeAndPosition(
                                this.props.canvasTranslation, this.props.canvasZoom, this.state.canvasSize,
                                inputBlock.size, inputBlock.position
                            );
                            if (outputBlockShape.size.x <= 25 || outputBlockShape.size.y <= 25 ||
                                inputBlockShape.size.x <= 25 || inputBlockShape.size.y <= 25)
                                return <React.Fragment key={`edge-${e.id}`}/>

                            const vertDistOutput = outputBlockShape.size.y / (outputBlock.outputPorts.length + 1);
                            const vertDistInput = inputBlockShape.size.y / (inputBlock.inputPorts.length + 1);

                            const outputBlockPos = new Vector2D(
                                outputBlockShape.position.x+ outputBlockShape.size.x,
                                outputBlockShape.position.y + (vertDistOutput * (outputPortInd+1))
                            );
                            const inputBlockPos = new Vector2D(
                                inputBlockShape.position.x,
                                inputBlockShape.position.y + (vertDistInput * (inputPortInd+1))
                            );

                            return <EdgeComponent key={`edge-${e.id}`}
                                                  outputPortLoc={outputBlockPos}
                                                  inputPortLoc={inputBlockPos}
                                                  zoomLevel={this.props.canvasZoom}
                            />
                        })}
                    </Layer>


                    {/* ------------------------------- Static Block Layer ------------------------------------------*/}
                    <Layer id='static-block'>
                        {/*--------------------------- Draw Static Blocks -------------------------------------------*/}
                        {this.stageRef.current !== null ? notSelectedBlocks.map(block => (
                            <this.BlockPortComponent key={`non_selected_block_${block.id}`} block={block} />
                        )):<React.Fragment/>}
                    </Layer>

                    {/*---------------------------- Block Selection Layer -------------------------------------------*/}
                    <Layer id='selected-block'>
                        {this.stageRef.current !== null ? selectedBlocks.map(block => (
                            <this.BlockPortComponent key={`selected_block_${block.id}`} block={block} />
                        )) : <React.Fragment/>}

                        {/* ---------- Used to create a transparent full screen rect to move mouse over ------------*/}
                        { (this.state.mouseDown?.mouseOn==="BLOCK" || this.state.mouseDown?.mouseOn==="BLOCK_EDGE") &&
                        selectedBlocks.length > 0 ? (
                            <Rect x={0} y={0}
                                  width={this.state.canvasSize.x}
                                  height={this.state.canvasSize.y}
                                  fill="transparent"
                                  listening={
                                      this.state.mouseDown?.mouseOn === "BLOCK" ||
                                      this.state.mouseDown?.mouseOn === "BLOCK_EDGE"
                                  }
                                  onMouseUp={()=>this.onMouseUpBlock()}
                                  onMouseMove={this.onMouseMoveBlock}
                            />
                        ):<React.Fragment/>}

                        {/*------------------------------ Selected Ports ------------------------------------------------*/}
                        {this.state.mouseDown?.mouseOn === "PORT" ? (
                            <Rect x={0} y={0}
                                  width={this.state.canvasSize.x} height={this.state.canvasSize.y} fill="transparent"
                                  onMouseMove={this.onMouseMovePort} onMouseUp={()=>this.setState({mouseDown: undefined})}
                            />
                        ) : <React.Fragment />}
                    </Layer>
                </Stage>
            </div>
        )
    }
}

// Creates a function to map the redux state to the redux props
function mapStateToProps(state: SaveState): GlobalProps {
    return {
        blocks: state.currentGraph.blocks,
        edges: state.currentGraph.edges,
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
        onResizeBlock: ResizedBlocksAction,
        onAddEdge: AddedEdgeAction,
        onTranslate: TranslatedCanvasAction,
        onZoom: ZoomedCanvasAction
    }, dispatch)
}

// Exports the redux connected component
export default connect(mapStateToProps, mapDispatchToProps)(CanvasContainer);