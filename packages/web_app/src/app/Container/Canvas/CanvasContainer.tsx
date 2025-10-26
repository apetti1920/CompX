import { PortStringListType, PortTypes } from '@compx/common/Graph/Port';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { VisualEdgeStorageType } from '@compx/common/Network/GraphItemStorage/EdgeStorage';
import { DirectionType, Vector2D } from '@compx/common/Types';
import Konva from 'konva';
import { throttle } from 'lodash';
import React, { Component } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { Layer, Rect, Stage } from 'react-konva';
import { connect } from 'react-redux';

import { Dispatch, bindActionCreators } from 'redux';

import BlockComponent from './Graph/VisualTypes/BlockComponent';
import CanvasEdgeWrapperComponent from './Graph/VisualTypes/EdgeComponent/CanvasEdgeWrapperComponent';
import EdgeComponent from './Graph/VisualTypes/EdgeComponent/EdgeComponent';
import PortList from './Graph/VisualTypes/PortList';
import Grid from './Grid/Grid';
import { ArrowDirectionType, CalculateScreenBlockSizeAndPosition, MouseOnBlockExtracted } from './utils';
import { TranslatedCanvasAction, ZoomedCanvasAction } from '../../../store/actions/canvasactions';
import {
  AddBlockAction,
  AddEdgeSplitAction,
  AddedEdgeAction,
  DeletedObjectsAction,
  DeselectObjectsAction,
  MovedBlocksAction,
  MovedEdgeAction,
  RemoveEdgeSplitAction,
  ResizedBlocksAction,
  SelectObjectAction
} from '../../../store/actions/graphactions';
import { StateType as SaveState, SelectableItemTypes } from '../../../store/types';
import ColorTheme from '../../../theme/ColorTheme';

type KonvaEventObject<T> = Konva.KonvaEventObject<T>;

type GlobalProps = {
  canvasZoom: number;
  canvasTranslation: Vector2D;
  selectedBlockIds: string[];
  selectedEdgeIds: string[];
  blocks: VisualBlockStorageType<PortStringListType, PortStringListType>[];
  edges: VisualEdgeStorageType<keyof PortTypes>[];
  theme: ColorTheme;
};
type DispatchProps = {
  onSelectObject: (objectId: string, objectType: SelectableItemTypes, selectMultiple: boolean) => void;
  onDeselectObjects: () => void;
  onDeleteObjects: () => void;
  onMoveBlocks: (delta: Vector2D) => void;
  onResizeBlock: (resizeDirection: DirectionType, delta: Vector2D) => void;
  onAddBlock: (blockTemplate: any, position: Vector2D) => void;
  onAddEdge: (
    output: { block: VisualBlockStorageType<any, any>; portInd: number },
    input: { block: VisualBlockStorageType<any, any>; portInd: number }
  ) => void;
  onMoveEdge: (edgePieceInd: number, delta: number) => void;
  onAddEdgeSplit: (afterEdgePieceInd: number) => void;
  onDeleteEdgeSplit: (edgePieceInd: number) => void;
  onZoom: (delta: number, around: Vector2D) => void;
  onTranslate: (point: Vector2D) => void;
};

type PropsType = GlobalProps & DispatchProps;
type StateType = {
  canvasSize: Vector2D;
  mouseDown?: MouseOnBlockExtracted<'BLOCK' | 'BLOCK_EDGE' | 'PORT' | 'EDGE'>;
};

class CanvasContainer extends Component<PropsType, StateType> {
  // Initialize some class variables
  private readonly wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  private readonly stageRef: React.MutableRefObject<Konva.Stage | null>;
  private readonly ThrottledSetWindowSize = throttle(() => requestAnimationFrame(this.SetWindowSize), 60);

  // Create the Component
  constructor(props: PropsType) {
    super(props);

    // Set the refs
    this.wrapperRef = React.createRef();
    this.stageRef = React.createRef();
    Konva.pixelRatio = 1;

    this.state = {
      canvasSize: new Vector2D(),
      mouseDown: undefined
    };
  }

