import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { TechMachine } from '../../tech-machine.model';
import { TechMachineService } from '../../tech-machine.service';

@Component({
  selector: 'tech-machine-factory-page',
  templateUrl: './tech-machine-factory-page.component.html',
  styleUrls: ['./tech-machine-factory-page.component.scss']
})
export class TechMachineFactoryPageComponent implements OnInit {

  private idTM : string;
  public showEditForm : boolean = false;
  constructor(private _techMachineService : TechMachineService,
    private _route : ActivatedRoute,
    private _router : Router,
    private _notification : NotificationService) {
      this.idTM = this._route.snapshot.params.id;
    }

  ngOnInit(): void {
    if(this.idTM){
      this._techMachineService.findByID(this.idTM).then(tm => {
        if(tm){
          this._techMachineService.tm$.next(tm);
          this.showEditForm = true;
        }
      })
    }else{
      this._techMachineService.tm$.next(null);
      this.showEditForm = true;
    }
  }

  public saveChanges(techMachine : TechMachine){
    if(this.idTM){
      //es edición
      this._techMachineService.update(this.idTM, techMachine).then(result => {
        if(result){
          this._techMachineService.tm$.next(result);
          this._notification.success("Edición exitosa ["+result.cod_machine+"]");
        }
      })
    }else{
      //es alta
      this._techMachineService.create(techMachine).then(result => {
        if(result){
          this._techMachineService.tm$.next(result);
          this._router.navigate([result._id], {relativeTo: this._route}).then();
          this._notification.success("Alta exitosa ["+result.cod_machine+"]")
        }
      });
    }
  }

}
