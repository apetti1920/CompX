import { PointType } from '@compx/common/Types'

/* Utility function to convert on screen mouse coordinates to canvas coordinates*/
export function ScreenToWorld(point: PointType, translation: PointType, zoom: number, screenSize: PointType): PointType {
    return {
        x: (1/zoom) * ((point.x - translation.x) - (0.5 * screenSize.x)),
        y: -((1/zoom) * ((point.y - translation.y) - (0.5 * screenSize.y)))
    };
}

