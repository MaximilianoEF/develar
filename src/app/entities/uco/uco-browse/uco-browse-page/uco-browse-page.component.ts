import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { SharedService } from '../../../../develar-commons/shared-service';
import { UcoModalService } from '../../uco-modal.service';
import { UcoService } from '../../uco.service';
import { UcoHelper } from '../../uco.helper';
@Component({
  selector: 'uco-browse-page',
  templateUrl: './uco-browse-page.component.html',
  styleUrls: ['./uco-browse-page.component.scss'],
  providers : [UcoModalService]
})
export class UcoBrowsePageComponent implements OnInit {

  public pageTitle = 'Gestión de unidades de conservación';
  public showData = false;

  constructor(
    private _service: UcoService,
    private sharedService: SharedService,
    private _modalsService : UcoModalService,
    private _route : ActivatedRoute,
    private _router : Router,
    private _notification : NotificationService
  ) {
    this.sharedService.emitChange(this.pageTitle);
  }

  ngOnInit(): void {
  }

  public fetchUco(query: any): void {
    this._service.findByQuery(query)
      .subscribe(items => {
        if (items && items.length > 0) {
          this._service.dataRecordsSource.next(UcoHelper.buildUcoTableData(items))
          this.showData = true;
        } else {
          this.showData = false;
        }
      });
  }

  /**
   * Abre el modal de alta rápida de UCO
   *
   *
   */
  public openQuickCreateModal(): void {
    const dialogRef = this._modalsService.setupAltaRapidaUcoModal();

    dialogRef.subscribe(techmachine => {
      if (techmachine) {
        this._service.create(techmachine).then(result => {
          if(result){
            this._service.uco$.next(result);
            this._router.navigate(['factory',result._id], {relativeTo: this._route}).then();
            this._notification.success("Alta exitosa ["+result.cod_uco+"]")
          }
        });
      }
    });
  }

}
