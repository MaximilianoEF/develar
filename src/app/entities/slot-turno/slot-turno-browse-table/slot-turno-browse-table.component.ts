import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { SlotTurnoTable } from '../slot-turno.model';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';
import { SlotTurnoService } from '../slot-turno.service';
import { Router, ActivatedRoute } from '@angular/router';

class TurnoSedeDataSource extends DataSource<SlotTurnoTable> {
  private data$: BehaviorSubject<SlotTurnoTable[]>;

  constructor(
    recordsSource$: BehaviorSubject<SlotTurnoTable[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(collectionViewer: CollectionViewer): Observable<SlotTurnoTable[]> {
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

  private _getSortedData(): SlotTurnoTable[] {
    const data = this.data$.value.slice();
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'dow':
          [propertyA, propertyB] = [a.dow, b.dow];
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
  selector: 'slot-turno-browse-table',
  templateUrl: './slot-turno-browse-table.component.html',
  styleUrls: ['./slot-turno-browse-table.component.scss']
})
export class SlotTurnoBrowseTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public displayedColumns: string[] = [
    'select',
    'nombre',
    // 'dow',
    'sede',
    'descripcion',
    'tipo',
    'estado',
    'rowactions'
  ];

  public selection = new SelectionModel<SlotTurnoTable>(true, []);
  public dataSource: TurnoSedeDataSource;
  private dataRecordsSource: BehaviorSubject<SlotTurnoTable[]> = new BehaviorSubject<SlotTurnoTable[]>([]);

  constructor(
    private service: SlotTurnoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataRecordsSource = this.service.dataRecordsSource;
  }

  ngOnInit(): void {
    this.initDataSource();
  }

  private initDataSource(): void {
    this.dataSource = new TurnoSedeDataSource(
      this.dataRecordsSource,
      this.paginator,
      this.sort
    );
  }

  public delete(entity: SlotTurnoTable): void {
    console.log('Eliminamos: %o', entity);
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
