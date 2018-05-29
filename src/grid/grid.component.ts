import {Observable} from 'rxjs/Observable';
import {timer} from 'rxjs/observable/timer';
import {debounce} from 'rxjs/operators';
import {Subject} from 'rxjs/Subject';
import * as _ from 'underscore';
import {ColDef, ColumnApi, Grid, GridApi, GridOptions, GridReadyEvent, RowNode} from 'ag-grid';
import {OlympicDataService} from '../services/olympic-data.service';
import {ChartDataService, ChartType} from '../services/chart-data.service';
import {SummarisedOlympicRecord, TotalsByAthlete} from '../model/SummarisedOlympicRecord';
import 'ag-grid-enterprise';
import {OlympicRecord} from '../model/OlympicRecord';

const rowNodeTotalSumReducer = (accumulator: number, currentValue: RowNode) => accumulator + currentValue.data.total;

const sortByMedalsWonComparator = (nodeA: RowNode, nodeB: RowNode, valueA: any, valueB: any) => {
    if (nodeA && nodeB) {
        if (nodeA.group && nodeB.group) {
            const sumTotalA = nodeA.childrenAfterGroup.reduce(rowNodeTotalSumReducer, 0);
            const sumTotalB = nodeB.childrenAfterGroup.reduce(rowNodeTotalSumReducer, 0);

            return sumTotalA - sumTotalB;
        } else if (nodeA.group && !nodeB.group) {
            return 1;
        } else if (nodeB.group && !nodeA.group) {
            return -1;
        }

        return nodeA.data.total - nodeB.data.total;
    } else {
        if (valueA && !valueB) {
            return 1;
        }
        if (!valueA && valueB) {
            return -1;
        }
        return valueA.localeCompare(valueB);
    }
};

export class GridComponent {
    private api: GridApi;
    private columnApi: ColumnApi;

    private gridOptions: GridOptions;

    selectionEventSubject = new Subject<RowNode[]>();
    selectEventsObserver: Observable<RowNode[]>;

    constructor(gridId: string,
                private olympicDataService: OlympicDataService,
                private chartDataService: ChartDataService) {

        this.createGrid(gridId);

        // debounce the row selection events - only pass the selected rows after 20ms
        this.selectEventsObserver = this.selectionEventSubject.pipe(debounce(() => timer(20)));
        this.selectEventsObserver.subscribe(rowNodes => {
                this.setBarChartData(rowNodes);
            }
        );
    }

    private createGrid(gridId: string) {
        this.gridOptions = {
            columnDefs: this.getColumnDefs(),
            rowSelection: 'multiple',
            enableSorting: true,
            enableFilter: true,
            toolPanelSuppressPivots: true,
            toolPanelSuppressPivotMode: true,
            autoGroupColumnDef: this.getAutoGroupColumnDef(),
            onGridReady: this.gridReady.bind(this),
            onSelectionChanged: this.selectionChanged.bind(this)
        };

        // lookup the container we want the Grid to use
        const eGridDiv = <HTMLElement>document.querySelector(gridId);

        // create the grid passing in the div to use together with the columns & data we want to use
        new Grid(eGridDiv, this.gridOptions);
    }

    private setBarChartData(rowNodes: RowNode[]) {
        const summarisedOlympicRecords: SummarisedOlympicRecord[] = rowNodes.map((groupedRowNode) => {
            const country = groupedRowNode.key;
            const total = groupedRowNode.childrenAfterGroup.reduce(rowNodeTotalSumReducer, 0);
            const olympicRecords = groupedRowNode.childrenAfterGroup.map((rowNode: RowNode) => rowNode.data);
            return new SummarisedOlympicRecord(country,
                total,
                olympicRecords);
        });
        this.chartDataService.setBarChartData(summarisedOlympicRecords);
    }

    getAutoGroupColumnDef(): any {
        return {
            field: 'athlete',
            colId: 'autoGroupId',
            width: 180,
            cellRenderer: 'agGroupCellRenderer',
            comparator: (valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode) => {
                return sortByMedalsWonComparator(nodeA, nodeB, valueA, valueB);
            }
        };
    }