  componentDidMount() {
    // --------------------------------- State Setting -------------------------------------------------------------
    this.SetWindowSize();
    this.wrapperRef.current?.focus();
    this.wrapperRef.current!.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.props.selectedEdgeIds.length > 0 || this.props.selectedBlockIds.length > 0)
          this.props.onDeleteObjects();
      }
      e.stopPropagation();
    });
    this.stageRef.current!.on('contextmenu', (e: KonvaEventObject<MouseEvent>) => e.evt.preventDefault());

    // --------------------------------- Port Dragging Events -------------------------------------------------------
    this.stageRef.current!.on('mousemove', (e: KonvaEventObject<MouseEvent>) => {
      if (this.state.mouseDown?.mouseOn === 'PORT') {
        this.mouseMovePortHandler(e);
      }
    });

    this.stageRef.current!.on('mouseup', (e: KonvaEventObject<MouseEvent>) => {
      if (this.state.mouseDown?.mouseOn === 'PORT') {
        // Check if we didn't click on a port (in which case the port's handler already fired)
        // This will be called for mouseup on empty space
        if (!e.target.hasName || !(e.target.hasName('port-hitbox'))) {
          this.mouseUpHandler();
        }
      }
    });

    // ----------------------------- Resize Event ------------------------------------------------------------------
    window.addEventListener('resize', this.ThrottledSetWindowSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.ThrottledSetWindowSize);
  }

  private readonly SetWindowSize = () => {
    // Check if the refs are present
    if (this.wrapperRef.current === null || this.wrapperRef.current === undefined) return;

    const canvasSize = new Vector2D(this.wrapperRef.current.clientWidth, this.wrapperRef.current.clientHeight);
    this.setState({
      canvasSize: canvasSize
    });
  };

  // -------------------------------------- Events -------------------------------------------------------------------
  mouseDownHandler = (on: MouseOnBlockExtracted<'BLOCK' | 'BLOCK_EDGE' | 'PORT' | 'EDGE'>) =>
    this.setState({ mouseDown: on });

  deselectAllHandler = () => {
    this.props.onDeselectObjects();
  };

  mouseMoveHandler = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    if (this.state.mouseDown === undefined) return;

    if (this.state.mouseDown.mouseOn === 'BLOCK') {
      const delta = new Vector2D(e.evt.movementX / this.props.canvasZoom, -e.evt.movementY / this.props.canvasZoom);
      this.props.onMoveBlocks(delta);
    } else if (this.state.mouseDown.mouseOn === 'BLOCK_EDGE') {
      const delta = new Vector2D(e.evt.movementX / this.props.canvasZoom, -e.evt.movementY / this.props.canvasZoom);
      this.props.onResizeBlock(this.state.mouseDown.direction, delta);
    } else if (this.state.mouseDown.mouseOn === 'EDGE' && this.state.mouseDown.moveInfo !== undefined) {
      const delta = new Vector2D(e.evt.movementX / this.props.canvasZoom, -e.evt.movementY / this.props.canvasZoom);
      const deltaD = this.state.mouseDown.moveInfo.edgePieceInd % 2 === 0 ? delta.x : -delta.y;

      const denom =
        (this.state.mouseDown.moveInfo.inputPortLoc - this.state.mouseDown.moveInfo.outputPortInd) /
        this.props.canvasZoom;
      if (denom === 0) return;
      const deltaM = deltaD / denom;

      this.props.onMoveEdge(this.state.mouseDown.moveInfo.edgePieceInd, deltaM);
    }
  };

  // -------------------------------------- Block Events -------------------------------------------------------------
  selectBlockHandler = (
    blockId: string,
    selectMultiple: boolean,
    selectedOn: MouseOnBlockExtracted<'BLOCK' | 'BLOCK_EDGE'>
  ) => {
    this.props.onSelectObject(blockId, 'BLOCK', selectMultiple);
    this.setState({ mouseDown: selectedOn });
  };

  // -------------------------------------- Port Events --------------------------------------------------------------
  mouseMovePortHandler = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    if (this.state.mouseDown === undefined || this.state.mouseDown.mouseOn !== 'PORT') return;

    this.setState({
      mouseDown: {
        // eslint-disable-next-line react/no-access-state-in-setstate
        ...this.state.mouseDown,
        mouseLocation: new Vector2D(e.evt.offsetX, e.evt.offsetY)
      }
    });
  };

  mouseUpHandler = (on?: MouseOnBlockExtracted<'PORT'>) => {
    if (on !== undefined && this.state.mouseDown?.mouseOn === 'PORT') {
      const mouseDownBlock = {
        block: this.state.mouseDown.block,
        portInd: this.state.mouseDown.portInd
      };
      const mouseUpBlock = { block: on.block, portInd: on.portInd };

      this.props.onAddEdge(
        this.state.mouseDown.isOutput ? mouseDownBlock : mouseUpBlock,
        this.state.mouseDown.isOutput ? mouseUpBlock : mouseDownBlock
      );
    }

    this.setState({ mouseDown: undefined });
  };

  // -------------------------------------- Edge Events --------------------------------------------------------------
  selectEdgeHandler = (edgeId: string, on: MouseOnBlockExtracted<'EDGE'>, selectMultiple: boolean) => {
    this.props.onSelectObject(edgeId, 'EDGE', selectMultiple);
    this.setState({ mouseDown: on });
  };

  // -------------------------------------- Helper Funcs -------------------------------------------------------------
  onSetCursorStyle = (side?: ArrowDirectionType) => {
    if (side !== undefined) this.stageRef.current!.container().style.cursor = `${side}-resize`;
    else this.stageRef.current!.container().style.cursor = 'default';
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  BlockPortComponent = (props: { block: VisualBlockStorageType<any, any>; selected: boolean }) => {
    const blockShape = CalculateScreenBlockSizeAndPosition(
      this.props.canvasTranslation,
      this.props.canvasZoom,
      this.state.canvasSize,
      props.block.size,
      props.block.position
    );
    if (blockShape.size.x <= 25 || blockShape.size.y <= 25) return <React.Fragment />;

    /* eslint-disable */
    const PortListWrapper = () => {
      return (
        <PortList
          canvasTranslation={this.props.canvasTranslation}
          canvasZoom={this.props.canvasZoom}
          screenSize={this.state.canvasSize}
          onMouseUp={(block, portInd, isOutput) =>
            this.mouseUpHandler({
              mouseOn: 'PORT',
              block: block,
              portInd: portInd,
              isOutput: isOutput
            })
          }
          onMouseDown={(block, portInd, isOutput) =>
            this.mouseDownHandler({
              mouseOn: 'PORT',
              block: block,
              portInd: portInd,
              isOutput: isOutput
            })
          }
          block={props.block}
        />
      );
    };
    /* eslint-enable */

    return (
      <React.Fragment key={`block-${props.block.id}`}>
        {/* ------------------------- Draw Blocks ------------------------------------------------------------*/}
        <BlockComponent
          id={props.block.id}
          blockShape={blockShape}
          color={props.block.color ?? 'green'}
          selected={props.selected}
          onSetCursorStyle={this.onSetCursorStyle}
          onMouseDown={this.mouseDownHandler}
          screenSize={this.state.canvasSize}
          canvasTranslation={this.props.canvasTranslation}
          canvasZoom={this.props.canvasZoom}
          onSelectBlock={this.selectBlockHandler}
          onZoom={this.props.onZoom}
        />

        {/* ------------------------------- Draw Ports -------------------------------------------------------*/}
        <PortListWrapper />
      </React.Fragment>
    );
  };

  render() {
    // Do this so selected blocks are not placed above the active port drag layer
    let notSelectedBlocks: VisualBlockStorageType<any, any>[];
    let selectedBlocks: VisualBlockStorageType<any, any>[];
    if (this.state.mouseDown?.mouseOn !== 'PORT') {
      selectedBlocks = this.props.blocks.filter((b) => this.props.selectedBlockIds.includes(b.id));
      notSelectedBlocks = this.props.blocks.filter((b) => !this.props.selectedBlockIds.includes(b.id));
    } else {
      notSelectedBlocks = this.props.blocks;
      selectedBlocks = [];
    }

    return (
      <div
        ref={this.wrapperRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%'
        }}
        tabIndex={1}
      >
        <Stage width={window.innerWidth} height={window.innerHeight} ref={this.stageRef}>
          {/* ------------------------------------ Background ---------------------------------------------*/}
          <Layer id="static">
            <Rect
              x={0}
              y={0}
              listening={false}
              width={this.state.canvasSize.x}
              height={this.state.canvasSize.y}
              fill={this.props.theme.value.primary.background.tint(80).hexString()}
              shadowBlur={10}
            />
          </Layer>

          {/* --------------------------------- Grid Layer -------------------------------------------------*/}
          <Layer id="grid">
            <Grid
              screenSize={this.state.canvasSize}
              canvasTranslation={this.props.canvasTranslation}
              onTranslate={this.props.onTranslate}
              canvasZoom={this.props.canvasZoom}
              onZoom={this.props.onZoom}
              theme={this.props.theme}
              onClick={this.deselectAllHandler}
            />
          </Layer>

          {/* ------------------------------- Edge Layer --------------------------------------------------*/}
          <Layer id="edge">
            {this.state.mouseDown?.mouseOn === 'PORT' && this.state.mouseDown.mouseLocation !== undefined ? (
              <EdgeComponent
                mouse={{
                  block: this.state.mouseDown.block,
                  isOutput: this.state.mouseDown.isOutput,
                  portInd: this.state.mouseDown.portInd,
                  mouseLoc: this.state.mouseDown.mouseLocation
                }}
                canvasTranslation={this.props.canvasTranslation}
                canvasZoom={this.props.canvasZoom}
                screenSize={this.state.canvasSize}
              />
            ) : (
              <React.Fragment />
            )}
            {this.props.edges
              .filter((e) => !this.props.selectedEdgeIds.includes(e.id))
              .map((e) => (
                <CanvasEdgeWrapperComponent
                  key={`edge-${e.id}`}
                  edge={e}
                  blocks={this.props.blocks}
                  canvasTranslation={this.props.canvasTranslation}
                  canvasZoom={this.props.canvasZoom}
                  screenSize={this.state.canvasSize}
                  onSetCursorStyle={this.onSetCursorStyle}
                  onSelectComponent={(on: MouseOnBlockExtracted<'EDGE'>, selectMultiple: boolean) =>
                    this.selectEdgeHandler(e.id, on, selectMultiple)
                  }
                  onAddEdgeSplit={(splitInd: number) => this.props.onAddEdgeSplit(splitInd)}
                  onDeleteEdgeSplit={(splitInd: number) => this.props.onDeleteEdgeSplit(splitInd)}
                />
              ))}
          </Layer>

          {/* ------------------------------- Static Block Layer ------------------------------------------*/}
          <Layer id="static-block">
            {/* --------------------------- Draw Static Blocks -------------------------------------------*/}
            {notSelectedBlocks.map((block) => (
              <this.BlockPortComponent key={`non_selected_block_${block.id}`} block={block} selected={false} />
            ))}
          </Layer>

          {/* ---------------------------- Block Selection Layer -------------------------------------------*/}
          <Layer id="selected-block">
            {/* ------------------------------ Selected Edges ------------------------------------------*/}
            {this.props.edges
              .filter((e) => this.props.selectedEdgeIds.includes(e.id))
              .map((e) => (
                <CanvasEdgeWrapperComponent
                  key={`edge-${e.id}`}
                  edge={e}
                  blocks={this.props.blocks}
                  canvasTranslation={this.props.canvasTranslation}
                  canvasZoom={this.props.canvasZoom}
                  screenSize={this.state.canvasSize}
                  onSetCursorStyle={this.onSetCursorStyle}
                  selected
                  onSelectComponent={(on: MouseOnBlockExtracted<'EDGE'>, selectMultiple: boolean) =>
                    this.selectEdgeHandler(e.id, on, selectMultiple)
                  }
                  onAddEdgeSplit={(splitInd: number) => this.props.onAddEdgeSplit(splitInd)}
                  onDeleteEdgeSplit={(splitInd: number) => this.props.onDeleteEdgeSplit(splitInd)}
                />
              ))}

            {/* ------------------------------ Selected Blocks ------------------------------------------*/}
            {selectedBlocks.map((block) => (
              <this.BlockPortComponent key={`selected_block_${block.id}`} block={block} selected />
            ))}

            {/* ---------- Used to create a transparent full screen rect to move mouse over ------------*/}
            {(this.state.mouseDown?.mouseOn === 'BLOCK' ||
              this.state.mouseDown?.mouseOn === 'BLOCK_EDGE' ||
              this.state.mouseDown?.mouseOn === 'EDGE') &&
            (this.props.selectedBlockIds.length > 0 || this.props.selectedEdgeIds.length > 0) ? (
              <Rect
                x={0}
                y={0}
                width={this.state.canvasSize.x}
                height={this.state.canvasSize.y}
                fill="transparent"
                listening={
                  this.state.mouseDown?.mouseOn === 'BLOCK' ||
                  this.state.mouseDown?.mouseOn === 'BLOCK_EDGE' ||
                  this.state.mouseDown?.mouseOn === 'EDGE'
                }
                onMouseUp={() => this.mouseUpHandler()}
                onMouseMove={this.mouseMoveHandler}
              />
            ) : (
              <React.Fragment />
            )}

            {/* ------------------------------ Selected Ports ------------------------------------------------*/}
          </Layer>
        </Stage>
      </div>
    );
  }
}

