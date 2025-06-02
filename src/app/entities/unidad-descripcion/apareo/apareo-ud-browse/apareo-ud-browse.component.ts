import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';
import { UnidadDescripcion, UnidadDescripcionQuery } from '../../unidad-descripcion.model';
import { UnidadDescripcionService } from '../../unidad-descripcion.service';

@Component({
  selector: 'apareo-ud-browse',
  templateUrl: './apareo-ud-browse.component.html',
  styleUrls: ['./apareo-ud-browse.component.scss']
})
export class ApareoUdBrowseComponent implements OnInit {

  @Output() emitQuery: EventEmitter<UnidadDescripcionQuery>;
  public unidadesDocumentales$: Observable<UnidadDescripcion[]>;
  public formGroup: FormGroup;
  public levelOfDescriptionList: any[];
  public actionUdaList: any[];
  constructor(
              private _fb: FormBuilder,
              private _serviceUD: UnidadDescripcionService,
  ) {
    this.emitQuery = new EventEmitter<UnidadDescripcionQuery>();
    this.actionUdaList = UnidadDescripcionHelper.getOptionList('actionsOfUDA');
    this.levelOfDescriptionList = UnidadDescripcionHelper.getOptionList('descriptionLevel');
  }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup() {
    this.formGroup = this._fb.group({
      term: ['', [Validators.required, Validators.minLength(1)]],
      descriptionLevel: [''],
      type: ['', Validators.required],
      actionId: ['', Validators.required]
    })
  }

  public search(): void {
    const fvalue = this.formGroup.value;
    let search = fvalue.term;
    let split1 = search && search.split('-')
    let split2 = search && search.split(' ')

    const query = new UnidadDescripcionQuery();
    if (fvalue.descriptionLevel && fvalue.descriptionLevel !== 'no_definido') {
      /** Se intenta filtrar por nivel de descripción */
      query.descriptionlevel = fvalue.descriptionLevel;
    }
    if (split1 && split1.length > 1) {
      // se pasó un código de referencia con guiones
      query.codigo_referencia_exact = split1.join(' ');

    } else if (split2 && split2.length > 1) {
      // se pasó un código de referencia con espacios
      query.codigo_referencia_exact = split2.join(' ');

    } else if (search) {
      // se pasó un identifier, va solito
      query.codigo_referencia = search;
    }


    /** Vamos a setear que va a ser una query que va a excluir estos terminos
     *  si es que se cargan
     */
    if(fvalue.type)
      query.type = fvalue.type;
    
    if(fvalue.actionId)
      query.actionId = fvalue.actionId;
    

    this.emitQuery.emit(query);
  }


  public getReferenceCode(reference_code: string[]) : string {
    return UnidadDescripcionHelper.buildReferenceCode(reference_code);
  }

  public getLabel(type: string, val: string): string {
    return UnidadDescripcionHelper.getOptionSlug(type, val);
  }


}
