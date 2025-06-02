import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DaoService } from '../../develar-commons/dao.service';
import { SlotTurnoTable, SlotTurnoQuery, SlotTurnoTemplate } from './slot-turno.model';
import { SlotTurnoHelper } from './slot-turno.helper';

const RECORD: string = 'turnosede';
@Injectable({
  providedIn: 'root',
})
export class SlotTurnoService {
  /**
   * Orígenes de datos para la tabla del navegador de
   * turnos nominales
   */
  private _turnoSedeDataSource: BehaviorSubject<SlotTurnoTable[]> = new BehaviorSubject<SlotTurnoTable[]>([]);
  private _turnoSedeList: SlotTurnoTemplate[] = [];

  get dataRecordsSource(): BehaviorSubject<SlotTurnoTable[]> {
    return this._turnoSedeDataSource;
  }

  constructor(
    private _dao: DaoService
  ) { }

  public findById(id: string): Promise<any> {
    return this._dao.findById<any>(RECORD, id);
  }

  public update(id: string, entity: any): Promise<any> {
    return this._dao.update<any>(RECORD, id, entity);
  }

  public create(entity: any): Promise<any> {
    return this._dao.create<any>(RECORD, entity);
  }

  public findByQuery(query: any): Observable<any[]> {
    return this._dao.search<any>(RECORD, query);
  }

  public findAll(): Promise<any[]> {
    return this._dao.findAll<any>(RECORD);
  }

  public fetchTurnoSedeByQuery(query: SlotTurnoQuery): BehaviorSubject<SlotTurnoTemplate[]> {
    const subject = new BehaviorSubject<SlotTurnoTemplate[]>([]);
    this._loadTurnoSedeByQuery(subject, query);
    return subject;
  }

  private _loadTurnoSedeByQuery(subject: BehaviorSubject<SlotTurnoTemplate[]>, query: SlotTurnoQuery): void {
    this.findByQuery(query).subscribe((entities) => {
      if (entities && entities.length > 0) {
        this._turnoSedeList = entities;
      } else {
        this._turnoSedeList = [];
      }

      subject.next(this._turnoSedeList);
    });
  }

  public updateTableData(): void {
    const turnoSedeTableData = SlotTurnoHelper.buildTurnoSedeDataTable(this._turnoSedeList);
    this._turnoSedeDataSource.next(turnoSedeTableData);
  }
}
