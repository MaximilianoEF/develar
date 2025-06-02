import { Component, Input, OnInit } from '@angular/core';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';

@Component({
  selector: 'view-contexto',
  templateUrl: './view-contexto.component.html',
  styleUrls: ['./view-contexto.component.scss']
})
export class ViewContextoComponent implements OnInit {

  @Input() ud : UnidadDescripcion;
  constructor() { }

  ngOnInit(): void {
  }

}
