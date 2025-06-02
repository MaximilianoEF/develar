import { Component, OnInit } from '@angular/core';
import { async } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorityRecord } from '../../../authority-record/authority-record.model';
import { AuthorityRecordService } from '../../../authority-record/authority-record.service';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';
import { UnidadDescripcion } from '../../unidad-descripcion.model';
import { UnidadDescripcionService } from '../../unidad-descripcion.service';

import { gldef } from '../../../../develar-commons/develar.config';
import { NotificationService } from '../../../../develar-commons/notifications.service';
@Component({
  selector: 'unidad-descripcion-detailed-view-page',
  templateUrl: './unidad-descripcion-detailed-view-page.component.html',
  styleUrls: ['./unidad-descripcion-detailed-view-page.component.scss']
})
export class UnidadDescripcionDetailedViewPageComponent implements OnInit {

  public idUD: string;
  public ud: UnidadDescripcion;
  public startView: boolean = false;
  public atomSlug: string;
  public subTitle: string;
  public reference_code: string = '';
  public defaultLeyenda: string = "Vista no disponible, faltan completar datos minimos e indispensables";
  

  constructor(private _route: ActivatedRoute, 
              private _service: UnidadDescripcionService,
              private _router: Router,
              private _notificationService: NotificationService
  ){
    this.idUD = this._route.snapshot.params.id;
  }

  ngOnInit(): void {
    this.initOnce();
  }

  private initOnce() : void {
    this._service.findById(this.idUD).then(ud => {
      if (ud) {
        this.ud = ud;
        this.startView = true;
        this.atomSlug = UnidadDescripcionHelper.atomSlug(this.ud);
        this.reference_code = UnidadDescripcionHelper.buildReferenceCode(this.ud.identificador.reference_code);
        this.subTitle =
          this.getLabel(
            this.ud.identificador.level_of_description
          ) +
          ' :: ' +
          this.ud.identificador.title;
 
      }
    })
  }

  

  public getLabel(val: string): string {
    return UnidadDescripcionHelper.getOptionLabel('descriptionLevel', val);
  }

  public goToEdit() {
    this._router.navigate(['../..', 'factory', this.idUD], { relativeTo: this._route }).then();
  }


  public refreshUdaDialog(): void {
    modalConfig.data.caption = modalConfig.data.caption.replace('[%s]', this.ud.atomSlug);
    this._notificationService.openModalDialog(modalConfig)
    .subscribe(result => {
      if(result)
        this._service.fetchUDAFromAtoMSlug(this.ud.atomSlug).subscribe(
          result => {
            if(result){
              this._notificationService.success(`Sincronización de ${result.atomSlug} exitosa.`);
              this.initOnce();
            }
          }
        )
    })
  }

}

const modalConfig = {
  hasBackdrop: true,
  backdropClass: 'yellow-backdrop',
  data: {
    caption: 'Sincronización de [%s] con AtoM',
    body: '¿Está seguro que desea sincronizar este registro con AtoM?',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    },
    cancel: {
      action: 'cancel',
      label: 'Cancelar'
    }
  }
};
