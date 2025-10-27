import { Vector2D } from '@compx/common/Types';
import { ScreenToWorld } from '../../src/helpers';

describe('Coordinate Transformation - ScreenToWorld', () => {
  describe('Basic Transformations', () => {
    test('should convert screen center to world origin with no zoom or translation', () => {
      const screenSize = new Vector2D(800, 600);
      const screenCenter = new Vector2D(400, 300);
      const translation = new Vector2D(0, 0);
      const zoom = 1.0;

      const worldPos = ScreenToWorld(screenCenter, translation, zoom, screenSize);

      // Screen center should map to world origin
      expect(worldPos.x).toBeCloseTo(0, 5);
      expect(worldPos.y).toBeCloseTo(0, 5);
    });

    test('should handle screen top-left corner', () => {
      const screenSize = new Vector2D(800, 600);
      const topLeft = new Vector2D(0, 0);
      const translation = new Vector2D(0, 0);
      const zoom = 1.0;

      const worldPos = ScreenToWorld(topLeft, translation, zoom, screenSize);

      // Top-left should be at negative world coordinates
      expect(worldPos.x).toBeCloseTo(-400, 5);
      expect(worldPos.y).toBeCloseTo(300, 5); // Y-axis is inverted
    });

    test('should handle screen bottom-right corner', () => {
      const screenSize = new Vector2D(800, 600);
      const bottomRight = new Vector2D(800, 600);
      const translation = new Vector2D(0, 0);
      const zoom = 1.0;

      const worldPos = ScreenToWorld(bottomRight, translation, zoom, screenSize);

      expect(worldPos.x).toBeCloseTo(400, 5);
      expect(worldPos.y).toBeCloseTo(-300, 5); // Y-axis is inverted
    });
  });

  describe('Zoom Transformations', () => {
    test('should scale coordinates with zoom > 1 (zoomed in)', () => {
      const screenSize = new Vector2D(800, 600);
      const point = new Vector2D(600, 300); // 200 pixels right of center
      const translation = new Vector2D(0, 0);
      const zoom = 2.0; // 2x zoom

      const worldPos = ScreenToWorld(point, translation, zoom, screenSize);

      // At 2x zoom, 200 screen pixels = 100 world units
      expect(worldPos.x).toBeCloseTo(100, 5);
      expect(worldPos.y).toBeCloseTo(0, 5);
    });

    test('should scale coordinates with zoom < 1 (zoomed out)', () => {
      const screenSize = new Vector2D(800, 600);
      const point = new Vector2D(600, 300); // 200 pixels right of center
      const translation = new Vector2D(0, 0);
      const zoom = 0.5; // 0.5x zoom (zoomed out)

      const worldPos = ScreenToWorld(point, translation, zoom, screenSize);

      // At 0.5x zoom, 200 screen pixels = 400 world units
      expect(worldPos.x).toBeCloseTo(400, 5);
      expect(worldPos.y).toBeCloseTo(0, 5);
    });

    test('should handle very high zoom levels', () => {
      const screenSize = new Vector2D(800, 600);
      const point = new Vector2D(410, 305); // 10px right, 5px down from center
      const translation = new Vector2D(0, 0);
      const zoom = 10.0;

      const worldPos = ScreenToWorld(point, translation, zoom, screenSize);

      expect(worldPos.x).toBeCloseTo(1, 5);
      expect(worldPos.y).toBeCloseTo(-0.5, 5);
    });

    test('should handle very low zoom levels', () => {
      const screenSize = new Vector2D(800, 600);
      const point = new Vector2D(600, 300);
      const translation = new Vector2D(0, 0);
      const zoom = 0.1;

      const worldPos = ScreenToWorld(point, translation, zoom, screenSize);

      expect(worldPos.x).toBeCloseTo(2000, 5);
      expect(worldPos.y).toBeCloseTo(0, 5);
    });
  });

  describe('Translation Transformations', () => {
    test('should apply positive translation correctly', () => {
      const screenSize = new Vector2D(800, 600);
      const screenCenter = new Vector2D(400, 300);
      const translation = new Vector2D(100, 50); // Canvas panned right and down
      const zoom = 1.0;

      const worldPos = ScreenToWorld(screenCenter, translation, zoom, screenSize);

      // With positive translation, world origin shifts
      // X: (400 - 100 - 400) / 1 = -100
      // Y: -((300 - 50 - 300) / 1) = -(-50) = 50
      expect(worldPos.x).toBeCloseTo(-100, 5);
      expect(worldPos.y).toBeCloseTo(50, 5);
    });

    test('should apply negative translation correctly', () => {
      const screenSize = new Vector2D(800, 600);
      const screenCenter = new Vector2D(400, 300);
      const translation = new Vector2D(-100, -50);
      const zoom = 1.0;

      const worldPos = ScreenToWorld(screenCenter, translation, zoom, screenSize);

      // X: (400 - (-100) - 400) / 1 = 100
      // Y: -((300 - (-50) - 300) / 1) = -(50) = -50
      expect(worldPos.x).toBeCloseTo(100, 5);
      expect(worldPos.y).toBeCloseTo(-50, 5);
    });

    test('should handle large translations', () => {
      const screenSize = new Vector2D(800, 600);
      const point = new Vector2D(400, 300);
      const translation = new Vector2D(5000, -3000);
      const zoom = 1.0;

      const worldPos = ScreenToWorld(point, translation, zoom, screenSize);

      // X: (400 - 5000 - 400) / 1 = -5000
      // Y: -((300 - (-3000) - 300) / 1) = -(3000) = -3000
      expect(worldPos.x).toBeCloseTo(-5000, 5);
      expect(worldPos.y).toBeCloseTo(-3000, 5);
    });
  });

  describe('Combined Zoom and Translation', () => {
    test('should correctly apply both zoom and translation', () => {
      const screenSize = new Vector2D(800, 600);
      const point = new Vector2D(600, 400); // 200px right, 100px down from center
      const translation = new Vector2D(50, 25);
      const zoom = 2.0;

      const worldPos = ScreenToWorld(point, translation, zoom, screenSize);

      // Point relative to center: (200, 100)
      // Subtract translation: (200 - 50, 100 - 25) = (150, 75)
      // Apply zoom: (150/2, 75/2) = (75, 37.5)
      // Invert Y: (75, -37.5)
      expect(worldPos.x).toBeCloseTo(75, 5);
      expect(worldPos.y).toBeCloseTo(-37.5, 5);
    });

    test('should handle zoom out with translation', () => {
      const screenSize = new Vector2D(1000, 800);
      const point = new Vector2D(500, 400); // Center
      const translation = new Vector2D(-200, 100);
      const zoom = 0.5;

      const worldPos = ScreenToWorld(point, translation, zoom, screenSize);

      // X: (1/0.5) * (500 - (-200) - 500) = 2 * 200 = 400
      // Y: -((1/0.5) * (400 - 100 - 400)) = -(2 * (-100)) = 200
      expect(worldPos.x).toBeCloseTo(400, 5);
      expect(worldPos.y).toBeCloseTo(200, 5);
    });
  });

  describe('Y-Axis Inversion', () => {
    test('should invert Y-axis (screen down = world up)', () => {
      const screenSize = new Vector2D(800, 600);
      const pointAbove = new Vector2D(400, 200); // Above center
      const pointBelow = new Vector2D(400, 400); // Below center
      const translation = new Vector2D(0, 0);
      const zoom = 1.0;

      const worldAbove = ScreenToWorld(pointAbove, translation, zoom, screenSize);
      const worldBelow = ScreenToWorld(pointBelow, translation, zoom, screenSize);

      // Screen up (smaller Y) should be world up (positive Y)
      expect(worldAbove.y).toBeGreaterThan(0);
      // Screen down (larger Y) should be world down (negative Y)
      expect(worldBelow.y).toBeLessThan(0);
    });

    test('should maintain Y-inversion with zoom', () => {
      const screenSize = new Vector2D(800, 600);
      const pointAbove = new Vector2D(400, 250);
      const pointBelow = new Vector2D(400, 350);
      const translation = new Vector2D(0, 0);
      const zoom = 3.0;

      const worldAbove = ScreenToWorld(pointAbove, translation, zoom, screenSize);
      const worldBelow = ScreenToWorld(pointBelow, translation, zoom, screenSize);

      expect(worldAbove.y).toBeGreaterThan(0);
      expect(worldBelow.y).toBeLessThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero-sized screen', () => {
      const screenSize = new Vector2D(0, 0);
      const point = new Vector2D(0, 0);
      const translation = new Vector2D(0, 0);
      const zoom = 1.0;

      const worldPos = ScreenToWorld(point, translation, zoom, screenSize);

      expect(worldPos.x).toBeCloseTo(0, 5);
      expect(worldPos.y).toBeCloseTo(0, 5);
    });

    test('should handle very small zoom values', () => {
      const screenSize = new Vector2D(800, 600);
      const point = new Vector2D(400, 300);
      const translation = new Vector2D(0, 0);
      const zoom = 0.001;

      const worldPos = ScreenToWorld(point, translation, zoom, screenSize);

      // Very small zoom = very large world coordinates
      expect(Math.abs(worldPos.x)).toBeLessThan(1);
      expect(Math.abs(worldPos.y)).toBeLessThan(1);
    });

    test('should handle non-square screen dimensions', () => {
      const screenSize = new Vector2D(1920, 1080);
      const point = new Vector2D(1920, 1080);
      const translation = new Vector2D(0, 0);
      const zoom = 1.0;

      const worldPos = ScreenToWorld(point, translation, zoom, screenSize);

      expect(worldPos.x).toBeCloseTo(960, 5);
      expect(worldPos.y).toBeCloseTo(-540, 5);
    });
  });

  describe('Real-World Drag-and-Drop Scenarios', () => {
    test('should convert drop at default position (centered, no zoom)', () => {
      const screenSize = new Vector2D(900, 900);
      const dropPoint = new Vector2D(450, 450); // Screen center
      const translation = new Vector2D(0, 0);
      const zoom = 1.0;

      const worldPos = ScreenToWorld(dropPoint, translation, zoom, screenSize);

      expect(worldPos.x).toBeCloseTo(0, 5);
      expect(worldPos.y).toBeCloseTo(0, 5);
    });

    test('should convert drop after panning right and down', () => {
      const screenSize = new Vector2D(900, 900);
      const dropPoint = new Vector2D(450, 450); // Still dropping at screen center
      const translation = new Vector2D(300, 200); // Canvas panned
      const zoom = 1.0;

      const worldPos = ScreenToWorld(dropPoint, translation, zoom, screenSize);

      // X: (450 - 300 - 450) / 1 = -300
      // Y: -((450 - 200 - 450) / 1) = -(-200) = 200
      expect(worldPos.x).toBeCloseTo(-300, 5);
      expect(worldPos.y).toBeCloseTo(200, 5);
    });

    test('should convert drop after zooming in 2x', () => {
      const screenSize = new Vector2D(900, 900);
      const dropPoint = new Vector2D(600, 450); // 150px right of center
      const translation = new Vector2D(0, 0);
      const zoom = 2.0;

      const worldPos = ScreenToWorld(dropPoint, translation, zoom, screenSize);

      // At 2x zoom, 150 screen pixels = 75 world units
      expect(worldPos.x).toBeCloseTo(75, 5);
      expect(worldPos.y).toBeCloseTo(0, 5);
    });

    test('should convert drop with zoom and pan combined', () => {
      const screenSize = new Vector2D(900, 900);
      const dropPoint = new Vector2D(600, 350); // Right and up from center
      const translation = new Vector2D(100, -50);
      const zoom = 1.5;

      const worldPos = ScreenToWorld(dropPoint, translation, zoom, screenSize);

      // Relative to center: (150, -100)
      // Subtract translation: (150 - 100, -100 - (-50)) = (50, -50)
      // Apply zoom: (50/1.5, -50/1.5) = (33.33, -33.33)
      // Invert Y: (33.33, 33.33)
      expect(worldPos.x).toBeCloseTo(33.33, 2);
      expect(worldPos.y).toBeCloseTo(33.33, 2);
    });
  });
});
