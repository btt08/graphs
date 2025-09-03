import * as d3 from 'd3';
import { ChartContext } from './interfaces/bar-graph.interfaces';
import { parseValue, getColor, getBarId } from './bar-graph.utils';

// --- VERTICAL DRAW HELPERS ---
export function drawOuterBarVertical(ctx: ChartContext, d: any, i: number) {
  const x = i * ctx.barSpacing + ctx.margin.left;
  const yBase = ctx.height - ctx.margin.bottom;
  const totalValue = parseValue(d[ctx.config.totalKey]);
  const barHeight = ctx.yScale!(totalValue);
  const path = getRoundedRectPath(x, yBase, ctx.barWidth, barHeight, 20);
  ctx.barGroup
    .append('path')
    .attr('d', path)
    .attr('fill', getColor(ctx.config.colors, 'total', '#bdbdbd'))
    .attr('stroke', '#888')
    .attr('stroke-width', 1)
    .attr('shape-rendering', 'geometricPrecision');
}

export function defineClipPathVertical(ctx: ChartContext, d: any, i: number) {
  const x = i * ctx.barSpacing + ctx.margin.left;
  const yBase = ctx.height - ctx.margin.bottom;
  const totalValue = parseValue(d[ctx.config.totalKey]);
  const barHeight = ctx.yScale!(totalValue);
  const barId = getBarId(ctx.instanceId, i);
  const path = getRoundedRectPath(x, yBase, ctx.barWidth, barHeight, 20);
  ctx.defs.append('clipPath').attr('id', barId).append('path').attr('d', path);
}

export function drawStackedSegmentsVertical(
  ctx: ChartContext,
  d: any,
  i: number,
  onBarEvents: any
) {
  const x = i * ctx.barSpacing + ctx.margin.left;
  const yBase = ctx.height - ctx.margin.bottom;
  const barId = getBarId(ctx.instanceId, i);
  const stackData = ctx.config.stackKeys
    .map((key) => ({ key, value: parseValue(d[key]) }))
    .filter((s) => s.value > 0);
  let yStack = yBase;
  stackData.forEach((s) => {
    const h = ctx.yScale!(s.value);
    yStack -= h;
    ctx.barGroup
      .append('rect')
      .attr('x', x)
      .attr('y', yStack)
      .attr('width', ctx.barWidth)
      .attr('height', h)
      .attr(
        'fill',
        ctx.config.colorFn
          ? ctx.config.colorFn(s.value, s.key, d)
          : getColor(ctx.config.colors, s.key)
      )
      .attr('clip-path', `url(#${barId})`)
      .on('mouseover', (event: MouseEvent) =>
        onBarEvents.mouseover(event, ctx, s, d)
      )
      .on('mousemove', (event: MouseEvent) => onBarEvents.mousemove(event, ctx))
      .on('mouseout', (event: MouseEvent) =>
        onBarEvents.mouseout(event, ctx, s)
      );
  });
}

