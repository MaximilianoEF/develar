import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-consultas-panel',
  templateUrl: './consultas-panel.component.html',
  styleUrls: ['./consultas-panel.component.scss']
})
export class ConsultasPanelComponent implements OnInit {

  public isConsulta: boolean = false;
  constructor(private _route: ActivatedRoute) { }

  ngOnInit(): void {
    this._route.data.subscribe(data => {

      this.isConsulta = data.modo && data.modo == 'consulta' ? true : false;
    })
  }

}
