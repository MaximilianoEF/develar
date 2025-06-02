import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, SimpleChange, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaxonomiaTermino, TaxonomiaTerminoTable } from '../../taxonomia.model';
import { TaxonomiaService } from '../../taxonomia.service';
import { NotificationService } from '../../../../develar-commons/notifications.service';

const CONFIRMATION_MODAL_CONFIG = {
  data: {
    caption: 'Confirmar',
    body: '¿Seguro que desea eliminar este término?',
    accept: {
      action: 'accept',
      label: 'Sí'
    },
    cancel: {
      action: 'cancel',
      label: 'No'
    }
  }
};

const WARNING_MODAL_CONFIG = {
  data: {
    caption: '¡Acción no permitida!',
    body: 'Está intentando borrar un término de una taxonomía bloqueada.',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

@Component({
  selector: 'termino-table',
  templateUrl: './termino-table.component.html',
  styleUrls: ['./termino-table.component.scss']
})
export class TerminoTableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() isLocked: boolean;

  public displayedColumns: string[] = [
    // 'select',
    'identificador',
    'slug',
    'descripcion',
    'rowactions',
  ];

  public selection = new SelectionModel<TaxonomiaTerminoTable>(true, []);
  public dataSource: TaxonomiaTerminoDataSource;
  private readonly dataRecordsSource: BehaviorSubject<TaxonomiaTerminoTable[]>;


  constructor(
              private _service: TaxonomiaService,
              private _notificationService: NotificationService
  ) {
    this.dataRecordsSource = this._service.dataRecordsSourceTerminos;
    this.isLocked = false;
  }

  ngOnInit(): void {
    this.dataSource = new TaxonomiaTerminoDataSource(
      this.dataRecordsSource,
      this.paginator,
      this.sort
    );
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataRecordsSource.value.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataRecordsSource.value.forEach((row) =>
        this.selection.select(row)
      );
  }

  editTermino(item: TaxonomiaTermino): void {
    this._service.taxonomiaTerminoSelected$.next(item);
  }

  deleteTermino(item: TaxonomiaTerminoTable): void {
    this._notificationService.openModalDialog(CONFIRMATION_MODAL_CONFIG)
      .subscribe(result => {
        if (result) {
          this._service.deleteTermino(item.source._id).then(status => {
            this._notificationService.success(`Se ha eliminado el registro exitosamente.`);
            this._refreshDataSource(item);
          });
        }
      })
  }

  private _refreshDataSource(item: TaxonomiaTerminoTable): void {
    const dataSource = this._service.dataRecordsSourceTerminos.value;
    dataSource.splice(dataSource.indexOf(item), 1);
    this._service.dataRecordsSourceTerminos.next(dataSource);
  }

}

class TaxonomiaTerminoDataSource extends DataSource<TaxonomiaTerminoTable> {
  private readonly data$: BehaviorSubject<TaxonomiaTerminoTable[]>;

  constructor(
    recordsSource$: BehaviorSubject<TaxonomiaTerminoTable[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(): Observable<TaxonomiaTerminoTable[]> {
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

  private _getSortedData(): TaxonomiaTerminoTable[] {
    const data = this.data$.value.slice();
    if (!this._sort || !this._sort?.active || this._sort?.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort?.active) {

      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (
        (valueA < valueB ? -1 : 1) * (this._sort?.direction === 'asc' ? 1 : -1)
      );
    });
  }
}
