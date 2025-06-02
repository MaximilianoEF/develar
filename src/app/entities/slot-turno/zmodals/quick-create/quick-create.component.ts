import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SlotTurnoHelper } from '../../slot-turno.helper';
import { SlotTurnoTemplate } from '../../slot-turno.model';
import { MatDialogRef } from '@angular/material/dialog';

const SLOTTURNO_INACTIVO = 'inactivo';

@Component({
  selector: 'app-quick-create',
  templateUrl: './quick-create.component.html',
  styleUrls: ['./quick-create.component.scss']
})
export class QuickCreateComponent implements OnInit {
  public form: FormGroup;

  public sedeList = [];
  public estadosList = [];
  public tipoTurneraList = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<QuickCreateComponent>
  ) { }

  ngOnInit(): void {
    this.initOptLists();
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombreturno: [null, Validators.required],
      sede: [null, Validators.required],
      sala: [null, Validators.required],
      type: [null, Validators.required],
      slug: [null, Validators.required]
    });
  }

  private initOptLists(): void {
    this.sedeList = SlotTurnoHelper.getOptionList('sede');
    this.estadosList = SlotTurnoHelper.getOptionList('estado');
    this.tipoTurneraList = SlotTurnoHelper.getOptionList('tipoTurnera');
  }

  public handleSubmit(): void {
    const entity = new SlotTurnoTemplate();
    const fvalue = this.form.value;

    entity.nombreturno = fvalue.nombreturno;
    entity.sede = fvalue.sede;
    entity.sala = fvalue.sala;
    entity.type = fvalue.type;
    entity.slug = fvalue.slug;
    /** Por defecto, inactivo; es una turnera que falta perfeccionar */
    entity.estado = SLOTTURNO_INACTIVO;

    this.dialogRef.close(entity);
  }
}
