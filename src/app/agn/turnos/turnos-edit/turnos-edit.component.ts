import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


import { Turno, RequirenteTurno } from '../../models/turno.model';
import { AgnTurnosService } from '../../agn-turnos.service';
import { UserWebService } from '../../../entities/userweb/user-web.service';


@Component({
  selector: 'app-agn-turnos-edit',
  templateUrl: './turnos-edit.component.html',
  styleUrls: ['./turnos-edit.component.scss']
})
export class TurnosEditComponent implements OnInit {
  public isEdit = false;
  public turno: Turno;
  public showForm = false;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _turnoService: AgnTurnosService,
    private _userService: UserWebService
  ) {

  }

  ngOnInit(): void {
    // Definir si estamos en vista de alta o edición
    if (this._route.snapshot.params.id) {
      this.loadTurno(this._route.snapshot.params.id);
      this.isEdit = true;
    }
  }

  private loadTurno(id: string): void {
    this._turnoService.fetchTurnoById(id)
      .then(item => {
        this.turno = item;
        this.showForm = true;
      })
      .catch(error => {
        // c onsole.log('Error obteniendo el turno: %s', error);
      });
  }

  gotoTurneraBrowse(): void {
    const navTo = this.isEdit ? '../..' : '..';

    this._router.navigate([navTo], { relativeTo: this._route });
  }



  upsertTurno(turno: Turno): void {

    if (this.isEdit) {
      this.editTurno(turno._id, turno);
    } else {

      turno.estado = 'activo';
      turno.requirente = new RequirenteTurno();
      turno.requirente.userId = this._userService.currentUser._id;

      this._userService.fetchPersonByUserId(turno.requirente.userId)
        .then(persons => {
          if (persons) {
            turno.requirente.personId = persons[0]._id;
            turno.requirente.displayName = persons[0].displayName;
            turno.requirente.ndoc = persons[0].ndoc;
            this.createTurno(turno);

          }else {
            //errror: TODO
          }
        });
    }
  }

  private createTurno(turno: Turno): void {

    this._turnoService.createTurno(turno)
      .then(item => {
        this.gotoTurneraBrowse();
      })
      .catch(error => {
        // c onsole.log('agnTurnosEdit createTurno ERROR -> %o', error);
      });
  }

  private editTurno(id: string, turno: Turno): void {
    this._turnoService.editTurno(id, turno)
      .then(item => {
        this.gotoTurneraBrowse();
      })
      .catch(error => {
        // c onsole.log('agnTurnosEdit editTurno ERROR -> %o', error);
      });
  }
}
