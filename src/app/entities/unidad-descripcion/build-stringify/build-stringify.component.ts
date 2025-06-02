import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { UnidadDescripcionService } from '../unidad-descripcion.service';

@Component({
  selector: 'build-stringify',
  templateUrl: './build-stringify.component.html',
  styleUrls: ['./build-stringify.component.scss']
})
export class BuildStringifyComponent implements OnInit {

  public searching : boolean;
  constructor( private _service: UnidadDescripcionService,
               private _notification: NotificationService
    ){
      this.searching = false;
     }

  ngOnInit(): void {
  }

  public rebuildStringify(): void {
    this.searching = true;
    this._service.buildStringifyFromUdas().pipe(
      take(1),
      catchError( () => of(null)),
      finalize(() => this.searching = false)
      ).subscribe(result => {
        if(result){
          this._notification.success(`Se ha reconstruido exitosamente el stringify para las UDAS.`);
        }else{
          this._notification.error(`Se produjo un error al realizar la operación.`)
        }
      })
  }

}
