import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { Taxonomia, TaxonomiaTerminoTable, TaxonomiaTerminoQuery } from '../../taxonomia.model';
import { TaxonomiaService } from '../../taxonomia.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { MatCheckboxChange } from '@angular/material/checkbox';

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

const CONFIRMATION_EDIT_TAXONOMY_MODAL_CONFIG = {
  data: {
    caption: '¡Atención!',
    body: 'Esta acción puede traer efectos colaterales al editar una taxonomía.<br>¿Está seguro de realizar esta acción?',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    },
    cancel: {
      action: 'cancel',
      label: 'Cancelar'
    }
  }
}
const IDENTIFICADOR: string = 'identificador';
const CANT_EDIT_IDENTIFICADOR: string = 'canEditIdentificador';

import {SharedService} from '../../../../develar-commons/shared-service';
@Component({
  selector: 'tesauro-gdoc-edit',
  templateUrl: './tesauro-gdoc-edit.component.html',
  styleUrls: ['./tesauro-gdoc-edit.component.scss']
})
export class TesauroGdocEditComponent implements OnInit, OnDestroy {

  public tesauroCabeceraId: string;
  public entity: Taxonomia;
  public isEdit = false;
  public showForm = false;
  public canEditTaxonomy: boolean;

  // Formulario
  public form: FormGroup;

  // Errores de async-validación
  public asyncValidationErrors: any = {};

  // Type-ahead de parents
  public parentsFound$: Observable<Taxonomia[]>;
  public dataSource$: BehaviorSubject<TaxonomiaTerminoTable[]>;

