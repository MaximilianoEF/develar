import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../../entities/user/user.service';
import { User } from '../../../entities/user/user';

@Component({
  selector: 'agn-user-datos-dashboard',
  templateUrl: './user-datos-dashboard.component.html',
  styleUrls: ['./user-datos-dashboard.component.scss']
})
export class UserDatosDashboardComponent implements OnInit {

  @Input() public title: string;
  @Input() public subtitle: string;
  public user$: BehaviorSubject<User>;
  id : string;
  constructor(
    private _router: Router,
    private _userService : UserService) { }

  ngOnInit(): void {
    this.user$ = this._userService.userEmitter;
    this.id = this._userService.currentUser._id;
  }


  goToEditUserData() : void {
    this._router.navigate(['web','usuario','dashboard','datos',this.id])
  }

}
