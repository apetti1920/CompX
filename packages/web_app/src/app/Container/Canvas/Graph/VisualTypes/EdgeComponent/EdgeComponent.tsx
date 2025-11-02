import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { VisualEdgeStorageType } from '@compx/common/Network/GraphItemStorage/EdgeStorage';
import { Vector2D } from '@compx/common/Types';
import React from 'react';

import EdgeWrapperComponent from './EdgeWrapperComponent';
import { ArrowDirectionType, CalculatePortLocation, MouseOnBlockExtracted } from '../../../utils';

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

const MIN_SEGMENT_LENGTH = 30; // Minimum horizontal segment length to prevent lines going behind ports

/**
 * Calculate 5-line routing path when input block is on the opposite side of output block.
 * Path: horizontal (right from output) → vertical → horizontal (left/backward) → vertical → horizontal (left to input)
 */
const CalculateFiveLinePath = (
  outputPort: Vector2D,
  inputPort: Vector2D,
  outputBlockSize: Vector2D,
  inputBlockSize: Vector2D,
  outputBlockPosition: Vector2D,
  inputBlockPosition: Vector2D
): Vector2D[] => {
  const points: Vector2D[] = [outputPort];

  // First horizontal segment: extend right from output port with minimum length
  const firstHorizontalX = outputPort.x + MIN_SEGMENT_LENGTH;
  points.push(new Vector2D(firstHorizontalX, outputPort.y));

  // Calculate block boundaries
  const outputBlockTop = outputBlockPosition.y;
  const outputBlockBottom = outputBlockPosition.y + outputBlockSize.y;
  const inputBlockTop = inputBlockPosition.y;
  const inputBlockBottom = inputBlockPosition.y + inputBlockSize.y;

  // Determine if blocks are vertically level (similar Y coordinates)
  const verticalDifference = Math.abs(outputPort.y - inputPort.y);
  const levelThreshold = Math.max(outputBlockSize.y, inputBlockSize.y) * 0.3;
  const blocksAreVerticallyLevel = verticalDifference < levelThreshold;

  // Calculate vertical routing position
  let verticalY: number;
  const verticalOffset = 50; // Fixed offset to route around blocks

  if (blocksAreVerticallyLevel) {
    // Blocks are vertically level - route above or below both blocks
    // Choose based on which has more space to avoid going behind blocks
    const minBlockTop = Math.min(outputBlockTop, inputBlockTop);
    const maxBlockBottom = Math.max(outputBlockBottom, inputBlockBottom);

    // Check if there's more space above or below
    // Use port positions as a proxy for canvas boundaries
    const spaceAbove = minBlockTop;
    const spaceBelow = Math.max(outputPort.y, inputPort.y) + 500 - maxBlockBottom; // Estimate based on port positions

    // Route above by default, but switch to below if there's clearly more space below
    if (spaceBelow > spaceAbove * 1.5 && spaceBelow > verticalOffset * 2) {
      // Route below both blocks
      verticalY = maxBlockBottom + verticalOffset;
    } else {
      // Route above both blocks
      verticalY = minBlockTop - verticalOffset;
    }
  } else {
    // Blocks are offset vertically - route between them
    verticalY = (outputPort.y + inputPort.y) / 2;

    // Check if the midpoint would go behind either block
    const wouldGoBehindOutput = verticalY >= outputBlockTop && verticalY <= outputBlockBottom;
    const wouldGoBehindInput = verticalY >= inputBlockTop && verticalY <= inputBlockBottom;

    // If midpoint would intersect either block, route below both blocks
    if (wouldGoBehindOutput || wouldGoBehindInput) {
      const maxBlockBottom = Math.max(outputBlockBottom, inputBlockBottom);
      verticalY = maxBlockBottom + verticalOffset;
    }
  }

  // Second vertical segment: move to routing level
  points.push(new Vector2D(firstHorizontalX, verticalY));

  // Third horizontal segment: route backward (left) to get past input block
  // Route far enough left to ensure we clear the input block with minimum segment length
  const backwardX = inputPort.x - MIN_SEGMENT_LENGTH;
  points.push(new Vector2D(backwardX, verticalY));

  // Fourth vertical segment: move down/up to align with input port y
  // Note: backwardX is already inputPort.x - MIN_SEGMENT_LENGTH, so the final horizontal
  // segment from (backwardX, inputPort.y) to inputPort will be exactly MIN_SEGMENT_LENGTH
  points.push(new Vector2D(backwardX, inputPort.y));

  // Fifth horizontal segment: route left to input port with minimum length (already enforced)
  // Final point: input port
  points.push(inputPort);

  return points;
};

