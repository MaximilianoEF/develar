import { Component, Input, OnInit } from '@angular/core';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion.helper';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';

@Component({
  selector: 'view-identificacion',
  templateUrl: './view-identificacion.component.html',
  styleUrls: ['./view-identificacion.component.scss']
})
export class ViewIdentificacionComponent implements OnInit {

  @Input() public ud : UnidadDescripcion;

  constructor() { }

  ngOnInit(): void {
  }

  public getLabel(type : string, val : string) : string {
    return UnidadDescripcionHelper.getOptionLabel(type,val);
  }

}
