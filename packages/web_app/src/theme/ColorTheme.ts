import Color from 'values.js';

import { ThemeStorageType } from '../types';

type ThemeType = {
  [P in keyof ThemeStorageType]: { [U in keyof ThemeStorageType[P]]: Color };
};

export default class ColorTheme {
  private readonly theme: ThemeType;
  constructor(theme: ThemeStorageType) {
    this.theme = Object.fromEntries(
      Object.keys(theme).map((k) => [
        k,
        Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Object.keys(theme[k as unknown as keyof ThemeStorageType]).map((k2) => [k2, new Color(theme[k][k2])])
        )
      ])
    ) as ThemeType;
  }
}
