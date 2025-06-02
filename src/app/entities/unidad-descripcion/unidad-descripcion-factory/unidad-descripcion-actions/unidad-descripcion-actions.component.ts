import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'unidad-descripcion-actions',
  templateUrl: './unidad-descripcion-actions.component.html',
  styleUrls: ['./unidad-descripcion-actions.component.scss']
})
export class UnidadDescripcionActionsComponent implements OnInit {

  @Output()
  emitActionSelected : EventEmitter<string> = new EventEmitter<string>();

  public isEdit: boolean = false;
  public udaId: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.isEdit = !!this._route.snapshot.params.id;

    if (this.isEdit) {
      this.udaId = this._route.snapshot.params.id;
    }
  }

  emitAction(action: string): void {
    this.emitActionSelected.emit(action);
  }

  public navigateToBrowser(): void {
    this._router.navigate(['unidad-descripcion']).then();
  }

  public navigateToDetailedView(): void {
    this._router.navigate(['unidad-descripcion', 'vista-detallada', this.udaId]).then();
  }
}
