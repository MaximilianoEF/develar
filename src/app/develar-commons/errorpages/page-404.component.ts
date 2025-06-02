import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector:    'page-404',
  templateUrl: './page-404.component.html',
  styleUrls:  ['./page-404.component.scss']
})
export class Page404Component implements OnInit {
  constructor(
    private router: Router

  ) { }

  ngOnInit() { }


  backToHome(e){
    this.router.navigate(['/'])

  }
}
