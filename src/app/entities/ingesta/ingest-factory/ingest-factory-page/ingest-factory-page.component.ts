import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SharedService} from '../../../../develar-commons/shared-service';
import {UnidadDescripcionQuery} from '../../../unidad-descripcion/unidad-descripcion.model';
import {UnidadDescripcionService} from '../../../unidad-descripcion/unidad-descripcion.service';
import {IngestProcess} from '../../ingesta.model';
import {IngestaService} from '../../ingesta.service';
import {NotificationService} from '../../../../develar-commons/notifications.service';
import {UnidadDescripcionHelper} from '../../../unidad-descripcion/unidad-descripcion.helper';

@Component({
  selector: 'ingest-factory-page',
  templateUrl: './ingest-factory-page.component.html',
  styleUrls: ['./ingest-factory-page.component.scss'],
})
export class IngestFactoryPageComponent implements OnInit {
  public pageTitle: string = 'Gestión de ingesta';
  private idPI: string;
  /** Variables de estado; definen qué paneles se muestran o no */
  public showMatchingPanel = false;
  public showIngestFolderPanel = false;
  public showAssetsPanel = false;
  public showIngestPlanPanel = false;
  public showUdaPanel = false;
  public showIT: boolean = false;

  constructor(
    private _shared: SharedService,
    private _route: ActivatedRoute,
    private _service: IngestaService,
    private _serviceUD: UnidadDescripcionService,
    private _notificationService: NotificationService
  ) {
    this.idPI = this._route.snapshot.params.id;
    this._shared.emitChange(this.pageTitle);
  }

  ngOnInit(): void {
    if (this.idPI) {
      this._service
        .findByID(this.idPI)
        .then((pi) => {
          this._service.pi$.next(pi);
          this._service.ud$.next(null);

          /** Determinamos si mostrar panel Carpeta de Ingesta */
          if (pi.ingestFolder && pi.ingestFolder.path) {
            this.showIngestFolderPanel = true;
          }
          /** Determinamos si mostrar panel Información Técnica */
          this.showIngestPlanPanel = true;

          // vamos a vincular la uda al service a partir del hook
          if (pi.udaHook && pi.udaHook.udaId) {
            this._service.buildUDAFromHook(pi.udaHook)
              .then((udaFromHook) => {
                this._service.ud$.next(udaFromHook);
                this.showUdaPanel = udaFromHook ? true : false;
              })
              .catch((error) => {
                this._notificationService.error('Se produjo un error al obtener la UDA asociada a este PI');
                this.showIngestPlanPanel = false;
                this.showUdaPanel = false;
              });
          }
        })
        .catch((error) => {
          this.showIngestFolderPanel = false;
          this.showIngestPlanPanel = false;
          this.showUdaPanel = false;
        });
    } else {
      this._service.pi$.next(null);
      this._service.ud$.next(null);
    }

    this._service.pi$.subscribe(pi => {
      if (pi && pi._id == this.idPI) {
        if (pi.ingestFolder && pi.ingestFolder.path) {
          this.showIngestFolderPanel = true;
        }
      } else {
        this.showIngestFolderPanel = false;
      }
    });

    this._service.ud$.subscribe(ud => {
      if (ud && this._service.pi$.value && this._service.pi$.value._id == this.idPI) {
        this.showUdaPanel = true;
      } else {
        this.showUdaPanel = false;
      }
    });
  }

  public showMatchingsPanelHandler(value: boolean): void {
    this.showMatchingPanel = value;
  }


  public editPI(pi: IngestProcess): void {

    this._service.update(pi._id, pi).then(result => {
      this._service.pi$.next(result);
      this._notificationService.success('Edición de información técnica exitosa');
    });
  }

  public showAssetPanelHandler(value: boolean): void {
    this.showAssetsPanel = value;
  }
}
