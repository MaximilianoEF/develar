import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Turno, TurnoDisponible } from './models/turno.model';
import { DaoService } from '../develar-commons/dao.service';
import { UserWebService } from '../entities/userweb/user-web.service';
import { UsuarioWeb } from '../entities/userweb/usuario-web';


const RECORD = 'turnospresenciales';

@Injectable({
  providedIn: 'root'
})
export class AgnTurnosService {
  private urlMap = {
    findAll: 'api/turnospresenciales',
    findDisponibles: 'api/turnospresenciales/disponibles',
    findAllDisponibles: 'api/turnospresenciales/alldisponibles',
    create: 'api/turnospresenciales',
    findOne: 'api/turnospresenciales/%s',
    update: 'api/turnospresenciales/%s',
    delete: 'api/turnospresenciales/%s',
    search: 'api/turnospresenciales/search',
    disponiblesv2: 'api/turnospresenciales/disponiblesv2'
  };

  private headers = new HttpHeaders().set('Content-Type', 'application/json');
  public _user$: BehaviorSubject<UsuarioWeb>;

  constructor(
    private _http: HttpClient,
    private _user: UserWebService,
    private _dao: DaoService
  ) { }

  get user$() {
    return this._user.userEmitter;
  }

  public fetchTurnoFromUser(user: any, query?: any): Observable<Turno[]> {
    query = query || {};
    Object.assign(query, { userId: user._id });
    return this._dao.search<Turno>(RECORD, query);
  }

  public fetchAllTurnos(): Observable<Turno[]> {
    return this._http.get<Turno[]>(this.urlMap.findAll, { headers: this.headers });
  }

  public fetchTurnoById(id: string): Promise<Turno> {
    return this._http.get<Turno>(this.urlMap.findOne.replace('%s', id), { headers: this.headers }).toPromise();
  }

  public fetchByQuery(queryobj): Observable<Turno[]> {
    const params = this.buildParams(queryobj);
    return this._http.get<Turno[]>(this.urlMap.search, { params });
  }

  public createTurno(turno: Turno): Promise<Turno> {
    return this._http.post<Turno>(this.urlMap.create, turno, { headers: this.headers }).toPromise();
  }

  public editTurno(id: string, turno: Turno): Promise<Turno> {
    return this._http.put<Turno>(this.urlMap.update.replace('%s', id), turno, { headers: this.headers }).toPromise();
  }

  public deleteTurno(id: string): Promise<Turno> {
    return this._http.delete<Turno>(this.urlMap.delete.replace('%s', id), { headers: this.headers }).toPromise();
  }

  // public fetchAvailableSlots(sede: string, fecha: string) {
  public fetchAvailableSlots(sede: string, dateTx: string): Observable<TurnoDisponible[]> {
    const query = { sede: sede, dateTx: dateTx };
    const params = this.buildParams(query);
    return this._http.get<TurnoDisponible[]>(this.urlMap.findDisponibles, { params });
  }

  async fetchAllAvailableSlots(sede: string): Promise<TurnoDisponible[]> {
    const query = { sede: sede };
    const params = this.buildParams(query);

    return await this._http.get<TurnoDisponible[]>(this.urlMap.findAllDisponibles, { params })
      .toPromise();
  }

  private buildParams(query) {
    return Object.getOwnPropertyNames(query)
                 .reduce((p, key) => p.append(key, query[key]), new HttpParams());
  }

  /*  HELPER SCRIPTS  */


  public regenerarTurnosNominales(): Observable<any> {
    return this._http.get<any>('/api/turnospresenciales/initdata');
  }

}
