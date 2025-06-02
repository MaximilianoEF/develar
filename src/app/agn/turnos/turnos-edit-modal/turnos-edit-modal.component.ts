import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalendarHeaderCustomComponent } from '../../../develar-commons/calendar-header-custom/calendar-header-custom.component';
import { devutils } from '../../../develar-commons/utils';
import { TurnoHelper } from '../../../entities/turnos/turno.helper';
import { AvailableSlotResultData, Turno, TurnoDisponible } from '../../../entities/turnos/turno.model';
import { TurnosService } from '../../../entities/turnos/turnos.service';
import { Moment } from 'moment';
import { UserWebService } from '../../../entities/userweb/user-web.service';

const ESTADO_EDIT : string = 'activo';
const AVANCE_EDIT : string = 'edicionusuario'
@Component({
  selector: 'turnos-edit-modal',
  templateUrl: './turnos-edit-modal.component.html',
  styleUrls: ['./turnos-edit-modal.component.scss']
})
export class TurnosEditModalComponent implements OnInit {
  
  public form : FormGroup;
  public showCalendar = false;


  public customHeader = CalendarHeaderCustomComponent;
  /** Es la fecha actualmente elegida en el calendario */
  public theDate: Date;
  /** Es la fecha establecida como mínima en el calendario */
  public today: Date;

  // Contiene los turnos disponibles
  public availableSlots: AvailableSlotResultData;

  /** Contiene las fechas (formato texto) para las que hay algún horario disponible */
  public fechasDisponibles: string[];

  public listHoursOfSelect: AvailableSlotResultData = new AvailableSlotResultData();

  constructor(public dialogRef : MatDialogRef<TurnosEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data : Turno,
    private _fb : FormBuilder,
    private _turnoService : TurnosService,
    private _userService : UserWebService) {

      this.today = new Date();
    }

  ngOnInit(): void {
    this.initGroup()
  }

  
  private initGroup(): void {
    let dateAux : Date = new Date(this.data.tsFechaHora);
    let horaForm : number = dateAux.getHours();
    this.form = this._fb.group({
      txFecha: [devutils.dateFromTx(this.data.txFecha), Validators.required],
      txHora: [horaForm, Validators.required],
    });

    this.buildHorario(this.data.slotId, this.data.txFecha, true);
  }
  public handleDateSelectionChange(selectedDate): void {

    this.form.get('txFecha').setValue(devutils.datePickerToTx(selectedDate));
    this.theDate = devutils.datePickerToDate(selectedDate);
    this.buildHorario(this.data.slotId, this.form.get('txFecha').value, false);
  }

  private buildHorario(slotId: string, dateTx?: string, isCallFromForm? : boolean): void {
    this._turnoService.fetchAvailableSlotsV2(slotId).then((result) => {

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
        this.showCalendar = true;


        //vamos a inicializar today con la primer fecha disponible (el dia de hoy + 2 o N)
        this.today = devutils.dateFromTx(this.fechasDisponibles[0]);

        let isFixedDate : boolean = false;
        if(this.theDate.getTime() < this.today.getTime() && !isFixedDate){
          //Con esto me aseguro de que si quiere editar el turno, lo haga pero sobre la base de dos días
          this.theDate = new Date(this.today.getTime());
          isFixedDate = true;
        }



        const key = this.fechasDisponibles.filter(f => f === devutils.txFromDate(this.theDate))[0];

          this.listHoursOfSelect.items = new Array<TurnoDisponible>();
          this.listHoursOfSelect.items = result.data[key];

        
        if(isCallFromForm && !isFixedDate){
          let avaidable = this.listHoursOfSelect.items.find(f => f.horaNum === this.form.get('txHora').value);
          this.form.get('txHora').setValue(avaidable ? avaidable.horaNum : null);
        }else{
          this.form.get('txHora').setValue(this.listHoursOfSelect.items[0].horaNum);

        }
      }
    })
      .catch((error) => console.log(error));
  }

  disabledDaysFilter = (d: Moment): boolean => {
    // Devuelve verdadero si d contiene una fecha contenida en
    // el array fechasDisponibles
    const fechaFiltro = devutils.txFromDate(devutils.datePickerToDate(d));
    return this.fechasDisponibles.includes(fechaFiltro);
  }

  public onSubmit() : void {
    let fvalue = this.form.value;

    const currentDate = devutils.dateFromTx(fvalue.txFecha);

    let itemSelected = this.listHoursOfSelect.items.find(f => f.horaNum == fvalue.txHora);
    currentDate.setHours(itemSelected.horaNum, itemSelected.minutos);
    this.data.txHora = devutils.txFromHora(currentDate);
    this.data.tsFechaHora = devutils.dateFromTx(fvalue.txFecha).setHours(fvalue.txHora, itemSelected.minutos);
    this.data.txFecha = fvalue.txFecha;

    let ejecucion = this.data.avance || 'aconfirmar';

    let nuevoPase = TurnoHelper.buildPaseEditTurno(this._userService.currentUser, ejecucion);
    this.data.pases.push(nuevoPase);
    this.data.estado = nuevoPase.estado;
    this.data.avance = nuevoPase.ejecucion;

    this.dialogRef.close(this.data);
  }

}
