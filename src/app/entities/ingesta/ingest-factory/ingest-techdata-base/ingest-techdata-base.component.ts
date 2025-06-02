import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { TechMachineHelper } from '../../../tech-machine/tech-machine.helper';
import { TechMachine } from '../../../tech-machine/tech-machine.model';
import { TechMachineService } from '../../../tech-machine/tech-machine.service';
import { IngestParams, IngestPlan, IngestProcess } from '../../ingesta.model';
import { IngestaService } from '../../ingesta.service';

const CONFIRMATION_TECHDATA_MODAL_CONFIG = {
  data: {
    caption: '¡Acción no permitida!',
    body: 'Está intentando editar los datos técnicos cuando el PI está aprobado.',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};
@Component({
  selector: 'ingest-techdata-base',
  templateUrl: './ingest-techdata-base.component.html',
  styleUrls: ['./ingest-techdata-base.component.scss']
})
export class IngestTechdataBaseComponent implements OnInit {

  @Output() onEmitUpdate = new EventEmitter<IngestProcess>();
  public machines : TechMachine[];
  public pi$ : BehaviorSubject<IngestProcess>;
  public formGroup : FormGroup;
  public showParamsMachine : boolean = false;
  public showForm : boolean = false;

  constructor(private _machineService : TechMachineService,
              private _ingestService : IngestaService,
              private _fb : FormBuilder,
              private _notificationService: NotificationService
  ){
      this.pi$ = this._ingestService.pi$;
   }

  ngOnInit(): void {

    this.initGroup();
    // this.pi$.subscribe(pi => {
    //   if(pi && pi.ingestPlan && pi.ingestPlan.ingestParams){
    //     this.formGroup.get('tech_machine').setValue(pi.ingestPlan.ingestParams.machineId);
    //   }
    // })
  }

  private async initGroup() {
    this.machines = await this._machineService.findAll();
    let currentPi = this.pi$.value;
    this.formGroup = this._fb.group({
      tech_machine : [currentPi && currentPi.ingestPlan && currentPi.ingestPlan.ingestParams && currentPi.ingestPlan.ingestParams.machineCod ? this.machines.find( m => m.cod_machine == currentPi.ingestPlan.ingestParams.machineCod).cod_machine : null]
    })
    this.showForm = true;
  }

  public onSelectionChange() : void {
    if(this.pi$.value && this.pi$.value.admin.avanceList.includes('aprobado')) {
      this._notificationService.openModalDialog(CONFIRMATION_TECHDATA_MODAL_CONFIG);
    } else {
      let machineSelected = this.machines.find(m => m.cod_machine == this.formGroup.value.tech_machine);
      let ingestParams = new IngestParams();
      ingestParams.machineId = machineSelected._id;
      ingestParams.machineSlug = machineSelected.slug;
      ingestParams.machineTypeDigitalizacion = machineSelected.type_digitalizacion;
      ingestParams.machineCod = machineSelected.cod_machine;

      let currentPI = this.pi$.value;
      currentPI.ingestPlan = currentPI.ingestPlan ? currentPI.ingestPlan : new IngestPlan();
      currentPI.ingestPlan.ingestParams = ingestParams;

      this.onEmitSaveChanges(currentPI);
    }
  }

  public getLabel(type : string, val : string) : string {
    return TechMachineHelper.getOptionLabel(type, val);
  }

  public showPM() : void{
    this.showParamsMachine = !this.showParamsMachine;
    //c onsole.log(!pi +"  "+ !pi.ingestPlan +"  "+ !pi.ingestPlan.ingestParams +"  "+ !pi.ingestPlan.ingestParams.machineCod)
  }

  public onEmitSaveChanges(currentPi : IngestProcess) : void {
    this.onEmitUpdate.emit(currentPi);
    this.showParamsMachine = !this.showParamsMachine;
  }



}
