import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { TurnosDialogConsultaComponent } from '../turnos-dialog-consulta/turnos-dialog-consulta.component';

import { ConsultasService } from '../../consultas/consulta.service';
import { Atendido, Consulta, Pase } from '../../consultas/consulta.model';
import { devutils } from '../../../develar-commons/utils';
import { GenericDialogComponent } from '../../../develar-commons/generic-dialog/generic-dialog.component';
import { TurnosService } from '../../../entities/turnos/turnos.service';
import { Turno } from '../../../entities/turnos/turno.model';
import { TurnoHelper } from '../../../entities/turnos/turno.helper';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { UserWebService } from '../../../entities/userweb/user-web.service';
import { UsuarioWeb } from '../../../entities/userweb/usuario-web';

const ESTADO_ACTIVO = 'activo';
const SECTOR_INICIAL = 'comunicacion';
const SOLTURNO = 'turnopresencial';

const deleteTurnoDialog = {
  hasBackdrop: true,
  backdropClass: 'yellow-backdrop',
  data: {
    caption: 'Confirme la acción',
    body: '¿Confirma la cancelacion del turno?',
    accept: {
      action: 'accept',
      label: 'Aceptar',
    },
    cancel: {
      action: 'cancel',
      label: 'Cancelar',
    },
  },
};


const CONFIRMATION_MODAL_CONFIG = {
  data: {
    caption: '¡Turno editado con éxito!',

    body: 'Tu turno ha sido editado con éxito.<br>Podrás ver el estado de tu turno en el botón de <b>Turnos Vigentes</b>',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};
@Component({
  selector: 'agn-turnos-browse',
  templateUrl: './turnos-browse.component.html',
  styleUrls: ['./turnos-browse.component.scss']
})
export class TurnosBrowseComponent implements OnInit {
  public turneraTurnosList$: Observable<Turno[]>;

  public _user$: BehaviorSubject<UsuarioWeb>;
  public showTable = false;
  private user: UsuarioWeb;

  private turnosList: Turno[];

  constructor(
    private _turnoService: TurnosService,
    private _userService: UserWebService,
    private _consultaService: ConsultasService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dialog: MatDialog,
    private _notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initTurneraTurnosList();
  }

  private initTurneraTurnosList(): void {
    this._userService.userEmitter.subscribe(user => {
      if (user && user._id) {
        this.user = user;

        let query = {};
        Object.assign(query, { userId: user._id });
        this.turneraTurnosList$ = this._turnoService.fetchByQuery(query);

        this.turneraTurnosList$.subscribe(turnos => {
          this.showTable = true;
          this.turnosList = turnos;
        });
      }
    });
  }

  gotoTurneraAlta(): void {
    this.openHasTurnoActivoDialog().subscribe(response => {
      if (response.result === true) {
        const pase = new Pase();
        const consulta = new Consulta();

        pase.ejecucion = SOLTURNO;
        pase.novedadTx = 'Inicio de la consulta';
        pase.sector = SECTOR_INICIAL;
        pase.paseTx = '';
        pase.estado = ESTADO_ACTIVO;
        pase.isCumplida = false;
        pase.fe_nov = devutils.txFromDate(new Date());
        pase.ho_nov = devutils.txFromHora(new Date());
        pase.fets_nov = new Date().getTime();
        pase.atendidox = new Atendido();
        pase.atendidox.userWebId = this.user._id;
        pase.atendidox.slug = this.user.nombre + ' ' + this.user.apellido;
        consulta.sector = SECTOR_INICIAL;
        consulta.ejecucion = pase.ejecucion;
        consulta.pases.push(pase);
        consulta.type = response.data.type;
        consulta.description = response.data.description;
        consulta.estado = ESTADO_ACTIVO;

        this._consultaService.manageConsulta(consulta, this.user).subscribe(value => {
          if (value) {
            this._router.navigate(['..'], { relativeTo: this._route });
          }
        });
      }
    });
  }

  gotoDashboard(): void {
    this._router.navigate(['..'], { relativeTo: this._route });
  }

  doCancelTurno(turnoId): void {
    this._turnoService.fetchById(turnoId).then(turno => {
      this.openDialog(deleteTurnoDialog).subscribe((result) => {
        if (result === 'accept') {
          let nuevoPase = TurnoHelper.buildPaseBajaFromTurno(this._userService.currentUser);
          turno.pases.push(nuevoPase);
          turno.avance = nuevoPase.ejecucion;
          turno.estado = nuevoPase.estado;

          this._turnoService.edit(turno._id, turno).then(result => {
            this.initTurneraTurnosList();
          });
        }
      });
    });
  }

  public doEditTurno(turno : Turno) : void {

    this._turnoService.edit(turno._id, turno).then(turnoEdit => {
      this._notificationService.openModalDialog(CONFIRMATION_MODAL_CONFIG).subscribe((result) => {
       this.initTurneraTurnosList();
      });
    });
  }

  private openDialog(config): Observable<any> {
    const dialogRef = this._dialog.open(GenericDialogComponent, config);
    return dialogRef.afterClosed();
  }

  private openHasTurnoActivoDialog(): Observable<any> {
    const dialogRef = this._dialog.open(TurnosDialogConsultaComponent);
    return dialogRef.afterClosed();
  }
}
