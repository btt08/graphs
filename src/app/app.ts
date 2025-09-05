import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IStackedBarConfig } from './components/bar-graph/interfaces/bar-graph.interfaces';
import { BarGraph } from './components/bar-graph/bar-graph';
import { mockData3Values, mockDataSingleValue } from './mocks/mockData';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BarGraph],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'graphs';
  mockData3Values = mockData3Values;
  mockDataSingleValue = mockDataSingleValue;

  config3Values: IStackedBarConfig = {
    stackKeys: ['contracts', 'amendments', 'terminations'],
    colors: {
      contracts: '#90caf9',
      amendments: '#1565c0',
      terminations: '#e0e0e0',
    },
    totalKey: 'total',
    labelKey: 'year',
  };

  configSingleValueColors: IStackedBarConfig = {
    stackKeys: ['total'],
    colors: {
      '< 40': '#90caf9',
      '< 60': '#ffe082',
      '>= 60': '#e57373',
    },
    totalKey: 'total',
    labelKey: 'year',
    colorFn: (value, key, d) => {
      if (value < 40) return '#90caf9';
      if (value < 60) return '#ffe082';
      return '#e57373';
    },
  };
}