  // Título principal de la página
  private pageTitle = 'Gestión de taxonomías';
  public isLocked: boolean;
  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _service: TaxonomiaService,
    private _notificationService: NotificationService,
    private _changeDetector: ChangeDetectorRef,
    private _shared: SharedService
  ) {
    this.tesauroCabeceraId = this._route.snapshot.params.id;
    this.dataSource$ = this._service.dataRecordsSourceTerminos;
    this.isLocked = false;
    this.canEditTaxonomy = false;
    this._shared.emitChange(this.pageTitle);
  }

  ngOnDestroy(): void {
    this._service.dataRecordsSourceTerminos.next([]);
  }

  ngOnInit(): void {
    this._route.params.subscribe(result => {
      if (result) {
        this.tesauroCabeceraId = result.id;
        this._initOnce();
      }
    });
    this._initOnce();
  }

  private _initOnce(): void {
    this.showForm = false;

    if (this.tesauroCabeceraId) {
      this.isEdit = true;
      this._service.findById(this.tesauroCabeceraId)
        .then(entity => {
          this.entity = entity;
          this.isLocked = this.entity.isLocked;
          this._initForm(entity);
          this.showForm = true;

          // Si la taxonomía cargó correctamente, entonces cargo todos sus términos
          // pero ojo, si hay un término seleccionado, entonces debe formar parte
          // de los filtros
          this._service.taxonomiaTerminoSelected$.subscribe(taxonomiaTermino => {
            const query: TaxonomiaTerminoQuery = {
              taxonomiaId: this.entity._id
            };

            if (taxonomiaTermino) {
              query['parentTermId'] = taxonomiaTermino._id;
            }


            console.log('taxonomiaTerminoSelected$ ', query);

            this._service.searchTerminos(query)
              .subscribe(entities => {
                // Esto permite cargar el dataSource a mostrarse debajo
                if (entities) {
                  this._service.updateTableTerminoData(entities);
                }
              });
          });



          /** Corrige error ExpressionChangedAfterItHasBeenChecked */
          this._changeDetector.detectChanges();
        })
        .catch(error => console.error('Error: ', error));
    } else {
      this._initForm();
      this.showForm = true;
    }
  }

  /**
   * Gestiona el envío del formulario de edición de taxonomía.
   *
   */
  async handleSubmit() {
    const fvalue = this.form.getRawValue();
    // Verifico que el campo identificador no haya sido alterado si no se permitió la edición
    const identificadorField = this.form.get(IDENTIFICADOR);

    if (this.isEdit) {
    if (identificadorField.disabled) {
      fvalue.identificador = this.entity.identificador;
      identificadorField.setValue(fvalue.identificador);
    } else {
        this.entity.identificador = fvalue.indentificador;
      }
    }

    console.log('handleSubmit -> fvalue', fvalue);

    if (!this.isEdit) {
      const taxonomia = new Taxonomia(fvalue);

      try {
        const entity = await this._service.create(taxonomia);

        if (entity) {
          this._notificationService.success(`Taxonomía creada satisfactoriamente [${entity._id}]`);
          await this._router.navigate([entity._id], { relativeTo: this._route });
        }
      } catch (error) {
        console.error(error);
        this._notificationService.error(`Ocurrió un error al crear la taxonomía`);
      }
    } else {
      /** Es edición de cabecera*/
      fvalue._id = this.entity._id;
      this.entity = new Taxonomia(fvalue);

      this.entity = await this._service.update(this.entity);
      if(this.entity) {
        this._notificationService.success(`Taxonomía editada satisfactoriamente [${this.entity._id}]`);
        if (this.entity.isLocked) {
          this._disableOrEnableAllControls(true);
          this.isEdit = false;
          this.isLocked = true;
          this._lockAllTerminos();
        }
      }
    }
  }

  private _lockAllTerminos(): void {
    /** Como se bloqueó la taxonomía, hay que bloquear todos sus terminos (si los hubiese) */
    this._service.searchTerminos({ taxonomiaId: this.entity._id })
    .subscribe(entities => {
      if(entities && entities.length) {
        entities.forEach(termino => {
          termino.isLocked = true;
          this._service.updateTermino(termino).then();
        })
      }
    })
  }

  /**
   * Busca una taxonomía según su identificador. Se usa en el type-ahead de
   * taxonomía padre.
   *
   * TODO: generalizar este método para que sirva para cualquier type-ahead
   *
   * @param identificador El identificador -puede ser parcial- a buscar
   */
  searchByIdentificador(identificador: string): void {
    this.parentsFound$ = this._service.search({ identificador, exact: false }).pipe(
      debounceTime(200)
    )
  }

  select(item: Taxonomia): void {
    this.form.get('parentId').setValue(item._id);
  }

  private _initForm(entity?: Taxonomia): void {
    this.form = this._fb.group({
      identificador:     [ entity?.identificador ?? null, Validators.required, [this.validateIdentificadorUniqueness(this._service, this.asyncValidationErrors)] ],
      slug:              [ entity?.slug ?? null, Validators.required ],
      descripcion:       [ entity?.descripcion ?? null, Validators.required ],
      isLocked:          [ entity?.isLocked ?? false ],
      canCreateOnTheFly: [ entity?.canCreateOnTheFly ?? false ],
      canEditIdentificador: [false]
    });

    if(this.isEdit) {
      if(this.isLocked) {
        /** Como la taxonomía está bloqueada, no se puede:
         * - Editar.
         * - Dar de alta términos.
         * - Borrar taxonomía y terminos.
         */
        this._disableOrEnableAllControls(true);
      } else {
        this.form.get(IDENTIFICADOR).disable();
      }
    }
  }

  private _disableOrEnableAllControls(disable: boolean): void {
    Object.keys(this.form.controls).forEach(key => {
      if(disable)
        this.form.get(key).disable();
      else
        this.form.get(key).enable();
    })

    if(!this.form.get(CANT_EDIT_IDENTIFICADOR).value) {
      this.form.get(IDENTIFICADOR).disable();
    }
  }

  changeEditIdentificador(event: MatCheckboxChange): void {
    const identificadorField = this.form.get(IDENTIFICADOR);
    const canEditField = this.form.get(CANT_EDIT_IDENTIFICADOR);
    if (event.checked) {
      this._notificationService.openModalDialog(CONFIRMATION_MODAL_CONFIG)
        .subscribe(result => {
          if(result) {
            identificadorField.enable();
          } else {
            canEditField.setValue(false);
          }
        })
    } else {
      identificadorField.disable();
    }

  }

  changeEditTaxonomy(event: MatCheckboxChange): void {
    if(event.checked) {
      this._notificationService.openModalDialog(CONFIRMATION_EDIT_TAXONOMY_MODAL_CONFIG)
        .subscribe(result => {
          this.canEditTaxonomy = !!(result);
          this._disableOrEnableAllControls(!result);
        })
    } else {
      this.canEditTaxonomy = false;
      this._disableOrEnableAllControls(true);
    }
  }

  /*
   * Async validators
   */

  // Valida el identificador de una taxonomía (debe ser unique)
  validateIdentificadorUniqueness(service: TaxonomiaService, errors: any): AsyncValidatorFn {
    return ((control: AbstractControl): Observable<ValidationErrors | null> => {
      const identificador = control.value;

      return service.search({ identificador })
        .pipe(
          debounceTime(300),
          map(existe => {
            let valido = true;

            if (existe.length) {
               /** Verificamos que estemos en modo edición
               *  y que entity sea !== null
               */
                if(this.isEdit && this.entity) {
                  /** Si el identificador ingresado es distinto de la taxonomia corriente
                   *  entonces lo dejamos pasar.
                   */
                  const isCurrentTaxonomia = existe.find(f => f._id === this.entity._id);
                  if(!isCurrentTaxonomia) {
                    valido = false;
                    errors['taxonomiaIdentificador'] = 'El identificador está en uso.';
                  }
                } else {
                    valido = false;
                    errors['taxonomiaIdentificador'] = 'El identificador está en uso.';
                }
            }

            return !valido ? errors : null;
          })
        );
    });
  }
}
