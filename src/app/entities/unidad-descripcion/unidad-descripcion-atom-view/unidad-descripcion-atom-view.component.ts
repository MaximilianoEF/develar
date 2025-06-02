import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { UnidadDescripcionHelper } from '../unidad-descripcion.helper';
import { UdAssets, UnidadDescripcion } from '../unidad-descripcion.model';
import { UnidadDescripcionService } from '../unidad-descripcion.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'unidad-descripcion-atom-view',
  templateUrl: './unidad-descripcion-atom-view.component.html',
  styleUrls: ['./unidad-descripcion-atom-view.component.scss']
})
export class UnidadDescripcionAtomViewComponent implements OnInit {

  public idUD: string;
  public ud: UnidadDescripcion;
  public startView: boolean = false;
  public atomSlug: string;
  public subTitle: string;
  public reference_code: string = '';
  public childrensTree$: Observable<UdAssets[]>;

  constructor(private _route: ActivatedRoute,
              private _service: UnidadDescripcionService,
              private _location: Location
  ){
    this.idUD = this._route.snapshot.params.id;
  }

  ngOnInit(): void {
    this._route.params.subscribe(result => {
      if (result) {
        this.idUD = result.id;
        this.initOnce();
      }
    })
  }

  private initOnce() : void {
    this._service.findById(this.idUD).then(ud => {
      if (ud) {
        this.ud = ud;
        this.startView = true;

        if(this.ud.identificador && this.ud.identificador.reference_code && this.ud.identificador.reference_code.length)
          this.reference_code = UnidadDescripcionHelper.buildReferenceCode(this.ud.identificador.reference_code);

          this.subTitle =
          this.getLabel('descriptionLevel',
            this.ud.identificador.level_of_description
          ) +
          ' :: ' +
          this.ud.identificador.title;

        this.childrensTree$ = this._service.buildChildrenTreeCollectingAssetFromUdaId(this.idUD);
      }
    });
  }

  public getLabel(type: string, val: string): string {
    return UnidadDescripcionHelper.getOptionLabel(type, val);
  }

  public returnToPrevious(): void {
    this._location.back();
  }
}
