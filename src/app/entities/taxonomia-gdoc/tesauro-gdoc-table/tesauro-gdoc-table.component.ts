import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaxonomiaTable } from '../taxonomia.model';
import { TaxonomiaService } from '../taxonomia.service';
import {TaxonomiaModalService} from '../taxonomia-modal.service';

@Component({
  selector: 'tesauro-gdoc-table',
  templateUrl: './tesauro-gdoc-table.component.html',
  styleUrls: ['./tesauro-gdoc-table.component.scss']
})
export class TesauroGDocTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public displayedColumns: string[] = [
    // 'select',
    'identificador',
    'descripcion',
    'rowactions',
  ];

  public selection = new SelectionModel<TaxonomiaTable>(true, []);
  public dataSource: TesauroDataSource;
  private readonly dataRecordsSource: BehaviorSubject<TaxonomiaTable[]>;


  constructor(
    private _service: TaxonomiaService,
    private _modal: TaxonomiaModalService,
    private _router: Router,
  ) {
    this.dataRecordsSource = this._service.dataRecordsSource;
  }

  ngOnInit(): void {
    this.dataSource = new TesauroDataSource(
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

  altaRapida(item: TaxonomiaTable): void {
    this._modal.abrirAltaRapidaTerminoModal(item.source).subscribe(entity => {
      console.log(entity);
    });
  }

  // public deleteEntity(item: TesauroTable): void {
  //   this._notificationService.openModalDialog(CONFIRMATION_MODAL_CONFIG)
  //     .subscribe(result => {
  //       if (result) {
  //         this._service.delete(item.source._id).then(status => {

  //           this._notificationService.success(`Se ha eliminado el registro exitosamente.`);
  //           this._refreshDataSource(item);

  //         })
  //       }
  //     })
  // }

  // private _refreshDataSource(item: TesauroTable): void {
  //   const dataSource = this._service.dataRecordsSource.value;
  //   dataSource.splice(dataSource.indexOf(item), 1);
  //   this._service.dataRecordsSource.next(dataSource);
  // }

}

class TesauroDataSource extends DataSource<TaxonomiaTable> {
  private readonly data$: BehaviorSubject<TaxonomiaTable[]>;

  constructor(
    recordsSource$: BehaviorSubject<TaxonomiaTable[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(): Observable<TaxonomiaTable[]> {
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

  private _getSortedData(): TaxonomiaTable[] {
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
