import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { UnidadDocumentalSimpleTable } from '../../ingesta.model';
import { IngestaService } from '../../ingesta.service';


class UnidadDocumentalSimpleDataSource extends DataSource<UnidadDocumentalSimpleTable> {
  private data$: BehaviorSubject<UnidadDocumentalSimpleTable[]>;

  constructor(
    recordsSource$: BehaviorSubject<UnidadDocumentalSimpleTable[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(collectionViewer: CollectionViewer): Observable<UnidadDocumentalSimpleTable[]> {
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

  disconnect(collectionViewer: CollectionViewer): void {}

  private _getSortedData(): UnidadDocumentalSimpleTable[] {
    const data = this.data$.value.slice();
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        // case 'entityType':
        //   [propertyA, propertyB] = [a.entityType, b.entityType];
        //   break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
}


@Component({
  selector: 'unidad-documental-simple-table',
  templateUrl: './unidad-documental-simple-table.component.html',
  styleUrls: ['./unidad-documental-simple-table.component.scss']
})
export class UnidadDocumentalSimpleTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  // @Output() altaRapida = new EventEmitter<ParentUD>();
  public displayedColumns: string[] = [
    'select',
    'identificador',
    'objetoDigital',
    'rowactions',
  ];

  public selection = new SelectionModel<UnidadDocumentalSimpleTable>(true, []);
  public dataSource: UnidadDocumentalSimpleDataSource;
  private dataRecordsSource: BehaviorSubject<UnidadDocumentalSimpleTable[]> = new BehaviorSubject<UnidadDocumentalSimpleTable[]>([]);

  constructor(
    private _service: IngestaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataRecordsSource =null;
  }

  ngOnInit(): void {
    this.dataSource = new UnidadDocumentalSimpleDataSource(
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

}
