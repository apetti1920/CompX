import { VisualGraphStorageType } from '@compx/common/Network/GraphItemStorage/GraphStorage';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { Vector2D } from '@compx/common/Types';

function getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function CreateBlock(id: string, name: string): VisualBlockStorageType<any, any> {
    return { id: id, visualName: name, name: name, inputPorts: [], outputPorts: [], callbackString: "",
        tags: [], description: "", mirrored: false, selected: false,
        position: new Vector2D(getRandom(-100.0, 100.0), getRandom(-100.0, 100.0)),
        size: new Vector2D(getRandom(50.0, 150.0), getRandom(50.0, 150.0)), shape: "rect",
        color: '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')
    }
}

export function MakeVisualGraph(numBlocks: number = 1): VisualGraphStorageType {
    const blocks = Array(numBlocks ).fill("const")
        .map((x, i) => CreateBlock(i.toString(), x));

    return {
        blocks: blocks
    }
}