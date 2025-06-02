import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { Router } from '@angular/router';
import { PreguntaSecreta } from '../registro-user/registro-user.component';
import { UserWebService } from '../user-web.service';
import { devutils } from '../../../develar-commons/utils';

const preguntasSecretas: PreguntaSecreta[] = [{
  key: 'mascota',
  label: '¿Nombre de tu mascota?',
}, {
  key: 'madre',
  label: '¿Primer nombre de tu madre?',
}, {
  key: 'hijo',
  label: '¿Primer nombre de tu hijo?',
}, {
  key: 'color',
  label: '¿Color favorito?',
}, {
  key: 'comida',
  label: '¿Comida favorita?',
}];
@Component({
  selector: 'agn-user-recuperar-password',
  templateUrl: './user-recuperar-password.component.html',
  styleUrls: ['./user-recuperar-password.component.scss']
})
export class UserWebRecuperarPasswordComponent implements OnInit {

  showPassword : boolean = false;
  formGroup : FormGroup;
  preguntasSecretas : PreguntaSecreta[];
  constructor(private _fb : FormBuilder,
    private _notificacionService : NotificationService,
    private _userWebService : UserWebService,
    private _router : Router) {
    this.preguntasSecretas = preguntasSecretas;
   }

  ngOnInit(): void {
    this.initGroup();
  }

  verPassword() {
    let nodes = document.getElementsByClassName("password");
    for(let i = 0; i < nodes.length ; i++){
      let atributo = nodes[i].getAttribute('type');
      if (atributo === "password") {
        nodes[i].setAttribute('type', 'text');
      } else {
        nodes[i].setAttribute('type', 'password');
      }
    }
    this.showPassword = this.showPassword ? false : true;

  }

  private initGroup() : void{
    this.formGroup = this._fb.group({
      username : [''],
      email : ['' , [Validators.email, Validators.required]],
      password : ['', Validators.required],
      confirmPassword : [''],
      preguntaSecreta : ['', Validators.required],
      respuestaSecreta : ['', Validators.required]
    })

    this._setValidators();

  }

  private _setValidators(): void {
    this.formGroup.get('confirmPassword').setValidators([devutils.equalPasswordValidator(this.formGroup, 'password','confirmPassword'), Validators.required]);
  }

  onSubmit(){
    let formGroup : RestorePasswordFormGroup = this.formGroup.getRawValue();

      let restore = {
        username : formGroup.email,
        email : formGroup.email,
        preguntaSecreta : formGroup.preguntaSecreta,
        respuestaSecreta : formGroup.respuestaSecreta,
        password : formGroup.password
      }
      restore.respuestaSecreta = this.eliminarDiacriticos(restore.respuestaSecreta.toLowerCase());
      this.resetPassword(restore);

  }

  private resetPassword(restore) : void {
    this._userWebService.resetPassword(restore).then( user => {
      if(user){
        this._notificacionService.success("Contraseña actualizada con éxito")
        this._router.navigate(['inicio','bienvenidx'])
      }else{
        this._notificacionService.error("Los datos provistos no son correctos. No se pudo restablecer la contraseña.")
      }
    })
  }

  eliminarDiacriticos(texto : string) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
  }

  volver(){
    this._router.navigate(['web','ingresar'])
  }

}

export class RestorePasswordFormGroup{
  password : string;
  confirmPassword : string;
  preguntaSecreta : string;
  respuestaSecreta : string;
  username : string;
  email : string;
}
