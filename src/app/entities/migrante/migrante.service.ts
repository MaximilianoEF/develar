import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DaoService } from '../../develar-commons/dao.service';
import { MigranteHelper } from './migrante.helper';
import { MigranteQuery, MigranteTable, Migrante, MigranteAntecedenteData } from './migrante.model';
import {HttpClient} from '@angular/common/http';

const RECORD: string = 'migrante';
@Injectable({
  providedIn: 'root'
})
export class MigranteService {

  private _dataSource$: BehaviorSubject<MigranteTable[]> ;
  public selectedMigranteFromTable$: BehaviorSubject<Migrante>;
  public headerAction$: BehaviorSubject<string>;
  public selectedAntecedentesFromMigrante$: BehaviorSubject<any[]>;
  public antecedentesSolicitados$: BehaviorSubject<MigranteAntecedenteData[]>;

  constructor(
              private _dao: DaoService,
              private _http: HttpClient
  ){
    this._dataSource$ = new BehaviorSubject<MigranteTable[]>([]);
    this.selectedMigranteFromTable$ = new BehaviorSubject<Migrante>(null);
    this.selectedAntecedentesFromMigrante$ = new BehaviorSubject<any[]>([]);
    this.antecedentesSolicitados$ = new BehaviorSubject<MigranteAntecedenteData[]>([]);
  }

  create(entity: Migrante): Promise<Migrante> {
    return this._dao.create<Migrante>(RECORD, entity);
  }

  createMany(entities: Migrante[]): Promise<Migrante[]> {
    return this._dao.createMany<Migrante>(RECORD, entities);
  }

  search(query: MigranteQuery): Observable<Migrante[]> {
    return this._dao.search(RECORD, query);
  }

  update(entity: Migrante): Promise<Migrante> {
    return this._dao.update<Migrante>(RECORD, entity._id, entity);
  }

  findById(entity: string): Promise<Migrante> {
    return this._dao.findById(RECORD, entity);
  }

  delete(id: string): Promise<any> {
    return this._dao.delete(RECORD, id);
  }


  findDocumentation(fechaarribots: number): Promise<any> {
      const url = `/api/migrante/documentos/`;
      const params = this._dao.buildParams({fechaarribots});
      return this._http.get(url, {params}).toPromise();
  }


  get dataRecordsSource(): BehaviorSubject<MigranteTable[]> {
    return this._dataSource$;
  }
  /**
   * Actualiza el dataSource a partir del array de Migrantes
   * @param entities
   */
  updateTableData(entities: Migrante[]): void {
    const tableData = MigranteHelper.buildMigrantesDataTable(entities);
    this._dataSource$.next(tableData);
  }

  syncLibrosWithUdas(): Observable<any[]> {
    const url = `/api/migrante/synclibros/`;
    return this._http.get<any[]>(url);
  }
}
