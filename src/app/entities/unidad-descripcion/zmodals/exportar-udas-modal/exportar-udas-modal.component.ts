import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';

const TIPO_REPORTE_PREDETERMINADO = 'ATOM-ALTA';

@Component({
  selector: 'exportar-udas-modal',
  templateUrl: './exportar-udas-modal.component.html',
  styleUrls: ['./exportar-udas-modal.component.scss']
})
export class ExportarUdasModalComponent implements OnInit {

  public tiposExportaciones: any[];
  public form: FormGroup;
  constructor(
                public dialogRef: MatDialogRef<ExportarUdasModalComponent>,
                private _fb: FormBuilder
  ) {
    this.tiposExportaciones = UnidadDescripcionHelper.getOptionList('tiposExportaciones');
  }

  ngOnInit(): void {
    this._initGroup();
  }

  private _initGroup(): void {
    this.form = this._fb.group({
      reporte: [TIPO_REPORTE_PREDETERMINADO, Validators.required]
    })
  }

  onSubmit(): void {
    const fvalue = this.form.value;
    this.dialogRef.close(fvalue.reporte);
  }

}
