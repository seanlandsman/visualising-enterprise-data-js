import * as D3 from 'D3/index';
import {SummarisedOlympicRecord} from '../../../model/SummarisedOlympicRecord';
import {D3ChartComponent} from '../../d3-chart.component';
import {Subject} from 'rxjs/Subject';

export class PieChartByAthleteBySportComponent extends D3ChartComponent {
    constructor(chartDataChanged: Subject<SummarisedOlympicRecord[]>) {
        super(chartDataChanged);

        this.colourScale = D3.scaleOrdinal().range(['#965A38', '#A8A8A8', '#D9A441']);

        this.initialiseChart();
    }

    render() {
        this.svg.selectAll('*').remove();
        if (this.summarisedOlympicRecords && this.summarisedOlympicRecords.length > 0) {
            const svgWidth = +this.svg.attr('width');
            const svgHeight = +this.svg.attr('height');

            const radius = Math.min(svgWidth, svgHeight) / 2;
            const pieGroup = this.svg.append('g')
                .attr('transform', 'translate(' + svgWidth / 2 + ',' + svgHeight / 2 + ')');

            this.colourScale = D3.scaleOrdinal(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

            const pie = D3.pie()
                .sort(null)
                .value((summarisedOlympicRecord: any) => (<SummarisedOlympicRecord>summarisedOlympicRecord).total);

            const path = D3.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);

            const label = D3.arc()
                .outerRadius(radius - 20)
                .innerRadius(radius - 40);

            const arc = pieGroup.selectAll('.arc')
                .data(pie(<any>this.summarisedOlympicRecords))
                .enter().append('g')
                .attr('class', 'arc');

            arc.append('path')
                .attr('d', path)
                .attr('fill', (d: any) => this.colourScale(d.data.country));

            arc.append('text')
                .attr('transform', (d: any) => {
                    return 'translate(' + label.centroid(d) + ')';
                })
                .attr('dy', '0.35em')
                .attr('dx', (data: any) => {
                    if (data.index === 0) {
                        return '-7em';
                    }
                    return '0';
                })
                .text((d: any) => {
                    return d.data.country;
                });
        }
    }
}
