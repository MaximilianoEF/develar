import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { AccessionRecord, AccessionRecordQuery, UnidadDescripcionProxy } from '../../accession-records-model';
import { AccessionRecordsService } from '../../accession-records.service';
import { AccessionRecordsHelper } from '../../accession-records-helper';
import { ActivatedRoute } from '@angular/router';
import { UnidadDescripcionService } from '../../../unidad-descripcion/unidad-descripcion.service';
import { UnidadDescripcion } from '../../../unidad-descripcion/unidad-descripcion.model';

@Component({
  selector: 'accession-records-master-panel',
  templateUrl: './accession-records-master-panel.component.html',
  styleUrls: ['./accession-records-master-panel.component.scss']
})
export class AccessionRecordsMasterPanelComponent implements OnInit {

  public headerAction$: BehaviorSubject<string>;
  public udaId: string;
  public showData: boolean;

  // Componentes de un AccessionRecord

  public udaProxy: UnidadDescripcionProxy;
  private udaSource: UnidadDescripcion;

  constructor(
    private _route: ActivatedRoute,
    private _service: AccessionRecordsService,
    private _udaService: UnidadDescripcionService,
    private _notificationService: NotificationService
  ) {
    this.headerAction$ = this._service.headerAction$;
    this.showData = false;
    this.udaProxy = null;
  }

  ngOnInit(): void {
    this._setupUdaProxy();
    this._initOnce();
  }

  private _initOnce(): void {
    if (this.udaId) {
      const initialQuery = new AccessionRecordQuery();
      initialQuery.idUda = this.udaId;

      this._service.search(initialQuery)
        .subscribe(results => {
          if (results && results.length) {
            this._service.updateTableData(results);
            this.showData = true;
          }
        })
    }
  }

  public upsertRecord(record: AccessionRecord): void {
    const ar = this._service.selectedARFromTable$.value;
    record.uda = this.udaProxy;
    this._service.upsert(record)
      .subscribe(result => {
        if (result) {
          this._notificationService.success(`Operación exitosa sobre registro [${result._id}]`);
          const dataSource = this._service.dataRecordsSource.value;

          if (ar && ar._id && ar._id === result._id) {
            /** Edición de AR */ 
            const index = dataSource.findIndex( f => f._id === result._id);
            if(dataSource[index]) {
              console.log(dataSource[index])
              dataSource[index] = AccessionRecordsHelper.buildAccessionRecordDataTableWithAR(result);
              this._service.dataRecordsSource.next(dataSource);
            }
          } else {
            /** Alta de AR */
            const dataTable = AccessionRecordsHelper.buildAccessionRecordsDataTable([result]);
            
            if (dataSource && dataSource.length) {
              this._service.dataRecordsSource.next([... dataSource, ...dataTable]);
            } else {
              this._service.dataRecordsSource.next([...dataTable]);
              this.showData = true;
            }
          }
          /** Hay que verificar que si el AR tiene fechas cargadas
           *  la UDA que lo contiene tiene dado de alta ese dato
           */
          this._verifyAndUpdateUDADates(result);
        }
        else {
          this._notificationService.error(`Se ha producido un error al realizar la operación.`);
        }
      })
  }

  private _verifyAndUpdateUDADates(ar: AccessionRecord): void {
    if(ar.migrante && ar.migrante.date_type && ar.migrante.fe_migracion_tx) {
      /** Si posee el AR el tipo de fecha y el texto de la misma, verificamos
       *  si el UDA en cuestión también lo tiene
       */
      const migrante = ar.migrante;
      let date = null;

      if(this.udaSource.identificador && this.udaSource.identificador.dates && this.udaSource.identificador.dates.length) {
        date = this.udaSource.identificador.dates.find(d => 
          d.type === migrante.date_type && d.date === migrante.fe_migracion_tx
          )
      }

      if(!date){
        /** Si no existe dicha fecha, actualizamos la UDA en cuestión 
         *  con la fecha cargada en AR
        */
        const dateFromAR = AccessionRecordsHelper.buildDateFromARDate(ar); 
        this.udaSource.identificador.dates.push(dateFromAR);
        this._udaService.update(this.udaSource)
        .then(result => {});
      }
      
    } 
  }

  private async _setupUdaProxy() {
    if (this._route.snapshot.params.id) {
      this.udaId = this._route.snapshot.params.id;

      /*
       * Con el ID que llega por ruta, buscar la UDA, generar una UdaProxy
       *  enviárselo al componente correspondiente para su renderización
       */
      try {
        this.udaSource = await this._udaService.findById(this.udaId);
        this.udaProxy = AccessionRecordsHelper.buildUdaProxy(this.udaSource);
      } catch (error) {
        console.error(error);
      }
    } else {
      this.udaId = null;
    }
  }
}
