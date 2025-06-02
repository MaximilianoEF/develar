import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, of } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { TaxonomiaHelper } from '../../taxonomia.helper';
import { Taxonomia, TaxonomiaTermino, BreadcrumbPart } from '../../taxonomia.model';
import { TaxonomiaService } from '../../taxonomia.service';
import { devutils } from '../../../../develar-commons/utils';

const CONFIRMATION_MODAL_CONFIG = {
  data: {
    caption: '¡Atención!',
    body: 'Esta acción puede traer efectos colaterales a cambiar el identificador.<br>¿Está seguro de realizar esta acción?',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    },
    cancel: {
      action: 'cancel',
      label: 'Cancelar'
    }
  }
};
@Component({
  selector: 'taxonomia-termino-edit',
  templateUrl: './taxonomia-termino-edit.component.html',
  styleUrls: ['./taxonomia-termino-edit.component.scss']
})
export class TaxonomiaTerminoEditComponent implements OnInit, OnDestroy {
  @Input() taxonomia: Taxonomia;

  public form: FormGroup;
  @ViewChild('formDirective') private formDirective: NgForm;

  separatorKeysCodes: number[] = [ENTER, COMMA];

  public isEdit: boolean;
  public sinonimos: string[];

  // Término elegido y actualmente cargado en el formulario
  termino: TaxonomiaTermino;

  // Errores de async-validación
  public asyncValidationErrors: any = {};

  // Arreglo de términos hallados, se usa para el type-ahead de identificador padre
  // de un término
  parentTermsFound$: Observable<TaxonomiaTermino[]>;

  // Breadcrumb perteneciente al término que se está viendo
  breadcrumb$: Observable<BreadcrumbPart[]>;

  constructor(
    private _service: TaxonomiaService,
    private _fb: FormBuilder,
    private _notificationService: NotificationService
  ) {
    this.isEdit = false;
  }

  ngOnDestroy(): void {
    this._resetInitialValues();
  }

  ngOnInit(): void {
    this._initGroup();

    this._service.taxonomiaTerminoSelected$
      .subscribe(termino => {
        if (termino) {
          this.termino = termino;
          this.isEdit = true;
          this._initGroup(termino);
          this._initBreadcrumb(termino);
        }
      });
  }

