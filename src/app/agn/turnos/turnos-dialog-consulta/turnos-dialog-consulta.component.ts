import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ConsultasHelper } from '../../consultas/consulta.helper';


@Component({
  selector: 'app-agn-turnos-dialog-consulta',
  templateUrl: './turnos-dialog-consulta.component.html',
  styleUrls: ['./turnos-dialog-consulta.component.scss']
})
export class TurnosDialogConsultaComponent implements OnInit {
  public form: FormGroup;

  public consultaTypeList = [];
  description_tmpl = `Solicito turno para consultar:
  Fondo documental:
  Tipo de soporte (foto/ documento /audio /video...):
  Fechas aproximadas del material a consultar: 
  `

  constructor(
    private _fb: FormBuilder,
    public dialogRef: MatDialogRef<TurnosDialogConsultaComponent>
  ) {
    this.consultaTypeList = ConsultasHelper.getOptionlist('consultaType');

    this.form = this._fb.group({
      type: [{value: 'consultaturno', disabled: true }],
      description: [this.description_tmpl, Validators.required]
    });
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close({
      result: true,
      data: this.form.getRawValue()
    });
  }
}
