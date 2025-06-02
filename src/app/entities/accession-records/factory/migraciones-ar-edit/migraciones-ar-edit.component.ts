import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { devutils } from '../../../../develar-commons/utils';
import { personModel } from '../../../person/person';
import { User } from '../../../user/user';
import { UserService } from '../../../user/user.service';
import { AccessionRecordsHelper } from '../../accession-records-helper';
import { AccessionRecord, Migrante } from '../../accession-records-model';
import { AccessionRecordsService } from '../../accession-records.service';

const RESET_CONTROLS: string[] = ['nombre', 'apellido', 'sexo', 'fe_nacimiento'];
const MIGRANTE: string = 'migrante';
const EDICION: string = 'edicion';
const ALTA: string = 'alta';
const ARRIBO_VAPOR: string = 'arribovapor';
@Component({
  selector: 'migraciones-ar-edit',
  templateUrl: './migraciones-ar-edit.component.html',
  styleUrls: ['./migraciones-ar-edit.component.scss']
})
export class MigracionesArEditComponent implements OnInit, OnDestroy {

  @Output() upsertRecord: EventEmitter<AccessionRecord>;
  public form: FormGroup;
  public sexoOptList = personModel.sexoList;
  private isEdit: boolean;
  private user: User;
  private ar$: BehaviorSubject<AccessionRecord>;
  public ar: AccessionRecord;
  public typeFechas: any[];
  constructor(
    private _fb: FormBuilder,
    private _user: UserService,
    private _service: AccessionRecordsService
  ) {
    this.upsertRecord = new EventEmitter<AccessionRecord>();
    this.typeFechas = AccessionRecordsHelper.getOptionList('typeFecha');
    this.ar$ = this._service.selectedARFromTable$;
    this.ar = null
    this.isEdit = false;
    this.initGroup();
  }

  ngOnInit(): void {
    this.ar$.subscribe(ar => {
      if (ar) {
        this.initGroup(ar);
        this.ar = ar;
        this.isEdit = true;
      }
    })
    this.user = this._user.currentUser;
  }

  ngOnDestroy(): void {
    this.resetInitialValues();
  }

  private initGroup(ar?: AccessionRecord): void {
    /** Auxiliares utilizados para verificar que exista un objeto AR */
    const validateMigrante: boolean = !!(ar && ar.migrante);
    const migrante = validateMigrante ? ar.migrante : null;

    this.form = this._fb.group({
      num_expediente: [validateMigrante ? migrante.num_expediente : ''],
      nombre: [validateMigrante ? migrante.nombre : '', Validators.required],
      apellido: [validateMigrante ? migrante.apellido : '', Validators.required],
      fe_nacimiento: [validateMigrante ? new Date(migrante.fe_nacimiento_ts) : null],
      sexo: [validateMigrante ? migrante.sexo : ''],
      barco: [validateMigrante ? migrante.barco : ''],
      libro: [validateMigrante ? migrante.libro : ''],
      caja: [validateMigrante ? migrante.caja : ''],
      puerto: [validateMigrante ? migrante.puerto : ''],
      date_type: [validateMigrante ? migrante.date_type : ARRIBO_VAPOR],
      fe_migracion: [validateMigrante ? migrante.fe_migracion_tx : null, Validators.compose(
        [Validators.minLength(4), Validators.maxLength(10), Validators.pattern('[0-9/]*')]
      )],
      observaciones: [validateMigrante ? migrante.observaciones : null],
      novedad: [validateMigrante ? migrante.novedad : null]
    });
  }

  public onSubmit(): void {
    const fvalue = this.form.value;

    const migrante: Migrante = devutils.copyMatchingKeys<Migrante>(new Migrante(), fvalue);

    if (fvalue.fe_migracion) {
      migrante.fe_migracion_tx = fvalue.fe_migracion; //esto lo guardamos tal como lo ingresa el usuario
      const date_input_ts = devutils.tsToDateInputTx(fvalue.fe_migracion);

      if (date_input_ts) {
        migrante.fe_migracion_ts = date_input_ts;
        migrante.anio_migracion = new Date(date_input_ts).getFullYear();
      }
    }

    if (fvalue.fe_nacimiento) {
      migrante.fe_nacimiento_tx = devutils.datePickerToTx(fvalue.fe_nacimiento);
      migrante.fe_nacimiento_ts = devutils.datePickerToNum(fvalue.fe_nacimiento);
    }

    const action: string = this.isEdit ? EDICION : ALTA;
    const audit = AccessionRecordsHelper.buildAuditAR(action, this.user);
    const accessionRecord = this.isEdit ? this.ar : new AccessionRecord();
    accessionRecord.type = MIGRANTE;
    accessionRecord.audit = audit;
    accessionRecord.migrante = migrante;
    // TODO: orden de aparición

    this.resetForm(RESET_CONTROLS);

    this.upsertRecord.emit(accessionRecord);
  }
  /**
   * Se resetearán aquellos campos que no van a ser compartidos
   */
  private resetForm(controls: string[]): void {
    controls.forEach(control => {
      this.form.get(control).reset();
    })
  }

  public closeForm(): void {
    this._service.headerAction$.next('');
    this.resetInitialValues();
  }

  public resetInitialValues(): void {
    this.ar = null;
    this.isEdit = false;
    this.form.reset();
    this._service.selectedARFromTable$.next(null);
  }

  public resetDatosPersonales(): void {
    this._service.selectedARFromTable$.next(null);
    this.ar = null;
    this.isEdit = false;
    this.resetForm(RESET_CONTROLS);
  }

}
