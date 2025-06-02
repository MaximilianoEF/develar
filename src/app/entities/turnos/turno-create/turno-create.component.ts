import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, filter, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from '../../../develar-commons/shared-service';
import { devutils } from '../../../develar-commons/utils';

import { TurnosService } from '../turnos.service';
import { TurnoHelper } from '../turno.helper';
import { Turno, RequirenteTurno, TurnoDisponible, AvailableSlotResultData } from '../turno.model';
import { Moment } from 'moment';
import { UserService } from '../../user/user.service';
import { SlotTurnoTemplate } from '../../slot-turno/slot-turno.model';
import { UserWebService } from '../../userweb/user-web.service';
import { UsuarioWeb } from '../../userweb/usuario-web';

const ESTADO_NO_CONFIRM = 'aconfirmar';
@Component({
  selector: 'app-turno-create',
  templateUrl: './turno-create.component.html',
  styleUrls: ['./turno-create.component.scss']
})
export class TurnoCreateComponent implements OnInit {
  public form: FormGroup;
  public sedesList;
  public tipoConsultaList;
  public slotsList : SlotTurnoTemplate[] = [];

  /** Variables para manejo del calendario */
  public today = new Date();
  public availableSlots = [];
  public fechasDisponibles: string[];
  public theDate: Date;
  public listHoursOfSelect: AvailableSlotResultData = new AvailableSlotResultData();

  /* Flag que define si se renderiza el calendario o no */
  public showCalendar = false;


  public users$: Observable<UsuarioWeb[]>;
  public selectedUser: UsuarioWeb;
  private searchTerms: Subject<string> = new Subject<string>();

  public pageTitle = 'Gestión de turnos';

  constructor(
    private _turnoService: TurnosService,
    private _userService: UserWebService,
    private _fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _shared: SharedService,
    private _userAdminService : UserService
  ) {
    this.sedesList = TurnoHelper.getSedesList();
    this.tipoConsultaList = TurnoHelper.getTipoConsultaList();

    this._shared.emitChange(this.pageTitle);

    this.initGroup();
  }

  ngOnInit(): void {
    this.initOnce();
    this.users$ = this.searchTerms.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(term => term && term.length > 4),
      switchMap(term => this._userService.testUserByEmail(term))
    );
  }

  private initOnce() : void {
    this._turnoService.buildOptListSedes().then(result => {
      if(result && result.length){
        //TODO: POPULAR LA OPT LIST
        this.slotsList = result;
      }
      
    })
  }

  private initGroup(): void {
    this.form = this._fb.group({
      _id: [null],
      tipoConsulta: [null],
      sede: [null],
      slotId : [null],
      txFecha: [null],
      txHora: [null],
      detalle: [null],
      email: [null]
    });
  }

  public onTipoConsultaChange(tipoConsulta: string): void {
    // this.form.get('sede').setValue(this.tipoConsultaList.find(item =>
    //   item.val === tipoConsulta
    // ).sede);

    // this.onSedeChange(this.form.get('sede').value);
  }

  public onDateChange(event): void {
    let fecha = devutils.datePickerToDate(event.value);
    if (!fecha) return;

    let dateTx = devutils.txFromDate(fecha);
    const slotId = this.form.get('slotId').value;
    this.buildHorario(slotId, dateTx);
  }

  public onSedeChange(slotId: string): void {
    this.buildHorario(slotId);
  }

  private buildHorario(slotId: string, dateTx?: string): void {
    this._turnoService.fetchAvailableSlotsV2(slotId).then((result) => {
      if (result && result.status === 'OK') {
        const data = result.data;
        this.fechasDisponibles = Object.keys(data);

        let currentDate : Date;
        if(dateTx){
          currentDate = devutils.dateFromTx(dateTx)
        } else {
          this.today = devutils.dateFromTx(this.fechasDisponibles[0]);
          currentDate = devutils.dateFromTx(this.fechasDisponibles[0]);
        }
        this.theDate = new Date(currentDate.getTime());
        this.form.get('txFecha').setValue(this.theDate);

        this.showCalendar = true;

        const key = this.fechasDisponibles.filter(f => f === devutils.txFromDate(this.theDate))[0];
        this.listHoursOfSelect.items = new Array<TurnoDisponible>();
        this.listHoursOfSelect.items = result.data[key];


          this.form.get('txHora').setValue(this.listHoursOfSelect.items[0].horaNum);

      }
    })
      .catch((error) => console.log(error));
  }


  datepickerFilterDaysWithoutSlots = (d: Moment): boolean => {
    const fechaFiltro = devutils.txFromDate(devutils.datePickerToDate(d));
    return this.fechasDisponibles.includes(fechaFiltro);
  }

  public doCancelCreate(): void {
    this._router.navigate(['..'], { relativeTo: this._route }).then();
  }

  public doCreateTurno(): void {
    if (!this.selectedUser) {
      this._snackBar.open('Primero seleccione un usuario', 'Cerrar', {
        duration: 1500
      });
    } else {
      const fvalue = this.form.value;

      this._userService.fetchPersonByUserId(this.selectedUser._id).then(person => {
        const turno = new Turno();
        let user = this._userAdminService.currentUser;
        turno.requirente = new RequirenteTurno();

        turno.requirente.userId = this.selectedUser._id;
        turno.requirente.personId = person[0]._id;
        turno.requirente.ndoc = person[0].ndoc;
        turno.requirente.displayName = person[0].displayName;
        turno.slotId = fvalue.slotId;
        turno.sede = this.slotsList.find(f => f._id === fvalue.slotId).sede;
        turno.tipoConsulta = fvalue.tipoConsulta;
        turno.detalle = fvalue.detalle;


        turno.txFecha = devutils.datePickerToTx(fvalue.txFecha);

        /////**************/////
        let date = new Date(); //vamos a usarlo para manipular la hora y los minutos
        date.setHours(0,0,0,0);
        date.setHours(fvalue.txHora);
        let itemSelected =  this.listHoursOfSelect.items.find(f => f.horaNum === fvalue.txHora);
        date.setHours(itemSelected.horaNum, itemSelected.minutos);

        turno.txHora = devutils.txFromHora(date);
        turno.tsFechaHora = devutils.dateFromTx(turno.txFecha).setHours(fvalue.txHora, itemSelected.minutos);

        let nuevoPase = TurnoHelper.buildFirstPaseFromTurno(user)
        turno.pases.push(nuevoPase);
        turno.estado = nuevoPase.estado;
        turno.avance = nuevoPase.ejecucion;
    
        this._turnoService.create(turno).then(result => {
          this._router.navigate(['..'], { relativeTo: this._route }).then();
        }).catch(error => {
          this._snackBar.open('Error al crear el turno; intente nuevamente', 'Cerrar', {
            duration: 1500
          });
        });
      });
    }
  }

  public doSearch(email: string): void {
    this.searchTerms.next(email);
  }

  public doSelectEntity(user: UsuarioWeb): void {
    this.selectedUser = user;
  }


}
