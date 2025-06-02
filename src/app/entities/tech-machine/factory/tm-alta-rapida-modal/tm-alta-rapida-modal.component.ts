import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { devutils } from '../../../../develar-commons/utils';
import { TechMachineHelper } from '../../tech-machine.helper';
import { TechMachine } from '../../tech-machine.model';

@Component({
  selector: 'tm-alta-rapida-modal',
  templateUrl: './tm-alta-rapida-modal.component.html',
  styleUrls: ['./tm-alta-rapida-modal.component.scss']
})
export class TmAltaRapidaModalComponent implements OnInit {

  public formGroup : FormGroup;
  public typeDigitalizacionesList : any[];
  constructor(public dialogRef : MatDialogRef<TmAltaRapidaModalComponent>,
    private _fb : FormBuilder) {
      this.typeDigitalizacionesList = TechMachineHelper.getOptionList('typeDigitalizaciones');
     }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(){
    this.formGroup = this._fb.group({
      cod_machine : [null, Validators.required],
      slug : [null],
      fecha : [null, Validators.required],
      type_digitalizacion : [null],
      usos : [null]
    })
  }

  public onSubmit() : void {
    let fvalue = this.formGroup.value;
    let techMachine = new TechMachine();
    Object.assign(techMachine, fvalue);
    delete techMachine['fecha'];
    techMachine.fe_incorporacion_tx = devutils.datePickerToTx(fvalue.fecha);
    techMachine.fe_incorporacion_ts = devutils.datePickerToNum(fvalue.fecha);
    this.dialogRef.close(techMachine);
  }

}
