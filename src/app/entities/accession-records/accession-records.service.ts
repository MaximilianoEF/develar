import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DaoService } from '../../develar-commons/dao.service';
import { AccessionRecordsHelper } from './accession-records-helper';
import { AccessionRecord, AccessionRecordQuery, AccessionRecordTable } from './accession-records-model';

const RECORD: string = "accessionrecord"
@Injectable({
  providedIn: 'root'
})
export class AccessionRecordsService {

  private _dataSource$: BehaviorSubject<AccessionRecordTable[]> ;
  public selectedARFromTable$: BehaviorSubject<AccessionRecord>;
  public headerAction$: BehaviorSubject<string>;
  private url: string;
  constructor(
              private _dao: DaoService,
              private _http: HttpClient
  ){
    this._dataSource$ = new BehaviorSubject<AccessionRecordTable[]>([]);
    this.selectedARFromTable$ = new BehaviorSubject<AccessionRecord>(null);
    //De momento, lo inicializamos para que muestre el formulario de migración
    this.headerAction$ = new BehaviorSubject<string>('migrante');

    this.url = `api/accessionrecords`;
  }

  create(entity: AccessionRecord): Promise<AccessionRecord> {
    return this._dao.create<AccessionRecord>(RECORD, entity);
  }

  createMany(entities: AccessionRecord[]): Promise<AccessionRecord[]> {
    return this._dao.createMany<AccessionRecord>(RECORD, entities);
  }

  search(query: AccessionRecordQuery): Observable<AccessionRecord[]> {
    return this._dao.search(RECORD, query);
  }

  update(entity: AccessionRecord): Promise<AccessionRecord> {
    return this._dao.update<AccessionRecord>(RECORD, entity._id, entity);
  }

  findById(entity: string): Promise<AccessionRecord> {
    return this._dao.findById(RECORD, entity);
  }

  upsert(entity: AccessionRecord): Observable<AccessionRecord> {
    return this._http.post<AccessionRecord>(this.url+'/upsert', JSON.stringify(entity), {headers: this._dao.headers})
      .pipe(
        catchError( err => of(null))
    );
  }

  delete(id: string): Promise<any> {
    return this._dao.delete(RECORD, id);
  }

  get dataRecordsSource(): BehaviorSubject<AccessionRecordTable[]> {
    return this._dataSource$;
  }
  /**
   * Actualiza el dataSource a partir del array de AccessionRecords
   * @param entities 
   */
  updateTableData(entities: AccessionRecord[]): void {
    const tableData = AccessionRecordsHelper.buildAccessionRecordsDataTable(entities);
    this._dataSource$.next(tableData);
  }
}