  async activarTaxonomiaDesdeBreadcrumb() {
    try {
      const terminos = await this._service.searchTerminos({ taxonomiaId: this.taxonomia._id }).toPromise();

      if (terminos) {
        this._service.dataRecordsSourceTerminos.next(TaxonomiaHelper.buildTaxonomiaTerminoDataTable(terminos));
        this.formDirective.resetForm();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async activarTerminoDesdeBreadcrumb(item: BreadcrumbPart) {
    try {
      const termino = await this._service.findTerminoById(item.id);

      if (termino) {
        this._service.taxonomiaTerminoSelected$.next(termino);
      } else {
        console.error('El término ue se intenta activar no existe.');
      }
    } catch (error) {
      console.error(error);
    }
  }

  async add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    const esSinonimoUnicoEnTaxonomia = await this._validarUnicidadDeSinonimo(value, this.taxonomia);

    if (value.length) {
      if (esSinonimoUnicoEnTaxonomia && !this.sinonimos.includes(value)) {
        this.sinonimos.push(value);
        event.input.value = '';
      } else {
        // TODO: Indicar en QUÉ término se usa el sinónimo
        this._notificationService.warn(`El sinónimo "${value}" ya está en uso en este u otro término.`);
      }
    }

  }

  remove(index: number): void {
    this.sinonimos.splice(index, 1);
  }


  /**
   *  Event-handler para el envío del formulario
   */
  async onSubmit() {
    const fvalue = this.form.getRawValue();
    /** Verifico que el campo identificador no haya sido alterado
     *  si no se permitió la edición
     */
    const identificadorField = this.form.get('identificador');

    if (this.isEdit) {
      if (identificadorField.disabled) {
        fvalue.identificador = this.termino.identificador;
        identificadorField.setValue(fvalue.identificador);
      } else {
        this.termino.identificador = fvalue.identificador;
      }
    }


    const termino = TaxonomiaHelper.buildTermino(fvalue, this.taxonomia, this.sinonimos);



    // Ahora verificamos si damos de alta el termino o lo editamos
    try {
      let result: TaxonomiaTermino;

      if (this.isEdit) {
        termino._id = this.termino._id;
        /** Tenemos un termino seleccionado para su edición */
        result = await this._service.updateTermino(termino);

        if (result) {
          this._notificationService.success(`Termino [${result._id}] actualizado satisfactoriamente.`);
          this._refreshDataSource(result);

        }
      } else {
        /** Tenemos que dar de alta el termino */
        result = await this._service.createTermino(termino);

        if (result) {
          this._notificationService.success(`Termino [${result._id}] creado satisfactoriamente.`);
          this._refreshDataSource(result);
        }
      }

      this._resetInitialValues();

      this.form.get('parentTermId').setValue(result.parentTermId);
      this.form.get('parentTermIdentificador').setValue(result.parentTermIdentificador);
    } catch (error) {
      console.error(error);
      this._notificationService.error(`Se ha producido un error al realizar la operación.`);
    }


  }

  searchByIdentificador(identificador: string): void {
    this.parentTermsFound$ = this._service.searchTerminos({
      identificador,
      taxonomiaId: this.taxonomia._id,
      exact: false
    }).pipe(
      debounceTime(200)
    );
  }

  changeEditIdentificador(event: MatCheckboxChange): void {
    const identificadorField = this.form.get('identificador');
    const canEditField = this.form.get('canEditIdentificador');
    if (event.checked) {
      this._notificationService.openModalDialog(CONFIRMATION_MODAL_CONFIG)
        .subscribe(result => {
          if (result) {
            identificadorField.enable();
          } else {
            canEditField.setValue(false);
          }
        });
    } else {
      identificadorField.disable();
    }

  }


  select(item: TaxonomiaTermino): void {
    this.form.get('parentTermId').setValue(item._id);
  }


  cancelEdit(): void {
    this._resetInitialValues();

    this.form.get('parentTermId').setValue(this.termino.parentTermId);
    this.form.get('parentTermIdentificador').setValue(this.termino.parentTermIdentificador);


    this.termino = null;
  }

  autocompletar(slug: string): void {
    // Identificador (forma normalizada de 'Mostrar Como')
    this.form.get('identificador').setValue(devutils.normalizeString(slug));
    this.form.get('formaAbreviada').setValue(slug);
  }


  /**
   * Valida que un sinónimo sea único para todo término dentro de la taxonomía elegida
   *
   * @param sinonimo el sinónimo que se desea validar
   * @param taxonomia la taxonomía para la que se validará el sinónimo
   * @returns {boolean} true si el sinónimo es único, false en caso contrario
   */
  private async _validarUnicidadDeSinonimo(sinonimo: string, taxonomia: Taxonomia): Promise<boolean> {
    let esUnico = false;

    try {
      esUnico = await this._service.esSinonimoUnicoEnTaxonomia(sinonimo, taxonomia._id);
    } catch (error) {
      console.error(error);
    }

    return esUnico;
  }

  /**
   * Genera el breadcrumb para el término especificado.
   *
   * @param termino el término para el que se va a generar el breadcrumb
   */
  private _initBreadcrumb(termino: TaxonomiaTermino): void {
    if (termino) {
      this.breadcrumb$ = this._service.getBreadcrumb(termino._id);
    } else {
      this.breadcrumb$ = of(null);
    }
  }

  private _initGroup(termino?: TaxonomiaTermino): void {
    this.form = this._fb.group({
      identificador:           [termino && termino.identificador ? termino.identificador : '', Validators.required, [this.validateIdentificadorUniqueness(this._service, this.asyncValidationErrors)]],
      descripcion:             [termino && termino.descripcion ? termino.descripcion : ''],
      slug:                    [termino && termino.slug ? termino.slug : '', Validators.required],
      isLocked:                [termino && termino.isLocked ? termino.isLocked : false],
      notasAlcance:            [termino && termino.notasAlcance ? termino.notasAlcance : ''],
      notasOrigen:             [termino && termino.notasOrigen ? termino.notasOrigen : ''],
      formaAbreviada:          [ termino?.formaAbreviada ?? '' ],
      parentTermId:            [ termino?.parentTermId ?? '' ],
      parentTermIdentificador: [ termino?.parentTermIdentificador ?? '' ],
      canEditIdentificador:    [false]
    });

    this.sinonimos = termino && termino.sinonimos && termino.sinonimos.length ? termino.sinonimos : [];

    if (this.isEdit) {
      this.form.get('identificador').disable();
    }
  }

  private _refreshDataSource(entity: TaxonomiaTermino): void {
    const dataSource = this._service.dataRecordsSourceTerminos.value;
    const dataTable = TaxonomiaHelper.buildTaxonomiaTerminoDataTable([entity])[0];
    if (this.isEdit) {
      /** Edición de Termino */
      const index = dataSource.findIndex(f => f._id === entity._id);
      if (dataSource[index]) {
        dataSource[index] = dataTable;
        this._service.dataRecordsSourceTerminos.next(dataSource);
      }
    } else {
      /** Alta de Termino */
      if (dataSource && dataSource.length) {
        this._service.dataRecordsSourceTerminos.next([...dataSource, dataTable]);
      } else {
        this._service.dataRecordsSourceTerminos.next([dataTable]);
      }
    }
  }

  private _resetInitialValues(): void {
    this.sinonimos = [];
    this.isEdit = false;

    this.formDirective.resetForm();

    this.form.get('identificador').enable();
    this.form.clearAsyncValidators();
    this.form.clearValidators();
    this.form.updateValueAndValidity();

  }

  /*
   * Async validators
   */

  // Valida el identificador de una taxonomía (debe ser unique)
  validateIdentificadorUniqueness(service: TaxonomiaService, errors: any): AsyncValidatorFn {
    return ((control: AbstractControl): Observable<ValidationErrors | null> => {
      const identificador = control.value;

      return service.searchTerminos({ identificador })
        .pipe(
          debounceTime(300),
          map(existe => {
            let valido = true;
            if (existe.length) {
              /** Verificamos que estemos en modo edición
               *  y que termino sea !== null
               */
              if (this.isEdit && this.termino) {
                /** Si el identificador ingresado es distinto del termino corriente
                 *  entonces lo dejamos pasar.
                 */
                const isCurrentTermino = existe.find(f => f._id === this.termino._id);
                if (!isCurrentTermino) {
                  valido = false;
                  errors['terminoIdentificador'] = 'El identificador está en uso.';
                }
              } else {
                valido = false;
                errors['terminoIdentificador'] = 'El identificador está en uso.';
              }
            }
            return !valido ? errors : null;
          })
        );
    });
  }
}
