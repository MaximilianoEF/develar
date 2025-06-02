import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'documentacion-dashboard',
  templateUrl: './documentacion-dashboard.component.html',
  styleUrls: ['./documentacion-dashboard.component.scss']
})
export class DocumentacionDashboardComponent implements OnInit {

  public documentacionDashboardTitle : string = 'Mis documentos';
  public documentacionDashboardSubtitle : string = 'Adjuntar documentación personal'
  constructor(private _router : Router,  private _route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  gotoDocumentacionPage() : void{
    this._router.navigate(['documentacion'], { relativeTo: this._route });
  }

}
