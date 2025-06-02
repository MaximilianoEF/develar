import { Component, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UnidadDescripcion } from "../../../unidad-descripcion/unidad-descripcion.model";
import { UnidadDescripcionTree, IngestProcess } from "../../ingesta.model";
import { UnidadDescripcionService } from "../../../unidad-descripcion/unidad-descripcion.service";
import { IngestaService } from "../../ingesta.service";
import { NotificationService } from "../../../../develar-commons/notifications.service";
import { IngestaModalService } from "../ingesta-modal.service";

/** Definición de constantes */
const UDALIST_DELETION_CONFIRMATION_TITLE = "Eliminar lista de UDAs";
const UDALIST_DELETION_CONFIRMATION_MESSAGE = "¿Está seguro?";
const MODAL_CONFIG = {
  data: {
    caption: '¡Acción no permitida!',
    body: 'Está intentando eliminar las UDC/UDS generadas cuando el PI está aprobado.',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};
@Component({
  selector: "ingest-uda-base",
  templateUrl: "./ingest-uda-base.component.html",
  styleUrls: ["./ingest-uda-base.component.scss"],
  providers: [IngestaModalService],
})
export class IngestUdaBaseComponent implements OnInit {
  /** Subject para obtener el P.I. del servicio */
  public pi$: BehaviorSubject<IngestProcess>;
  /** Subject para obtener la U.D. del servicio */
  public ud$: BehaviorSubject<UnidadDescripcion>;

  public shouldDisplayDeleteUdaListButton = false;
  public shouldDisplayUdaTree = false;

  public showTree: boolean = false;
  public inProgress: boolean = false;

  /** Propiedades que determinan el funcionamiento de la creación de UDC/UDS */
  public currentTree: UnidadDescripcionTree;
  private _pi: IngestProcess;
  constructor(
    private ingestService: IngestaService,
    private ingestModalService: IngestaModalService,
    private udService: UnidadDescripcionService,
    private _notificationService: NotificationService
  ) {
    this.pi$ = this.ingestService.pi$;
    this.ud$ = this.ingestService.ud$;
  }

  ngOnInit(): void {
    this.pi$.subscribe((pi) => {
      if (pi) {
        this._pi = pi;
        this.shouldDisplayDeleteUdaListButton = this.shouldDisplayUdaTree = pi.udaList && pi.udaList.length > 0;
      }
    });
  }

  public handleOnClickDeleteUdaList(): void {
    if(this._pi && this._pi.admin.avanceList.includes('aprobado')) {
      this._notificationService.openModalDialog(MODAL_CONFIG);
    } else {
      this.ingestModalService
      .setupConfirmationModal(
        UDALIST_DELETION_CONFIRMATION_TITLE,
        UDALIST_DELETION_CONFIRMATION_MESSAGE
      )
      .subscribe((proceedToDeleteUdaList) => {
        if (proceedToDeleteUdaList) {
          const pi = this.pi$.value;
          const uda = this.ud$.value;

          /** Primero hay que eliminar las UDA de su colección propia */
          const udaIdsToDelete = pi.udaList.map((token) => token._id);

          /** Desvincula los assets. Ver si esto es suficiente */
          udaIdsToDelete.forEach((udaId) => {
            const assetHook = pi.assetHookList.find((assetHookItem) => assetHookItem.itemId === udaId);
            assetHook.isVinculado = false;
            assetHook.itemId = null;
            assetHook.itemIdentifier = null;
            assetHook.itemLevel = null;
            assetHook.itemName = null;
            assetHook.itemRole = null;
          });

          this.udService.deleteMany(udaIdsToDelete).then((response) => {
              /** Luego vaciar el array udaList en el proceso de ingesta */
              pi.udaList = [];
              this.ingestService.update(pi._id, pi).then((updatedPi) => {
                this.pi$.next(updatedPi);
              });
          });
        }
      });
    }
  }

  public handleOnClickCreateUds(): void {
    const pi = this.pi$.value;
    const uda = this.ud$.value;
    const canBuildUds = (pi.udaList && pi.udaList.length === 0) || !pi.udaList;

    if (canBuildUds && uda) {
      this.createUds(uda, pi);
    } else {
      this._notificationService.warn(
        'No se pueden recrear las UDC ó UDS; primero elimine las UDC/UDS actuales'
      );
    }
  }

  private createUds(uda: UnidadDescripcion, pi: IngestProcess): void {
    this.ingestModalService.setupUdsFormDataModal(pi).subscribe((formData) => {
      if (pi && uda && formData) {
        /**
         * formData contiene cuatro datos:
         * - relAssetUDS es la cardinalidad de la relación asset-a-UDS; por ejemplo
         *  si relAssetUDS = 2, indica que a una misma UDS corresponden 2 assets
         *
         * - identifierBase representa el sufijo para el identificador de toda UDC/UDS
         *   generada mediante este método
         *
         * - slugBase representa el sufijo para el título de toda UDC/UDS
         *   generada mediante este método
         *
         * - items: que si viene populado, indica que se seleccionó matchear con los udc/uds ya creadas.
         */

          this.inProgress = true;
          this.ingestService.createUDAsFromAssets(uda, pi.assetHookList, formData).then(results => {
            this.inProgress = false;
          });
      }
    });
  }
}
