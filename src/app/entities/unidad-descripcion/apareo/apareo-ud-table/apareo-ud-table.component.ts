import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';
import { ApareoUda } from '../../unidad-descripcion.model';

@Component({
  selector: 'apareo-ud-table',
  templateUrl: './apareo-ud-table.component.html',
  styleUrls: ['./apareo-ud-table.component.scss']
})
export class ApareoUdTableComponent implements OnInit {
  
  @Input() apareoDataSource: BehaviorSubject<Array<ApareoUda>>;
  @Output() selectedList: EventEmitter<Array<ApareoUda>> = new EventEmitter<Array<ApareoUda>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  
  public displayedColumns: string[] = [
    'select',
    'reference_code',
    'descriptionlevel',
    'title',
    'thumbnail',
    'rowactions',
  ];

  public selection = new SelectionModel<ApareoUda>(true, []);
  public dataSource: ApareoDataSource;
  public isBuscadorMultimedia: boolean = false;
  private dataRecordsSource: BehaviorSubject<
  ApareoUda[]
  > = new BehaviorSubject<ApareoUda[]>([]);

  constructor(
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.dataRecordsSource = this.apareoDataSource;
    this.dataSource = new ApareoDataSource(
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

  public detailedView(ud : ApareoUda) : void {
    this.router.navigate(['/unidad-descripcion','vista', ud.idUda]);
  }


  public selectedRow(row: ApareoUda): void {
    this.selection.toggle(row);
    this.selectedList.emit(this.selection.selected);
  }

  public getLabel(type:string, val:string): string {
    return UnidadDescripcionHelper.getOptionLabel(type, val);
  }

  public getReferenceCode(reference_code: string[]): string {
    return UnidadDescripcionHelper.buildReferenceCode(reference_code);
  }
}

export class ApareoDataSource extends DataSource<ApareoUda> {
  private data$: BehaviorSubject<ApareoUda[]>;

  constructor(
    recordsSource$: BehaviorSubject<ApareoUda[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(collectionViewer: CollectionViewer): Observable<ApareoUda[]> {
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

  private _getSortedData(): ApareoUda[] {
    const data = this.data$.value.slice();
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
}

