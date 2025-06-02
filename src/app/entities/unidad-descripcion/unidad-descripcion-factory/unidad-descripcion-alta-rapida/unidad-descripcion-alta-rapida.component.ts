import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';
import {
  IdentificadorUD,
  CompanyUD,
  ParentUD,
} from '../../unidad-descripcion.model';
import { UnidadDescripcionService } from '../../unidad-descripcion.service';
import { gldef } from '../../../../develar-commons/develar.config';
import { AuthorityRecord } from '../../../authority-record/authority-record.model';
import { AuthorityRecordService } from '../../../authority-record/authority-record.service';

const UDC: string = 'unidad documental';
@Component({
  selector: 'unidad-descripcion-alta-rapida',
  templateUrl: './unidad-descripcion-alta-rapida.component.html',
  styleUrls: ['./unidad-descripcion-alta-rapida.component.scss'],
})
export class UnidadDescripcionAltaRapidaComponent implements OnInit {
  public formGroup: FormGroup;
  public docBelongsTo = { error: '' };
  public descriptionLevelList = [];
  public isParent: boolean = false;
  /** Lista de organizaciones */
  public companyList: AuthorityRecord[] = [];
  public flagErrorSelection: boolean = false;
  public isUDS: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UnidadDescripcionAltaRapidaComponent>,
    @Inject(MAT_DIALOG_DATA) public parent: ParentUD,
    private _fb: FormBuilder,
    private _service: UnidadDescripcionService,
    private _authorityRecordService: AuthorityRecordService
  ) {
    this.isParent = !!(this.parent);
    this.descriptionLevelList = UnidadDescripcionHelper.getOptionList('descriptionLevel');
    this.initGroup();
  }

  ngOnInit() {
    this.initOnce();
  }

  private async initOnce() {
    this.companyList = await this._authorityRecordService.findByQuery({ isArchivalInstitution: true }).toPromise();

    const defaultCompany = this.companyList.find(item => item.controlArea.identifier === gldef.companyIdentifier);
    this.formGroup.get('company').setValue(defaultCompany);
  }

  private initGroup() {
    this.formGroup = this._fb.group({
      identifier: [
        null,
        Validators.required
      ],
      level_of_description: [null, Validators.required],
      title: [null, Validators.required],
      dates: this._fb.array([]),
      company: [null],
      udsNumber: [1, [Validators.pattern('[0-9]+'), Validators.minLength(1)]],
      startIn: [11, [Validators.pattern('[0-9]+'), Validators.minLength(1)]],
    });
    this.setValueOfUDC();
  }

  private setValueOfUDC(): void {
    if (this.parent && this.parent.level_of_description === UDC) {
      let control = this.formGroup.get('level_of_description');
      control.setValue('item');
      this.isUDS = true;
    }
  }

  verifyLevelOfDescription(level_of_hijo: string): void {
    if (this.isParent) {
      const isChildren = UnidadDescripcionHelper.verifyLevelOfDescriptionFatherAndSon(level_of_hijo, this.parent.level_of_description);
      this.flagErrorSelection = !isChildren;
    } else {
      this.flagErrorSelection = false;
    }
    this.isUDS = level_of_hijo === 'item';
  }

  compareFn(ar1: AuthorityRecord, ar2: AuthorityRecord): boolean {
    return ar1 && ar2 ? ar1._id === ar2._id : ar1 === ar2;
  }

  onSubmit() {
    const fvalue = this.formGroup.getRawValue();

    const identificador = new IdentificadorUD();
    identificador.identifier = fvalue.identifier;
    identificador.level_of_description = fvalue.level_of_description;
    identificador.title = fvalue.title;

    let company = new CompanyUD();

    let result = {};

    if (this.isParent) {
      this._service.findById(this.parent.id_parent).then((padre) => {
        company = padre.company;
        identificador.reference_code = padre.identificador.reference_code;
        identificador.reference_code.push(identificador.identifier);
        result = {
          identificador,
          company,
          parent: this.parent,
          udsNumber: fvalue.udsNumber,
          startIn: fvalue.startIn,
        };
        this.dialogRef.close(result);
      });
    } else {
      company.authorityRecordId = fvalue.company._id;
      company.countryPrefix = fvalue.company.identityArea.countryPrefix;
      company.displayName = fvalue.company.identityArea.authorizedName;
      company.identifier = fvalue.company.controlArea.identifier;

      identificador.reference_code.push(company.countryPrefix);
      identificador.reference_code.push(company.identifier);
      identificador.reference_code.push(identificador.identifier);

      result = {
        identificador,
        company,
        udsNumber: fvalue.udsNumber,
        startIn: fvalue.startIn,
      };
      this.dialogRef.close(result);
    }
  }

  public getLabel(val: string): string {
    return UnidadDescripcionHelper.getOptionLabel('descriptionLevel', val);
  }
}