export function drawBaseLabelVertical(ctx: ChartContext, d: any, i: number) {
  const x = i * ctx.barSpacing + ctx.margin.left;
  const yBase = ctx.height - ctx.margin.bottom;
  ctx.barGroup
    .append('text')
    .attr('x', x + ctx.barWidth / 2)
    .attr('y', yBase + 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('fill', '#333')
    .text(d[ctx.config.labelKey]);
}

export function drawDataLabelVertical(ctx: ChartContext, d: any, i: number) {
  const x = i * ctx.barSpacing + ctx.margin.left;
  const yBase = ctx.height - ctx.margin.bottom;
  const barHeight = ctx.yScale!(parseValue(d[ctx.config.totalKey]));
  ctx.barGroup
    .append('text')
    .attr('x', x + ctx.barWidth / 2)
    .attr('y', yBase - barHeight - 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('font-weight', 'bold')
    .attr('fill', '#333')
    .text(d[ctx.config.totalKey]);
}

function getRoundedRectPath(
  x: number,
  yBase: number,
  w: number,
  h: number,
  r: number
): string {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x},${yBase} V${yBase - h + radius} Q${x},${yBase - h} ${
    x + radius
  },${yBase - h} H${x + w - radius} Q${x + w},${yBase - h} ${x + w},${
    yBase - h + radius
  } V${yBase} Z`;
}

// --- HORIZONTAL DRAW HELPERS ---
export function drawOuterBarHorizontal(ctx: ChartContext, d: any, i: number) {
  const y = i * ctx.barSpacing + ctx.margin.top;
  const xBase = ctx.margin.left;
  const totalValue = parseValue(d[ctx.config.totalKey]);
  const barWidth = ctx.xScale!(totalValue);
  const path = getRoundedRectPathHorizontal(
    xBase,
    y,
    barWidth,
    ctx.barWidth,
    20
  );
  ctx.barGroup
    .append('path')
    .attr('d', path)
    .attr('fill', getColor(ctx.config.colors, 'total', '#bdbdbd'))
    .attr('stroke', '#888')
    .attr('stroke-width', 1)
    .attr('shape-rendering', 'geometricPrecision');
}

export function defineClipPathHorizontal(ctx: ChartContext, d: any, i: number) {
  const y = i * ctx.barSpacing + ctx.margin.top;
  const xBase = ctx.margin.left;
  const totalValue = parseValue(d[ctx.config.totalKey]);
  const barWidth = ctx.xScale!(totalValue);
  const barId = getBarId(ctx.instanceId, i);
  const path = getRoundedRectPathHorizontal(
    xBase,
    y,
    barWidth,
    ctx.barWidth,
    20
  );
  ctx.defs.append('clipPath').attr('id', barId).append('path').attr('d', path);
}

export function drawStackedSegmentsHorizontal(
  ctx: ChartContext,
  d: any,
  i: number,
  onBarEvents: any
) {
  const y = i * ctx.barSpacing + ctx.margin.top;
  const xBase = ctx.margin.left;
  const barId = getBarId(ctx.instanceId, i);
  const stackData = ctx.config.stackKeys
    .map((key) => ({ key, value: parseValue(d[key]) }))
    .filter((s) => s.value > 0);
  let xStack = xBase;
  stackData.forEach((s) => {
    const w = ctx.xScale!(s.value);
    ctx.barGroup
      .append('rect')
      .attr('x', xStack)
      .attr('y', y)
      .attr('width', w)
      .attr('height', ctx.barWidth)
      .attr(
        'fill',
        ctx.config.colorFn
          ? ctx.config.colorFn(s.value, s.key, d)
          : getColor(ctx.config.colors, s.key)
      )
      .attr('clip-path', `url(#${barId})`)
      .on('mouseover', (event: MouseEvent) =>
        onBarEvents.mouseover(event, ctx, s, d)
      )
      .on('mousemove', (event: MouseEvent) => onBarEvents.mousemove(event, ctx))
      .on('mouseout', (event: MouseEvent) =>
        onBarEvents.mouseout(event, ctx, s)
      );
    xStack += w;
  });
}

export function drawYearLabelHorizontal(ctx: ChartContext, d: any, i: number) {
  const y = i * ctx.barSpacing + ctx.margin.top;
  ctx.barGroup
    .append('text')
    .attr('x', ctx.margin.left - 10)
    .attr('y', y + ctx.barWidth / 2 + 6)
    .attr('text-anchor', 'end')
    .attr('font-size', 14)
    .attr('fill', '#333')
    .text(d[ctx.config.labelKey]);
}

export function drawTotalLabelHorizontal(ctx: ChartContext, d: any, i: number) {
  const y = i * ctx.barSpacing + ctx.margin.top;
  const xBase = ctx.margin.left;
  const barWidth = ctx.xScale!(parseValue(d[ctx.config.totalKey]));
  ctx.barGroup
    .append('text')
    .attr('x', xBase + barWidth + 10)
    .attr('y', y + ctx.barWidth / 2 + 6)
    .attr('text-anchor', 'start')
    .attr('font-size', 16)
    .attr('font-weight', 'bold')
    .attr('fill', '#333')
    .text(d[ctx.config.totalKey]);
}

function getRoundedRectPathHorizontal(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): string {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x},${y} H${x + w - radius} Q${x + w},${y} ${x + w},${
    y + radius
  } V${y + h - radius} Q${x + w},${y + h} ${x + w - radius},${y + h} H${x} Z`;
}
