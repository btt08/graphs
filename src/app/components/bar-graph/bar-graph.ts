import {
  Component,
  OnInit,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
  input,
} from '@angular/core';
import * as d3 from 'd3';
import {
  StackedBarConfig,
  ChartContext,
} from './interfaces/bar-graph.interfaces';
import * as BarGraphDrawers from './services/bar-graph.drawers';
import { parseValue } from './services/bar-graph.utils';

let barGraphInstanceCounter = 0;

@Component({
  selector: 'app-bar-graph',
  imports: [],
  templateUrl: './bar-graph.html',
  styleUrl: './bar-graph.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BarGraph implements OnInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  readonly data = input<Array<Record<string, any>>>([]);
  readonly config = input<StackedBarConfig>({
    stackKeys: ['contracts', 'amendments', 'terminations'],
    colors: {
      contracts: '#90caf9',
      amendments: '#1565c0',
      terminations: '#e0e0e0',
    },
    totalKey: 'total',
    labelKey: 'year',
  });
  readonly height = input<number>(200);
  readonly width = input(400);
  readonly margin = input({ top: 20, right: 30, bottom: 30, left: 40 });
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly showLegend = input<boolean>(true);
  svg: any;
  barGroup: any;
  private instanceId: string;

  constructor() {
    // Unique ID for this chart instance
    this.instanceId =
      'bargraph-' +
      (barGraphInstanceCounter++).toString(36) +
      '-' +
      Math.random().toString(36).slice(2, 8);
  }

  ngOnInit(): void {
    // Add extra space at the top for the label (vertical) or left (horizontal)
    // const extraSpace = this.orientation() === 'vertical' ? 30 : 30;
    const extraSpace = this.orientation() === 'vertical' ? 30 : 30;
    // For horizontal with legend, add extra height for legend
    let svgHeight =
      this.orientation() === 'vertical'
        ? this.height() + this.margin().top + this.margin().bottom + extraSpace
        : this.height() + this.margin().top + this.margin().bottom;
    const orientation = this.orientation();
    if (orientation === 'horizontal' && this.showLegend()) {
      // Add enough space for legend below all bars (bar count * barSpacing + margin)
      // const legendSpace =
      //   60 + (this.data().length > 0 ? (this.data().length - 1) * 40 : 0);
      // svgHeight += legendSpace;
    }
    this.svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr(
        'width',
        orientation === 'vertical'
          ? this.width() + this.margin().left + this.margin().right
          : this.width() + this.margin().left + this.margin().right + extraSpace
      )
      .attr('height', svgHeight);
    // Create a group for all bars, shifted by margin
    this.barGroup = this.svg
      .append('g')
      .attr('class', 'bar-group')
      .attr(
        'transform',
        `translate(${this.margin().left},${this.margin().top})`
      );
    this.createStackedBarChart(extraSpace);
  }

  private createStackedBarChart(extraSpace: number = 0): void {
    // Find the max value for scaling
    const totalKey = this.config().totalKey;
    const maxValue = d3.max(this.data(), (d) => parseValue(d[totalKey])) || 1;

    let chartContext: ChartContext;
    if (this.orientation() === 'vertical') {
      const availableBarHeight =
        this.height() - this.margin().top - this.margin().bottom - extraSpace;
      const yScale = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([0, availableBarHeight]);
      chartContext = {
        svg: this.svg,
        barGroup: this.barGroup,
        defs: this.svg.append('defs'),
        barWidth: 30,
        barSpacing: 46,
        config: this.config(),
        margin: { ...this.margin(), top: this.margin().top + extraSpace },
        height: this.height(),
        tooltip: this.createTooltip(),
        yScale,
        instanceId: this.instanceId,
      };
      this.data().forEach((d, i) => {
        BarGraphDrawers.drawOuterBarVertical(chartContext, d, i);
        BarGraphDrawers.defineClipPathVertical(chartContext, d, i);
        BarGraphDrawers.drawStackedSegmentsVertical(
          chartContext,
          d,
          i,
          this.getBarEvents()
        );
        BarGraphDrawers.drawBaseLabelVertical(chartContext, d, i);
        BarGraphDrawers.drawDataLabelVertical(chartContext, d, i);
      });
    } else {
      const availableBarWidth =
        this.width() - this.margin().left - this.margin().right - extraSpace;
      const xScale = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([0, availableBarWidth]);
      chartContext = {
        svg: this.svg,
        barGroup: this.barGroup,
        defs: this.svg.append('defs'),
        barWidth: 16,
        barSpacing: 32,
        config: this.config(),
        margin: { ...this.margin(), left: this.margin().left + extraSpace },
        height: this.height(),
        tooltip: this.createTooltip(),
        xScale,
        instanceId: this.instanceId,
      } as any;
      this.data().forEach((d, i) => {
        BarGraphDrawers.drawOuterBarHorizontal(chartContext, d, i);
        BarGraphDrawers.defineClipPathHorizontal(chartContext, d, i);
        BarGraphDrawers.drawStackedSegmentsHorizontal(
          chartContext,
          d,
          i,
          this.getBarEvents()
        );
        BarGraphDrawers.drawYearLabelHorizontal(chartContext, d, i);
        BarGraphDrawers.drawTotalLabelHorizontal(chartContext, d, i);
      });
    }
    if (this.showLegend()) {
      this.drawLegend(chartContext);
    }
  }

  /** Bar event handlers for modular drawers */
  private getBarEvents() {
    return {
      mouseover: this.onBarMouseOver.bind(this),
      mousemove: this.onBarMouseMove.bind(this),
      mouseout: this.onBarMouseOut.bind(this),
    };
  }

  /** Tooltip creation helper */
  private createTooltip() {
    return d3
      .select(this.chartContainer.nativeElement)
      .append('div')
      .attr('class', 'd3-tooltip');
  }

  /** D3 event: bar mouseover */
  private onBarMouseOver(
    event: MouseEvent,
    ctx: ChartContext,
    s: { key: string; value: number },
    d: any
  ) {
    ctx.tooltip.transition().duration(150).style('opacity', 1);
    ctx.tooltip
      .html(
        `<b>${s.key.charAt(0).toUpperCase() + s.key.slice(1)}</b>: ${d[s.key]}`
      )
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY - 28 + 'px');
    // Use colorFn if present, else fallback to static color
    let baseColor = ctx.config.colorFn
      ? ctx.config.colorFn(s.value, s.key, d)
      : ctx.config.colors[s.key] || '#ccc';
    const hoverColorVal = d3.color(baseColor);
    d3.select(event.target as SVGRectElement)
      .attr(
        'fill',
        hoverColorVal ? hoverColorVal.brighter(0.7).toString() : baseColor
      )
      .attr('opacity', 0.7);
  }

  /** D3 event: bar mousemove */
  private onBarMouseMove(event: MouseEvent, ctx: ChartContext) {
    ctx.tooltip
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY - 28 + 'px');
  }

  /** D3 event: bar mouseout */
  private onBarMouseOut(
    event: MouseEvent,
    ctx: ChartContext,
    s: { key: string; value: number },
    d: any
  ) {
    ctx.tooltip.transition().duration(150).style('opacity', 0);
    let baseColor = ctx.config.colorFn
      ? ctx.config.colorFn(s.value, s.key, d)
      : ctx.config.colors[s.key] || '#ccc';
    d3.select(event.target as SVGRectElement)
      .attr('fill', baseColor)
      .attr('opacity', 1);
  }

  /** Draws the legend below the chart, ensures SVG is tall enough */
  private drawLegend(ctx: ChartContext) {
    const legendY =
      this.orientation() === 'vertical'
        ? ctx.height + ctx.margin.bottom / 2
        : this.data().length * ctx.barSpacing + 15;
    const legendHeight = 32;
    const svgEl = d3.select(ctx.svg.node());
    const currentHeight = +svgEl.attr('height');
    const neededHeight = legendY + legendHeight;
    if (currentHeight < neededHeight) {
      svgEl.attr('height', neededHeight);
    }
    const legend = ctx.svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${ctx.margin.left}, ${legendY})`);
    ctx.config.stackKeys.forEach((key, i) => {
      legend
        .append('circle')
        .attr('cx', i * 120 + 12)
        .attr('cy', 12)
        .attr('r', 8)
        .attr('fill', ctx.config.colors[key] || '#ccc');
      legend
        .append('text')
        .attr('x', i * 120 + 24)
        .attr('y', 18)
        .attr('font-size', 14)
        .attr('fill', '#848484')
        .attr('font-family', 'Arial, sans-serif')
        .text(key.charAt(0).toUpperCase() + key.slice(1));
    });
  }
}
