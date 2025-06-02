import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IngestaModalService } from '../ingesta-modal.service';
import { IngestaHelper } from '../../ingesta.helper';
import { IngestProxy, MinimalChildren, UnidadDescripcion } from '../../../unidad-descripcion/unidad-descripcion.model';
import { IngestaService } from '../../ingesta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IngestFolder, IngestProcess, ScanFolder, UcoProxy, UdaHook } from '../../ingesta.model';
import { UnidadDescripcionService } from '../../../unidad-descripcion/unidad-descripcion.service';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion/unidad-descripcion.helper';
import { AssetService } from '../../../../develar-commons/asset.service';
import { UcoModalService } from '../../../uco/uco-modal.service';
import { take } from 'rxjs/operators';
import { Asset } from '../../../../develar-commons/develar-entities';

const CONFIRMATION_MODAL_CONFIG = {
  data: {
    caption: '¡Acción no permitida!',
    body: 'Está intentando cambiar la carpeta contenedora teniendo UDC/UDS ya creadas.<br>Desvincule las mismas para realizar esta acción.',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

const CONFIRMATION_UDA_MODAL_CONFIG = {
  data: {
    caption: '¡Acción no permitida!',
    body: 'Está intentando cambiar la UDA cuando el PI está aprobado.',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

const CONFIRMATION_SLUG_MODAL_CONFIG = {
  data: {
    caption: '¡Acción no permitida!',
    body: 'Está intentando editar el SLUG del PI cuando el mismo ya fue aprobado.',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

const CONFIRMATION_UCO_MODAL_CONFIG = {
  data: {
    caption: '¡Acción no permitida!',
    body: 'Está intentando cambiar las UCOs cuando el PI está aprobado.',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

const IN_PROGRESS = { val: '', estado: 'inprogress' };
const COMPLETO = { val: '', estado: 'completo' };
const ASSETS: string = 'assets';
const DERIVADA: string = 'derivada';
const THUMBNAIL: string = 'thumbnail';
@Component({
  selector: 'ingest-master-panel',
  templateUrl: './ingest-master-panel.component.html',
  styleUrls: ['./ingest-master-panel.component.scss'],
  providers: [IngestaModalService, UcoModalService]
})
export class IngestMasterPanelComponent implements OnInit {

  public ud$: BehaviorSubject<UnidadDescripcion>;
  public pi$: BehaviorSubject<IngestProcess>;
  public scan$: BehaviorSubject<ScanFolder>;
  public udChildren: Array<MinimalChildren> = [];

  private _progressSubscriptionDerivada: Subscription;
  private _progressSubscriptionThumbnail: Subscription;
  private _pi: IngestProcess;

  constructor(
              private _ingestaModalService: IngestaModalService,
              private _ingestaService: IngestaService,
              private assetService: AssetService,
              private _router: Router,
              private _route: ActivatedRoute,
              private _udService: UnidadDescripcionService,
              private _notificationService: NotificationService,
              private _ucoModalService: UcoModalService
  ) {
    this.ud$ = new BehaviorSubject<UnidadDescripcion>(null);
    this.pi$ = new BehaviorSubject<IngestProcess>(null);
    this.scan$ = new BehaviorSubject<ScanFolder>(null);
  }

  ngOnInit(): void {
    this.ud$ = this._ingestaService.ud$;
    this.pi$ = this._ingestaService.pi$;

    this.ud$.subscribe(ud => {
      if (ud) {
        /* udChildren contiene los contadores de la cantidad de hijos de cada tipo que la UD contiene */
        this._udService.getUdaChildrenList(ud._id)
          .pipe(
            take(1)
          )
          .subscribe((childrenList) => this.udChildren = UnidadDescripcionHelper.buildUdaChildrenCounters(childrenList));
      }
    });

    this.pi$.subscribe(pi => {
      if (pi) {
        this._pi = pi;
        if (pi.ingestFolder && pi.ingestFolder.path) {
          this._ingestaService.getResumenFromFolder(pi.ingestFolder.path, pi.ingestFolder.server).subscribe(result => {
            this.scan$.next(result);
          });
        }
      }
    });

    this._ingestaService.initProcessDerivada$
    .subscribe(init => {
      if (init) {
        console.log("Init processDerivada")
        this._initProcessDerivada();
      }
    });

    this._ingestaService.initProcessThumbnail$.subscribe(init => {
      if (init) {
        this._initProcessThumbnail();
      }
    });
  }

  public openBrowserUDAModal(): void {
    if (this._pi && this._pi.admin.avanceList.includes('aprobado')) {
      this._notificationService.openModalDialog(CONFIRMATION_UDA_MODAL_CONFIG);
    } else {
      this._ingestaModalService.setupBrowserUDModal().subscribe(udaSelected => {
        if (udaSelected) {
          let pi = this.pi$.value;
          if (pi) {
            let piMinimal = new IngestProxy();
            piMinimal.ingestProcessId = pi._id;
            piMinimal.slug = pi.slug;
            piMinimal.compNum = pi.admin.compNum;
            if (this.isNotMemberOfIngestArray(udaSelected, piMinimal)) {
              udaSelected.ingest.push(piMinimal);
              this.updateUD(udaSelected);
            } else {
              this.updateProcessIngestHook(udaSelected)
            }
          }
        }
      })
    }
  }

  private isNotMemberOfIngestArray(uda: UnidadDescripcion, token: IngestProxy): boolean {
    let isNotMember = true;
    if (!(uda.ingest && uda.ingest.length)) {
      uda.ingest = [];
      return isNotMember;
    }
    return uda.ingest.find(t => t.ingestProcessId === token.ingestProcessId) ? !isNotMember : isNotMember;

  }

  private updateUD(ud: UnidadDescripcion): void {
    this._udService.update(ud).then(udaUpdated => {
      this.updateProcessIngestHook(udaUpdated)
      this._ingestaService.ud$.next(udaUpdated);
    });
  }

  private updateProcessIngestHook(ud: UnidadDescripcion): void {
    let currentPi = this.pi$.value;
    currentPi.udaHook = new UdaHook(ud);
    this.updatePi('Se ha vinculado la UDA con éxito', currentPi);
  }

  public getCodRef(ud: UnidadDescripcion): string {
    return IngestaHelper.getDecoratedCodigoReferencia(ud);
  }

  public openScanFolderMoldal() {
    const pi = this.pi$.value;
    if (pi.udaList && pi.udaList.length) {
      this._notificationService.openModalDialog(CONFIRMATION_MODAL_CONFIG);
    }
    else {
      const pathInfo = {
        rootPath: pi.ingestFolder && pi.ingestFolder.server ? pi.ingestFolder.server : null,
        path: pi.ingestFolder && pi.ingestFolder.path ? pi.ingestFolder.path : null
      }

      this._ingestaModalService.setupAltaRapidaCarpetaRaizModal(pathInfo).subscribe(content => {
        if (content) {
          /** Limpiamos los estados anteriores de la carpeta de ingesta */
          this._cleanStatesAndPrepareProcess();
          this.scan$.next(content.scan);

          /** Genera un nuevo objeto 'ingestFolder' donde el path es lo escrito por el usuario en el textbox del modal de selección
           *  de carpeta (me viene en la key 'payload')
           */
          let _ingestFolder = new IngestFolder(content.payload);

          _ingestFolder = IngestaHelper.buildIngestFolder(_ingestFolder, content);

          if (this._pi) {
            let pi = this._pi;
            pi.ingestFolder = _ingestFolder;

            /** Marcamos que no tiene derivadas ni thumbnails */
            pi.ingestFolder.hasDerivadas = false;
            pi.ingestFolder.hasThumbnails = false;

            this._ingestaService.update(pi._id, pi).then(result => {
              this._ingestaService.pi$.next(result);
              /** Primero eliminamos los assets antiguos */
              if (pi.assetList && pi.assetList.length > 0) {
                this.assetService.deleteMany(pi.assetList).then();
              }


              /**  La vinculación resultó exitosa; construimos el asset-tree */
              this._ingestaService.getAssetTree(pi.ingestFolder.path, pi.ingestFolder.server).subscribe(assetList => {
                if (assetList && assetList.length > 0) {
                  this.completeProcessAssetsAndUpdate(assetList, pi).then(result => {
                  }).catch(error => {
                  });
                }
              });
            });
          }
        }
      });
    }
  }

  private completeProcessAssetsAndUpdate(assetList: Asset[], pi: IngestProcess): Promise<any> {
    const promise = new Promise( async (resolve, reject) => {
      if (assetList) {
        try {

          // assetList = assetList.map(item => {
          //    item.hasThumbnail = true;
          //    item.hasDerivada = pi.admin.tipoParte !== 'derivada';
          //    return item;
          // });

          pi.assetList = assetList;
          pi.assetHookList = IngestaHelper.buildAssetHookList(pi.assetList);
          /** Grabamos los assets */
          await this.assetService.createMany(pi.assetList)

          this._setCompleteState(ASSETS);

          this._ingestaService.inProgressAssets$.next(false);
          /** Grabamos asset-list y asset-hooks en el PI (Mongo) */
          const updatedPi = await this._ingestaService.update(pi._id, pi)

          this._ingestaService.pi$.next(updatedPi);


          this._notificationService.success('Carpeta vinculada correctamente a PI');

          resolve(true);

        } catch (error) {
          console.error("error --> %o",error);
          this._notificationService.error(`Se ha producido un error inesperado`);
          reject(error);
        }

      }
    })
    return promise;
  }


  private _cleanStatesAndPrepareProcess(): void {
    this._ingestaService.estadosCI$.next([]);
    this._ingestaService.inProgressAssets$.next(true);
          /** Ponemos el estado de assets inprogress */
    this._inProgressState(ASSETS);
  }

  private _setCompleteState(val: string): void {
    const completeAsset = { ...COMPLETO };
    completeAsset.val = val;
    const estadosCI = this._ingestaService.estadosCI$.value;
    estadosCI.push(completeAsset);
    this._ingestaService.estadosCI$.next(estadosCI);
  }


  private _inProgressState(val: string): void {
    const in_progress = { ...IN_PROGRESS };
    in_progress.val = val;
    const estadosCI = this._ingestaService.estadosCI$.value;
    estadosCI.push(in_progress)
    this._ingestaService.estadosCI$.next(estadosCI);
  }

  private async _initProcessDerivada() {
    if (this._pi.admin.tipoParte !== DERIVADA) {
      this._inProgressState(DERIVADA);
      this.jobDerivadaProgressFollowUp(DERIVADA);
      await this._ingestaService.buildDerivadasForIngestFolder(this._pi);
    }
  }

  private _initProcessThumbnail() {

    this._inProgressState(THUMBNAIL);
    /** Generación de thumbnails con las imágenes de la ingest-folder */
    this.jobThumbnailProgressFollowUp(THUMBNAIL);

    this._ingestaService.buildThumbnailsForIngestFolder(this._pi);
  }

  public openUcoModal(): void {
    if (this._pi && this._pi.admin.avanceList.includes('aprobado')) {
      this._notificationService.openModalDialog(CONFIRMATION_UCO_MODAL_CONFIG);
    } else {
      this._ucoModalService.setupBrowseUcoModal(this.pi$.value).subscribe(result => {
        if (result) {
          this.updatePi("Se ha vinculado la UCO exitosamente", result)
        }
      })
    }
  }

  public removedUco(uco: UcoProxy): void {
    let currentPi = this.pi$.value;
    currentPi.ucos = currentPi.ucos.filter(f => f.id_uco != uco.id_uco);
    this.updatePi("Se ha retirado la UCO exitosamente", currentPi);
  }

  private updatePi(msj: string, pi: IngestProcess) {
    this._ingestaService.update(pi._id, pi).then(piUpdated => {
      this._ingestaService.pi$.next(piUpdated);
      this._notificationService.success(msj);
    })

  }

  public openViewUco(uco: UcoProxy): void {
    this._ucoModalService.openViewModal(uco.id_uco);
  }

  public goToEditView(id: string): void {
    this._router.navigate(['/unidad-descripcion', 'factory', id]).then();
  }

  public getEstadoLabel(val: string): string {
    return IngestaHelper.getOptionSlug('nivelesAvance', val);
  }

  public getTipoParteLabel(val: string): string {
    return IngestaHelper.getOptionLabel('tipoParte', val);
  }

  public returnToBrowser(): void {
    this._router.navigate(['../..'], { relativeTo: this._route }).then();
  }


  private jobThumbnailProgressFollowUp(jobtype: string) {
    if (!this._progressSubscriptionThumbnail) {

      this._progressSubscriptionThumbnail = this._ingestaService.thumbnailQueueProgress().subscribe(list => {

        if (list && list.length) {
            let token = list[0];
            this._ingestaService.thumbnailProgressInfo$.next(`${token.identifier}: ${token.queue}  [${token.progress}]`);
            let final = list.find(token => token.progress == 999999);

            if (final) {
              this._setCompleteState(THUMBNAIL);

              this._ingestaService.inProgressThumbnail$.next(false);
              this._ingestaService.thumbnailProgressInfo$.next(`${final.identifier}: ${final.queue}  [${final.progress}]`);
              this._progressSubscriptionThumbnail.unsubscribe();
              this._progressSubscriptionThumbnail = null;
              /** Como finalizó el proceso, los thumbnail ya fueron creados. */
              this._pi.ingestFolder.hasThumbnails = true;
              this._pi.assetList = this._pi.assetList.map(item => {
                item.hasThumbnail = true;
                return item;
              })
              /** Ponemos en false al behavior */
              this._ingestaService.initProcessThumbnail$.next(false);
              this._ingestaService.update(this._pi._id, this._pi).then(result => {
                //c onsole.log("ACTUALIZACIÓN DE ASSET LIST")
              });
            }

          }
        })
    }
  }

  private jobDerivadaProgressFollowUp(jobtype: string) {
    if (!this._progressSubscriptionDerivada) {
      this._progressSubscriptionDerivada = this._ingestaService.derivadaQueueProgress()
        .subscribe(list => {
          if (list && list.length) {
            let token = list[0];
            this._ingestaService.derivadaProgressInfo$.next(`${token.identifier}: ${token.queue}  [${token.progress}]`);
            let final = list.find(token => token.progress == 999999);
            if (final) {
              this._ingestaService.derivadaProgressInfo$.next(`${final.identifier}: ${final.queue}  [${final.progress}]`);
              this._setCompleteState(DERIVADA);
              this._ingestaService.inProgressDerivada$.next(false);
              this._progressSubscriptionDerivada.unsubscribe();
              this._progressSubscriptionDerivada = null;
              /** Como finalizó el proceso, los thumbnail ya fueron creados. */

              this._pi.ingestFolder.hasDerivadas = true;
              this._pi.assetList = this._pi.assetList.map(item => {
                item.hasDerivada = this._pi.admin.tipoParte !== 'derivada';
                return item;
              });
              /** Ponemos en false al behavior */
              this._ingestaService.initProcessDerivada$.next(false);
              this._ingestaService.update(this._pi._id, this._pi).then(result => {
                //c onsole.log("Actualización de assetList completa")
              });
            }
          }
        })
    }
  }

  public editSlug(): void {
    if (this._pi && this._pi.admin.avanceList.includes('aprobado')) {
      this._notificationService.openModalDialog(CONFIRMATION_SLUG_MODAL_CONFIG);
    } else {
      this._ingestaModalService.setupEditSlugModal(this._pi.slug)
      .subscribe(slug => {
        if(slug) {
          this._pi.slug = slug;
          this.updatePi('Slug actualizado éxitosamente',this._pi);
        }
      })
    }
  }
}
