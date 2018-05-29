import * as D3 from 'D3/index';
import {SummarisedOlympicRecord} from '../../../model/SummarisedOlympicRecord';
import {D3ChartComponent} from '../../d3-chart.component';
import {Subject} from 'rxjs/Subject';

export class BarChartByTotalMedalsComponent extends D3ChartComponent {
    private barPadding = 5;

    constructor(chartDataChanged: Subject<SummarisedOlympicRecord[]>) {
        super(chartDataChanged);
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
                .range([0, this.width]);

            // create the yScale based on total medals won by country
            const yScale = D3.scaleLinear()
                .domain([0, D3.max(this.summarisedOlympicRecords, (summarisedOlympicRecord: SummarisedOlympicRecord): any => {
                    return summarisedOlympicRecord.total;
                })])
                .range([this.height, 0]);

            // create and set the xAxis
            const xAxis = D3.axisBottom(xScale);
            this.svg.append('g')
                .attr('transform', 'translate(0,' + this.height + ')')
                .call(xAxis);

            // create and set the yAxis
            const yAxis = D3.axisLeft(yScale)
                .ticks(5);
            this.svg.append('g')
                .call(yAxis);

            // render the bar charts
            this.svg.selectAll('rect')
                .data(this.summarisedOlympicRecords)
                .enter()
                .append('rect')
                .attr('x', (summarisedOlympicRecord: SummarisedOlympicRecord, i: number) => {
                    // set the x position to the index * (the width of the svg / the number of countries)
                    return i * (this.width / this.summarisedOlympicRecords.length);
                })
                .attr('y', (summarisedOlympicRecord: SummarisedOlympicRecord) => {
                    // set the height of the bar chart to the relative size of the number of medals won by this country
                    return yScale(summarisedOlympicRecord.total);
                })
                // bar chart width = svg width / number of countries - a bit of padding
                .attr('width', this.width / this.summarisedOlympicRecords.length - this.barPadding)
                .attr('height', (summarisedOlympicRecord: SummarisedOlympicRecord) => {
                    // offset the height based on the bottom not being at the top (ie the bar charts go "up", not down from the top of the browser)
                    return yScale(0) - yScale(summarisedOlympicRecord.total);
                })
                .attr('fill', (summarisedOlympicRecord: SummarisedOlympicRecord, i: number) => {
                    return this.colourScale(i);
                });

            this.svg.selectAll('text.label')
                .data(this.summarisedOlympicRecords)
                .enter()
                .append('text')
                .attr('class', 'label')
                .text((summarisedOlympicRecord: SummarisedOlympicRecord) => {
                    return summarisedOlympicRecord.total;
                })
                .attr('text-anchor', 'middle')
                .attr('x', (summarisedOlympicRecord: SummarisedOlympicRecord, i: number) => {
                    return i * (this.width / this.summarisedOlympicRecords.length) +
                        (this.width / this.summarisedOlympicRecords.length - this.barPadding) / 2;
                })
                .attr('y', (summarisedOlympicRecord: SummarisedOlympicRecord) => {
                    return yScale(summarisedOlympicRecord.total) + 20;
                })
                .attr('font-family', 'sans-serif')
                .attr('font-size', '11px')
                .attr('fill', 'white');
        }
    }
}
