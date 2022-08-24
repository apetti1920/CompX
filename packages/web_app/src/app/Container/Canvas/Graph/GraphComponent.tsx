import React from "react";

import { Vector2D } from '@compx/common/Types';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import BlockComponent from "./VisualTypes/BlockComponent";
import { ThemeType } from "../../../../types";
import Konva from "konva";

type PropType = {
    konvaStage: Konva.Stage,
    blocks: VisualBlockStorageType<any, any>[],
    onSelectedBlock: (blockId: string, selectMultiple: boolean)=>void,
    screenSize: Vector2D,
    canvasTranslation: Vector2D,
    canvasZoom: number,
    theme: ThemeType,
    onZoom: (delta: number, around: Vector2D) => void
};

export default function(props: PropType) {
    return (
        <React.Fragment>
            {props.blocks.map(block => <BlockComponent
                key={`block-${block.id}`} konvaStage={props.konvaStage}
                onSelectBlock={props.onSelectedBlock} screenSize={props.screenSize}
                canvasTranslation={props.canvasTranslation} canvasZoom={props.canvasZoom}
                block={block} theme={props.theme} onZoom={props.onZoom} />
            )}
        </React.Fragment>
    )
}