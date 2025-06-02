import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { Uco } from '../../uco.model';
import { UcoService } from '../../uco.service';

@Component({
  selector: 'uco-factory-page',
  templateUrl: './uco-factory-page.component.html',
  styleUrls: ['./uco-factory-page.component.scss']
})
export class UcoFactoryPageComponent implements OnInit {
  private idUCO : string;
  public showEditForm : boolean = false;

  constructor(
        private _service : UcoService,
        private _route : ActivatedRoute,
        private _router : Router,
        private _notification : NotificationService
        ) {
          this.idUCO = this._route.snapshot.params.id;
    }

  ngOnInit(): void {
    if(this.idUCO){
      this._service.findByID(this.idUCO).then(tm => {
        if(tm){
          this._service.uco$.next(tm);
          this.showEditForm = true;
        }
      })
    }else{
      this._service.uco$.next(null);
      this.showEditForm = true;
    }
  }

  public saveChanges(uco : Uco){
    if(this.idUCO){
      //es edición
      this._service.update(this.idUCO, uco).then(result => {
        if(result){
          this._service.uco$.next(result);
          this._notification.success("Edición exitosa ["+result.cod_uco+"]")
          this._router.navigate(['/develar','uco']);
        }
      })
    }else{
      //es alta
      this._service.create(uco).then(result => {
        if(result){
          this._service.uco$.next(result);
          this._router.navigate([result._id], {relativeTo: this._route}).then();
          this._notification.success("Alta exitosa ["+result.cod_uco+"]")
        }
      });
    }
  }
}
