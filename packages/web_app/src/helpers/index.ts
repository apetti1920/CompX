import { Vector2D } from '@compx/common/Types'

/* Utility function to convert on screen mouse coordinates to canvas coordinates*/
export function ScreenToWorld(point: Vector2D, translation: Vector2D, zoom: number, screenSize: Vector2D): Vector2D {

    const tmpWorld = {
        x: (1/zoom) * ((point.x - translation.x) - (0.5 * screenSize.x)),
        y: -((1/zoom) * ((point.y - translation.y) - (0.5 * screenSize.y)))
    };
    return new Vector2D(tmpWorld.x, tmpWorld.y);
}

// type RectIdentifier = {position: Vector2D, size: Vector2D}
// export function RectsOverlap(rect1: RectIdentifier, rect2: RectIdentifier): boolean {
//     const l1: Vector2D = { x: rect1.position.x - (rect1.size.x / 2), y: rect1.position.y + (rect1.size.y / 2) };
//     const r1: Vector2D = { x: rect1.position.x + (rect1.size.x / 2), y: rect1.position.y - (rect1.size.y / 2) };
//     const l2: Vector2D = { x: rect2.position.x - (rect2.size.x / 2), y: rect2.position.y + (rect2.size.y / 2) };
//     const r2: Vector2D = { x: rect2.position.x + (rect2.size.x / 2), y: rect2.position.y - (rect2.size.y / 2) };
//
//     // if rectangle has area 0, no overlap
//     if (l1.x == r1.x || l1.y == r1.y || r2.x == l2.x || l2.y == r2.y)
//         return false;
//
//     // If one rectangle is on left side of other
//     if (l1.x > r2.x || l2.x > r1.x) {
//         return false;
//     }
//
//     // If one rectangle is above other
//     return !(r1.y > l2.y || r2.y > l1.y);
//
//
// }