import { BlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';

abstract class LibraryUpdate {
  abstract GetBlocks(): Promise<BlockStorageType<any, any>[]>;
}

// export class LibraryUpdateLocal extends LibraryUpdate {
//   GetBlocks(): Promise<BlockStorageType<any, any>[]> {
//     return [];
//   }
// }
