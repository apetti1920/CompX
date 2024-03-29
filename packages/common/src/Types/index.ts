import Vector2D from './Vector2D';

export type DirectionType = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'se' | 'sw';

export type HexType =
  | 'a'
  | 'A'
  | 'b'
  | 'B'
  | 'c'
  | 'C'
  | 'd'
  | 'D'
  | 'e'
  | 'E'
  | 'f'
  | 'F'
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5';

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

export { Vector2D };
