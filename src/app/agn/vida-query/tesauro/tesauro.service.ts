import { Injectable } from "@angular/core";
import { DaoService } from '../../../develar-commons/dao.service';
import { Observable } from 'rxjs';
import { Tesauro } from './models/tesauro.model';
const RECORD : string = 'tesauro';
@Injectable({
    providedIn : 'root'
})
export class TesauroService {

    constructor(private _daoService : DaoService){}

    findByQuery(query) : Observable<Tesauro[]>{
        return this._daoService.search(RECORD, query);
    }
}