const CalculateMidPoints = (start: Vector2D, end: Vector2D, percentages: number[]): Vector2D[] => {
  const points = [start];
  const gap = Vector2D.subtract(end, start);

  // Determine first horizontal segment endpoint with minimum length enforcement
  let firstHorizontalX: number;
  if (percentages.length > 0 && percentages[0] !== 0.0) {
    const calculatedX = percentages[0] * gap.x + start.x;
    firstHorizontalX = Math.max(start.x + MIN_SEGMENT_LENGTH, calculatedX);
  } else {
    // Default: use 50% or minimum length, whichever is greater
    const defaultX = gap.x > 0 ? start.x + gap.x * 0.5 : start.x + MIN_SEGMENT_LENGTH;
    firstHorizontalX = Math.max(start.x + MIN_SEGMENT_LENGTH, defaultX);
  }

  // Add first horizontal segment point if we have a horizontal gap
  if (gap.x > 0) {
    points.push(new Vector2D(firstHorizontalX, start.y));
  }

  // Process remaining mid-points
  percentages.forEach((p, i) => {
    if (p !== 0.0) {
      // Skip first percentage since we handled it above
      if (i === 0 && gap.x > 0) return;

      points.push(
        new Vector2D(
          i % 2 === 0 ? p * gap.x + start.x : points[points.length - 1].x,
          i % 2 === 0 ? points[points.length - 1].y : p * gap.y + start.y
        )
      );
    }
  });

  // Calculate point before final horizontal segment to end
  const lastPoint = points[points.length - 1];

  // Add vertical segment to align with end y-coordinate
  let pointBeforeEnd = new Vector2D(lastPoint.x, end.y);

  // Ensure last horizontal segment is at least MIN_SEGMENT_LENGTH
  const horizontalDistance = Math.abs(end.x - pointBeforeEnd.x);
  if (horizontalDistance < MIN_SEGMENT_LENGTH) {
    // Adjust pointBeforeEnd to ensure minimum segment length
    if (end.x < pointBeforeEnd.x) {
      // Input is to the left, move pointBeforeEnd further left
      pointBeforeEnd = new Vector2D(end.x + MIN_SEGMENT_LENGTH, end.y);
    } else {
      // Input is to the right, move pointBeforeEnd further right
      pointBeforeEnd = new Vector2D(end.x - MIN_SEGMENT_LENGTH, end.y);
    }
  }

  points.push(pointBeforeEnd);

  // Add final point (end)
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

    // Detect if input block is on the opposite side (left) of output block
    const inputPort = inputPortLoc.port;
    const outputPort = outputPortLoc.port;
    const isInputOnOppositeSide = inputPort.x < outputPort.x;

    // Detect if blocks are too close together or perfectly vertical
    // Check horizontal distance between ports
    const horizontalDistance = outputPort.x - inputPort.x;
    const absHorizontalDistance = Math.abs(horizontalDistance);

    // For forward progress (input to the right), only use 5-line routing when absolutely necessary:
    if (!isInputOnOppositeSide) {
      // Forward progress case: input is to the right of output
      // Only use 5-line routing if blocks are extremely close (< 2 * MIN_SEGMENT_LENGTH)
      // This ensures we can fit minimum segments on both ends
      const blocksTooCloseHorizontally = absHorizontalDistance < MIN_SEGMENT_LENGTH * 2;

      // For forward progress, don't use 5-line routing unless blocks are too close
      // This prevents unnecessary U-shapes and stair-steps
      if (blocksTooCloseHorizontally) {
        points = CalculateFiveLinePath(
          outputPort,
          inputPort,
          outputPortLoc.block.size,
          inputPortLoc.block.size,
          outputPortLoc.block.position,
          inputPortLoc.block.position
        );
      } else {
        points = CalculateMidPoints(outputPort, inputPort, edge.midPoints);
      }
      // Exit early for forward progress case
    } else {
      // Opposite side case: input is to the left of output
      // Always use 5-line routing to go around blocks
      points = CalculateFiveLinePath(
        outputPort,
        inputPort,
        outputPortLoc.block.size,
        inputPortLoc.block.size,
        outputPortLoc.block.position,
        inputPortLoc.block.position
      );
    }
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
