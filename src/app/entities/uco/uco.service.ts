import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from 'rxjs';
import { DaoService } from '../../develar-commons/dao.service';
import { Uco, UcoQuery, UcoTableData } from './uco.model';

const RECORD : string = 'uco';
@Injectable({
    providedIn: 'root'
})
export class UcoService {


    private _ucoDataSource: BehaviorSubject<
    UcoTableData[]
    > = new BehaviorSubject<UcoTableData[]>([]);

    public uco$ : BehaviorSubject<Uco>;
    
    constructor(private _dao : DaoService){
        this.uco$ = new BehaviorSubject<Uco>(null);
    }

    public findByID(id : string) : Promise<Uco>{
        return this._dao.findById<Uco>(RECORD, id)
    }

    public update(id : string, entity : Uco) : Promise<Uco> {
        return this._dao.update<Uco>(RECORD, id, entity);
    }

    public create(entity : Uco) : Promise<Uco> {
        return this._dao.create<Uco>(RECORD, entity);
    }

    public findByQuery(query : UcoQuery) : Observable<Uco[]>{
        return this._dao.search<Uco>(RECORD, query);
    }

    get dataRecordsSource(): BehaviorSubject<UcoTableData[]> {
        return this._ucoDataSource;
    }

    public async findAll() : Promise<Uco[]>{
        return this._dao.findAll<Uco>(RECORD);
    }
     
}