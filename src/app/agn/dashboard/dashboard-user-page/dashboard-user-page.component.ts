import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ImageToken, UserWebService } from '../../../entities/userweb/user-web.service';


@Component({
  selector: 'dashboard-user-page',
  templateUrl: './dashboard-user-page.component.html',
  styleUrls: ['./dashboard-user-page.component.scss']
})
export class DashboardUserPageComponent implements OnInit {
  public title = 'Mi perfil AGN';
  public services: Array<ImageToken> = [];
  public showDetail = false;




  constructor(
    private _userWebService: UserWebService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
     this._userWebService.initLoginUser().subscribe((loggedIn) => {
       this.fetchRecordCard();

    });
  }

  serviceDetail(e, node: ImageToken){
    e.stopPropagation();
    e.preventDefault();
    this.navigateToService(node);
  }

  private navigateToService(node:ImageToken){
    let navigateTo = this._userWebService.navigateToService(node);
    this.router.navigate(navigateTo, {relativeTo: this.route});
  }

  private fetchRecordCard(){

    this.showDetail = false;
    this._userWebService.fetchRecordCard('agn:servicios').pipe(finalize(() => this.showDetail = true)).subscribe(records => {
      this.services = this._userWebService.buildImageArray(records[0]);
    })


  }

}
