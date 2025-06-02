import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserwebRoutingModule } from './userweb-routing.module';
import { SiginUserWebComponent } from './sigin-user/sigin-user.component';
import { RegistroUserWebComponent } from './registro-user/registro-user.component';
import { UserWebRecuperarPasswordComponent } from './user-recuperar-password/user-recuperar-password.component';
import { DevelarCommonsModule } from '../../develar-commons/develar-commons.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [SiginUserWebComponent, RegistroUserWebComponent, UserWebRecuperarPasswordComponent],
  imports: [
    CommonModule,
    UserwebRoutingModule,
    ReactiveFormsModule,
    DevelarCommonsModule
  ],
  exports: [RegistroUserWebComponent]
})
export class UserwebModule { }
