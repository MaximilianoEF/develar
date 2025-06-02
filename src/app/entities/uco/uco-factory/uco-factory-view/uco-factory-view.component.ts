import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Uco } from '../../uco.model';
import { UcoService } from '../../uco.service';

@Component({
  selector: 'uco-factory-view',
  templateUrl: './uco-factory-view.component.html',
  styleUrls: ['./uco-factory-view.component.scss']
})
export class UcoFactoryViewComponent implements OnInit {

  public uco$ : BehaviorSubject<Uco>
  private idTM : string;
  constructor(
            private _service : UcoService,
            private _route : ActivatedRoute,
            ) 
  {
        this.idTM = this._route.snapshot.params.id;
        this.uco$ = this._service.uco$;
  }

  ngOnInit(): void {
    if(this.idTM){
      this._service.findByID(this.idTM).then(tm => {
        if(tm){
          this._service.uco$.next(tm);
        }
      })
    }
  }

}
