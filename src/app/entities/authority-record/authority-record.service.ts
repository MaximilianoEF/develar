import { Injectable } from '@angular/core';
import { DaoService } from '../../develar-commons/dao.service';
import { AuthorityRecordHelper } from './authority-record.helper';
import { AuthorityRecord, AuthorityRecordQuery, AuthorityRecordTable } from './authority-record.model';
import { Observable, BehaviorSubject } from 'rxjs';

const RECORD = 'authorityrecord';
@Injectable({
  providedIn: 'root'
})
export class AuthorityRecordService {
  /**
   * Orígenes de datos para la tabla del navegador de
   * registros de autoridad
   */
  private _authorityRecordDataSource: BehaviorSubject<AuthorityRecordTable[]> = new BehaviorSubject<AuthorityRecordTable[]>([]);
  private _authorityRecordList: AuthorityRecord[] = [];

  constructor(
    private dao: DaoService
  ) { }

  get dataRecordsSource(): BehaviorSubject<AuthorityRecordTable[]> {
    return this._authorityRecordDataSource;
  }

  public findById(id: string): Promise<AuthorityRecord> {
    return this.dao.findById(RECORD, id);
  }

  public findByQuery(query: AuthorityRecordQuery): Observable<AuthorityRecord[]> {
    return this.dao.search(RECORD, query);
  }

  public create(data: AuthorityRecord): Promise<AuthorityRecord> {
    return this.dao.create(RECORD, data);
  }

  public update(id: string, data: AuthorityRecord): Promise<AuthorityRecord> {
    return this.dao.update(RECORD, id, data);
  }

  public fetchAuthorityRecordsByQuery(query: AuthorityRecordQuery): BehaviorSubject<AuthorityRecord[]> {
    const subject = new BehaviorSubject<AuthorityRecord[]>([]);
    this._loadAuthorityRecordsByQuery(subject, query);
    return subject;
  }

  private _loadAuthorityRecordsByQuery(subject: BehaviorSubject<AuthorityRecord[]>, query: AuthorityRecordQuery): void {
    this.findByQuery(query).subscribe(items => {
      if (items && items.length > 0) {
        this._authorityRecordList = items;
      } else {
        this._authorityRecordList = [];
      }

      subject.next(this._authorityRecordList);
    });
  }

  public updateTableData(): void {
    const authorityRecordTableData = AuthorityRecordHelper.buildAuthorityRecordDataTable(this._authorityRecordList);
    this._authorityRecordDataSource.next(authorityRecordTableData);
  }
}
