import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion.helper';
import { AccesoYUsoUD, UnidadDescripcion } from '../../../unidad-descripcion.model';
const CONDICIONES: string = "CONDICIONES";
@Component({
  selector: 'form-condiciones',
  templateUrl: './form-condiciones.component.html',
  styleUrls: ['./form-condiciones.component.scss']
})
export class FormCondicionesComponent implements OnInit {

    @Input() ud : UnidadDescripcion;
    @Output() value = new EventEmitter<any>();
    public formGroup : FormGroup;
    public idiomasList = UnidadDescripcionHelper.getOptionList('idiomas');
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
        conditions_governing_access : [this.ud && this.ud.accesoYUso ? this.ud.accesoYUso.conditions_governing_access : null],
        conditions_governing_reproduction : [this.ud && this.ud.accesoYUso ? this.ud.accesoYUso.conditions_governing_reproduction : null],
        languages_of_material : [this.ud && this.ud.accesoYUso ? this.ud.accesoYUso.languages_of_material : []],
        scripts_of_material : [this.ud && this.ud.accesoYUso ? this.ud.accesoYUso.scripts_of_material : []],
        notas : [this.ud && this.ud.accesoYUso ? this.ud.accesoYUso.notas : null],
        physical_characteristics_and_technical_requirements : [this.ud && this.ud.accesoYUso ? this.ud.accesoYUso.physical_characteristics_and_technical_requirements : null],
        finding_aids : [this.ud && this.ud.accesoYUso ? this.ud.accesoYUso.finding_aids : null]
      })
    }

    onSubmit(){
      let fvalue = this.formGroup.value as AccesoYUsoUD ;
      let emit = {
        type : CONDICIONES,
        value : fvalue
      }
      this.value.emit(emit);
    }

    public closeForm(): void {
      this.closeInputAreaEmitter.emit(true);
    }
  }
