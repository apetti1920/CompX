import { PortTypes, PortTypesStringList } from '../../Graph/Port';
import { WithID } from '../../Helpers/Types';

export interface PortStorageType<U extends keyof PortTypes> {
  name: string;
  type: U;
  initialValue?: PortTypes[U];
}

export function isPortStorageType<U extends keyof PortTypes>(obj: any): obj is PortStorageType<U> {
  if (typeof obj !== 'object' || Array.isArray(obj)) return false;

  const requiredKeys = ['name', 'type'];
  if (!requiredKeys.every((k) => k in obj)) return false;

  if (typeof obj['name'] !== 'string') return false;
  if (
    typeof obj['type'] !== 'string' ||
    !PortTypesStringList.includes(obj['type'] as (typeof PortTypesStringList)[number])
  )
    return false;

  if ('initialValue' in obj && obj['initialValue'] !== undefined) {
    switch (obj['type'] as (typeof PortTypesStringList)[number]) {
      case 'STRING': {
        if (typeof obj['initialValue'] !== 'string') return false;
        break;
      }
      case 'NUMBER': {
        if (typeof obj['initialValue'] !== 'number') return false;
        break;
      }
      default: {
        break;
      }
    }
  }

  return true;
}

export interface PortStorageWithIDType<U extends keyof PortTypes> extends WithID, PortStorageType<U> {}
export function isPortStorageWithIDType<U extends keyof PortTypes>(obj: any): obj is PortStorageWithIDType<U> {
  if (!isPortStorageType(obj)) return false;
  if (!('id' in obj) || typeof obj['id'] !== 'string') return false;

  return true;
}
