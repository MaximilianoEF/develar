import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { devutils } from '../../develar-commons/utils';

import { DaoService } from '../../develar-commons/dao.service';

import { Consulta, Requirente } from './consulta.model';
import { ConsultasHelper } from './consulta.helper';
import { ConsultaTable, ConsultaQuery } from '../../entities/consultas/consulta.model';
import { UserWebService } from '../../entities/userweb/user-web.service';
import { UsuarioWeb } from '../../entities/userweb/usuario-web';

const RECORD = 'consultas';
const MANAGER = {
    consulta: {
      isActive: true,
      hasNecesidad: false,
      hasCumplimiento: true,
      ejecucion: 'emitido',
      sector: 'comunicacion',
      urgencia: 2,
      estado: 'activo'
    },
    asesoramiento: {
      isActive: true,
      hasNecesidad: true,
      hasCumplimiento: true,
      ejecucion: 'emitido',
      sector: 'comunicacion',
      urgencia: 2,
      estado: 'activo'
    },
    solmaterial: {
      isActive: true,
      hasNecesidad: true,
      hasCumplimiento: true,
      ejecucion: 'emitido',
      sector: 'comunicacion',
      urgencia: 2,
      estado: 'activo'
    }
}


@Injectable()
export class ConsultasService {
  public _user$: BehaviorSubject<UsuarioWeb>

  /**
   * Origen de datos para la tabla del navegador de consultas
   *
   */
  private _consultasDataSource: BehaviorSubject<ConsultaTable[]> = new BehaviorSubject<ConsultaTable[]>([]);
  private consultasList: Consulta[];


  constructor(
    private _dao: DaoService,
    private _user: UserWebService,

  ) { }

  get user$(){
    return this._user.userEmitter;
  }

  get dataRecordsSource(): BehaviorSubject<ConsultaTable[]> {
    return this._consultasDataSource;
  }


  fetchConsultaById(id: string): Promise<Consulta>{
    return this._dao.findById<Consulta>(RECORD, id);
  }

  fetchConsultaFromUser(user: any, query?: any): Observable<Consulta[]>{
    query = query || {};
    Object.assign(query, {userId: user._id})
    return this._dao.search<Consulta>(RECORD, query);
  }

  /***************************/
  /***   Consulta         ***/
  /*************************/
  manageConsulta(consulta: Consulta, user): Subject<Consulta>{
    let listener = new Subject<Consulta>();
    this.preSave(listener, consulta, user);
    return listener;
  }

  createConsultaRecord(listener: Subject<Consulta>, consulta: Consulta){
    this._dao.create<Consulta>(RECORD, consulta).then(consulta => {
      listener.next(consulta);
    })
  }

  updateConsultaRecord(listener: Subject<Consulta>, consulta: Consulta){
    this._dao.update<Consulta>(RECORD,consulta._id, consulta).then(consulta => {
      listener.next(consulta);
    })
  }

  private preSave(listener: Subject<Consulta>, consulta: Consulta, user: UsuarioWeb){
    let isNew = consulta._id ? false: true;

    if(isNew){
      this.initNewConsulta(consulta, user);
      this.createConsultaRecord(listener, consulta);

    }else {
      //this.updateConsulta(consulta);
      this.updateConsultaRecord(listener, consulta);
    }


  }

  public edit(id: string, consulta: Consulta): Promise<Consulta> {
    return this._dao.update<Consulta>(RECORD, id, consulta);
  }

  public delete(id: string): Promise<void> {
    return this._dao.delete<Consulta>(RECORD, id);
  }

  private initNewConsulta(consulta: Consulta, user: UsuarioWeb){
    let today = new Date();
    Object.assign(consulta, MANAGER[consulta.type])
    consulta.requirente = this.buildRequirente(consulta, user);
    consulta.fecomp_txa = devutils.txFromDate(today);
    consulta.fecomp_tsa = today.getTime();
    consulta.fe_necesidad = devutils.txFromDate(today);
    consulta.fets_necesidad = today.getTime();


  }

  private buildRequirente(consulta: Consulta, user: UsuarioWeb): Requirente{
    let requirente = new Requirente();
    requirente.userId = user._id;
    requirente.personId = null;
    requirente.slug = user.isUsuarioWeb ? user.username : user['displayName'];
    return requirente
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
    const consultaTableData = ConsultasHelper.buildConsultasBrowseDataTable(this.consultasList);
    this._consultasDataSource.next(consultaTableData);
  }

  public fetchByQuery(queryobj): Observable<Consulta[]> {
    return this._dao.search<Consulta>(RECORD, queryobj)
  }


}


