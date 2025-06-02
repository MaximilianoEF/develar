import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { Turno } from '../../models/turno.model';
import { AgnTurnosService } from '../../agn-turnos.service';
import { AGNHelper } from '../../agn.helper';
import { UsuarioWeb } from '../../../entities/userweb/usuario-web';


@Component({
  selector: 'agn-turnos-dashboard',
  templateUrl: './turnos-dashboard.component.html',
  styleUrls: ['./turnos-dashboard.component.scss']
})
export class TurnosDashboardComponent implements OnInit {
  public user$: BehaviorSubject<UsuarioWeb>;
  private user: UsuarioWeb;
  public turnosList$: Observable<Turno[]>;

  public turnoDashboardTitle = 'Solicitar turno';
  public turnoDashboardSubtitle = 'Solicitá un turno para consulta presencial o chequeá los que tenés vigentes';

  public turnosList: Turno[];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _turnoService: AgnTurnosService
  ) { }

  ngOnInit(): void {
    this.initTurnoDashboard();
  }

  private initTurnoDashboard() {
    this._turnoService.user$.subscribe(user => {
      if (user && user._id) {
        this.user = user;
        this._turnoService.fetchTurnoFromUser(this.user, { estado: 'activo' }).subscribe(items => {
          if (items && items.length > 0) {
            this.turnosList = items.map(turno => {
              turno.sede = AGNHelper.getOptionLabel('sede', turno.sede);

              return turno;
            });
          }
        });
      } else {
        // TODO: Que hacer si no hay usuario?
      }
    });
  }

  gotoTurneraBrowse(): void {
    this._router.navigate(['turnospresenciales'], { relativeTo: this._route });
  }

}
