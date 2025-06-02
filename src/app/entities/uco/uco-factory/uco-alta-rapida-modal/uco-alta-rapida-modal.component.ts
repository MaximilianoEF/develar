import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Uco } from '../../uco.model';

@Component({
  selector: 'uco-alta-rapida-modal',
  templateUrl: './uco-alta-rapida-modal.component.html',
  styleUrls: ['./uco-alta-rapida-modal.component.scss']
})
export class UcoAltaRapidaModalComponent implements OnInit {

  public formGroup : FormGroup;
  constructor(public dialogRef : MatDialogRef<UcoAltaRapidaModalComponent>,
    private _fb : FormBuilder) {
     }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(){
    this.formGroup = this._fb.group({
      cod_uco : [null, Validators.required],
      slug : [null, Validators.required],
      descripcion : [null],
    })
  }

  public onSubmit() : void {
    let fvalue = this.formGroup.value;
    let techMachine = new Uco();
    Object.assign(techMachine, fvalue);
    this.dialogRef.close(techMachine);
  }

}
