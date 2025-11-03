import { PortType } from '@compx/common/BlockSchema/types';

/**
 * Color mapping for port types
 * Each port type has a unique color that is used consistently for both ports and edges
 */
export const PortTypeColorMap: Record<PortType, string> = {
  NUMBER: '#2196F3', // Blue
  STRING: '#4CAF50', // Green
  VECTOR: '#FF9800', // Orange
  MATRIX: '#9C27B0', // Purple
  BOOLEAN: '#F44336' // Red
};

/**
 * Get the color for a given port type
 * @param type - The port type (can be string from PortTypes or PortType)
 * @returns The color string (hex format) for the port type
 */
export function getPortTypeColor(type: PortType | string): string {
  // Normalize the type to uppercase to handle any case variations
  const normalizedType = (typeof type === 'string' ? type.toUpperCase() : type) as string;

  // Direct lookup in the map
  const color = PortTypeColorMap[normalizedType as PortType];
  if (color) {
    return color;
  }

  // Fallback if type doesn't exist in map
  // eslint-disable-next-line no-console
  console.warn(
    `Port type "${type}" (normalized: "${normalizedType}") not found in color map. Available types:`,
    Object.keys(PortTypeColorMap),
    'PortTypeColorMap:',
    PortTypeColorMap
  );
  return '#9E9E9E'; // Gray fallback
}
