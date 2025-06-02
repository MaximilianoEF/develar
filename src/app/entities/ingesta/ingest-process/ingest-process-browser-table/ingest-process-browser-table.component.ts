import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IngestProcessDataTable } from '../../ingesta.model';
import { IngestaService } from '../../ingesta.service';


class AuthorityRecordDataSource extends DataSource<IngestProcessDataTable> {
  private data$: BehaviorSubject<IngestProcessDataTable[]>;

  constructor(
    recordsSource$: BehaviorSubject<IngestProcessDataTable[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(collectionViewer: CollectionViewer): Observable<IngestProcessDataTable[]> {
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

  private _getSortedData(): IngestProcessDataTable[] {
    const data = this.data$.value.slice();
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'fecha_tx':
          [propertyA, propertyB] = [a.fecha_ts, b.fecha_ts];
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
  selector: 'ingest-process-browser-table',
  templateUrl: './ingest-process-browser-table.component.html',
  styleUrls: ['./ingest-process-browser-table.component.scss']
})
export class IngestProcessBrowserTableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public displayedColumns: string[] = [
    // 'select',
    'slug',
    'compNum',
    'fecha_tx',
    'rowactions',
  ];

  public selection = new SelectionModel<IngestProcessDataTable>(true, []);
  public dataSource: AuthorityRecordDataSource;
  private dataRecordsSource: BehaviorSubject<IngestProcessDataTable[]> = new BehaviorSubject<IngestProcessDataTable[]>([]);

  constructor(
    private _ingestaService: IngestaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataRecordsSource = this._ingestaService.dataRecordsSource;
  }

  ngOnInit(): void {
    this.dataSource = new AuthorityRecordDataSource(
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

  public edit(record: IngestProcessDataTable): void {
    this.router.navigate(['proceso-ingesta', record._id], { relativeTo: this.route }).then();
  }
}
