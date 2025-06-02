import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { devutils } from '../../../../develar-commons/utils';
import { TechMachine } from '../../tech-machine.model';
import { TechMachineService } from '../../tech-machine.service';
import { TechMachineHelper } from '../../tech-machine.helper';
import { Router } from '@angular/router';

@Component({
  selector: 'tech-machine-factory-edit',
  templateUrl: './tech-machine-factory-edit.component.html',
  styleUrls: ['./tech-machine-factory-edit.component.scss']
})
export class TechMachineFactoryEditComponent implements OnInit {

  @Output() emitSaveChanges = new EventEmitter<TechMachine>();
  public tm$ : BehaviorSubject<TechMachine>;
  public formGroup : FormGroup;
  public typeDigitalizacionesList : any[];

  constructor(private _fb : FormBuilder,
    private _techMachineService : TechMachineService,
    private _router : Router) {
      this.tm$ = this._techMachineService.tm$;
      this.typeDigitalizacionesList = TechMachineHelper.getOptionList('typeDigitalizaciones');
     }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(){
    let tm = this.tm$.value;
    this.formGroup = this._fb.group({
      cod_machine : [tm && tm.cod_machine ? tm.cod_machine : null, Validators.required],
      slug : [tm && tm.slug ? tm.slug : null],
      descripcion : [tm && tm.descripcion ? tm.descripcion : null],
      marca : [tm && tm.marca ? tm.marca : null],
      modelo : [tm && tm.modelo ? tm.modelo : null],
      fecha : [tm && tm.fe_incorporacion_tx ? new Date(tm.fe_incorporacion_ts) : null],
      software : [tm && tm.software ? tm.software : null],
      version_software : [tm && tm.version_software ? tm.version_software : null],
      type_digitalizacion : [tm && tm.type_digitalizacion ? tm.type_digitalizacion : null],
      usos : [tm && tm.usos ? tm.usos : null]
    })
  }

  public onSubmit(){
    let fvalue = this.formGroup.value;
    let techMachine = new TechMachine();
    Object.assign(techMachine, fvalue);
    delete techMachine['fecha'];
    techMachine.fe_incorporacion_tx = devutils.datePickerToTx(fvalue.fecha);
    techMachine.fe_incorporacion_ts = devutils.datePickerToNum(fvalue.fecha);
    this.emitSaveChanges.emit(techMachine)
  }

  public goToBrowse() {
    this._router.navigate(['/develar','maquinaria']);
  }

}
