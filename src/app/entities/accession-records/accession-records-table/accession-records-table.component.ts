import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { AccessionRecordTable } from '../accession-records-model';
import { AccessionRecordsService } from '../accession-records.service';

const CONFIRMATION_MODAL_CONFIG = {
  data: {
    caption: '¡Atención acción no reversible!',
    body: 'Si confirma se eliminará este AR y ya no se podrá recuperar <br/> ¿Confirma la acción?',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    },
    cancel: {
      action: 'cancel',
      label: 'Cancelar'
    }
  }
};


@Component({
  selector: 'accession-records-table',
  templateUrl: './accession-records-table.component.html',
  styleUrls: ['./accession-records-table.component.scss']
})
export class AccessionRecordsTableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public displayedColumns: string[] = [
    // 'select',
    'nomyape',
    'fe_migracion_tx',
    'barco',
    'observaciones',
    'rowactions',
  ];

  public selection = new SelectionModel<AccessionRecordTable>(true, []);
  public dataSource: AccessionRecordsDataSource;

  private dataRecordsSource: BehaviorSubject<
    AccessionRecordTable[]
  >;
  private isBrowser: boolean;

  constructor(
    private _service: AccessionRecordsService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _notificationService: NotificationService
  ) {
    this.isBrowser = false;
    this.dataRecordsSource = this._service.dataRecordsSource;
  }

  ngOnInit(): void {

    this._route.data.subscribe(data => {

      this.isBrowser = data.modo && data.modo == 'browser' ? true : false;
    })

    this.dataSource = new AccessionRecordsDataSource(
      this.dataRecordsSource,
      this.paginator,
      this.sort
    );
  }

  public isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataRecordsSource.value.length;
    return numSelected === numRows;
  }

  public masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataRecordsSource.value.forEach((row) =>
        this.selection.select(row)
      );
  }

  public editEntity(item: AccessionRecordTable): void {
    this._service.selectedARFromTable$.next(item.source);
    if (this.isBrowser) {
      this._router.navigate(['/punto-acceso', 'factory', item.idUda]);
    }
  }

  public deleteEntity(item: AccessionRecordTable): void {
    this._notificationService.openModalDialog(CONFIRMATION_MODAL_CONFIG)
      .subscribe(result => {
        if (result) {
          this._service.delete(item.source._id).then(status => {

            this._notificationService.success(`Se ha eliminado el registro exitosamente.`);
            this._refreshDataSource(item);

          })
        }
      })
  }

  private _refreshDataSource(item: AccessionRecordTable): void {
    const dataSource = this._service.dataRecordsSource.value;
    dataSource.splice(dataSource.indexOf(item), 1);
    this._service.dataRecordsSource.next(dataSource);
  }

}

class AccessionRecordsDataSource extends DataSource<AccessionRecordTable> {
  private data$: BehaviorSubject<AccessionRecordTable[]>;

  constructor(
    recordsSource$: BehaviorSubject<AccessionRecordTable[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(): Observable<AccessionRecordTable[]> {
    const displayDataChanges = [
      this.data$,
      this._paginator.page,
      this._sort.sortChange,
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        const data = this._getSortedData();
        this._paginator.length = data.length;
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        return data.splice(startIndex, this._paginator.pageSize);
      })
    );
  }

  disconnect(): void { }

  private _getSortedData(): AccessionRecordTable[] {
    const data = this.data$.value.slice();
    if (!this._sort || !this._sort?.active || this._sort?.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort?.active) {
        case 'fe_migracion_tx': {
          if (a.fe_migracion_ts && b.fe_migracion_ts) {
            [propertyA, propertyB] = [a.fe_migracion_ts, b.fe_migracion_ts];
          }
          break;
        }

      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (
        (valueA < valueB ? -1 : 1) * (this._sort?.direction === 'asc' ? 1 : -1)
      );
    });
  }
}
