import { Injectable } from "@angular/core";
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../../entities/user/user.service';
import { MatDialog } from '@angular/material/dialog';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { NotificationService } from '../notifications.service';
import { UnloggedInterceptorService } from '../unlogged-interceptor.service';

const STORAGE_KEY = 'navegante';

@Injectable({
    providedIn: 'root'
})
export class MustBeAuthenticatedGuard implements CanActivate {
    constructor(private _router: Router,
    private _userService: UserService,
    private _localService: LocalStorageService,
    private _notificationService : NotificationService,
    public dialog: MatDialog,
    private unloggedInterceptorService: UnloggedInterceptorService) { }

    canActivate(): boolean {
      return this.unloggedInterceptorService.checkLocalStorageForUnloggedUser(STORAGE_KEY);
    }
}
