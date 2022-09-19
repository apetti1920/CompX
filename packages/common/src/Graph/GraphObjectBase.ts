import { Port } from "./Port";
import { Block } from "./Block";
import { Edge } from "./Edge";
import {PortStorageType, PortStorageWithIDType} from "../Network/GraphItemStorage/PortStorage";
import {BlockStorageType, BlockStorageWithIDType} from "../Network/GraphItemStorage/BlockStorage";
import { EdgeStorageType } from "../Network/GraphItemStorage/EdgeStorage";
import {Graph} from "./Graph";
import {GraphStorageType} from "../Network/GraphItemStorage/GraphStorage";

type StorageSelect<T> = T extends Port<infer V> ? PortStorageType<V> : (
    T extends Block<infer V, infer U> ? BlockStorageType<V, U> : (
        T extends Edge<infer V> ? EdgeStorageType<V> : (
            T extends Graph ? GraphStorageType : never
        )
    )
)
type StorageWithIDSelect<T> = T extends Port<infer V> ? PortStorageWithIDType<V> : (
    T extends Block<infer V, infer U> ? BlockStorageWithIDType<V, U> : (
        T extends Edge<infer V> ? EdgeStorageType<V> : (
            T extends Graph ? StorageSelect<T> : never
        )
    )
)

export abstract class GraphObject<T> {
    public static InitializeFromStorage<U>(storage: StorageSelect<U>): U | void { console.log(storage); }
    public abstract ToStorage(): StorageWithIDSelect<T>
}