import { isPortStorageType, isPortStorageWithIDType } from "./PortStorage";
import { PortStringListType } from "../../Graph/Port";
import { MapStringsToPortStoragesType, MapStringsToPortStoragesWithIDType } from "../../Graph/Block";
import { WithID } from "../../Helpers/Types";
import {PointType} from "../../Types";

export type BlockStorageType<
    Inputs extends PortStringListType, Outputs extends PortStringListType
> = {
    name: string,
    description: string,
    tags: string[]
    inputPorts: MapStringsToPortStoragesType<Inputs>,
    outputPorts: MapStringsToPortStoragesType<Outputs>,
    callbackString: string
}

export function isBlockStorageType<
    Inputs extends PortStringListType,
    Outputs extends PortStringListType
>(obj: any): obj is BlockStorageType<PortStringListType, PortStringListType> {
    if (typeof obj !== 'object' || Array.isArray(obj)) return false;

    const requiredKeys = ["name", "description", "tags", "inputPorts", "outputPorts", "callbackString"];
    if (!requiredKeys.every(k => k in obj)) return false;

    if (typeof obj['name'] !== 'string') return false;
    if (typeof obj['description'] !== "string") return false;
    if (!Array.isArray(obj['tags']) || !obj['tags'].every(t => typeof t === 'string')) return false;
    if (!Array.isArray(obj['inputPorts']) || !obj['inputPorts'].every(p => isPortStorageType(p))) return false;
    if (!Array.isArray(obj['outputPorts']) || !obj['outputPorts'].every(p => isPortStorageType(p))) return false;
    if (typeof obj["callbackString"] !== "string") return false;

    return true;
}

interface TempIOsWithIDType<Inputs extends PortStringListType, Outputs extends PortStringListType> {
    inputPorts: MapStringsToPortStoragesWithIDType<Inputs>, outputPorts: MapStringsToPortStoragesWithIDType<Outputs>
}
export interface BlockStorageWithIDType<Inputs extends PortStringListType, Outputs extends PortStringListType>
    extends WithID, Omit<BlockStorageType<Inputs, Outputs>, "inputPorts" | "outputPorts">,
        TempIOsWithIDType<Inputs, Outputs> {}

export function isBlockStorageWithIDType<
    Inputs extends PortStringListType,
    Outputs extends PortStringListType>(obj: any): obj is BlockStorageWithIDType<Inputs, Outputs>
{
    if (!isBlockStorageType(obj)) return false;
    if (!("id" in obj) || typeof obj['id'] !== 'string') return false;

    if (!Array.isArray(obj['outputPorts']) || !(obj['outputPorts'] as any[])
        .every((p: any) => isPortStorageWithIDType(p))) return false;
    if (!Array.isArray(obj['inputPorts']) || !(obj['inputPorts'] as any[])
        .every((p: any) => isPortStorageWithIDType(p))) return false;

    return true
}

export interface VisualBlockStorageType<Inputs extends PortStringListType, Outputs extends PortStringListType> extends
    BlockStorageWithIDType<Inputs, Outputs> {
        visualName: string,
        position: PointType,
        size: PointType,
        selected: boolean,
        mirrored: boolean,
        shape: "rect" | "circ" | "tri",
        color?: string,
        icon?: string
    }