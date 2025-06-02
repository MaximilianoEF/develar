import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistroUserWebComponent } from './registro-user/registro-user.component';
import { SiginUserWebComponent } from './sigin-user/sigin-user.component';
import { UserWebRecuperarPasswordComponent } from './user-recuperar-password/user-recuperar-password.component';


const routes: Routes = [
  
  {
    path: 'registrarse',
    pathMatch : 'full',
    component : RegistroUserWebComponent
  },
  {
    path : 'recuperar',
    pathMatch : 'full',
    component : UserWebRecuperarPasswordComponent
  },
  {
    path: '',
    component: SiginUserWebComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserwebRoutingModule { }
