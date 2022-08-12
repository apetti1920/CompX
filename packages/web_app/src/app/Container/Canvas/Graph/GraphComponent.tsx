import React from "react";

import {DirectionType, Vector2D} from '@compx/common/Types';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import BlockComponent from "./VisualTypes/BlockComponent";
import { ThemeType } from "../../../../types";
import Konva from "konva";

type PropType = {
    konvaStage: Konva.Stage,
    blocks: VisualBlockStorageType<any, any>[],
    onSelectedBlock: (blockId: string, selectMultiple: boolean)=>void,
    onMoveBlocks: (delta: Vector2D)=>void,
    onMouseResize: (blockId: string, resizeDirection: DirectionType, delta: Vector2D)=>void
    screenSize: Vector2D,
    canvasTranslation: Vector2D,
    canvasZoom: number,
    theme: ThemeType,
    onZoom: (delta: number, around: Vector2D) => void
};

export default function(props: PropType) {
    return (
        <React.Fragment>
            {props.blocks.sort(
                (a, b) =>
                    ((a.selected?1:0) - (b.selected?1:0))
            ).map(block => <BlockComponent
                key={`block-${block.id}`} konvaStage={props.konvaStage}
                onSelectBlock={props.onSelectedBlock} onMouseMoveRect={ props.onMoveBlocks }
                onMouseResize={props.onMouseResize} screenSize={props.screenSize}
                canvasTranslation={props.canvasTranslation} canvasZoom={props.canvasZoom}
                block={block} theme={props.theme} onZoom={props.onZoom} />
            )}
        </React.Fragment>
    )
}