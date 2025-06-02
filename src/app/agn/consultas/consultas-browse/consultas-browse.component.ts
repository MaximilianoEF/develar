import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable, BehaviorSubject } from 'rxjs';

import { Consulta } from '../consulta.model';

import { ConsultasService } from '../consulta.service';
import { ConsultaQuery } from '../../../entities/consultas/consulta.model';
import { UsuarioWeb } from '../../../entities/userweb/usuario-web';


@Component({
  selector: 'agn-consultas-browse',
  templateUrl: './consultas-browse.component.html',
  styleUrls: ['./consultas-browse.component.scss']
})
export class ConsultasBrowseComponent implements OnInit {
  @Input() modo = 'consulta';
  public consultasList$: Observable<Consulta[]>;
  public user$: BehaviorSubject<UsuarioWeb>;
  public title = '';
  public stitle = '';


  private user: UsuarioWeb;

  public showData = false;

  constructor(
    private _service: ConsultasService,
    private _router: Router,
    private _route: ActivatedRoute,
    private activatedroute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {

      this.modo=data ? data.modo : this.modo;

      this.initOnce();
    })

  }

  private initOnce(){

    if(this.modo === 'consulta'){
      // this.title = 'Consultas emitidas';
      this.title = 'Consultas realizadas';
      // this.stitle = 'Nueva consulta'
      this.stitle = '';


    }else if(this.modo === 'servicio'){
      this.title = 'Solicitudes emitidas';
      this.stitle = 'Nueva solicitud'

    }

    this._service.user$.subscribe(user => {
      if(user && user._id){
        this.user = user;
        let query = new ConsultaQuery();
        query.modoconsulta = this.modo;
        query.userId = user._id;
        this._service.fetchConsultasByQuery(query).subscribe(list => {
          if(list && list.length){
            this._service.updateTableData();
            this.showData = true
          }
        })

      }else {
        // todo
      }
    })


  }



  nuevaConsulta(): void {
    this._router.navigate(['alta'], { relativeTo: this._route });
  }

  navigateDashboard(): void {
    this._router.navigate(['..'], { relativeTo: this._route });
  }

  onCancelEvent(event : string){
    // c onsole.log(event)
  }



}
