import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { SlotTurnoTemplate, SlotTurno } from '../slot-turno.model';
import { SlotTurnoService } from '../slot-turno.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SlotTurnoHelper } from '../slot-turno.helper';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../develar-commons/notifications.service';

@Component({
  selector: 'slot-turno-edit',
  templateUrl: './slot-turno-edit.component.html',
  styleUrls: ['./slot-turno-edit.component.scss']
})
export class SlotTurnoEditComponent implements OnInit {
  @Input()
  public turnoTemplateId: string;
  public entity: SlotTurnoTemplate;
  public isEdit = false;
  public showForm = false;

  /** Formulario */
  public form: FormGroup;
  public slotsArray: FormArray;

  /** Opt lists */
  public dowList = [];
  public sedeList = [];
  public estadosList = [];
  public tipoTurneraList = [];
  public horaList = [];
  public minutosList = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private slotTurnoService: SlotTurnoService,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.initForm();
   }

  ngOnInit(): void {
    this.initOptLists();
    this.showForm = false;

    if (this.turnoTemplateId) {
      this.isEdit = true;
      this.slotTurnoService.findById(this.turnoTemplateId)
        .then((entity) => {
          this.entity = entity;
          this.initForm(this.entity);
          this.showForm = true;
          // Corrige error ExpressionChangedAfterItHasBeenChecked
          this.changeDetector.detectChanges();
        })
        .catch((error) => {
          // this.router.navigate(['..']);
        });
    } else {
      this.showForm = true;
    }
  }

  private initOptLists(): void {
    this.dowList = SlotTurnoHelper.getOptionList('dow');
    this.sedeList = SlotTurnoHelper.getOptionList('sede');
    this.estadosList = SlotTurnoHelper.getOptionList('estado');
    this.tipoTurneraList = SlotTurnoHelper.getOptionList('tipoTurnera');

    // Revisar estos ciclos
    for (let k = 0; k < 24; k++) {
      this.horaList.push(k);
    }

    for (let k = 0; k < 60; k += 15) {
      this.minutosList.push(k);
    }
  }

  private initForm(entity?: SlotTurnoTemplate): void {
    this.form = this.fb.group({
      nombreturno: [entity ? entity.nombreturno : null, Validators.required],
      sede: [entity ? entity.sede : null, Validators.required],
      sala: [entity ? entity.sala : null, Validators.required],
      estado: [entity ? entity.estado : null],
      type: [entity ? entity.type : null, Validators.required],
      description: [entity ? entity.description : null],
      slug: [entity ? entity.slug : null],
      novedad: [entity ? entity.novedad : null],
      slots: this.fb.array([], Validators.required)
    });

    if (entity && entity.slots.length > 0) {
      entity.slots.forEach((token) => {
        const group = this.fb.group({
          _id: [token ? token._id : null],
          dow: [token ? token.dow : null, Validators.required],
          hora_tx: [token ? token.hora_tx : null, [Validators.pattern(/([0-9]{2}):([0-9]{2})/ig), Validators.required]],
          hora: [token ? token.hora : null, Validators.required],
          minutos: [token ? token.minutos : null, Validators.required],
          duracion: [token ? token.duracion : null, Validators.required],
          capacidad: [token ? token.capacidad : null, Validators.required],
          slug: [token ? token.slug : null, Validators.required],
          estado: [ token ? token.estado : null, Validators.required]
        });
        this.slots.push(group);
      });
    }
  }

  public handleAddSlot(): void {
    let group;
    if (this.slots && this.slots.length) {
      const control = this.slots.at(this.slots.length - 1).value;
      group = this.fb.group({ ...control });
    } else {
      group = this.fb.group({
        dow: [null, Validators.required],
        hora_tx: [null, [Validators.pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/), Validators.required]],
        hora: [null, Validators.required],
        minutos: [null, Validators.required],
        duracion: [null, Validators.required],
        capacidad: [null, Validators.required],
        slug: [null, Validators.required],
        estado: [this.form.get('estado').value, Validators.required]
      });
    }
    this.slots.push(group);
  }

  public handleRemoveSlot(i: number): void {
    if (this.slots.at(i)) {
      this.slots.removeAt(i);
    }
  }

  public handleSubmit(): void {
    const turnoTemplate = this.buildSlotTurnoTemplate(this.form);

    if (!this.isEdit) {
      this.slotTurnoService.create(turnoTemplate)
      .then((entity) => {
        this.notificationService.success('Esquema generado satisfactoriamente [%s]'.replace('%s', entity._id));
        this.router.navigate(['..'], { relativeTo: this.route });
      })
      .catch((error) => {
        console.log('ENTITY ERROR: %o', error);
        this.notificationService.error('Error al generar el esquema');
      });
    } else {
    this.slotTurnoService.update(turnoTemplate._id, turnoTemplate)
      .then((entity) => {
        this.notificationService.success('Esquema editado satisfactoriamente [%s]'.replace('%s', entity._id));
        this.router.navigate(['../..'], { relativeTo: this.route });
      })
      .catch((error) => {
        console.log('ENTITY ERROR: %o', error);
        this.notificationService.error('Error al editar el esquema');
      });
    }
  }

  private buildSlotTurnoTemplate(form: FormGroup): SlotTurnoTemplate {
    const entity = new SlotTurnoTemplate();
    const fvalue = form.value;

    if (this.isEdit) {
      entity._id = this.entity._id;
    }

    entity.nombreturno = fvalue.nombreturno;
    entity.sede = fvalue.sede;
    entity.sala = fvalue.sala;
    entity.type = fvalue.type;
    entity.description = fvalue.description;
    entity.slug = fvalue.slug;
    entity.estado = fvalue.estado;
    entity.novedad = fvalue.novedad;

    entity.slots = fvalue.slots.map((slot) => {
      const token = new SlotTurno();

      token.dow = slot.dow;
      token.hora_tx = slot.hora_tx;
      token.hora = slot.hora;
      token.minutos = slot.minutos;
      token.duracion = slot.duracion;
      token.capacidad = slot.capacidad;
      token.slug = slot.slug;

      token.estado = slot.estado;

      token.slotId = slot.slotId;
      return token;
    });

    return entity;
  }

  public handleHoraChange(index: number, horatx: string): void {
    const splitted = horatx.split(':');

    if (splitted.length === 2) {
      this.slots.at(index).get('hora').setValue(splitted[0]);
      this.slots.at(index).get('minutos').setValue(splitted[1]);
    }
    console.log(this.slots.at(index));
  }

  get slots(): FormArray {
    return this.form.get('slots') as FormArray;
  }
}
