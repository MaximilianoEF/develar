import { animate, state, style, transition, trigger } from '@angular/animations';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { RenderAssetsModalService } from '../../../develar-commons/render-assets-modal/render-assets-modal.service';
import { UnidadDescripcionService } from '../../unidad-descripcion/unidad-descripcion.service';
import { MigranteHelper } from '../migrante.helper';
import { MigranteAntecedenteData, MigranteTable } from '../migrante.model';
import { MigranteService } from '../migrante.service';

const CONFIRMATION_MODAL_CONFIG = {
  data: {
    caption: '¡Atención acción no reversible!',
    body: 'Si confirma se eliminará este Migrante y ya no se podrá recuperar <br/> ¿Confirma la acción?',
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
const DNM01: string = 'DNM01'

@Component({
  selector: 'migrante-table',
  templateUrl: './migrante-table.component.html',
  styleUrls: ['./migrante-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [RenderAssetsModalService]
})
export class MigranteTableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Output()
  public onBuscarDocumentos: EventEmitter<number>;
  public expandedElement: MigranteTable;
  public displayedColumns: string[] = [
    // 'select',
    'fechaevento',
    'barco',
    'embarque',
    'nacionalidad',
    'edad',
    'apellido',
    'nombre',
    'rowactions',
  ];

  public selection = new SelectionModel<MigranteTable>(true, []);
  public dataSource: MigrantesDataSource;

  private dataRecordsSource: BehaviorSubject<MigranteTable[]>;

  public selectedAntecedentesFromMigrante$: BehaviorSubject<any[]>;
  public dataToShow$: BehaviorSubject<any[]>;
  private modo: string = "orale";
  constructor(
              private _service: MigranteService,
              private _notificationService: NotificationService,
              private _udService: UnidadDescripcionService,
              private _assetModal: RenderAssetsModalService,
              private _router: Router,
              private _route: ActivatedRoute
  ) {
    this.dataRecordsSource = this._service.dataRecordsSource;
    this.selectedAntecedentesFromMigrante$ = this._service.selectedAntecedentesFromMigrante$;
    this.onBuscarDocumentos = new EventEmitter<number>();
    this.dataToShow$ = new BehaviorSubject<any[]>([]);
  }

  ngOnInit(): void {

    this.dataSource = new MigrantesDataSource(
      this.dataRecordsSource,
      this.paginator,
      this.sort
    );

    this._route.data.subscribe(data => {

      //this.modo = data ? data.modo : this.modo;

    })

    this.selectedAntecedentesFromMigrante$
      .subscribe( results => {
        if(results && results.length) {
          this.dataToShow$.next([])
          const dataToRender = [];
          results.forEach( item => {
            this._udService.search({codigo_referencia: DNM01, inventario: item.libroid})
              .subscribe(udas => {
                if(udas && udas.length) {
                  /** El número de inventario debiera ser único para DNM01,
                   *  así que me quedo con el primer elemento
                   */
                  let registro = udas.length - 1;
                  dataToRender.push(MigranteHelper.buildMigranteAntecedenteData(udas[registro]));
                } else {
                  /** No encontró resultados, entonces pusheo el
                   *  analítico libro.
                   */
                  dataToRender.push(MigranteHelper.buildMigranteAntecedenteData(item));
                }
                this.dataToShow$.next(dataToRender);
              })
          })
        }
      })
  }

  /**
   * Dispara una búsqueda en un libro para el migrante elegido
   * @param fechaArribo El timestamp correspondiente a la fecha de arribo que se
   *                    quiere buscar
   */
  buscarDocumentos(fechaArribo: number, entity: MigranteTable): void {
    this.expandedElement = this.expandedElement === entity ? null : entity;
    this._service.selectedAntecedentesFromMigrante$.next([]);
    this.onBuscarDocumentos.emit(fechaArribo);
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

  public editEntity(item: MigranteTable): void {
    this._service.selectedMigranteFromTable$.next(item.source);

  }

  public deleteEntity(item: MigranteTable): void {
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

  private _refreshDataSource(item: MigranteTable): void {
    const dataSource = this._service.dataRecordsSource.value;
    dataSource.splice(dataSource.indexOf(item), 1);
    this._service.dataRecordsSource.next(dataSource);
  }
  
  public solicitarAntecedente(item: MigranteAntecedenteData, migrante: MigranteTable): void {
    //let url = `api/pdf/solhisopadoform/${asisId}`;

    //let params = this.daoService.buildParams(query);
    //const Url = 'api/asisprevencion/exportarmovimientos?' + params.toString();
    let udaId = item && item._id;
    let inventario = item.inventario;
    let migranteId = migrante && migrante.source && migrante.source._id;
    let query = '';
    query = migranteId ? '?migrante='+migranteId+"&inventario="+inventario : '';
    
    let url = udaId ? `api/pdf/constanciamigraciones/${udaId}${query}` : `api/pdf/constanciamigraciones${query}`
    const windw = window.open(url, 'about:blank')
  }

  public solicitarAntecedenteOld(item: MigranteAntecedenteData): void {
    let antecedentesSolicitados = this._service.antecedentesSolicitados$.value;
    if(this.itemIsRequested(item)) {
      antecedentesSolicitados = antecedentesSolicitados.filter(f => f._id !== item._id);
    } else {
      antecedentesSolicitados.push(item);
    }
    this._service.antecedentesSolicitados$.next(antecedentesSolicitados);
  }

  public itemIsRequested(item: MigranteAntecedenteData): boolean {
    const antecedentesSolicitados = this._service.antecedentesSolicitados$.value;
    const isRequested = antecedentesSolicitados.find(f => f._id === item._id);

    return !!(isRequested)
  }

  public openModalRenderAsset(assetId: string): void {
    this._assetModal.renderAssets(assetId);
  }

  public goToDetailedView(id: string): void {
    if(this.modo) {
      this._router.navigate(['/web','fichatecnica','vista-detallada',id]);
    } else {
      this._router.navigate(['/unidad-descripcion','vista-detallada',id]);
    }
  }

}

class MigrantesDataSource extends DataSource<MigranteTable> {
  private data$: BehaviorSubject<MigranteTable[]>;

  constructor(
    recordsSource$: BehaviorSubject<MigranteTable[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(): Observable<MigranteTable[]> {
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

  private _getSortedData(): MigranteTable[] {
    const data = this.data$.value.slice();
    if (!this._sort || !this._sort?.active || this._sort?.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort?.active) {
        case 'fechaevento': {
          if (a.fechaevento_ts && b.fechaevento_ts) {
            [propertyA, propertyB] = [a.fechaevento_ts, b.fechaevento_ts];
          }
          break;
        }

        case 'nomyape': {
          if (a.nomyape && b.nomyape) {
            [propertyA, propertyB] = [a.nomyape, b.nomyape];
          }
          break;
        }

        case 'barco': {
          if(a.barco && b.barco) {
            [propertyA, propertyB] = [a.barco, b.barco]
          }
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

