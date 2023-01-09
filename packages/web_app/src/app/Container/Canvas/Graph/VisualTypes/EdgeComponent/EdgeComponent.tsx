// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { VisualBlockStorageType } from 'compx_common/Network/GraphItemStorage/BlockStorage';
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { VisualEdgeStorageType } from 'compx_common/Network/GraphItemStorage/EdgeStorage';
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { Vector2D } from 'compx_common/Types';
import React from 'react';

import { ArrowDirectionType, CalculatePortLocation, MouseOnBlockExtracted } from '../../../utils';
import EdgeWrapperComponent from './EdgeWrapperComponent';

type MouseDraggingPortType = {
  block: VisualBlockStorageType<any, any>;
  isOutput: boolean;
  portInd: number;
  mouseLoc: Vector2D;
};

export type StaticEdgeBlockType = Omit<VisualEdgeStorageType<any>, 'input' | 'output'> & {
  input: { block: VisualBlockStorageType<any, any>; portInd: number };
  output: { block: VisualBlockStorageType<any, any>; portInd: number };
};

const CalculateMidPoints = (start: Vector2D, end: Vector2D, percentages: number[]): Vector2D[] => {
  const points = [start];
  const gap = Vector2D.subtract(end, start);
  percentages.forEach((p, i) => {
    if (p !== 0.0) {
      points.push(
        new Vector2D(
          i % 2 === 0 ? p * gap.x + start.x : points[points.length - 1].x,
          i % 2 === 0 ? points[points.length - 1].y : p * gap.y + start.y
        )
      );
    }
  });
  points.push(new Vector2D(points[points.length - 1].x, end.y));
  points.push(end);
  return points;
};

export type EdgeComponentPropType = ({ mouse: MouseDraggingPortType } | { edge: StaticEdgeBlockType }) & {
  canvasTranslation: Vector2D;
  canvasZoom: number;
  screenSize: Vector2D;
  onSetCursorStyle?: (side?: ArrowDirectionType) => void;
  selected?: boolean;
  onSelectComponent?: (on: MouseOnBlockExtracted<'EDGE'>, selectMultiple: boolean) => void;
  onAddEdgeSplit?: (splitInd: number) => void;
  onDeleteEdgeSplit?: (splitInd: number) => void;
};

export default function EdgeComponent(props: EdgeComponentPropType): React.ReactElement {
  const radius = 20 * props.canvasZoom;
  let points: Vector2D[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let selectedHandler = (on: MouseOnBlockExtracted<'EDGE'>, selectMultiple: boolean) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let addEdgeSplitHandler = (on: MouseOnBlockExtracted<'EDGE'>) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let deleteEdgeSplitHandler = (on: MouseOnBlockExtracted<'EDGE'>) => {};

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (props.edge === undefined) {
    const portLoc = CalculatePortLocation(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.mouse.block,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.mouse.isOutput,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.mouse.portInd,
      props.canvasTranslation,
      props.canvasZoom,
      props.screenSize
    ).port;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const startPos = props.mouse.isOutput ? portLoc : props.mouse.mouseLoc;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const endPos = props.mouse.isOutput ? props.mouse.mouseLoc : portLoc;

    if (endPos.x >= startPos.x + radius) {
      points = CalculateMidPoints(startPos, endPos, [0.5]);
    } else {
      const p1 = Vector2D.add(startPos, new Vector2D(radius, 0.0));
      points = [startPos, ...CalculateMidPoints(p1, endPos, [])];
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const edge: StaticEdgeBlockType = props.edge;
    if (props.onSelectComponent !== undefined) {
      selectedHandler = (on: MouseOnBlockExtracted<'EDGE'>, selectMultiple: boolean) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        props.onSelectComponent(on, selectMultiple);

      if (props.onAddEdgeSplit !== undefined && props.onDeleteEdgeSplit !== undefined) {
        addEdgeSplitHandler = (on: MouseOnBlockExtracted<'EDGE'>) => {
          if (on.moveInfo !== undefined) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            props.onAddEdgeSplit(on.moveInfo.edgePieceInd);
          }
        };
        deleteEdgeSplitHandler = (on: MouseOnBlockExtracted<'EDGE'>) => {
          if (on.moveInfo !== undefined) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            props.onDeleteEdgeSplit(on.moveInfo.edgePieceInd);
          }
        };
      }
    }
    const outputPortLoc = CalculatePortLocation(
      edge.output.block,
      true,
      edge.output.portInd,
      props.canvasTranslation,
      props.canvasZoom,
      props.screenSize
    );
    const inputPortLoc = CalculatePortLocation(
      edge.input.block,
      false,
      edge.input.portInd,
      props.canvasTranslation,
      props.canvasZoom,
      props.screenSize
    );

    if (
      outputPortLoc.block.size.x <= 25.0 ||
      outputPortLoc.block.size.y <= 25.0 ||
      inputPortLoc.block.size.x <= 25.0 ||
      inputPortLoc.block.size.y <= 25.0
    )
      return <React.Fragment />;

    points = CalculateMidPoints(outputPortLoc.port, inputPortLoc.port, edge.midPoints);
  }

  return (
    <EdgeWrapperComponent
      points={points}
      setCursorStyle={props.onSetCursorStyle}
      selected={props.selected}
      onSelectComponent={selectedHandler}
      onAddEdgeSplit={addEdgeSplitHandler}
      onDeleteEdgeSplit={deleteEdgeSplitHandler}
    />
  );
}
