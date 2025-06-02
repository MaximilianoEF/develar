import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';

import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { TurnoTable } from '../../models/turno.model';
import { AGNHelper } from '../../agn.helper';
import { Turno } from '../../../entities/turnos/turno.model';
import { TurnoModalService } from '../turno-modal.service';
import { TurnosService } from '../../../entities/turnos/turnos.service';

class TurnosDataSource implements DataSource<TurnoTable> {
  private turnosSubject = new BehaviorSubject<TurnoTable[]>([]);
  public turnosCountSubject = new BehaviorSubject<Number>(0);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private data$: Observable<Turno[]>;
  public loading$ = this.loadingSubject.asObservable();


  constructor(
    data$: Observable<Turno[]>,
  ) {
    this.data$ = data$;
  }

  connect(collectionViewer: CollectionViewer): Observable<TurnoTable[]> {
    return this.turnosSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.turnosSubject.complete();
    this.loadingSubject.complete();
  }

  // loadTurnos(personId: string, filter: string, sortDirection: string, pageIndex: number, pageSize: number) {
  loadTurnos() {
    this.loadingSubject.next(true);

    this.data$.pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(turnos => {
      this.turnosCountSubject.next(turnos.length);
      this.turnosSubject.next(AGNHelper.buildTurneraBrowseDataTable(turnos));
    });
  }
}

@Component({
  selector: 'agn-turnos-browse-table',
  templateUrl: './turnos-browse-table.component.html',
  styleUrls: ['./turnos-browse-table.component.scss'],
  providers: [TurnoModalService]
})
export class TurnosBrowseTableComponent implements OnInit, OnChanges {
  // -----------------------------------------------------
  // Datos para mostrar que me los pasa TurnosBrowse
  @Input() data$: Observable<Turno[]>;

  // -----------------------------------------------------
  // Emisor de evento de cancelación de turno
  @Output() cancelTurno: EventEmitter<string> = new EventEmitter<string>();

  //Emisor de evento de edición de turno
  @Output() editTurno = new EventEmitter<Turno>();

  public displayedColumns: string[] = [
    // 'select',
    'txFechaHora',
    'sede',
    'sala',
    // 'tipoConsulta',
    'detalle',
    'avance',
    'rowactions'
  ];
  private initialSelection = [];
  private allowMultiSelect = true;
  public selection = new SelectionModel<Turno>(this.allowMultiSelect, this.initialSelection);
  public dataSource: TurnosDataSource;

  constructor(
    private _turnoModal : TurnoModalService,
    private _turnoService : TurnosService,
  ) {
  }

  ngOnInit(): void {
    if(this.data$){
      this.dataSource = new TurnosDataSource(this.data$);
      this.dataSource.loadTurnos();
    }
  }

  ngOnChanges(): void {
    if (this.dataSource) {
      this.dataSource.loadTurnos();
    }
  }
  // oJo
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.turnosCountSubject.value;
    return numSelected === numRows;
  }


  masterToggle() {
    // this.isAllSelected() ?
    //     this.selection.clear() :
    //     this.dataSource.data.forEach(row => this.selection.select(row));
  }

  public editItem(turno: TurnoTable): void {

    this._turnoService.fetchById(turno._id).then(turno => {
      if(turno){
        this._turnoModal.setupEditModal(turno).subscribe(entity => {
          if(entity){
            this.editTurno.emit(entity);
          }
        });
      }
    })
  }

  public deleteItem(turno: TurnoTable): void {
    this.cancelTurno.emit(turno._id);
  }
}
