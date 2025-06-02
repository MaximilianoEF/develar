import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Moment } from 'moment';

import { TurnoHelper } from '../../../entities/turnos/turno.helper';
import { TurnosService } from '../../../entities/turnos/turnos.service';
import { Turno, AvailableSlotResultData, TurnoDisponible } from '../../../entities/turnos/turno.model';

import { CalendarHeaderCustomComponent } from '../../../develar-commons/calendar-header-custom/calendar-header-custom.component';
import { devutils } from '../../../develar-commons/utils';
import { RequirenteTurno } from '../../models/turno.model';
import { SlotTurnoTemplate } from '../../../entities/slot-turno/slot-turno.model';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { UserWebService } from '../../../entities/userweb/user-web.service';


const CONFIRMATION_MODAL_CONFIG = {
  data: {
    caption: '¡Turno requerido con éxito!',

    body: 'Analizaremos tu requerimiento y en breve recibiras confirmación de nuestra parte.<br>Podrás ver el estado de tu turno en el botón de <b>Turnos Vigentes</b>',
    // body: 'En breve recibirás un mail de confirmación.<br>Podrás ver el estado de tu turno en el botón de <b>Turnos Vigentes</b>',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};


const TURNO_OCUPADO_MODAL_CONFIG = {
  data: {
    caption: '¡No se pudo procesar su solicitud!',

    body: 'Se ha producido un error al intentar solicitar un turno, por favor volve a intentar',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

const SEDES_NO_DISPONIBLES_MODAL_CONFIG = {
  data: {
    caption: 'TURNERA CERRADA',
    body: 'La turnera se encuentra momentáneamente cerrada. Podés solicitar tu turno de lunes a viernes de 10 a 18 hs.',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

const AVANCE_INIT = 'aconfirmar';
const ESTADO_INIT = 'activo';
const SOURCE = 'user';
@Component({
  selector: 'app-turnos-create',
  templateUrl: './turnos-create.component.html',
  styleUrls: ['./turnos-create.component.scss']
})
export class TurnosCreateComponent implements OnInit {

  /** Mantiene la lista de sedes */
  public slotsList : SlotTurnoTemplate[] = [];
  public customHeader = CalendarHeaderCustomComponent;
  /** Formulario */
  public form: FormGroup;
  public showCalendar = false;
  public showHorario = false;

  /** Es la fecha actualmente elegida en el calendario */
  public theDate: Date;
  /** Es la fecha establecida como mínima en el calendario */
  public today: Date;

  // Contiene los turnos disponibles
  public availableSlots: AvailableSlotResultData;

  /** Contiene las fechas (formato texto) para las que hay algún horario disponible */
  public fechasDisponibles: string[];

  public listHoursOfSelect: AvailableSlotResultData = new AvailableSlotResultData();
  public initForm : boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _turnoService: TurnosService,
    private _router: Router,
    private _notificationService: NotificationService,
    private _userService: UserWebService
  ) {
    this.today = new Date();
  }

  ngOnInit(): void {
    this.initOnce();
  }

  private initOnce() : void {
    this._turnoService.buildOptListSedes().then(result => {
      if(result && result.length){
        this.slotsList = result;
        this.initGroup();
      }else{
        this._notificationService.openModalDialog(SEDES_NO_DISPONIBLES_MODAL_CONFIG).subscribe((result) => {
          this._router.navigate(['web', 'usuario', 'dashboard', 'turnospresenciales']);
        });
      }
    })
  }

  public onSubmit(){
    this.initTurno();
  }

  public handleDateSelectionChange(selectedDate): void {
    this.form.get('txFecha').setValue(devutils.datePickerToTx(selectedDate));
    this.theDate = selectedDate;
    this.buildHorario(this.slotId, this.fecha);
  }

  private get fecha(): string {
    return this.form.get('txFecha').value;
  }

  private get slotId(): string {
    return this.form.get('slotId').value;
  }


  private initGroup(): void {
    this.form = this._fb.group({
      slotId:  [this.slotsList[0]._id, Validators.required],
      txFecha: [null, Validators.required],
      txHora:  [null, Validators.required],
      fondo:   [null, Validators.required]
    });
    this.initForm = true;

    this.buildHorario(this.slotId, this.fecha);
  }


  private  initTurno(): void {
    let user = this._userService.currentUser;
    const fvalue = this.form.value;
    const entity = new Turno;
    const slotSelected = this.slotsList.find(f => f._id === fvalue.slotId);
    const itemSelected = this.listHoursOfSelect.items.find(f => f.horaNum == fvalue.txHora);

    entity.sede = slotSelected.sede;
    entity.sala = slotSelected.sala;

    entity.txFecha = fvalue.txFecha;
    entity.slotId =  fvalue.slotId;

    /////**************/////
    let date = devutils.dateFromTx(fvalue.txFecha)
    date.setHours(0, 0, 0, 0);
    date.setHours(itemSelected.horaNum, itemSelected.minutos);

    entity.duracion = itemSelected.duracion;
    entity.txHora = devutils.txFromHora(date);
    entity.tsFechaHora = date.getTime();

    entity.detalle = fvalue.fondo;
    entity.source = SOURCE;

    entity.requirente = new RequirenteTurno();
    entity.requirente.userId = this._userService.currentUser._id;

    let nuevoPase = TurnoHelper.buildFirstPaseFromTurno(user)
    entity.pases.push(nuevoPase);
    entity.estado = nuevoPase.estado;
    entity.avance = nuevoPase.ejecucion;

    this._userService.fetchPersonByUserId(entity.requirente.userId)
      .then(persons => {
        if (persons) {
          entity.requirente.personId = persons[0]._id;
          entity.requirente.displayName = persons[0].displayName;
          entity.requirente.ndoc = persons[0].ndoc;
         this.createTurno(entity);
        }
      })
  }

  private createTurno(entity: Turno): void {
    this._turnoService.create(entity).then(turno => {
      if (turno) {
        this._notificationService.openModalDialog(CONFIRMATION_MODAL_CONFIG).subscribe((result) => {
          this._router.navigate(['web', 'usuario', 'dashboard', 'turnospresenciales']);
        });
      } else {
        this.displayErrorModal();
      }
    }).catch(err => {
      this.displayErrorModal();
    })

  }

  private displayErrorModal(): void {
    this._notificationService.openModalDialog(TURNO_OCUPADO_MODAL_CONFIG).subscribe((result) => {
      this._router.navigate(['']);
    });
  }

  disabledDaysFilter = (d: Moment): boolean => {
    // Devuelve verdadero si d contiene una fecha contenida en
    // el array fechasDisponibles
    const fechaFiltro = devutils.txFromDate(devutils.datePickerToDate(d));
    return this.fechasDisponibles.includes(fechaFiltro);
  }

  private buildHorario(slotId: string, dateTx?: string): void {
    this._turnoService.fetchAvailableSlotsV2(slotId).then((result) => {
      //c onsole.log('ACA ESTOY [%s] dateTx[%s]', slotId, dateTx);

      if (result && result.status === 'OK') {
        const data = result.data;
        this.fechasDisponibles = Object.keys(data);

        let currentDate: Date;
        if (dateTx) {
          currentDate = devutils.dateFromTx(dateTx)
        } else {
          this.today = devutils.dateFromTx(this.fechasDisponibles[0]);
          currentDate = devutils.dateFromTx(this.fechasDisponibles[0]);
        }
        this.theDate = new Date(currentDate.getTime());
        
        this.form.get('txFecha').setValue(devutils.txFromDate(this.theDate));


        //this.showCalendar = true;
        setTimeout(() => {
          if(!this.showCalendar) this.showCalendar = true;
          if(!this.showHorario) this.showHorario = true;
        }, 50);

        const key = this.fechasDisponibles.filter(f => f === devutils.txFromDate(this.theDate))[0];
        this.listHoursOfSelect.items = new Array<TurnoDisponible>();
        this.listHoursOfSelect.items = result.data[key];

        this.form.get('txHora').setValue(this.listHoursOfSelect.items[0].horaNum);
      }
    })
      .catch((error) => console.error(error));
  }


  public onSelectionChange(type: string, val: any): void {
    //c onsole.log('onSelectionChange() [type=%s, val=%o]', type, val);
  }

  public slotChange( ) : void {
    this.showCalendar = false;
    this.showHorario = false;

    this.buildHorario(this.slotId);
  }


}

