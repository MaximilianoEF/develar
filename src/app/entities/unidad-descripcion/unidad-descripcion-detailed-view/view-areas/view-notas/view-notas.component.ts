import { Component, Input, OnInit } from '@angular/core';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';

@Component({
  selector: 'view-notas',
  templateUrl: './view-notas.component.html',
  styleUrls: ['./view-notas.component.scss']
})
export class ViewNotasComponent implements OnInit {

  @Input() ud : UnidadDescripcion;
  constructor() { }

  ngOnInit(): void {
  }

}