function CanvasContainerDroppableWrapper(props: PropsType) {
  const [_, drop] = useDrop(() => ({
    accept: 'block',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    }),
    drop: (item: { type: string; blockTemplate: any }, monitor: DropTargetMonitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && item.blockTemplate) {
        // Convert screen coordinates to canvas coordinates
        const canvasX = (clientOffset.x - props.canvasTranslation.x) / props.canvasZoom;
        const canvasY = (clientOffset.y - props.canvasTranslation.y) / props.canvasZoom;
        const canvasPosition = new Vector2D(canvasX, canvasY);

        // Add the block at the drop position
        props.onAddBlock(item.blockTemplate, canvasPosition);
      }
    }
  }));

  return (
    <div ref={drop} style={{ width: '100%', height: '100%' }}>
      <CanvasContainer {...props} />
    </div>
  );
}

// Creates a function to map the redux state to the redux props
function mapStateToProps(state: SaveState): GlobalProps {
  return {
    selectedBlockIds: state.currentGraph.selected.filter((s) => s.itemType === 'BLOCK').map((s) => s.id),
    selectedEdgeIds: state.currentGraph.selected.filter((s) => s.itemType === 'EDGE').map((e) => e.id),
    blocks: state.currentGraph.graph.blocks,
    edges: state.currentGraph.graph.edges,
    canvasZoom: state.userStorage.canvas.zoom,
    canvasTranslation: state.userStorage.canvas.translation,
    theme: state.userStorage.theme
  };
}

// Creates  a function to map the redux actions to props
function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      onSelectObject: SelectObjectAction,
      onDeselectObjects: DeselectObjectsAction,
      onDeleteObjects: DeletedObjectsAction,
      onMoveBlocks: MovedBlocksAction,
      onAddBlock: AddBlockAction,
      onResizeBlock: ResizedBlocksAction,
      onAddEdge: AddedEdgeAction,
      onMoveEdge: MovedEdgeAction,
      onAddEdgeSplit: AddEdgeSplitAction,
      onDeleteEdgeSplit: RemoveEdgeSplitAction,
      onTranslate: TranslatedCanvasAction,
      onZoom: ZoomedCanvasAction
    },
    dispatch
  );
}

// Exports the redux connected component
export default connect(mapStateToProps, mapDispatchToProps)(CanvasContainerDroppableWrapper);
