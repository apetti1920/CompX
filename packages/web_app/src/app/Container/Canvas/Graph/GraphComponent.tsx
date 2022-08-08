import React from "react";

import { PointType } from '@compx/common/Types';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import BlockComponent from "./VisualTypes/BlockComponent";
import { ThemeType } from "../../../../types";

type PropType = {
    blocks: VisualBlockStorageType<any, any>[],
    onSelectedBlock: (blockId: string, selectMultiple: boolean)=>void,
    onMoveBlocks: (delta: PointType)=>void,
    screenSize: PointType,
    canvasTranslation: PointType,
    canvasZoom: number,
    theme: ThemeType,
    onZoom: (delta: number, around: PointType) => void
};

export default function(props: PropType) {
    return (
        <React.Fragment>
            {props.blocks.map(block => <BlockComponent
                key={`block-${block.id}`}
                onSelectBlock={props.onSelectedBlock} onMouseMove={props.onMoveBlocks}
                screenSize={props.screenSize} canvasTranslation={props.canvasTranslation}
                canvasZoom={props.canvasZoom} block={block} theme={props.theme}
                onZoom={props.onZoom} /> )}
        </React.Fragment>
    )
}