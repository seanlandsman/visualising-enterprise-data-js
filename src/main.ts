import {ChartDataService} from './services/chart-data.service';
import {GridComponent} from './grid/grid.component';
import {OlympicDataService} from './services/olympic-data.service';

const chartDataService = new ChartDataService();
const olympicDataService = new OlympicDataService();

(<any>window).gridComponent = new GridComponent('#grid',
    olympicDataService,
    chartDataService);