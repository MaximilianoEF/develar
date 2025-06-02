import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { SharedService } from '../../../develar-commons/shared-service';
import { TechMachineModalService } from '../tech-machine-modal.service';
import { TechMachineHelper } from '../tech-machine.helper';
import { TechMachineService } from '../tech-machine.service';

@Component({
  selector: 'tech-machine-browse-page',
  templateUrl: './tech-machine-browse-page.component.html',
  styleUrls: ['./tech-machine-browse-page.component.scss'],
  providers : [TechMachineModalService]
})
export class TechMachineBrowsePageComponent implements OnInit {

  public pageTitle = 'Gestión de máquinas de tecnología';
  public showData = false;

  constructor(
    private _service: TechMachineService,
    private sharedService: SharedService,
    private _modalsService : TechMachineModalService,
    private _route : ActivatedRoute,
    private _router : Router,
    private _notification : NotificationService
  ) {
    this.sharedService.emitChange(this.pageTitle);
  }

  ngOnInit(): void {
  }

  public fetchIngestProcess(query: any): void {
    this._service.findByQuery(query)
      .subscribe(items => {
        if (items && items.length > 0) {
          this._service.dataRecordsSource.next(TechMachineHelper.buildDataTableMT(items))
          this.showData = true;
        } else {
          this.showData = false;
        }
      });
  }

  /**
   * Abre el modal de alta rápida de MT
   *
   *
   */
  public openQuickCreateModal(): void {
    const dialogRef = this._modalsService.setupAltaRapidaTechMachineModal();

    dialogRef.subscribe(techmachine => {
      if (techmachine) {
        this._service.create(techmachine).then(result => {
          if(result){
            this._service.tm$.next(result);
            this._router.navigate(['factory',result._id], {relativeTo: this._route}).then();
            this._notification.success("Alta exitosa ["+result.cod_machine+"]")
          }
        });
      }
    });
  }

}
