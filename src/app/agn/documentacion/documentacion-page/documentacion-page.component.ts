import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'documentacion-page',
  templateUrl: './documentacion-page.component.html',
  styleUrls: ['./documentacion-page.component.scss']
})
export class DocumentacionPageComponent implements OnInit {

  constructor(private _router : Router,
    public _matDialog : MatDialog) { }

  ngOnInit(): void {
  }

  goToDashboard() : void {
    this._router.navigate(['/']);
  }

  cargarDocumento() : void {
  }
}
