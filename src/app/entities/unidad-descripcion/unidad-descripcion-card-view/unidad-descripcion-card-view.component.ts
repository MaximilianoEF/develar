import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VidaQueryHelper } from '../../../agn/vida-query/vida-query.helper';
import { UnidadDescripcionTable } from '../unidad-descripcion.model';

@Component({
  selector: 'unidad-descripcion-card-view',
  templateUrl: './unidad-descripcion-card-view.component.html',
  styleUrls: ['./unidad-descripcion-card-view.component.scss']
})
export class UnidadDescripcionCardViewComponent implements OnInit {
  @Input() uda: UnidadDescripcionTable;
  public primerRenglon: string;
  public archiveId: string;
  public fecha: string;
  public recursoDigital: string;
  public atomSlug: string;

  /** Determina si se muestra o no la thumbnail */
  public shouldDisplayThumbnail: boolean;
  public shouldDisplayDefaultThumbnail: boolean;
  public isUdc: boolean;
  public isUds: boolean;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this.shouldDisplayThumbnail = false;
    this.shouldDisplayDefaultThumbnail = false;
    this.isUdc = false;
    this.isUds = false;
  }

  ngOnInit(): void {
    this.initData();
  }

  private initData() {
    /** Determinar si la UDA tiene thumbnail para mostrar */
    this.shouldDisplayThumbnail = this.uda.assetIds && this.uda.assetIds.length > 0;

    /** Determinar si se muestra el thumbnail por defecto */
    this.shouldDisplayDefaultThumbnail = !this.shouldDisplayThumbnail &&
                                        (this.uda.descriptionlevel === 'Un docum simple' ||
                                          this.uda.descriptionlevel === 'Un docum compuesta');

    this.isUdc = this.uda.descriptionlevel === 'Un docum compuesta';
    this.isUds = this.uda.descriptionlevel === 'Un docum simple';

    this.primerRenglon = this.uda.atomSlug + ' :: ';
    const fecha = this.uda.date ? 'Fecha: ' + this.uda.date : null;

    if (fecha) {
      this.primerRenglon += fecha + ' :: ';
      this.fecha = fecha || '';
    }

    this.primerRenglon += `Recurso: ${VidaQueryHelper.getRecursoListByID(3)}`;
    this.archiveId = this.uda._id || '';
    this.recursoDigital = VidaQueryHelper.getRecursoListByID(3);
    this.atomSlug = this.uda.atomSlug ? 'AtoM slug: ' + this.uda.atomSlug : '';
  }

  public navegarAVistaDetallada(): void {
    // console.log('navigate');
    // this._router.navigate(['/unidad-descripcion/vista-detallada/', this.uda._id]).then();
    this._router.navigate(['vista-detallada', this.uda._id], { relativeTo: this._route }).then();
  }
}
