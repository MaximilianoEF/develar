import { Injectable } from '@angular/core';
import { gldef } from './develar.config';
import { LocalStorageService } from './local-storage/local-storage.service';
import { NotificationService } from './notifications.service';
import { Router } from '@angular/router';
import { devutils } from './utils';
import { MatDialog } from '@angular/material/dialog';
import { IntercepterUserNoLoggedComponent } from './guards/intercepter-user-no-logged/intercepter-user-no-logged.component';
import { UserService } from '../entities/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class UnloggedInterceptorService {
  constructor(
    private localService: LocalStorageService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService
  ) { }

  public checkLocalStorageForUnloggedUser(storageKey: string): boolean {
    let isLoggedIn = this.userService.userlogged;
    let toReturn = false;

    if (isLoggedIn) {
      toReturn = true;
    } else {
      const today = new Date();
      const txToday = devutils.txFromDate(today);

      let navegante = this.localService.getItem(gldef.app_prefix, storageKey);

      if (navegante) {
        if (navegante['isRegistered']) {
          this.notificationService.info("Usted se ha registrado previamente en nuestro sistema, por favor autentifiquese para continuar.")
          this.router.navigate(['web', 'ingresar']).then();
        } else if (navegante['fecha_bonus'] === txToday) {
          toReturn = true;
        } else {
          // bonus vencido
          this.openDialog({initViewTwo: true, initViewFirst: false});
        }
      } else {
        // o se autentica o solicita bonus
        this.openDialog({initViewFirst: true, initViewTwo: false});
      }
    }

    return toReturn;
  }

  private openDialog(obj: any): void {
    const dialogRef = this.dialog.open(IntercepterUserNoLoggedComponent, { data: obj });
    dialogRef.afterClosed().subscribe(result => {
      // en el modal, eligió autenticarse
      if (result && result.auth) {
        this.router.navigate(['web', 'ingresar']).then();
      }
    });
  }
}
