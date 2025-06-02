import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {IngestaService} from '../../ingesta.service';
import {IngestProcess} from '../../ingesta.model';
import {IngestaModalService} from '../ingesta-modal.service';
import {Asset} from '../../../../develar-commons/develar-entities';
import {IngestaHelper} from '../../ingesta.helper';
import {AssetService} from '../../../../develar-commons/asset.service';

const IN_PROGRESS = { val: '', estado: 'inprogress' };
const COMPLETO = { val: '', estado: 'completo' };
const ASSETS: string = 'assets';
const THUMBNAIL: string = 'thumbnail';
const DERIVADA: string = 'derivada';
@Component({
  selector: 'ingest-rootfolder-panel',
  templateUrl: './ingest-rootfolder-panel.component.html',
  styleUrls: ['./ingest-rootfolder-panel.component.scss'],
  providers: [IngestaModalService]
})
export class IngestRootfolderPanelComponent implements OnInit {
  /* Representa la UDC actualmente seleccionada (se almacena en el service) */
  public pi$: BehaviorSubject<IngestProcess>;
  public pi: IngestProcess;
  /* Representa el listado de assets contruidos a partir de una carpeta de ingesta
   *  seleccionada
   */
  public assetTree$: BehaviorSubject<Asset[]>;

  /* Carpeta (localPath) activa */
  public currentLocalPath: string;

  @Output() public showAssetPanelEmitter: EventEmitter<boolean>;
  private isAssetPanelVisible = false;

  private server: string;

  /** Gestor de estados */
  private estadosCI$: BehaviorSubject<any[]>;

  /** Botonera */
  public estadosBotonera: any[] = [
    { val: 'assets',      label: 'Creando Assets',     slug: 'Ver Assets' },
    { val: 'thumbnail',   label: 'Crear Thumbnails',   slug: 'Thumbnails creados' },
    { val: 'derivada',    label: 'Crear Derivadas',    slug:  'Derivadas creadas' },
  ]

  public inProgressDerivada$: BehaviorSubject<boolean>;
  public inProgressThumbnail$: Subject<boolean>;
  public inProgressAssets$: BehaviorSubject<boolean>;
  public derivadaProgressInfo$: BehaviorSubject<string>;
  public thumbnailProgressInfo$: BehaviorSubject<string>;
  constructor(
              private _ingestaService: IngestaService,
              private _ingestaModalService: IngestaModalService,
              private assetService: AssetService
  ) {
    this.pi$ = this._ingestaService.pi$;
    this.assetTree$ = this._ingestaService.assetTree$;

    this.showAssetPanelEmitter = new EventEmitter<boolean>();
    this.estadosCI$ = this._ingestaService.estadosCI$;
    this.inProgressDerivada$ = this._ingestaService.inProgressDerivada$;
    this.inProgressThumbnail$ = this._ingestaService.inProgressThumbnail$;
    this.inProgressAssets$ = this._ingestaService.inProgressAssets$;
    this.derivadaProgressInfo$ = this._ingestaService.derivadaProgressInfo$;
    this.thumbnailProgressInfo$ = this._ingestaService.thumbnailProgressInfo$;
  }

  ngOnInit(): void {
    this.pi$.subscribe(pi => {
      if (pi) {
        this.pi = pi;
        this.currentLocalPath = pi.ingestFolder.path;
        this.server = pi.ingestFolder.server;
        const estados = this._ingestaService.estadosCI$.value;

        if(pi.assetList && pi.assetList.length) {
          const stateComplete = {...COMPLETO};
          stateComplete.val = ASSETS;
          estados.push(stateComplete);
        } else {
          const in_progress = {...IN_PROGRESS};
          in_progress.val = ASSETS;
          estados.push(in_progress);
        }
        if(pi.ingestFolder.hasDerivadas) {
          const stateComplete = {...COMPLETO};
          stateComplete.val = DERIVADA;
          estados.push(stateComplete);
        }

        if(pi.ingestFolder.hasThumbnails) {
          const stateComplete = {...COMPLETO};
          stateComplete.val = THUMBNAIL;
          estados.push(stateComplete);
        }
        this._ingestaService.estadosCI$.next(estados);
      }
    });
  }

  public openTreeViewModal(): void {
    const treeData = this._ingestaService.pi$.value.assetList;

    this._ingestaModalService.setupIngestFolderTreeViewModal(treeData).subscribe(result => {
      if (result) {
      } else {
      }
    });
  }

  private refreshAssetTree(): void {
    const pi = this.pi$.value;

    if (pi) {
      /** Vuelve al backend y escanea nuevamente la carpeta de ingesta...
       * (esto popula el subject assetTree en el ingestaService)
       */
      this._ingestaService.getAssetTree(this.currentLocalPath, this.server)
        .subscribe(assetList => {

          if (pi.assetList && pi.assetList.length > 0) {
            this.assetService.deleteMany(pi.assetList).then();
          }

          /** Almacena la lista de assets, colgándolos del PI */
          pi.assetList = assetList;

          pi.assetHookList = IngestaHelper.buildAssetHookList(pi.assetList);

          /** Grabamos asset-list y asset-hooks en el PI (Mongo) */
          this._ingestaService.update(pi._id, pi)
            .then(updatedPi => this._ingestaService.pi$.next(updatedPi));

          /** Almacena los assets en su colección propia */
          this.assetService.createMany(pi.assetList).then();
        });
    }
  }

  public panelHandler(val: string): void {
    if(val === ASSETS) {
      this.isAssetPanelVisible = !this.isAssetPanelVisible;
      this.showAssetPanelEmitter.emit(this.isAssetPanelVisible);

    } else if( val === THUMBNAIL && !this.workInProgress(THUMBNAIL) ) { //&& !this.isCompleteState(THUMBNAIL)
      /** Esto ejecuta el método _initProcessThumbnail de ingest-master-panel */
      this._ingestaService.inProgressThumbnail$.next(true);
      this._ingestaService.initProcessThumbnail$.next(true);
    
    } else if (val === DERIVADA && !this.workInProgress(DERIVADA) ) { //&& !this.isCompleteState(DERIVADA)
      /** Esto ejecuta el método _initProcessDerivada de ingest-master-panel */
      this._ingestaService.inProgressDerivada$.next(true);
      this._ingestaService.initProcessDerivada$.next(true);
    }
  }

  public showLabelOrSlug(val : string) : string{

    const estado = this.estadosBotonera.find(f => f.val === val);
    return this.isCompleteState(val) ? estado.slug : estado.label;

  }

  public workInProgress(val: string): boolean {
    const estados = this.estadosCI$.value;
    const estadosVal = estados.filter(f => f.val === val);
    return estadosVal.find(f => f.val === val && f.estado === 'inprogress') && !estadosVal.some(f => f.estado === 'completo');
  }

  public isCompleteState(val: string): boolean {

    const estados = this.estadosCI$.value;
    const estadosVal = estados.filter(f => f.val === val);
    return estadosVal.some(f => f.estado === 'completo');
  }

  public notInState(val: string): boolean {
    const estados = this.estadosCI$.value;
    return !estados.some(f => f.val === val);
  }
}
