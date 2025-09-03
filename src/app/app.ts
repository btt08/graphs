import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarGraph } from './components/bar-graph/bar-graph';
import { mockData3Values, mockDataSingleValue } from './mocks/mockData';
import { StackedBarConfig } from './components/bar-graph/interfaces/bar-graph.interfaces';
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

  config: StackedBarConfig = {
    stackKeys: ['total'],
    colors: {
      total: '#90caf9',
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
