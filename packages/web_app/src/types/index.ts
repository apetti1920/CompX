import { RequireOnlyOne } from '@compx/common/Types';

export type MouseHandlerType = RequireOnlyOne<{
  onDragStart?: () => void;
  dragging?: {
    onDrag: () => void;
    onDragEng: () => void;
  };
}>;

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
