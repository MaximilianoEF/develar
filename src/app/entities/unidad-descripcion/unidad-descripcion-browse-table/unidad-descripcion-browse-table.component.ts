import {Component, OnInit, Output, ViewChild, EventEmitter} from '@angular/core';
import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { ParentUD, UnidadDescripcionTable } from '../unidad-descripcion.model';
import { UnidadDescripcionService } from '../unidad-descripcion.service';
import { UnidadDescripcionHelper } from '../unidad-descripcion.helper';

export class UnidadDescripcionDataSource extends DataSource<UnidadDescripcionTable> {
  private data$: BehaviorSubject<UnidadDescripcionTable[]>;

  constructor(
    recordsSource$: BehaviorSubject<UnidadDescripcionTable[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(): Observable<UnidadDescripcionTable[]> {
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

  disconnect(): void {}

  private _getSortedData(): UnidadDescripcionTable[] {
    const data = this.data$.value.slice();
    if (!this._sort || !this._sort?.active || this._sort?.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort?.active) {
        // case 'ndoc':
        //   [propertyA, propertyB] = [a.ndoc, b.ndoc];
        //   break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (
        (valueA < valueB ? -1 : 1) * (this._sort?.direction === 'asc' ? 1 : -1)
      );
    });
  }
}


@Component({
  selector: 'unidad-descripcion-browse-table',
  templateUrl: './unidad-descripcion-browse-table.component.html',
  styleUrls: ['./unidad-descripcion-browse-table.component.scss']
})
export class UnidadDescripcionBrowseTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Output() altaRapida = new EventEmitter<ParentUD>();
  @Output() hidePaginator = new EventEmitter<boolean>();
  public displayedColumns: string[] = [
    'select',
    'reference_code',
    'identifier',
    'descriptionlevel',
    'title',
    'thumbnail',
    'rowactions',
  ];

  public selection = new SelectionModel<UnidadDescripcionTable>(true, []);
  public dataSource: UnidadDescripcionDataSource;
  public isBuscadorMultimedia: boolean = false;

  private dataRecordsSource: BehaviorSubject<
    UnidadDescripcionTable[]
    > = new BehaviorSubject<UnidadDescripcionTable[]>([]);


  constructor(
    private unidadDescripcionService: UnidadDescripcionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataRecordsSource = this.unidadDescripcionService.dataRecordsSource;
  }

  ngOnInit(): void {

    this.route.data.subscribe(data => {
      this.isBuscadorMultimedia = !!(data && data.modo === 'buscador-multimedia');
      this.hidePaginator.emit(true);
    })

    this.dataSource = new UnidadDescripcionDataSource(
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

  public edit(ud: UnidadDescripcionTable): void {
    this.router.navigate(['factory', ud._id], { relativeTo: this.route }).then();
  }

  public detailedView(ud : UnidadDescripcionTable) : void {
    this.router.navigate(['/unidad-descripcion','vista-detallada', ud._id]).then();
  }

  public altaRapidaConParent(ud : UnidadDescripcionTable) : void {
    let parent = new ParentUD();
    parent.id_parent = ud._id;
    parent.identifier = ud.identifier;
    parent.level_of_description = UnidadDescripcionHelper.getOptionList('descriptionLevel').find( f => f.label == ud.descriptionlevel).val ;
    parent.title = ud.title;
    this.altaRapida.emit(parent);
  }
}
