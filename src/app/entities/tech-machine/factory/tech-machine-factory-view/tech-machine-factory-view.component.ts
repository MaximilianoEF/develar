import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TechMachineHelper } from '../../tech-machine.helper';
import { TechMachine } from '../../tech-machine.model';
import { TechMachineService } from '../../tech-machine.service';

@Component({
  selector: 'tech-machine-factory-view',
  templateUrl: './tech-machine-factory-view.component.html',
  styleUrls: ['./tech-machine-factory-view.component.scss']
})
export class TechMachineFactoryViewComponent implements OnInit {

  public tm$ : BehaviorSubject<TechMachine>
  private idTM : string;
  constructor(
          private _service : TechMachineService,
          private _route : ActivatedRoute) 
  {
    this.idTM = this._route.snapshot.params.id;
    this.tm$ = this._service.tm$;
  }

  ngOnInit(): void {
    if(this.idTM){
      this._service.findByID(this.idTM).then(tm => {
        if(tm){
          this._service.tm$.next(tm);
        }
      })
    }
  }

  public getLabel(type : string, val :string) : string{
    return TechMachineHelper.getOptionLabel(type, val);
  }

}
