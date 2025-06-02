import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ConsultaHelper } from '../../../../entities/consultas/consulta.helper';
import { UserWebService } from '../../../../entities/userweb/user-web.service';

@Component({
  selector: 'add-pase-consulta-modal',
  templateUrl: './add-pase-consulta-modal.component.html',
  styleUrls: ['./add-pase-consulta-modal.component.scss']
})
export class AddPaseConsultaModalComponent implements OnInit {

  public formGroup : FormGroup;
  constructor(
    public dialogRef: MatDialogRef<AddPaseConsultaModalComponent>,
    private _fb: FormBuilder,
    private _user : UserWebService) { }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(): void {
    this.formGroup = this._fb.group({
      novedad_tx : [null, [Validators.minLength(6), Validators.required]]
    })
  }

  public onSubmit():void {
    const fvalue = this.formGroup.value;
    const pase = ConsultaHelper.generarPaseFromAddPase(fvalue.novedad_tx, this._user.currentUser);
    this.dialogRef.close(pase);
  }

}
