import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuditUD, UnidadDescripcion } from '../unidad-descripcion.model';
import { UnidadDescripcionHelper } from '../unidad-descripcion.helper';
import { HistoriesModalComponent } from './histories-modal/histories-modal.component';
import { UnidadDescripcionService } from '../unidad-descripcion.service';

const DESCRIPCION = 'DESCR';


@Component({
  selector: 'unidad-descripcion-history',
  templateUrl: './unidad-descripcion-history.component.html',
  styleUrls: ['./unidad-descripcion-history.component.scss']
})
export class UnidadDescripcionHistoryComponent implements OnInit, OnChanges {
  /** Template variables */
  public createdBy: string;
  public createdAt: string;
  public descriptionStatus: string;
  public generalStatus: string;

  public lastModifiedBy: string;
  public lastModifiedAt: string;
  public lastModifiedReason: string;
  public inventario: string;

  /** Emite un valor booleano true toda vez que haya que cerrar el área de trabajo de los formularios */
  @Output()
  public closeInputAreaEmitter = new EventEmitter<boolean>();

  /** Option lists */
  public nivelAvanceList = [];


  /** Recibe la Unidad de Descripción con la que este componente trabajará */
  @Input()
  public unidadDescripcion: UnidadDescripcion;


  /** Emite al page los datos para actualizar el registro */
  @Output()
  public value: EventEmitter<any> = new EventEmitter<any>();


  /** Form para introducir motivo de edición y cambiar nivel de avance */
  public form: FormGroup;

  constructor(
    private service: UnidadDescripcionService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.nivelAvanceList = UnidadDescripcionHelper.getOptionList('nivelAvance');

    this.form = this.fb.group({
      navance: [null, Validators.required],
      reason: ["Instrucciones para la digitalización / preservación", Validators.required],
      procedureTxt : [null],
      inventario: [null]
    });
  }


  ngOnInit(): void {
    this.initForm(this.unidadDescripcion);
    this.initTemplateVariables();
  }

  ngOnChanges(): void {
    this.initForm(this.unidadDescripcion);
    this.initTemplateVariables();
  }

  private initForm(values: UnidadDescripcion) {
    if (values && values.audit) {
      this.form.get('navance').setValue(values.audit.navance);
      this.form.get('procedureTxt').setValue(values.audit.procedureTxt);
      this.form.get('inventario').setValue(values.audit.inventario);
    }
  }

  private initTemplateVariables(): void {
    /** Variables para mostrar en el template **/
    if(this.unidadDescripcion && this.unidadDescripcion.audit){

    this.createdBy = this.unidadDescripcion.audit.creationUsername;
    this.createdAt = this.unidadDescripcion.audit.creationDate;
    this.lastModifiedBy = this.unidadDescripcion.audit.lastModifiedUsername;
    this.lastModifiedAt = this.unidadDescripcion.audit.lastModifiedDate;
    this.lastModifiedReason = this.unidadDescripcion.audit.lastModifiedReason ?
    this.unidadDescripcion.audit.lastModifiedReason : '(sin novedad)';

    this.generalStatus = UnidadDescripcionHelper.getOptionLabel('estados', this.unidadDescripcion.estado);
    this.descriptionStatus = UnidadDescripcionHelper.getOptionLabel('nivelAvance', this.unidadDescripcion.audit.navance);
    this.inventario = this.unidadDescripcion.audit.inventario;
    }


  }

  public onSubmit(): void {
    const fvalue = this.form.value;

    const audit = new AuditUD();

    audit.navance = fvalue.navance;
    audit.lastModifiedReason = fvalue.reason;
    audit.procedureTxt = fvalue.procedureTxt;
    audit.inventario = fvalue.inventario;

    const auditToEmit = {
      type: DESCRIPCION,
      value: audit
    };

    this.value.emit(auditToEmit);
  }

  public returnToBrowser(): void {
    this.router.navigate(['unidad-descripcion']).then();
  }

  public async displayHistory() {
    const histories = await this.service.fetchHistory(this.unidadDescripcion._id);
    const historiesList = UnidadDescripcionHelper.buildHistoryList(histories);
    const title = this.unidadDescripcion.identificador.title;

    const dialogRef = this.dialog.open(HistoriesModalComponent, {
      data: {
        title,
        historiesList
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // c onsole.log(result);
    });
  }

  public closeForm(): void {
    this.closeInputAreaEmitter.emit(true);
  }
}
