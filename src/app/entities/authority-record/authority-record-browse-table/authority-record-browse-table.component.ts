import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { AuthorityRecordTable, AuthorityRecord } from '../authority-record.model';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthorityRecordService } from '../authority-record.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

class AuthorityRecordDataSource extends DataSource<AuthorityRecordTable> {
  private data$: BehaviorSubject<AuthorityRecordTable[]>;

  constructor(
    recordsSource$: BehaviorSubject<AuthorityRecordTable[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(collectionViewer: CollectionViewer): Observable<AuthorityRecordTable[]> {
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

  private _getSortedData(): AuthorityRecordTable[] {
    const data = this.data$.value.slice();
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'entityType':
          [propertyA, propertyB] = [a.entityType, b.entityType];
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
  selector: 'authority-record-browse-table',
  templateUrl: './authority-record-browse-table.component.html',
  styleUrls: ['./authority-record-browse-table.component.scss']
})
export class AuthorityRecordBrowseTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  // @Output() altaRapida = new EventEmitter<ParentUD>();
  public displayedColumns: string[] = [
    'select',
    'entityType',
    'authorizedName',
    'rowactions',
  ];

  public selection = new SelectionModel<AuthorityRecordTable>(true, []);
  public dataSource: AuthorityRecordDataSource;
  private dataRecordsSource: BehaviorSubject<AuthorityRecordTable[]> = new BehaviorSubject<AuthorityRecordTable[]>([]);

  constructor(
    private authorityRecordService: AuthorityRecordService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataRecordsSource = this.authorityRecordService.dataRecordsSource;
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

  public edit(record: AuthorityRecordTable): void {
    this.router.navigate(['factory', record._id], { relativeTo: this.route });
  }
}
