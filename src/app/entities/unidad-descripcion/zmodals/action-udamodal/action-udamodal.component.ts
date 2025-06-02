import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';

@Component({
  selector: 'action-udamodal',
  templateUrl: './action-udamodal.component.html',
  styleUrls: ['./action-udamodal.component.scss']
})
export class ActionUDAModalComponent implements OnInit {

  public form: FormGroup;
  public actionUDAList: any[];
  constructor(
              private _fb: FormBuilder,
              public dialogRef: MatDialogRef<ActionUDAModalComponent>
  ){ 
    this.actionUDAList = UnidadDescripcionHelper.getOptionList('actionsOfUDA');
  }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(): void {
    this.form = this._fb.group({
      type: ['', Validators.required],
      actionId: ['', Validators.required]
    })
  }

  public onSubmit(): void {
    const fvalue = this.form.value;
    this.dialogRef.close(fvalue);
  }

}
