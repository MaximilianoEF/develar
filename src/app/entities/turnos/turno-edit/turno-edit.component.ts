import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TurnosService } from '../turnos.service';
import { TurnoHelper } from '../turno.helper';
import { Turno, TurnoDisponible, AvailableSlotResultData } from '../turno.model';
import { devutils } from '../../../develar-commons/utils';
import { Moment } from 'moment';
import { UserService } from '../../user/user.service';
import { SlotTurnoTemplate } from '../../slot-turno/slot-turno.model';
import { UsuarioWeb } from '../../userweb/usuario-web';
import { UserWebService } from '../../userweb/user-web.service';

const CONFIRMADOAGN : string = 'confirmado';
const TEXTO_NOVEDAD_CONFIRMADO_AGN : string = 'Confirmado por AGN';
@Component({
  selector: 'app-turno-edit',
  templateUrl: './turno-edit.component.html',
  styleUrls: ['./turno-edit.component.scss']
})
export class TurnoEditComponent implements OnInit {
  public form: FormGroup;
  public sedesList = [];
  public tipoConsultaList = [];
  public estadosList = [];
  public estadoAvanceList = [];



  /* Variables para manejo del calendario */
  public availableSlots = [];
  public fechasDisponibles: string[];
  public today = new Date();
  public theDate: Date;
  public listHoursOfSelect: AvailableSlotResultData = new AvailableSlotResultData();

  /* Flag que define si se renderiza el calendario o no */
  public showCalendar = false;

  public user: UsuarioWeb;
  public slotsList : SlotTurnoTemplate[] = [];
  private idTurno: string;
  private turno: Turno;


  constructor(
    private _turnoService: TurnosService,
    private _userService: UserWebService,
    private _fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _userAdminService : UserService
  ) {
    this.sedesList = TurnoHelper.getSedesList();
    this.tipoConsultaList = TurnoHelper.getTipoConsultaList();
    this.estadosList = TurnoHelper.getTurnoEstadosList();
    this.estadoAvanceList = TurnoHelper.getTurnoEstadoAvanceList();
    this.idTurno = this._route.snapshot.params.id;
    
    this.today = new Date();

    this.initGroup();
  }

  ngOnInit(): void {
    // this.loadTurno(this.idTurno);
    this.initOnce();
  }

  private initOnce() : void {
    this._turnoService.buildOptListSedes().then(result => {
      console.log("result -_> %o",result)
      if(result && result.length){
        //TODO: POPULAR LA OPT LIST
        this.slotsList = result;
        this.initGroup();
        this.loadTurno(this.idTurno);
      }
    })
  }

  private initGroup(): void {
    this.form = this._fb.group({
      _id: [null],
      tipoConsulta: [null],
      sede: [null],
      slotId : [null],
      estado: [null],
      avance: [null],
      txFecha: [null],
      txHora: [null],
      detalle: [null],
      novedadTx : [null]
    });
  }

  private loadTurno(idTurno: string) {
    this._turnoService.fetchById(idTurno)
      .then(turno => {
        this.turno = turno;
        this.buildHorario(this.turno.slotId, this.turno.txFecha);
        this.initUser(this.turno.requirente.userId);
        this.initForm(this.turno);
      })
      .catch((error) => console.log(error));
  }

  private initForm(turno: Turno): void {
    this.form.reset({
      _id: turno ? turno._id : null,
      tipoConsulta: turno ? turno.tipoConsulta : null,
      sede: turno ? turno.sede : null,
      slotId : turno ? turno.slotId : null,
      txFecha: turno ? devutils.dateFromTx(turno.txFecha) : null,
      txHora: turno && turno.tsFechaHora ? new Date(turno.tsFechaHora).getHours() : null,
      detalle: turno ? turno.detalle : null,
      estado: turno ? turno.estado : null,
      avance: turno ? turno.avance : null
    });
    this.form.get('estado').disable();
  }

  private initUser(userId: string): void {
    this._userService.fetchById(userId)
      .then(entity => {
        this.user = entity;
      })
      .catch(error => {
        this._snackBar.open(
          'Ocurrieron errores al cargar el turno; intente nuevamente',
          'Cerrar',
          {
            duration: 1500
          });
      });
  }

  public onTipoConsultaChange(tipoConsulta: string): void {
    // this.form.get('sede').setValue(this.tipoConsultaList.find(item =>
    //   item.val === tipoConsulta
    // ).sede);
  }

  public onDateChange(event): void {
    let fecha = devutils.datePickerToDate(event.value);
    if(!fecha) return;

    let dateTx = devutils.txFromDate(fecha);
    const slotId = this.form.get('slotId').value;
    this.buildHorario(slotId, dateTx);
  }

  public onAvanceChange(avance) : void {
    let estado = TurnoHelper.getOptionEstado('avance',avance);
    this.form.get('estado').setValue(estado);
    this.form.get('estado').disable();

    if(avance === CONFIRMADOAGN){
      this.form.get('novedadTx').setValue(TEXTO_NOVEDAD_CONFIRMADO_AGN);
    }
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

        if (this.turno) {
          let assignedHour = new Date(this.turno.tsFechaHora).getHours();
          this.form.get('txHora').setValue(assignedHour);
        } else {
          this.form.get('txHora').setValue(this.listHoursOfSelect.items[0].horaNum);
        }
      }
    })
      .catch((error) => console.log(error));
  }


  datepickerFilterDaysWithoutSlots = (d: Moment): boolean => {
    const fechaFiltro = devutils.txFromDate(devutils.datePickerToDate(d));
    return this.fechasDisponibles.includes(fechaFiltro);
  }

  txHoraSelectComparator = (p: any, q: any): boolean => {
    return p.slug === q.slug;
  }


  public doCancelEdit(): void {
    this._router.navigate(['../..'], { relativeTo: this._route });
  }

  public doEditTurno(): void {
    let currentUser = this._userAdminService.currentUser;
    const fvalue = this.form.value;
    const turno = new Turno();
    turno._id = fvalue._id;
    turno.estado = TurnoHelper.getOptionEstado('avance',fvalue.avance);
    turno.avance = fvalue.avance;
    turno.sede = this.slotsList.find(f => f._id === fvalue.slotId).sede;
    turno.slotId = fvalue.slotId;
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

    turno.pases = this.turno.pases || [];
    let nuevoPase = TurnoHelper.buildPaseFromTurno(fvalue, currentUser)
    turno.pases.push(nuevoPase);
    turno.estado = nuevoPase.estado;
    turno.avance = nuevoPase.ejecucion;


    // turno.tsFechaHora = devutils.datePickerToDate(fvalue.txFecha).setHours(fvalue.txHora.val);

    this._turnoService.edit(turno._id, turno)
      .then(result => {
        this._router.navigate(['../..'], { relativeTo: this._route });
      })
      .catch(error => {
        this._snackBar.open(
          'Ocurrió un error al editar; intente nuevamente',
          'Error',
          {
            duration: 1500
          });
      });
  }
}
