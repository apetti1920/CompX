import { BlockStorageWithIDType, isBlockStorageWithIDType, VisualBlockStorageType } from "./BlockStorage";
import { EdgeStorageType, isEdgeStorageType, VisualEdgeStorageType } from "./EdgeStorage";
import { PortStringListType, PortTypes } from "../../Graph/Port";

export interface GraphStorageType {
    blocks: BlockStorageWithIDType<PortStringListType, PortStringListType>[],
    edges: EdgeStorageType<PortStringListType[number]>[]
}

export function isGraphStorageType(obj: any): obj is GraphStorageType {
    if (typeof obj !== 'object' || Array.isArray(obj)) return false;

    const requiredKeys = ["blocks", "edges"];
    if (!requiredKeys.every(k => k in obj)) return false;

    if (!Array.isArray(obj['blocks']) || !obj['blocks'].every(b => isBlockStorageWithIDType(b))) return false;
    if (!Array.isArray(obj['edges']) || !obj['edges'].every(b => isEdgeStorageType(b))) return false;

    return true;
}

export interface VisualGraphStorageType {
    blocks: VisualBlockStorageType<PortStringListType, PortStringListType>[],
    edges: VisualEdgeStorageType<keyof PortTypes>[]
}