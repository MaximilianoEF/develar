import { Component, OnInit, OnChanges, EventEmitter, Output, Input } from '@angular/core';
import {  BusquedaTable, ConsultaAcervo } from '../../../models/historial.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { finalize } from 'rxjs/operators';
import { AGNHelper } from '../../../agn.helper';
import { Router, ActivatedRoute } from '@angular/router';
import { VidaQueryHelper } from '../../vida-query.helper';
import { VidaQuery } from '../../../models/vidaQuery.model';

@Component({
  selector: 'vida-query-history-table',
  templateUrl: './vida-query-history-table.component.html',
  styleUrls: ['./vida-query-history-table.component.scss']
})
export class VidaQueryHistoryTableComponent implements OnInit, OnChanges {

  // -----------------------------------------------------
  // Datos para mostrar que me los pasa HistoryBrose
  @Input() data$: Observable<ConsultaAcervo[]>; 

  // -----------------------------------------------------
  // Emisor de evento de repetir busqueda
  @Output() repetirBusqueda: EventEmitter<VidaQuery> = new EventEmitter<VidaQuery>();

  public displayedColumns: string[] = [
    // 'select',
    'txFechaHora',
    'recurso',
    'descripcion',
    'rowactions'
  ];
  private initialSelection = [];
  private allowMultiSelect = true;
  public selection = new SelectionModel<ConsultaAcervo>(this.allowMultiSelect, this.initialSelection);
  public dataSource: BusquedasDataSource;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.dataSource = new BusquedasDataSource(this.data$);
    this.dataSource.loadTurnos();
  }

  ngOnChanges(): void {
    if (this.dataSource) {
      this.dataSource.loadTurnos();
    }
  }

  //oJo
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.busquedasCountSubject.value;
    return numSelected === numRows;
  }


  masterToggle() {
    // this.isAllSelected() ?
    //     this.selection.clear() :
    //     this.dataSource.data.forEach(row => this.selection.select(row));
  }


  public repetirQuery(busqueda : BusquedaTable){
    this.repetirBusqueda.emit(busqueda.query);
  }

}

class BusquedasDataSource implements DataSource<BusquedaTable> {
  private busquedasSubject = new BehaviorSubject<BusquedaTable[]>([]);
  public busquedasCountSubject = new BehaviorSubject<Number>(0);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private data$: Observable<ConsultaAcervo[]>;
  public loading$ = this.loadingSubject.asObservable();


  constructor(
    data$: Observable<ConsultaAcervo[]>,
  ) {
    this.data$ = data$;
  }

  connect(collectionViewer: CollectionViewer): Observable<BusquedaTable[]> {
    return this.busquedasSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.busquedasSubject.complete();
    this.loadingSubject.complete();
  }

  // loadTurnos(personId: string, filter: string, sortDirection: string, pageIndex: number, pageSize: number) {
  loadTurnos() {
    this.loadingSubject.next(true);

    this.data$.pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(busquedas => {
      this.busquedasCountSubject.next(busquedas.length);
      this.busquedasSubject.next(VidaQueryHelper.buildBusquedaBrowseDataTable(busquedas));
    });
  }

}
