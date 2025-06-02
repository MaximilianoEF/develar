import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IngestaService } from '../../ingesta.service';
import { IdentificadorUD, UnidadDescripcion } from '../../../unidad-descripcion/unidad-descripcion.model';
import {UnidadDescripcionService} from '../../../unidad-descripcion/unidad-descripcion.service';

@Component({
  selector: 'unidad-documental-simple',
  templateUrl: './unidad-documental-simple.component.html',
  styleUrls: ['./unidad-documental-simple.component.scss']
})
export class UnidadDocumentalSimpleComponent implements OnInit {

  public udc$: BehaviorSubject<UnidadDescripcion>;
  //public udc: UnidadDescripcion;
  public countLinkedDigitalResources: number;
  public countUnLinked: number;
  public showData: boolean = false;
  public changeIcon : boolean = false;
  public countChildrenUDS : number = 0;

  constructor(
    private _service: IngestaService,
    private _unidadDescripcionService: UnidadDescripcionService
  ) {
    this.udc$ = this._service.ud$;
  }

  ngOnInit(): void {

    this.udc$.subscribe(udc => {
      if (udc) {

        // if (udc.children && udc.children.length) {
        //   let arrAux = new Array<UnidadDescripcion>();
        //   arrAux = udc.children.filter(c => c.level_of_description === 'item').map(token => {
        //     let ud = new UnidadDescripcion();
        //     ud.identificador = new IdentificadorUD();
        //     ud.identificador.identifier = token.identifier;
        //     ud.identificador.level_of_description = token.level_of_description;
        //     ud.identificador.title = token.title;
        //     ud._id = token.id_children;
        //
        //     return ud;
        //   })
        //   //this._service.dataRecordsSource.next(IngestaHelper.buildUnidadDocumentalSimpleTable(arrAux));
        //   this.countChildrenUDS = arrAux.length;
        //   this.showData = true;
        // }
        // this.udc = udc;
        // this.countLinkedDigitalResources = IngestaHelper.countLinkedDigitalResources(this.udc);
        this.countLinkedDigitalResources = 0;
        // this.countUnLinked = this.udc.uds.length - this.countLinkedDigitalResources;
        this.countUnLinked = 0;
      }
    });
  }

}
