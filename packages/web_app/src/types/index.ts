import { RequireOnlyOne } from '@compx/common/Types';

export type MouseHandlerType = RequireOnlyOne<{
    onDragStart?: () => void
    dragging?: {
        onDrag: () => void,
        onDragEng: () => void
    }
}>

export type ThemeType = {
    palette: {
        background: string,
        text: string,
        accent: string,
        shadow: string,
        link: string,
        informational: string,
        success: string,
        warning: string,
        error: string
    }, spacing: {
        toolbarTopHeight: number,
        toolbarLeftHeight: number
    }
}