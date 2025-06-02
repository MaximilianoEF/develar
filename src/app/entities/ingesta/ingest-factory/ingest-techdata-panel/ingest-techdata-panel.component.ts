import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { IngestaHelper } from '../../ingesta.helper';
import { IngestProcess } from '../../ingesta.model';
import { IngestaService } from '../../ingesta.service';
import { IngestaModalService } from '../ingesta-modal.service';

@Component({
  selector: 'ingest-techdata-panel',
  templateUrl: './ingest-techdata-panel.component.html',
  styleUrls: ['./ingest-techdata-panel.component.scss'],
  providers : [IngestaModalService]
})
export class IngestTechdataPanelComponent implements OnInit {

  @Output() emitDatosTecnicos = new EventEmitter<boolean>(false);
  public fontStyleControl = new FormControl();
  private showDT : boolean = false;
  public pi$ : BehaviorSubject<IngestProcess>;
  public nivelesAvanceList : any[];
  private progressSubscription: Subscription;
  public _workInProgress = '';

  public progressInfo$: Subject<String> = new Subject<string>();

  constructor(
          private _ingestaService : IngestaService,
          private _modalSrv: IngestaModalService,
          private _notificationService : NotificationService
  ) {
      this.pi$ = this._ingestaService.pi$;
      this.nivelesAvanceList = IngestaHelper.getOptionList('nivelesAvance');
    }

  ngOnInit(): void {
    this._ingestaService.updateAdminUsersList()
  }

  public showDatosTecnicos() : void {
    this.showDT = !this.showDT;
    this.emitDatosTecnicos.emit(this.showDT);
  }


  public showLabelOrSlug(type : string, val : string) : string{
    let currentPi = this.pi$.value;

    if(currentPi.admin && currentPi.admin.avanceList && currentPi.admin.avanceList.length){
      let avance = currentPi.admin.avanceList.find( f => f == val);
      if(avance){
        return IngestaHelper.getOptionSlug(type, val);
      }else{
        return IngestaHelper.getOptionLabel(type, val);
      }
    }

    return IngestaHelper.getOptionLabel(type, val);

  }

  private jobProgressFollowUp(jobtype: string){
    if(!this.progressSubscription){
      this.progressSubscription = this._ingestaService.queueProgress().subscribe(list => {
        if(list && list.length){
          let token = list[0];
          this.progressInfo$.next(`${token.identifier}: ${token.queue}  [${token.progress}]`);
          let final = list.find( token => token.progress == 999999);
          if (final){
            this._workInProgress = ''
            this.progressInfo$.next(`${final.identifier}: ${final.queue}  [${final.progress}]`);
            this.progressSubscription.unsubscribe();
          }
        }
      })
    }
  }

  public workFlowManager(val : string) : void {
    let currentPi = this.pi$.value;
    this._workInProgress = ''

    if(this.progressSubscription){
      this.progressSubscription.unsubscribe()
      this.progressSubscription = null;
    }

    // 'aprobado', 'manifiesto', 'bagit', 'ingesta', 'cerrado'
    if(val === 'aprobado'){
      let errorMsg = this._ingestaService.changeStateToAprovalVerify(currentPi)
      this._modalSrv.setupAprobacionModal(currentPi, 'Aprobar Proceso de Ingesta (PI)', 'Confirme la APROBACIÓN del PI. Una vez aprobado, ya no se admiten modificaciones. ATENCIÓN: Esta opción no puede ser revertida.', errorMsg).subscribe(confirm =>{
        if(confirm){
          this._workInProgress = 'aprobado'

          this._ingestaService.markProcessAsAproved(currentPi, val).then(pi => {
            this._workInProgress = ''
          });

        }
      });

    }else if(val === 'manifiesto'){
      let errorMsg = this._ingestaService.changeStateToManifiestoVerify(currentPi)
      this._modalSrv.setupAprobacionModal(currentPi, 'Anexar MANIFIESTO en carpeta raiz', 'Agrega este Parte de Ingesta (PI) a la carpeta contenedora.', errorMsg).subscribe(confirm =>{
        if(confirm){
          this._workInProgress = 'manifiesto';

          this._ingestaService.addManifiestoToRootFolder(currentPi, val).then(pi => {
            this._workInProgress = ''
          });

        }
      });

    }else if(val === 'bagit'){
      let errorMsg = this._ingestaService.changeStateToBagit(currentPi)
      this._modalSrv.setupAprobacionModal(currentPi, 'Empaquetado BAGIT', 'Envuelve la carpeta de INGESTA con metadatos para el control de integridad', errorMsg).subscribe(confirm =>{
        if(confirm){
          this._workInProgress = 'bagit';
          this.jobProgressFollowUp('bagit')
          this._ingestaService.addBagitToRootFolder(currentPi, val);
        }
      });

    }else if(val === 'ingesta'){
      let errorMsg = this._ingestaService.changeStateToIngesta(currentPi)
      // Dependiendo del tipo de parte de ingesta (master/derivada) hay que invocar a un proceso u otro
      let message = '';
      if (currentPi.admin.tipoParte === 'master') {
        message = 'Rsync de la carpeta de INGESTA al área de MASTER';
      } else {
        message = 'Rsync de la carpeta de INGESTA al área de DERIVADAS';
      }

      this._modalSrv.setupAprobacionModal(currentPi, 'Proceso de INGESTA', message, errorMsg).subscribe(confirm =>{
        if(confirm){
          this._workInProgress = 'ingesta';
          this.jobProgressFollowUp('ingesta')

          this._ingestaService.ingestRootFolder(currentPi, val);
        }
      });
    }

  }


  private editPI(pi : IngestProcess) : void {

    this._ingestaService.update(pi._id, pi).then(result => {
      this._ingestaService.pi$.next(result);
      this._notificationService.success("Edición de información técnica exitosa");
    })
  }

  public includeInList(val : string) : boolean {
    let currentPi = this.pi$.value;
    let avance = currentPi.admin.avanceList.find( f => f == val);

    return avance && avance !== currentPi.admin.avance ? true : false;
  }

  public isActualState(val : string) : boolean {

    let currentPi = this.pi$.value;
    return (currentPi.admin.avance == val && this._workInProgress !== val) ? true : false;
  }

  public workInProgress(val: string): boolean {
    //, 'en_proceso', 'aprobado', 'manifiesto', 'bagit', 'ingesta', 'cerrado'

    return this._workInProgress == val ? true : false;
  }

  public isEndState() : boolean {

    let currentPi = this.pi$.value;
    return currentPi.admin.estado === 'cerrado' ? true : false;
  }
}
