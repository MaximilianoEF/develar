import { Component, Input, OnInit } from '@angular/core';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion.helper';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';

@Component({
  selector: 'view-contenido-estructura',
  templateUrl: './view-contenido-estructura.component.html',
  styleUrls: ['./view-contenido-estructura.component.scss']
})
export class ViewContenidoEstructuraComponent implements OnInit {

  @Input() ud : UnidadDescripcion;
  
  constructor() { }

  ngOnInit(): void {
  }

  public getLabel(type : string, val : string) : string {
    return UnidadDescripcionHelper.getOptionLabel(type, val)
  }

}
