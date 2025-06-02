import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion.helper';
import { ContenidoYEstructura, UnidadDescripcion } from '../../../unidad-descripcion.model';

const CONTENIDO: string = "CONTENT";
@Component({
  selector: 'form-contenido',
  templateUrl: './form-contenido.component.html',
  styleUrls: ['./form-contenido.component.scss']
})
export class FormContenidoComponent implements OnInit {
  @Input() ud : UnidadDescripcion;
  @Output() value = new EventEmitter<any>();
  public formGroup: FormGroup;
  public actionsList = UnidadDescripcionHelper.getOptionList('actionsContentAndStructure');
  public arreglosList = UnidadDescripcionHelper.getOptionList('arreglos')


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
      scope_and_content : [this.ud && this.ud.contenidoYEstructura ? this.ud.contenidoYEstructura.scope_and_content : null],
      contenido: [this.ud && this.ud.contenidoYEstructura ? this.ud.contenidoYEstructura.contenido : null],
      action : [this.ud && this.ud.contenidoYEstructura ? this.ud.contenidoYEstructura.action : null],
      appraisal_destruction_and_scheduling : [this.ud && this.ud.contenidoYEstructura ? this.ud.contenidoYEstructura.appraisal_destruction_and_scheduling : null],
      isAcumulacion : [this.ud && this.ud.contenidoYEstructura ? this.ud.contenidoYEstructura.isAcumulacion : false],
      accruals : [this.ud && this.ud.contenidoYEstructura ? this.ud.contenidoYEstructura.accruals : null],
      especificaciones : this._fb.array([])
    })
    this.addControls();
  }

  public get especificacionesGet() {
    return this.formGroup.get('especificaciones') as FormArray;
  }

  public removeControl(): void {
    let index = this.especificacionesGet.length - 1;
    this.especificacionesGet.removeAt(index);
  }

  public addControls(): void {
    if (this.ud && this.ud.contenidoYEstructura && this.ud.contenidoYEstructura.especificaciones && this.ud.contenidoYEstructura.especificaciones.length && (this.ud.contenidoYEstructura.especificaciones.length > this.especificacionesGet.length)) {
      for (let i = 0; i < this.ud.contenidoYEstructura.especificaciones.length; i++) {
        //c onsole.log(this.ud.contenidoYEstructura.especificaciones[i])
        const group = this._fb.group({
          type: [this.ud.contenidoYEstructura.especificaciones[i].type ? this.ud.contenidoYEstructura.especificaciones[i].type : null],
          system_of_arrangement : [this.ud.contenidoYEstructura.especificaciones[i].system_of_arrangement]
        });
        this.especificacionesGet.push(group);
      }
    } else {
      const group = this._fb.group({
        type: [''],
        system_of_arrangement: ['']
      });
      this.especificacionesGet.push(group);
    }
  }


  onSubmit() {
    let fvalue = this.formGroup.value as ContenidoYEstructura;
    if(!fvalue.isAcumulacion){
      fvalue.accruals = null;
      this.ud.contenidoYEstructura.accruals = null;
    }
    let emit = {
      type: CONTENIDO,
      value: fvalue
    }
    this.value.emit(emit);
  }

  public closeForm(): void {
    this.closeInputAreaEmitter.emit(true);
  }
}
