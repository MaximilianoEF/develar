import {
  Component,
  Input,
  Output,
  OnInit,
  OnChanges,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';
import { UnidadDescripcion } from '../../unidad-descripcion.model';
import { AuthorityRecord } from '../../../authority-record/authority-record.model';
import { gldef } from '../../../../develar-commons/develar.config';

@Component({
  selector: "unidad-descripcion-header",
  templateUrl: './unidad-descripcion-header.component.html',
  styleUrls: ['./unidad-descripcion-header.component.scss'],
})
export class UnidadDescripcionHeaderComponent implements OnInit, OnChanges {
  @Input()
  ud: UnidadDescripcion;

  /** Lista de instituciones archivísticas */
  @Input()
  companyList: AuthorityRecord[];

  @Input()
  referenceCodeTx: string;

  // TODO: tipado
  // Guarda el registro anterior y el siguiente
  @Input()
  prevNext: any;

  public hasPrev = false;
  public hasNext = false;


  /** Emite si se selecciona una institución archivística en la mat-select */
  @Output()
  companyEmitter: EventEmitter<AuthorityRecord> = new EventEmitter<AuthorityRecord>();

  @Output()
  refreshUdaDialog: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Template properties */
  public referenceCode: string = '';
  public subTitle: string = '';
  public atomSlug: String = '';

  public form: FormGroup;


  constructor(
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      company: [null],
    });
  }

  ngOnChanges() {
    this.referenceCode = this.referenceCodeTx;

    /** Vista de edición */
    if (this.ud) {
      this.referenceCode = this.referenceCodeTx;
      this.atomSlug = UnidadDescripcionHelper.atomSlug(this.ud);
      this.subTitle =
        this.getLabel(
          'descriptionLevel',
          this.ud.identificador.level_of_description
        ) +
        ' :: ' +
        this.ud.identificador.title;
      if (this.ud.company.identifier) {
        const company = this.companyList.find(
          (item) => item.controlArea.identifier === this.ud.company.identifier
        );

        if (company) {
          this.form.get('company').setValue(company);
        }
      }
    } else { /** Alta de UD */
      this.form
        .get('company')
        .setValue(
          this.companyList.find(
            (item) => item.controlArea.identifier === gldef.companyIdentifier
          )
        );
    }
  }

  ngOnInit() {
    this._initPrevNext();
  }

  compareFn(ar1: AuthorityRecord, ar2: AuthorityRecord): boolean {
    return ar1 && ar2 ? ar1._id === ar2._id : ar1 === ar2;
  }

  private getLabel(type: string, key: string) {
    return UnidadDescripcionHelper.getOptionLabel(type, key);
  }

  public updateCompany(company: AuthorityRecord): void {
    this.companyEmitter.emit(company);
  }

  public refreshUdaFromAtom(): void {
    this.refreshUdaDialog.emit(true);
  }

  private _initPrevNext(): void {
    this.hasPrev = !!this.prevNext?.prev;
    this.hasNext = !!this.prevNext?.next;
  }
}
