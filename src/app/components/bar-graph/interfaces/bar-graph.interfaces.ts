export interface IStackedBarConfig {
  /**
   * The keys to stack, in order from bottom to top.
   * Example: ['contracts', 'amendments', 'terminations']
   */
  stackKeys: string[];
  /**
   * The color for each stack key. Example: { contracts: '#90caf9', ... }
   */
  colors: Record<string, string>;
  /**
   * The key for the total value. Example: 'total'
   */
  totalKey: string;
  /**
   * The key for the label (e.g., year). Example: 'year'
   */
  labelKey: string;
  /**
   * Optional function to determine color based on value/key/data
   * If provided, overrides the static color for that bar segment.
   */
  colorFn?: (value: number, key: string, d: any) => string;
}

export interface IChartContext {
  svg: any;
  barGroup: any;
  defs: any;
  barWidth: number;
  barSpacing: number;
  config: IStackedBarConfig;
  margin: { top: number; right: number; bottom: number; left: number };
  height: number;
  tooltip: any;
  /** For vertical orientation */
  yScale?: (value: number) => number;
  /** For horizontal orientation */
  xScale?: (value: number) => number;
  /** Unique instance id for this chart */
  instanceId: string;
  /** Responsive font size for labels */
  fontSize?: number;
  /** Responsive corner radius for bars */
  radius?: number;
}

export interface IMarginObj {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
