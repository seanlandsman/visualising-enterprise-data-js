import * as D3 from 'D3/index';
import {SummarisedOlympicRecord} from '../../../model/SummarisedOlympicRecord';
import {Subject} from 'rxjs/Subject';
import {D3ChartComponent} from '../../d3-chart.component';

export class StackedBarChartByCountryMedalTypeComponent extends D3ChartComponent {
    constructor(chartDataChanged: Subject<SummarisedOlympicRecord[]>) {
        super(chartDataChanged);

        this.colourScale = D3.scaleOrdinal().range(['#965A38', '#A8A8A8', '#D9A441']);

        this.initialiseChart();
    }

    render() {
        this.svg.selectAll('*').remove();
        if (this.summarisedOlympicRecords && this.summarisedOlympicRecords.length > 0) {
            // create the xScale based on countries
            const xScale = D3.scaleBand()
                .domain(this.summarisedOlympicRecords.map((summarisedOlympicRecord: SummarisedOlympicRecord) => {
                    return summarisedOlympicRecord.country;
                }))
                .range([0, this.width])
                .paddingInner(0.1); // a bit of padding between the bars

            // create the yScale based on total medals won by country
            const yScale = D3.scaleLinear()
                .domain([0, D3.max(this.summarisedOlympicRecords, (summarisedOlympicRecord: SummarisedOlympicRecord): any => {
                    return summarisedOlympicRecord.total;
                })])
                .range([this.height, 0]);

            const keys = ['bronze', 'silver', 'gold'];

            this.svg.append('g')
                .selectAll('g')
                // d3 will pull out the values in this.summarisedOlympicRecords as specified by keys (gold, silver and bronze)
                .data(D3.stack().keys(keys)(<any>this.summarisedOlympicRecords))
                .enter()
                .append('g')
                .attr('fill', (d: any, i: number) => {
                    // for each segment (in turn)
                    // d is an object with:
                    //    0-number of items : {
                    //        0: ?,
                    //        1: value for current index (ie value for bronze, silver or gold, for the current country),
                    //        data: SummarisedOlympicRecord for the current country
                    //    },
                    //    index: index of this data item
                    //    key: current key

                    // pick the colour based on our colour scale
                    return this.colourScale(d.key);
                })
                .selectAll('rect')
                .data((d: any) => {
                    //  {
                    //      0: ?,
                    //      1: value for current index,
                    //      data: SummarisedOlympicRecord for the current country
                    //  },
                    return d;
                })
                .enter().append('rect')
                .attr('x', (d: any) => {
                    return xScale(d.data.country);
                })
                .attr('y', (d: any) => {
                    return yScale(d[1]);
                })
                .attr('height', (d: any) => {
                    return yScale(d[0]) - yScale(d[1]);
                })
                .attr('width', xScale.bandwidth());

            // add the x-axis
            this.svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(0,' + this.height + ')')
                .call(D3.axisBottom(xScale));

            // add the y-axis
            this.svg.append('g')
                .attr('class', 'axis')
                .call(D3.axisLeft(yScale))
                .append('text')
                .attr('x', 2)
                .attr('y', yScale(<any>yScale.ticks().pop()))
                .attr('dy', '-10px')
                .attr('fill', '#000')
                .attr('font-weight', 'bold')
                .attr('text-anchor', 'start');

            // create the legend
            const legend = this.svg.append('g')
                .attr('font-family', 'sans-serif')
                .attr('font-size', 10)
                .attr('text-anchor', 'end')
                .selectAll('g')
                .data(keys.slice().reverse())
                .enter().append('g')
                .attr('transform', function (d: any, i: number) {
                    return 'translate(0,' + i * 20 + ')';
                });

            legend.append('rect')
                .attr('x', this.width - 19)
                .attr('width', 19)
                .attr('height', 19)
                .attr('fill', (key: any) => {
                    return this.colourScale(key);
                });

            legend.append('text')
                .attr('x', this.width - 24)
                .attr('y', 9.5)
                .attr('dy', '0.32em')
                .text((d: any) => d);
        }
    }
}
