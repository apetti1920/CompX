import { RequireOnlyOne } from '@compx/common/Types';

export type MouseHandlerType = RequireOnlyOne<{
  onDragStart?: () => void;
  dragging?: {
    onDrag: () => void;
    onDragEng: () => void;
  };
}>;

export type ThemeType = {
  palette: {
    elements: {
      background: string;
      headline: string;
      paragraph: string;
      button: string;
      button_text: string;
    };

    illustration: {
      stroke: string;
      main: string;
      highlight: string;
      secondary: string;
      tertiary: string;
    };
  };
};
