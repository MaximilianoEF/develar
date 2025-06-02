import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {ChildrenUD, UnidadDescripcion} from '../../unidad-descripcion.model';

const IDENTIFICADOR: string = "IDENT";
const CONTEXTO: string = "CONTEXTO";
const CONTENIDO: string = "CONTENT";
const CONDICIONES: string = "CONDICIONES";
const DOC: string = "DOC";
const NOTAS : string = "NOTAS";
const DESCRIPTION: string = "DESCR";
const JERARQUIA : string = "JERARQUIA";
const ADMINISTRACION: string = "ADMINISTRACION";
const PUNTOSACCESO: string = "PUNTOSACCESO";
@Component({
  selector: 'unidad-descripcion-input-area',
  templateUrl: './unidad-descripcion-input-area.component.html',
  styleUrls: ['./unidad-descripcion-input-area.component.scss']
})
export class UnidadDescripcionInputAreaComponent implements OnInit, OnChanges {

  @Input() actionSelected: string = "";
  @Input() referenceCodeTx : string;

  @Input()
  ud: UnidadDescripcion;

  @Input()
  udChildrens: ChildrenUD[] = [];


  /** Emite un valor booleano true toda vez que haya que cerrar el área de trabajo de los formularios */
  @Output()
  public closeInputAreaEmitter = new EventEmitter<boolean>();


  @Output() emitForms = new EventEmitter<any>();
  @Output() udSelected = new EventEmitter<UnidadDescripcion>();
  public formGroup: FormGroup;

  public showIdentForm: boolean = false;
  public showCondicionesForm: boolean = false;
  public showContextForm: boolean = false;
  public showContenidoForm: boolean = false;
  public showDocForm: boolean = false;
  public showNotasForm : boolean = false;
  public showDescrForm: boolean = false;
  public showJerarquia : boolean = false;
  public showAdministracion: boolean = false;
  public showPuntosAcceso: boolean = false;
  /** Emite el identificador ingresado en el formulario de área de identificación */
  @Output()
  identifierEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(private _fb: FormBuilder) { }

  ngOnInit(): void {
    this.showForm();
  }

  ngOnChanges() {
    this.showForm();
  }


  private showForm() {
    this.hideAllForms();
    switch (this.actionSelected) {
      case IDENTIFICADOR: { this.showIdentForm = true; break; };
      case CONDICIONES: { this.showCondicionesForm = true; break; };
      case CONTEXTO : { this.showContextForm = true; break ;};
      case CONTENIDO : { this.showContenidoForm = true; break;};
      case DOC : { this.showDocForm = true; break;};
      case NOTAS : { this.showNotasForm = true ; break;}
      case DESCRIPTION : { this.showDescrForm = true; break;};
      case JERARQUIA : { this.showJerarquia = true ; break;};
      case ADMINISTRACION: { this.showAdministracion = true; break};
      case PUNTOSACCESO: {this.showPuntosAcceso = true; break;};
    }
  }

  hideAllForms() {
    this.showIdentForm = false;
    this.showCondicionesForm = false;
    this.showContextForm = false;
    this.showContenidoForm = false;
    this.showDocForm = false;
    this.showDescrForm = false;
    this.showNotasForm = false;
    this.showJerarquia = false;
  }


  formValue(event) {
    this.emitForms.emit(event);
  }

  emitir(event : UnidadDescripcion){
    this.udSelected.emit(event);
  }

  public updateIdentifier(identifier: string): void {
    this.identifierEmitter.emit(identifier);
  }

  /**
   * Re-emite el valor recibido, de manera que el mismo llegue al componente parent (unidad-descripcion-page)
   * que es quien determina si se debe renderizar o no la input-area (contenedora de los mini-forms)
   * @param value true para cerrar el input-area
   */
  public handleCloseInputArea(value: boolean): void {
    this.closeInputAreaEmitter.emit(value);
  }
}
