import {Component, Inject, OnInit} from '@angular/core';
import { Taxonomia, TaxonomiaTermino, TaxonomiaTerminoQuery } from '../../taxonomia.model';
import {TaxonomiaService} from '../../taxonomia.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import {devutils} from '../../../../develar-commons/utils';
import {NotificationService} from '../../../../develar-commons/notifications.service';
import { TaxonomiaHelper } from '../../taxonomia.helper';

@Component({
  selector: 'app-alta-rapida',
  templateUrl: './alta-rapida-termino.component.html',
  styleUrls: ['./alta-rapida-termino.component.scss']
})
export class AltaRapidaTerminoComponent implements OnInit {

  // La taxonomía a la que se va a asociar el térmio a crear mediante esta
  // ventana modal
  public taxonomia: Taxonomia;

  // Holder del formulario
  public form: FormGroup;

  // Objeto que almacena los errores de validación
  public errors: any = {};

  constructor(
    private _service: TaxonomiaService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<any>,
    private _fb: FormBuilder,
    private _notification: NotificationService
  ) { }

  ////////////////////////////// Métodos públicos //////////////////////////////
  ngOnInit(): void {
    this._initForm();
    this.taxonomia = this.data.taxonomia;
  }

  autocompletar(slug: string): void {
    // Identificador (forma normalizada de 'Mostrar Como')
    this.form.get('identificador').setValue(devutils.normalizeString(slug));
    this.form.get('formaAbreviada').setValue(slug);
  }

  async onSubmit() {
    const fvalue = this.form.value;
    const termino = new TaxonomiaTermino(fvalue);
    termino.taxonomiaId = this.taxonomia._id;
    termino.taxonomiaIdentificador = this.taxonomia.identificador;

    try {
      const creado = await this._service.createTermino(termino);
      if (creado) {
        this._notification.success(`Término creado satisfactoriamente [${creado._id}]`);
        this._dialogRef.close(creado);
      }
    } catch(error) {
      this._notification.error('Error al crear el término.');
      console.error(error);
    }
  }

  ////////////////////////////// Métodos privados //////////////////////////////
  private _initForm(): void {
    this.form = this._fb.group({
      slug: [ '', Validators.required ],
      identificador: [ '', Validators.required, this._validateIdentificadorUniqueness(this._service, this.errors) ],
      formaAbreviada: [ '', Validators.required ]
    });
  }

  // Valida el identificador de una taxonomía (debe ser unique)
  private _validateIdentificadorUniqueness(service: TaxonomiaService, errors: any): AsyncValidatorFn {
    return ((control: AbstractControl): Observable<ValidationErrors | null> => {
      const identificador = control.value;

      const query: TaxonomiaTerminoQuery = {
        identificador,
        taxonomiaId: this.taxonomia._id
      };


      return service.searchTerminos(query)
        .pipe(
          debounceTime(300),
          map(existe => {
            let valido = true;
            if (existe.length) {
                valido = false;
                errors['identificador'] = 'El identificador está en uso.';
            }

            return !valido ? errors : null;
          })
        );
    });
  }
}
