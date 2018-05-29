import {Observable} from 'rxjs/Observable';
import {OlympicRecord} from '../model/OlympicRecord';
import {Subscriber} from 'rxjs/Subscriber';

export class OlympicDataService {
    olympicDataUrl = '/assets/olympicWinners.json';

    getOympicData() {
        return Observable.create((observer: Subscriber<OlympicRecord[]>) => {
            fetch(this.olympicDataUrl)
                .then((response: Response) => {
                    response.json().then(olympicData => observer.next(olympicData));
                });
        });
    }
}
