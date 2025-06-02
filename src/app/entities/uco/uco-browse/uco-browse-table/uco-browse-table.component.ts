import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UcoTableData } from '../../uco.model';
import { UcoService } from '../../uco.service';

export class UcoDataSource extends DataSource<UcoTableData> {
  private data$: BehaviorSubject<UcoTableData[]>;

  constructor(
    recordsSource$: BehaviorSubject<UcoTableData[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(collectionViewer: CollectionViewer): Observable<UcoTableData[]> {
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

  private _getSortedData(): UcoTableData[] {
    const data = this.data$.value.slice();
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'fe_incorporacion_ts':
         // [propertyA, propertyB] = [a.fe_incorporacion_ts, b.fe_incorporacion_ts];
          break;
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
  selector: 'uco-browse-table',
  templateUrl: './uco-browse-table.component.html',
  styleUrls: ['./uco-browse-table.component.scss']
})
export class UcoBrowseTableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  // @Output() altaRapida = new EventEmitter<ParentUD>();
  public displayedColumns: string[] = [
    // 'select',
    'slug',
    'cod_uco',
    'rowactions',
  ];

  public selection = new SelectionModel<UcoTableData>(true, []);
  public dataSource: UcoDataSource;
  private dataRecordsSource: BehaviorSubject<UcoTableData[]> = new BehaviorSubject<UcoTableData[]>([]);

  constructor(
    private _service: UcoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataRecordsSource = this._service.dataRecordsSource;
  }

  ngOnInit(): void {
    this.dataSource = new UcoDataSource(
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

  public edit(record: UcoTableData): void {
    this.router.navigate(['factory', record._id], { relativeTo: this.route });
  }

  public view(record : UcoTableData) : void {
    this.router.navigate(['view', record._id], {relativeTo: this.route});
  }

}
