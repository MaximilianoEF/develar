import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

import { ConsultasService } from '../consulta.service';

import { Consulta } from '../consulta.model';
import { ConsultasHelper } from '../consulta.helper';
import { UsuarioWeb } from '../../../entities/userweb/usuario-web';


@Component({
  selector: 'agn-consultas-dashboard',
  templateUrl: './consultas-dashboard.component.html',
  styleUrls: ['./consultas-dashboard.component.scss']
})
export class ConsultasDashboardComponent implements OnInit {
  public user$: BehaviorSubject<UsuarioWeb>;
  public consultasList$: Observable<Consulta[]>;

  private user: UsuarioWeb;

  public showData = false;


  public title = 'Consultas';
  public subtitle = 'Ingresando acá podrás realizar una nueva consulta o ver las respuestas recibidas.';

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _service: ConsultasService
  ) { }

  ngOnInit(): void {
    this.initOnce();

  }

  private initOnce(){
    this._service.user$.subscribe(user => {
      if(user && user._id){
        this.user = user;
        this.consultasList$ = this._service.fetchConsultaFromUser(this.user, {estado: 'activo', modoconsulta: 'consulta'});
        this.showData = true;

      }else {
        // todo
      }
    })


  }

  getLabel(key : string) {
    return ConsultasHelper.getOptionLabel('consultaType',key);
  }

  navigateBrowse(): void {
    //this._router.navigate(['consultas'], { relativeTo: this._route, state: {type: 'CONSULTA' }});
    this._router.navigate(['consultas'], { relativeTo: this._route  });
  }

}
