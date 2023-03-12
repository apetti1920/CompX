import Color from 'values.js';

export type ThemeStorageType = {
  primary: {
    action: string; // primary actions, buttons, text links, for indicating progress and representing authentication
    heading: string; // body text and headings
    background: string; // backgrounds
  };
  secondary: {
    error: string; // backgrounds in messages and in error states, draw attention to important information or actions that are destructive
    warning: string; // indicates a warning or that progress is impeded
    success: string; // indicates success or to celebrate a win
    support: string; //  indicates help and support, visited links, as an accent color in illustration
    illustration: string; // illustrations or as an accent color
  };
};

type ThemeType = {
  [P in keyof ThemeStorageType]: { [U in keyof ThemeStorageType[P]]: Color };
};

export default class ColorTheme {
  public readonly value: ThemeType;
  constructor(theme: ThemeStorageType) {
    this.value = Object.fromEntries(
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

  get(color: keyof ThemeStorageType['primary'] | keyof ThemeStorageType['secondary']): string {
    if (color in this.value.primary) return this.value.primary[color as keyof ThemeStorageType['primary']].hexString();
    if (color in this.value.secondary)
      return this.value.secondary[color as keyof ThemeStorageType['secondary']].hexString();
    throw Error(`No Color "${color}"`);
  }
}
