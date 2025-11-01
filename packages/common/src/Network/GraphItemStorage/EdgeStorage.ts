import { PortTypes, PortTypesStringList } from '../../Graph/Port';
import { WithID } from '../../Helpers/Types';

export type EdgePointType = { blockID: string; portID: string };
function isEdgePointType(obj: any): obj is EdgePointType {
  if (typeof obj !== 'object' || Array.isArray(obj)) return false;

  const requiredKeys = ['blockID', 'portID'];
  if (!requiredKeys.every((k) => k in obj)) return false;

  if (typeof obj['blockID'] !== 'string') return false;
  if (typeof obj['portID'] !== 'string') return false;

  return true;
}

export interface EdgeStorageType<U extends keyof PortTypes> extends WithID {
  type: U;
  input: EdgePointType;
  output: EdgePointType;
}
export function isEdgeStorageType<U extends keyof PortTypes>(obj: any): obj is EdgeStorageType<U> {
  if (typeof obj !== 'object' || Array.isArray(obj)) return false;

  const requiredKeys = ['id', 'type', 'input', 'output'];
  if (!requiredKeys.every((k) => k in obj)) return false;

  if (typeof obj['id'] !== 'string') return false;
  if (
    typeof obj['type'] !== 'string' ||
    !PortTypesStringList.includes(obj['type'] as (typeof PortTypesStringList)[number])
  )
    return false;

  if (!isEdgePointType(obj['input'])) return false;
  if (!isEdgePointType(obj['output'])) return false;

  return true;
}

export interface VisualEdgeStorageType<U extends keyof PortTypes> extends EdgeStorageType<U> {
  visualName?: string;
  midPoints: number[];
}
