import { Component, OnInit } from '@angular/core';
import { finalize, take } from 'rxjs/operators';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { UnidadDescripcionService } from '../../unidad-descripcion/unidad-descripcion.service';
import { MigranteService } from '../migrante.service';

@Component({
  selector: 'sync-analiticos-libros',
  templateUrl: './sync-analiticos-libros.component.html',
  styleUrls: ['./sync-analiticos-libros.component.scss']
})
export class SyncAnaliticosLibrosComponent implements OnInit {

  public typesSync = [
    { title: 'LPME Libros Marítimos Entrada',       subtitle: 'Sincronizar libros con UDAs',     button: 'Sincronizar', action: 'syncLibros',  endpoint: '' },
    { title: 'C&C Caras y caretas',                 subtitle: 'Sincronizar analíticos con UDAs', button: 'Sincronizar', action: 'syncCyC',     endpoint: 'cyc' },
    { title: 'DINE01 Dirección Nacional Electoral', subtitle: 'Sincronizar analíticos con UDAs', button: 'Sincronizar', action: 'syncDNE',     endpoint: 'dne'},
    { title: 'UNIREN Empresas Recuperadas',         subtitle: 'Sincronizar analíticos con UDAs', button: 'Sincronizar', action: 'syncUNIREN',  endpoint: 'uniren'},
    { title: 'CAL Comisión Asesoram Legis',         subtitle: 'Sincronizar analíticos con UDAs', button: 'Sincronizar', action: 'syncCAL',     endpoint: 'cal'},
    { title: 'VERNET Fondo Gob Vernet',             subtitle: 'Sincronizar analíticos con UDAs', button: 'Sincronizar', action: 'syncVERNET',  endpoint: 'vernet'},
  ];
  //const url = `/api/unidaddescripcion/sincronizar/dne`;

  public searching: boolean;

  /** Título principal de la página */
  public pageTitle = 'Sincronización analíticos con UDAs';

  constructor(
    private _service: MigranteService,
    private _udaService: UnidadDescripcionService,
    private _notificationService: NotificationService
  ) { }

  ngOnInit(): void {
  }

  public dispatchAction(action: string): void {
    if(action === 'syncLibros'){
      this._syncLibros();
      return;
    }
    this._syncUDA(action);

    // switch (action) {
    //   case 'syncLibros':
    //     this._syncLibros();
    //     break;
    //   case 'syncCyC':
    //     this._syncCyC();
    //     break;
    //   case 'syncDNE':
    //     this._syncDNE();
    //     break;
    //   case 'syncUDA':
    //     this._syncUDA(action);
    //     break;
    //   }
  }

  private _syncUDA(action: string): void {
    console.log("sync UDA [%s]", action)
    this.searching = true;
    let token = this.typesSync.find(t => t.action === action);

    if(!token) {
      this._errorSyncMsg();
      return;
    }

    this._udaService.syncAnaliticosWithUdas(token.endpoint).pipe(
      take(1),
      finalize(() => this.searching = false)
    ).subscribe(results => {
      if (results) {
        if(results.length) {
          this._successSyncMsg(results.length);
        } else {
          this._warnSyncMsg();
        }
      } else {
        this._errorSyncMsg();
      }
    })
  }


  private _syncLibros(): void {
    this.searching = true;
    this._service.syncLibrosWithUdas().pipe(
      take(1),
      finalize(() => this.searching = false)
    ).subscribe(results => {
      if (results) {
        if (results.length) {
          this._successSyncMsg(results.length);
        } else {
          this._warnSyncMsg();
        }
      } else {
        this._errorSyncMsg();
      }
    })
  }

  private _syncCyC(): void {
    this.searching = true;
    this._udaService.syncAnaliticosCYCWithUdas().pipe(
      take(1),
      finalize(() => this.searching = false)
    ).subscribe(results => {
      if (results) {
        if(results.length) {
          this._successSyncMsg(results.length);
        } else {
          this._warnSyncMsg();
        }
      } else {
        this._errorSyncMsg();
      }
    })
  }

  private _successSyncMsg(length: number): void {
    this._notificationService.success(`Se han sincronizado ${length} registros.`);
  }

  private _warnSyncMsg(): void {
    this._notificationService.warn(`No se encontraron registros para sincronizar.`);
  }

  private _errorSyncMsg(): void {
    this._notificationService.error(`Se ha producido un error al realizar la operación.`);
  }

}
