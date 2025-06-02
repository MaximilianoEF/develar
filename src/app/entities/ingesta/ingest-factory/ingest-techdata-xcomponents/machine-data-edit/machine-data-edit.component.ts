import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { UnidadDescripcionHelper } from '../../../../unidad-descripcion/unidad-descripcion.helper';
import { UnidadDescripcionService } from '../../../../unidad-descripcion/unidad-descripcion.service';
import { IngestProcess } from '../../../ingesta.model';
import { IngestaService } from '../../../ingesta.service';
import { IngestProxy, UnidadDescripcion } from '../../../../unidad-descripcion/unidad-descripcion.model';
import { NotificationService } from '../../../../../develar-commons/notifications.service';
@Component({
  selector: 'machine-data-edit',
  templateUrl: './machine-data-edit.component.html',
  styleUrls: ['./machine-data-edit.component.scss']
})
export class MachineDataEditComponent implements OnInit {

  @Output() public onEmitSaveChanges = new EventEmitter<IngestProcess>();
  @Output() public emitCancelar  = new EventEmitter<boolean>();
  public pi$ : BehaviorSubject<IngestProcess>;
  public uda$ : BehaviorSubject<UnidadDescripcion>;
  public formGroup : FormGroup;
  
  
  constructor(
              private _fb : FormBuilder, 
              private _service : IngestaService,
              private _serviceUD : UnidadDescripcionService,
              private _notificationService: NotificationService

      ){ 
        this.pi$ = this._service.pi$;
        this.uda$ = this._service.ud$;
  }

  ngOnInit(): void {

    let currentPi  = this.pi$.value;
    this.initGroup(currentPi);

    this.processUda();   
    
  }

  private async processUda(){

    let currentPi = this.pi$.value;
    if(currentPi.udaHook && currentPi.udaHook.udaId){
      this._serviceUD.fetchProcedureTxt(currentPi.udaHook.udaId).subscribe(result => {
        if (result) {
          currentPi.ingestPlan.indicacionesTxt = UnidadDescripcionHelper.buildProcedureTxt(result);
          this.initGroup(currentPi);
        }
      })
  
    }else {
      this._notificationService.warn('No se ha definido un UDA')
    }
  }

  // private updatePI(currentPi : IngestProcess) : void {
  //   this._service.update(currentPi._id, currentPi).then( piUpdated => {
  //     this._service.pi$.next(piUpdated);
  //     this.formGroup.get('indicacionesTxt').setValue(piUpdated.ingestPlan.indicacionesTxt);
  //     this.formGroup.get('indicacionesTxt').disable();
  //   })
  // }

  private initGroup(currentPi: IngestProcess ) : void {
    this.formGroup = this._fb.group({
      dpi : [currentPi && currentPi.ingestPlan ? currentPi.ingestPlan.dpi : null],
      informeTxt : [currentPi && currentPi.ingestPlan ? currentPi.ingestPlan.informeTxt : null],
      indicacionesTxt : [currentPi && currentPi.ingestPlan && currentPi.ingestPlan.indicacionesTxt ? currentPi.ingestPlan.indicacionesTxt : 'No hay información desde el área archivística']
    })

    this.formGroup.get('indicacionesTxt').disable();
  }

  public onSubmit() : void {
    let currentPi = this.pi$.value;
    let fvalue = this.formGroup.value;

    currentPi.ingestPlan.informeTxt = fvalue.informeTxt;
    currentPi.ingestPlan.dpi = fvalue.dpi;

    this.onEmitSaveChanges.emit(currentPi);
  }

  public onEmitCancelar() : void {
    this.emitCancelar.emit(false);
  }

}
