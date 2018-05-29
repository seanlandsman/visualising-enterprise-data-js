import * as D3 from 'D3/index';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {SummarisedOlympicRecord} from '../model/SummarisedOlympicRecord';

export abstract class D3ChartComponent {
    protected svg: any;
    protected height: number;
    protected width: number;
    protected host: any;

    protected margin = {
        top: 25,
        right: 15,
        bottom: 15,
        left: 25
    };

    protected colourScale: any = D3.scaleOrdinal(D3.schemeCategory10);

    protected chartDataChangedSubscription: Subscription;
    protected summarisedOlympicRecords: SummarisedOlympicRecord[] = [];

    protected constructor(private chartDataChanged: Subject<SummarisedOlympicRecord[]>) {
        this.host = D3.select('#chart');
    }

    protected initialiseChart() {
        this.initialiseSizeAndScale();
        this.buildSVG();

        this.chartDataChangedSubscription = this.chartDataChanged
            .subscribe((summarisedOlympicRecords => {
                this.summarisedOlympicRecords = summarisedOlympicRecords;
                this.render();
            }));
    }

    private initialiseSizeAndScale() {
        const container = document.querySelector('#chartContainer');
        this.width = container!.clientWidth - this.margin.left - this.margin.right;
        this.height = container!.clientHeight - this.margin.bottom - this.margin.top;
    }

    private buildSVG() {
        this.host.html('');
        this.svg = this.host.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('margin-top', this.margin.top)
            .style('margin-left', this.margin.left)
            .style('margin-bottom', this.margin.bottom)
            .style('margin-right', this.margin.right);
    }

    protected abstract render(): void;

    public destroy(): void {
        if (this.chartDataChangedSubscription) {
            this.chartDataChangedSubscription.unsubscribe();
        }
    }
}
