import { Component, OnInit, Input } from '@angular/core';
import { ConsultaTable } from '../consulta.model';
import { ConsultasService } from '../consulta.service';
import { BehaviorSubject } from 'rxjs';
import { ConsultasHelper } from '../consulta.helper';
import { ConsultaModalService } from '../consulta-modal.service';
import { Consulta } from '../../../entities/consultas/consulta.model';
import { Router } from '@angular/router';
import { NotificationService } from '../../../develar-commons/notifications.service';


const CONFIRMATION_MODAL_CONFIG = {
  data: {
    caption: '¡Pase insertado con éxito!',
    body: 'Hemos registrado tu intervención.<br>Podrás ver el historial de tus consultas en el listado de <b>Consultas realizadas</b>',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};
@Component({
  selector: 'agn-consultas-list',
  templateUrl: './consultas-list.component.html',
  styleUrls: ['./consultas-list.component.scss'],
  providers: [ConsultaModalService]
})
export class ConsultasListComponent implements OnInit {
  @Input() modo : string;
  public consultasSubject: BehaviorSubject<ConsultaTable[]>;
  public consultasList: ConsultaTable[];
  public labelAboutModo : string = "";
  private consultaOptList = [];

  constructor(
    private _consultaService: ConsultasService,
    private _consultaModalService : ConsultaModalService,
    private _notificationService: NotificationService,
    private _router : Router
  ) {
    this.consultasSubject = this._consultaService.dataRecordsSource;
  }

  ngOnInit(): void {
    
    if(this.modo === 'consulta'){
      this.consultaOptList = ConsultasHelper.getOptionlist('consultaType');


    }else if(this.modo === 'servicio'){
      this.consultaOptList = ConsultasHelper.getOptionlist('servicioType');

    }

    this.consultasSubject.subscribe((entities) => {
      if (entities && entities.length > 0) {
        this.consultasList = entities;
      }
    });
  }

  getServiceHeader(token: ConsultaTable): string{
    let item = ConsultasHelper.getOptionItem(this.consultaOptList, token.type);
    if(item){
      this.labelAboutModo = item['help'];
    }else {
      this.labelAboutModo = this.modo === 'consulta' ? 'Consulta | ' : 'Servicio | ';
    }
    
    return this.labelAboutModo;
  }
  public showPases(id : string): void {
    this._consultaModalService.openShowPases(id);
  }

  public addPase(id : string): void {
    this._consultaModalService.openPaseModal().subscribe(result => {
      if(result){
        this._consultaService.fetchConsultaById(id).then(consulta => {
          if(consulta){
            consulta.pases.push(result);
            consulta.ejecucion = result.ejecucion;
            consulta.estado = result.estado;
            this.editConsulta(consulta);
          }
        })
      }
    })
  }

  private editConsulta(consulta : Consulta): void {
    this._consultaService.edit(consulta._id, consulta).then(result => {
      if(result){
        this._notificationService.openModalDialog(CONFIRMATION_MODAL_CONFIG).subscribe((result) => {
          if (result) {
            this._router.navigate(['']);
          }      
        });
      }
    })
  }

}