    gridReady(params: GridReadyEvent) {
        this.api = params.api;
        this.columnApi = params.columnApi;

        this.olympicDataService.getOympicData()
            .subscribe((olympicData: OlympicRecord[]) => {
                this.api.setRowData(<any>olympicData);
            });
    }

    selectionChanged() {
        this.selectionEventSubject.next(this.api.getSelectedNodes());
    }

    private getColumnDefs(): ColDef[] {
        return [
            {
                field: 'gold',
                width: 75
            },
            {
                field: 'silver',
                width: 75
            },
            {
                field: 'bronze',
                width: 90
            },
            {
                field: 'total',
                width: 75
            },
            {
                field: 'country',
                width: 100,
                rowGroup: true,
                hide: true
            },
            {
                field: 'athlete',
                hide: true
            },
            {
                field: 'year',
                width: 70
            },
            {
                field: 'sport',
                width: 110
            }
        ];
    }

    selectTopTenCountries() {
        this.clearFilterAndSort();
        this.api.deselectAll();

        this.sortByGroupedColumn();
        this.selectTopTenGroupedRowsByTotalMedalsWon();

        this.chartDataService.switchToChartType(ChartType.BarChartByTotalMedals);
    }

    selectTopTenByCountriesAthlete() {
        this.clearFilterAndSort();
        this.api.deselectAll();

        this.sortByGroupedColumn();
        this.selectTopTenGroupedRowsByTotalMedalsWon();

        this.chartDataService.switchToChartType(ChartType.StackedBarChartByCountryMedalType);
    }

    selectTopTenBySport(sport: string) {
        this.clearFilterAndSort();
        this.api.deselectAll();

        const topTenAthletes = this.getTopTenAthleteForSport(sport);

        // only include the top 10 athletes - filter out the rest
        this.api.setFilterModel({athlete: topTenAthletes});

        this.selectParentNodesForAthletes(topTenAthletes);

        this.chartDataService.switchToChartType(ChartType.PieChartByAthleteBySport);
    }

    private selectTopTenGroupedRowsByTotalMedalsWon() {
        const groupedNodes: RowNode[] = [];
        this.api.forEachNode((node: RowNode) => {
            if (node.group) {
                groupedNodes.push(node);
            }
        });

        groupedNodes.sort(<any>sortByMedalsWonComparator).reverse()
            .slice(0, 10)
            .forEach((rowNode: RowNode) => rowNode.setSelected(true));
    }

    private sortByGroupedColumn() {
        const sort = [
            {colId: 'ag-Grid-AutoColumn', sort: 'desc'}
        ];
        this.api.setSortModel(sort);
    }


    private selectParentNodesForAthletes(topTenAthletes: any[]) {
        this.api.forEachNode((node: RowNode) => {
            if (!node.group && topTenAthletes.indexOf(node.data.athlete) !== -1) {
                node.parent.setSelected(true);
            }
        });
    }

    private getTopTenAthleteForSport(sport: string) {
        const topN = 10;

        const leafNodesForSport: RowNode[] = [];
        this.api.forEachNode((node: RowNode) => {
            if (!node.group && node.data.sport === sport) {
                leafNodesForSport.push(node);
            }
        });

        const totalsByAthlete: TotalsByAthlete = leafNodesForSport.reduce(
            (accumulator, node) => {
                accumulator[node.data.athlete] = (accumulator[node.data.athlete] || 0) + node.data.total;
                return accumulator;
            }, <TotalsByAthlete>{});

        const totalMedalCountDesc = _.uniq(_.values(totalsByAthlete))
            .sort((a: number, b: number) => {
                return a - b;
            })
            .reverse()
            .splice(0, 10);

        const pairs = _.pairs(totalsByAthlete);
        let topTenAthletes: string[] = [];
        for (let i = 0; i < totalMedalCountDesc.length; i++) {
            topTenAthletes = topTenAthletes.concat(pairs.filter((pair) => pair[1] === totalMedalCountDesc[i])
                .map((pair) => pair[0]));
        }
        topTenAthletes.splice(topN);
        return topTenAthletes;
    }

    private clearFilterAndSort() {
        this.api.setSortModel(null);
        this.api.setFilterModel(null);
    }
}
