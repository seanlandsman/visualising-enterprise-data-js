import {OlympicRecord} from './OlympicRecord';

interface CountByMedalType {
    gold: number;
    silver: number;
    bronze: number;
}

export interface TotalsByAthlete {
    [athlete: string]: number;
}

export class SummarisedOlympicRecord {
    public totalsByAthlete: any;
    private gold: number;
    private silver: number;
    private bronze: number;

    constructor(public country: string,
                public total: number,
                public olympicRecords: OlympicRecord[]) {
        this.totalsByAthlete = olympicRecords.reduce(
            (totalsByAthlete, olympicRecord) => {
                totalsByAthlete[olympicRecord.athlete] = (totalsByAthlete[olympicRecord.athlete] || 0) + olympicRecord.total;
                return totalsByAthlete;
            }, <TotalsByAthlete>{});

        const countByMedalType = olympicRecords.reduce(
            (accumulator, olympicRecord) => {
                accumulator['gold'] = (accumulator['gold'] || 0) + olympicRecord.gold;
                accumulator['silver'] = (accumulator['silver'] || 0) + olympicRecord.silver;
                accumulator['bronze'] = (accumulator['bronze'] || 0) + olympicRecord.bronze;
                return accumulator;
            }, <CountByMedalType>{});

        this.gold = countByMedalType['gold'];
        this.silver = countByMedalType['silver'];
        this.bronze = countByMedalType['bronze'];
    }
}
