import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalStorageService } from '../../local-storage/local-storage.service';
import { devutils } from '../../utils';
import { gldef } from '../../develar.config';

const STORAGE_KEY = 'navegante';

@Component({
  selector: 'intercepter-user-no-logged',
  templateUrl: './intercepter-user-no-logged.component.html',
  styleUrls: ['./intercepter-user-no-logged.component.scss']
})
export class IntercepterUserNoLoggedComponent implements OnInit {
  title = "Credenciales AGN"

  autenticarse = "Para hacer uso de los servicios de AGN, le solicitamos que se autentique.";
  registrar_ahora = "Registrarse ahora";
  registrar_manana = "Aplazar para mañana";

  login_now ="Para hacer uso de nuestros servicios debes autenticarte. Si ya estás registrado, por favor ingresa con tus credenciales. Gracias."

  initViewFirst : boolean = false;
  initViewTwo : boolean = false;
  tx_today : string;

  result = {
    auth : false
  }

  constructor( public dialogRef: MatDialogRef<IntercepterUserNoLoggedComponent>,
    private _localService : LocalStorageService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.initViewFirst = data.initViewFirst;
      this.initViewTwo = data.initViewTwo;
     }

  ngOnInit(): void {
  }

  auth() : void {
    this.result.auth = true;
    this.dialogRef.close(this.result);
  }

  aplazar() : void {
    let today = new Date();
    this.tx_today = devutils.txFromDate(today);
    this._localService.setItem(gldef.app_prefix, STORAGE_KEY,{fecha_bonus :this.tx_today});
    this.dialogRef.close(this.result);
  }
}
