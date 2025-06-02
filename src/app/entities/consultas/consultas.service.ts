import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Consulta, ConsultaTable, ConsultaQuery } from './consulta.model';
import { ConsultaHelper } from './consulta.helper';

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  private urlMap = {
    findAll: 'api/consultas',
    search: 'api/consultas/search',
    create: 'api/consultas',
    findOne: 'api/consultas/%s',
    update: 'api/consultas/%s',
    delete: 'api/consultas/%s',
    export: 'api/consultas/exportar'
  };

  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  /**
   * Origen de datos para la tabla del navegador de consultas
   *
   */
  private _consultasDataSource: BehaviorSubject<ConsultaTable[]> = new BehaviorSubject<ConsultaTable[]>([]);
  private consultasList: Consulta[];

  constructor(
    private _http: HttpClient
  ) { }

  public fetchAll(): Observable<Consulta[]> {
    return this._http.get<Consulta[]>(this.urlMap.findAll, { headers: this.headers });
  }

  public fetchByQuery(queryobj): Observable<Consulta[]> {
    const params = this.buildParams(queryobj);
    return this._http.get<Consulta[]>(this.urlMap.search, { params });
  }

  public fetchById(id: string): Promise<Consulta> {
    return this._http.get<Consulta>(this.urlMap.findOne.replace('%s', id), { headers: this.headers }).toPromise();
  }

  public create(consulta: Consulta): Promise<Consulta> {
    return this._http.post<Consulta>(this.urlMap.create, consulta, { headers: this.headers }).toPromise();
  }

  public edit(id: string, consulta: Consulta): Promise<Consulta> {
    return this._http.put<Consulta>(this.urlMap.update.replace('%s', id), consulta, { headers: this.headers }).toPromise();
  }

  public delete(id: string): Promise<Consulta> {
    return this._http.delete<Consulta>(this.urlMap.delete.replace('%s', id), { headers: this.headers }).toPromise();
  }

  public export(queryobj): void {
    const params = this.buildParams(queryobj);
    const url = this.urlMap.export + '?' + params.toString();
    window.open(url, 'about: blank');
  }

  private buildParams(query) {
    return Object.getOwnPropertyNames(query)
                 .reduce((p, key) => p.append(key, query[key]), new HttpParams());
  }

  /**
   * Navegador de turnos
   *
   */
  get dataRecordsSource(): BehaviorSubject<ConsultaTable[]> {
    return this._consultasDataSource;
  }

  public fetchConsultasByQuery(query: ConsultaQuery): BehaviorSubject<Consulta[]> {
    const subject = new BehaviorSubject<Consulta[]>([]);
    this.loadConsultasByQuery(subject, query);
    return subject;
  }

  private loadConsultasByQuery(subject: BehaviorSubject<Consulta[]>, query: ConsultaQuery): void {
    this.fetchByQuery(query).subscribe(items => {
      if (items && items.length > 0) {
        this.consultasList = items;
      } else {
        this.consultasList = [];
      }
      subject.next(this.consultasList);
    });
  }

  public updateTableData(): void {
    const consultaTableData = ConsultaHelper.buildConsultasBrowseDataTable(this.consultasList);
    this._consultasDataSource.next(consultaTableData);
  }
}
