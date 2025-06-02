import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from 'rxjs';
import { DaoService } from '../../develar-commons/dao.service';
import { TechMachine, TechMachineQuery, TechMachineTable } from './tech-machine.model';

const RECORD : string = 'techmachine'
@Injectable({
    providedIn : 'root'
})
export class TechMachineService {

    private _techMachineDataSource: BehaviorSubject<
    TechMachineTable[]
    > = new BehaviorSubject<TechMachineTable[]>([]);

    public tm$ : BehaviorSubject<TechMachine>;
    
    constructor(private _dao : DaoService){
        this.tm$ = new BehaviorSubject<TechMachine>(null);
    }

    public findByID(id : string) : Promise<TechMachine>{
        return this._dao.findById<TechMachine>(RECORD, id)
    }

    public update(id : string, entity : TechMachine) : Promise<TechMachine> {
        return this._dao.update<TechMachine>(RECORD, id, entity);
    }

    public create(entity : TechMachine) : Promise<TechMachine> {
        return this._dao.create<TechMachine>(RECORD, entity);
    }

    public findByQuery(query : TechMachineQuery) : Observable<TechMachine[]>{
        return this._dao.search<TechMachine>(RECORD, query);
    }

    get dataRecordsSource(): BehaviorSubject<TechMachineTable[]> {
        return this._techMachineDataSource;
    }

    public async findAll() : Promise<TechMachine[]>{
        return this._dao.findAll<TechMachine>(RECORD);
    }
}