// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { RequireOnlyOne } from 'compx_common/Types';

export type MouseHandlerType = RequireOnlyOne<{
  onDragStart?: () => void;
  dragging?: {
    onDrag: () => void;
    onDragEng: () => void;
  };
}>;

export type ThemeType = {
  palette: {
    background: string;
    text: string;
    accent: string;
    shadow: string;
    link: string;
    informational: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    toolbarTopHeight: number;
    toolbarLeftHeight: number;
  };
};
