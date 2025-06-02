import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';

const NOTAS: string = "NOTAS";
@Component({
  selector: 'form-notas',
  templateUrl: './form-notas.component.html',
  styleUrls: ['./form-notas.component.scss']
})
export class FormNotasComponent implements OnInit {

  @Input() ud: UnidadDescripcion;
  @Output() value = new EventEmitter<any>();
  public formGroup: FormGroup;

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
      notes: this._fb.array([])
    })
    this.addControls();
  }

  public get notasGet() {
    return this.formGroup.get('notes') as FormArray;
  }

  public addControls() {
    if (this.ud && this.ud.notes && this.ud.notes.length && (this.ud.notes.length > this.notasGet.length)) {
      for(let i = 0; i < this.ud.notes.length; i++){
        const group = this._fb.group({note : [this.ud.notes[i] ? this.ud.notes[i] : ''] });
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

  onSubmit() {
    let arrValue = Array<string>();
    this.formGroup.value.notes.forEach(nota => {
      arrValue.push(nota.note);
    })
    let emit = {
      type: NOTAS,
      value: arrValue
    }
    this.value.emit(emit);
  }

  public closeForm(): void {
    this.closeInputAreaEmitter.emit(true);
  }
}
