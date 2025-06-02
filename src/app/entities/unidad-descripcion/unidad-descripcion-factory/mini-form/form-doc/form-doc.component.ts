import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DocumentacionAsociadaUD, UnidadDescripcion } from '../../../unidad-descripcion.model';


const DOC: string = "DOC";
@Component({
  selector: 'form-doc',
  templateUrl: './form-doc.component.html',
  styleUrls: ['./form-doc.component.scss']
})
export class FormDocComponent implements OnInit {

  @Output()
  value = new EventEmitter<any>();

  @Input()
  ud : UnidadDescripcion;

  public formGroup : FormGroup;

  /** Emite un valor booleano true toda vez que haya que cerrar el área de trabajo de los formularios */
  @Output()
  public closeInputAreaEmitter = new EventEmitter<boolean>();

  constructor(
    private _fb : FormBuilder
  ) { }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(){
    this.formGroup = this._fb.group({
      existence_and_location_of_originals : [this.validarUd() ? this.ud.documentacionAsociada.existence_and_location_of_originals : ''],
      existence_and_location_of_copies : [this.validarUd() ? this.ud.documentacionAsociada.existence_and_location_of_copies : ''],
      related_units_of_description : [this.validarUd() ? this.ud.documentacionAsociada.related_units_of_description : ''],
      related_descriptions : [this.validarUd() ? this.ud.documentacionAsociada.related_descriptions : ''],
      publication_notes : this._fb.array([])
    })
    this.addControls();
  }

  validarUd() : boolean {
    return this.ud && this.ud.documentacionAsociada ? true : false;
  }


  public get notasGet() {
    return this.formGroup.get('publication_notes') as FormArray;
  }

  public addControls() {
    if (this.ud && this.ud.documentacionAsociada && this.ud.documentacionAsociada.publication_notes.length && (this.ud.documentacionAsociada.publication_notes.length > this.notasGet.length)) {
      for(let i = 0; i < this.ud.documentacionAsociada.publication_notes.length; i++){
        const group = this._fb.group({nota : [this.ud.documentacionAsociada.publication_notes[i] ? this.ud.documentacionAsociada.publication_notes[i] : ''] });
        this.notasGet.push(group)
      }
    } else {
      const group = this._fb.group({ nota: [''] });
      this.notasGet.push(group);

    }
  }

  public removeControl(): void {
    let index = this.notasGet.length - 1;
    this.notasGet.removeAt(index);
  }

  onSubmit(){
    let doc = this.formGroup.value as DocumentacionAsociadaUD;
    let arrValue = Array<string>();
    this.formGroup.value.publication_notes.forEach(nota => {
      arrValue.push(nota.nota);
    })
    doc.publication_notes = [];
    doc.publication_notes = arrValue;

    let emit = {
      type : DOC,
      value : doc
    }
    this.value.emit(emit);
  }

  public closeForm(): void {
    this.closeInputAreaEmitter.emit(true);
  }
}
