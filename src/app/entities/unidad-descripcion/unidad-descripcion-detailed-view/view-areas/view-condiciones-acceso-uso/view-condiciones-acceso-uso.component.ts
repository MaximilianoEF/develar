import { Component, Input, OnInit } from '@angular/core';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion.helper';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';

@Component({
  selector: 'view-condiciones-acceso-uso',
  templateUrl: './view-condiciones-acceso-uso.component.html',
  styleUrls: ['./view-condiciones-acceso-uso.component.scss']
})
export class ViewCondicionesAccesoUsoComponent implements OnInit {

  @Input() ud : UnidadDescripcion;
  constructor() { }

  ngOnInit(): void {
  }

   public getLabel(type : string, val : string) : string {
    return UnidadDescripcionHelper.getOptionLabel(type, val);
  }

}
