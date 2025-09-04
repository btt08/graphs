// Utility functions for bar-graph

/** Parse a value as number or percent string */
export function parseValue(val: any): number {
  if (typeof val === 'string' && val.endsWith('%')) {
    return parseFloat(val);
  }
  return +val;
}

/** Get a color for a stack key, fallback to default */
export function getColor(
  colors: Record<string, string>,
  key: string,
  fallback = '#ccc'
) {
  return colors[key] || fallback;
}

/** Generate a unique barId for a chart instance */
export function getBarId(instanceId: string, i: number): string {
  return `${instanceId}-bar-clip-${i}`;
}
