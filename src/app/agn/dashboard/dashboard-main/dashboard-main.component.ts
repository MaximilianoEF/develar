import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Turno } from '../../models/turno.model';

import { AgnTurnosService } from '../../agn-turnos.service';
import { User } from '../../../entities/user/user';
import { UserService } from '../../../entities/user/user.service';
import { UsuarioWeb } from '../../../entities/userweb/usuario-web';

@Component({
  selector: 'app-agn-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.scss'],
})
export class DashboardMainComponent implements OnInit {
  /**
   * Dashboard
   *
   */
  public turneraDashboardTitle = 'Turnos presenciales';
  public turneraDashboardSubtitle = 'Sólo se muestran los turnos vigentes';
  public turneraTurnosList: Observable<Turno[]>;
  public user: User | UsuarioWeb;
  public consultaDashboardTitle = 'Consultas y solicitudes';
  public consultaDashboardSubtitle = 'Solicitudes emitidas';

  constructor(
    private _turnoService: AgnTurnosService,
    private _userService: UserService
  ) {}

  ngOnInit(): void {
    this.user = this._userService.currentUser;
    this.turneraTurnosList = this._turnoService.fetchAllTurnos();
  }
}
