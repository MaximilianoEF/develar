import { Component, Input, OnInit } from '@angular/core';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';

@Component({
  selector: 'view-documentacion-asociada',
  templateUrl: './view-documentacion-asociada.component.html',
  styleUrls: ['./view-documentacion-asociada.component.scss']
})
export class ViewDocumentacionAsociadaComponent implements OnInit {

  @Input() ud : UnidadDescripcion;
  constructor() { }

  ngOnInit(): void {
  }

}
