// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { BlockStorageType } from 'compx_common/Network/GraphItemStorage/BlockStorage';

abstract class LibraryUpdate {
  abstract GetBlocks(): Promise<BlockStorageType<any, any>[]>;
}

// export class LibraryUpdateLocal extends LibraryUpdate {
//   GetBlocks(): Promise<BlockStorageType<any, any>[]> {
//     return [];
//   }
// }
