import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion.helper';
import { ControlDescripcion, UnidadDescripcion } from '../../../unidad-descripcion.model';

const CONTROL_DESCRIPCION: string = 'control-descripcion';
@Component({
  selector: 'control-descripcion',
  templateUrl: './control-descripcion.component.html',
  styleUrls: ['./control-descripcion.component.scss']
})
export class ControlDescripcionComponent implements OnInit {
  @Input() ud: UnidadDescripcion;
  @Output() value = new EventEmitter<any>();
  public formGroup: FormGroup;
  public idiomasList = UnidadDescripcionHelper.getOptionList('idiomas');
  public statusList = UnidadDescripcionHelper.getOptionList('estados_control_descripcion');
  public levelDetailList = UnidadDescripcionHelper.getOptionList('level_detail');
  /** Emite un valor booleano true toda vez que haya que cerrar el área de trabajo de los formularios */
  @Output()
  public closeInputAreaEmitter = new EventEmitter<boolean>();

  constructor(
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup() {
    this.formGroup = this._fb.group({
      description_identifier: [this.ud && this.ud.controlDeLaDescripcion ? this.ud.controlDeLaDescripcion.description_identifier : null],
      institution_identifier: [this.ud && this.ud.controlDeLaDescripcion ? this.ud.controlDeLaDescripcion.institution_identifier : null],
      rules_and_or_conventions_used: [this.ud && this.ud.controlDeLaDescripcion ? this.ud.controlDeLaDescripcion.rules_and_or_conventions_used : null],
      status: [this.ud && this.ud.controlDeLaDescripcion ? this.ud.controlDeLaDescripcion.status : null],
      level_of_detail: [this.ud && this.ud.controlDeLaDescripcion ? this.ud.controlDeLaDescripcion.level_of_detail : null],
      "Dates of creation revision deletion": [this.ud && this.ud.controlDeLaDescripcion ? this.ud.controlDeLaDescripcion['Dates of creation revision deletion'] : null],
      physical_characteristics_and_technical_requirements: [this.ud && this.ud.controlDeLaDescripcion ? this.ud.controlDeLaDescripcion.physical_characteristics_and_technical_requirements : null],
      languages_of_description: [this.ud && this.ud.controlDeLaDescripcion ? this.ud.controlDeLaDescripcion.languages_of_description : []],
      scripts_of_description: [this.ud && this.ud.controlDeLaDescripcion ? this.ud.controlDeLaDescripcion.scripts_of_description : []],
      archivists_notes: this._fb.array([]),
    })
    this.addControls();
  }

  onSubmit() {
    const fvalue = this.formGroup.value;

    let arrValue = Array<string>();
    fvalue.archivists_notes.forEach(nota => {
      arrValue.push(nota.note);
    })
    
    const controlDescripcion = Object.assign(new ControlDescripcion(), fvalue);
    controlDescripcion.archivists_notes = arrValue;
    let emit = {
      type: CONTROL_DESCRIPCION,
      value: controlDescripcion
    }
    this.value.emit(emit);
  }

  public get notasGet() {
    return this.formGroup.get('archivists_notes') as FormArray;
  }

  public addControls() {
    if (this.ud && this.ud.controlDeLaDescripcion && this.ud.controlDeLaDescripcion.archivists_notes && this.ud.controlDeLaDescripcion.archivists_notes.length && (this.ud.controlDeLaDescripcion.archivists_notes.length > this.notasGet.length)) {
      for (let i = 0; i < this.ud.controlDeLaDescripcion.archivists_notes.length; i++) {
        const group = this._fb.group({ note: [this.ud.controlDeLaDescripcion.archivists_notes[i] ? this.ud.controlDeLaDescripcion.archivists_notes[i] : ''] });
        this.notasGet.push(group)
      }
    } else {
      const group = this._fb.group({ note: [''] });
      this.notasGet.push(group);

    }
  }


  public removeControl(): void {
    let index = this.notasGet.length - 1;
    this.notasGet.removeAt(index);
  }

  public closeForm(): void {
    this.closeInputAreaEmitter.emit(true);
  }
}
