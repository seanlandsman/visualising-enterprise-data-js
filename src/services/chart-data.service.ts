import {SummarisedOlympicRecord} from '../model/SummarisedOlympicRecord';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {D3ChartComponent} from '../charts/d3-chart.component';
import {BarChartByTotalMedalsComponent} from '../charts/bar-chart/bar-chart-by-total-medals/bar-chart-by-total-medals.component';
import {StackedBarChartByCountryMedalTypeComponent} from '../charts/bar-chart/stacked-bar-chart-by-country-athlete/stacked-bar-chart-by-country-medal-type.component';
import {PieChartByAthleteBySportComponent} from '../charts/pie-chart/pie-chart-by-athlete-by-sport/pie-chart-by-athlete-by-sport.component';

export enum ChartType {
    BarChartByTotalMedals,
    StackedBarChartByCountryMedalType,
    PieChartByAthleteBySport
}

export class ChartDataService {
    currentChart: D3ChartComponent;
    chartDataChanged = new BehaviorSubject<SummarisedOlympicRecord[]>([]);

    constructor() {
        this.currentChart = new BarChartByTotalMedalsComponent(this.chartDataChanged);
    }

    setBarChartData(summarisedOlympicRecords: SummarisedOlympicRecord[]) {
        this.chartDataChanged.next(summarisedOlympicRecords.slice());
    }

    switchToChartType(chartType: ChartType) {
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        switch (chartType) {
            case ChartType.BarChartByTotalMedals:
                this.currentChart = new BarChartByTotalMedalsComponent(this.chartDataChanged);
                break;
            case ChartType.StackedBarChartByCountryMedalType:
                this.currentChart = new StackedBarChartByCountryMedalTypeComponent(this.chartDataChanged);
                break;
            case ChartType.PieChartByAthleteBySport:
                this.currentChart = new PieChartByAthleteBySportComponent(this.chartDataChanged);
                break;
        }
    }
}
