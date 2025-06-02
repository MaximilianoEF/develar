import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { NotificationService } from '../../../develar-commons/notifications.service';

import { gldef } from '../../../develar-commons/develar.config';
import { UsuarioWeb } from '../usuario-web';
import { ImageToken, UserWebService } from '../user-web.service';

const AGN_WEB_INGRESAR : string = 'agn:ingresar';
const DEFAULT_LOGO = 'assets/img/' + gldef.logoCompany;

@Component({
  selector: "sigin-user-web",
  templateUrl: "./sigin-user.component.html",
  styleUrls: ["./sigin-user.component.scss"],
})
export class SiginUserWebComponent implements OnInit {
  public form: FormGroup;
  private userListener: Subject<UsuarioWeb>;
  public logoUrl = DEFAULT_LOGO;

  public mainimage: string = "";
  public hasImage: boolean = false;
  public showDetail: boolean = false;

  private imageData: ImageToken;

  constructor(
    private _formBuilder: FormBuilder,
    private _userWebService: UserWebService,
    private _notificacionService: NotificationService,
    private _router: Router) {
  }

  ngOnInit(): void {
    this.initGroup();
    this.initOnce();
  }

  private initOnce(): void {
    this.showDetail = false;
    this.hasImage = false;
    this._userWebService.fetchRecordCard(AGN_WEB_INGRESAR).pipe(finalize(() => this.showDetail = true)).subscribe(records => {
      if(records && records.length){
        this.imageData = this._userWebService.buildMainImage(records[0]);
        this.mainimage = this.imageData.imageUrl;
        this.hasImage = this.mainimage ? true : false;
      }
    })
  }

  initGroup(): void {
    this.form = this._formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  onSubmit(): void {
    let datos = new UserPassword();
    datos = this.form.value;
    this.login(datos)
  }

  onNavigateHome(): void {
    this._router.navigate(['']);
  }

  login(datos: UserPassword): void {

    this._userWebService.login(datos).then((user) => {
      if (user) {
        this.loadLoginUser();
        this._router.navigate(['/ingresando']);
      } else {
        this._notificacionService.error("Credenciales incorrectas");
      }
    }).catch((err) => {

      this._notificacionService.error("Credenciales incorrectas");
    });
  }

  private loadLoginUser(): void {
    this.userListener = this._userWebService.initLoginUser();

    this.userListener.subscribe((user) => {
      if (user) {
      }
    });
  }
}

export class UserPassword {
  username: string;
  password: string;
}
