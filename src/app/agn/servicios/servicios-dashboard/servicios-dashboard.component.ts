import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

import { ConsultasService } from '../../consultas/consulta.service';

import { Consulta } from '../../consultas/consulta.model';
import { ConsultasHelper } from '../../consultas/consulta.helper';
import { UsuarioWeb } from '../../../entities/userweb/usuario-web';


@Component({
  selector: 'agn-servicios-dashboard',
  templateUrl: './servicios-dashboard.component.html',
  styleUrls: ['./servicios-dashboard.component.scss']
})
export class ServiciosDashboardComponent implements OnInit {
  public user$: BehaviorSubject<UsuarioWeb>;
  public consultasList$: Observable<Consulta[]>;

  private user: UsuarioWeb;

  public showData = false;


  public title = 'Otros servicios';
  public subtitle = 'Ingresando acá podrás generar una solicitud de asistencia técnica o de copias de documentación histórica';

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
        this.consultasList$ = this._service.fetchConsultaFromUser(this.user, {estado: 'activo', modoconsulta: 'servicio'});
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
    this._router.navigate(['servicios'], { relativeTo: this._route });
  }

}
