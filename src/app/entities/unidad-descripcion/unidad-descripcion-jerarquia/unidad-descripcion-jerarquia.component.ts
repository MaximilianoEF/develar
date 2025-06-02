import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { UnidadDescripcionHelper } from '../unidad-descripcion.helper';
import { JerarquiaUD,  UnidadDescripcion } from '../unidad-descripcion.model';
import { UnidadDescripcionService } from '../unidad-descripcion.service';

@Component({
  selector: 'unidad-descripcion-jerarquia',
  templateUrl: './unidad-descripcion-jerarquia.component.html',
  styleUrls: ['./unidad-descripcion-jerarquia.component.scss']
})
export class UnidadDescripcionJerarquiaComponent implements OnInit {
  @Input()
  ud: UnidadDescripcion;

  /** Emite un valor booleano true toda vez que haya que cerrar el área de trabajo de los formularios */
  @Output()
  public closeInputAreaEmitter = new EventEmitter<boolean>();

  results: Array<JerarquiaUD[]>;


  constructor(
    private _service: UnidadDescripcionService
  ) { }


  ngOnInit(): void {
    this._service.fetchJerarquia(this.ud._id).subscribe(jerarquia => {
      this.results = UnidadDescripcionHelper.buildJerarquiaView(jerarquia);
    })
  }

  public closeForm(): void {
    this.closeInputAreaEmitter.emit(true);
  }
}
