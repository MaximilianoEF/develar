import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatesUD, UnidadDescripcion } from '../../unidad-descripcion.model';
import { UnidadDescripcionService } from '../../unidad-descripcion.service';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';
import { devutils } from '../../../../develar-commons/utils';
import { AccessionRecordsService } from '../../../accession-records/accession-records.service';
import { AccessionRecord } from '../../../accession-records/accession-records-model';
import { AccessionRecordsHelper } from '../../../accession-records/accession-records-helper';

const FECHA_MIGRANTE_VAL = UnidadDescripcionHelper.getOptionSlug('identifierDateType', 'migraciones');

@Component({
  selector: 'app-uda-minieditor',
  templateUrl: './uda-minieditor.component.html',
  styleUrls: ['./uda-minieditor.component.scss']
})
export class UdaMinieditorComponent implements OnInit {

  public form: FormGroup;

  // ID de la UDA que se va a editar; se pasa como dato al componente
  public udaId: any;

  // UDA que se está editando; se carga a partir del ID cargado en udaId
  public uda: UnidadDescripcion = null;

  // Opt-list de tipos de puntos de accecso
  // public tipoPuntosAccesoList = [];

  // Opt-list de tipos de fechas
  public tipoFechaList = [];

  // Variable que determina si se muestra o no el buscador de UDA
  public mostrarBuscadorDeUda = true;

  // Conjunto original de puntos de acceso (al cargar la UDA)
  private listaPuntosAccesoParaBorrar = [];


  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      private _dialogRef: MatDialogRef<UdaMinieditorComponent>,
      private _fb: FormBuilder,
      private _service: UnidadDescripcionService,
      private _arService: AccessionRecordsService
  ) {
    this.udaId = data.udaId;
  }

  ngOnInit(): void {
    this._inicializarUDA(this.udaId);
    this._inicializarFormulario(this.uda);

    // this.tipoPuntosAccesoList = UnidadDescripcionHelper.getOptionList('tipoPuntoAcceso');
    // this.tipoPuntosAccesoList = AccessionRecordsHelper.getOptionList('headerActions');
    this.tipoFechaList = UnidadDescripcionHelper.getOptionList('identifierDateType');
  }

  cerrarVentana(): void {
    this._dialogRef.close(false);
  }

  /**
   * Actualiza los datos de la UDA que se estaba editando, y la devuelve
   * al componente que invocó a esta ventana modal
   */
  grabar(): void {
    const fvalues = this.form.value;

    this.uda.identificador.identifier = fvalues.identificador;
    this.uda.identificador.title = fvalues.titulo;
    this.uda.audit.inventario = fvalues.inventario;
    
    // Tengo fecha de libro?
    let tieneFechaMigrante = false;

    this.uda.identificador.dates.forEach((fecha, indice) => {
      if (fecha.type === FECHA_MIGRANTE_VAL) {
        fecha.start_date = devutils.datePickerToTx(fvalues.fechaDesde);
        fecha.start_date_ts = devutils.datePickerToNum(fvalues.fechaDesde);
        fecha.end_date = devutils.datePickerToTx(fvalues.fechaHasta);
        fecha.end_date_ts = devutils.datePickerToNum(fvalues.fechaHasta);
        fecha.date = fvalues.fechaTexto;

        tieneFechaMigrante = true;
      }
    });

    if (!tieneFechaMigrante) {
      const nuevaFechaMigrante = new DatesUD();
      nuevaFechaMigrante.type = FECHA_MIGRANTE_VAL;
      nuevaFechaMigrante.start_date = devutils.datePickerToTx(fvalues.fechaDesde);
      nuevaFechaMigrante.start_date_ts = devutils.datePickerToNum(fvalues.fechaDesde);
      nuevaFechaMigrante.end_date = devutils.datePickerToTx(fvalues.fechaHasta);
      nuevaFechaMigrante.end_date_ts = devutils.datePickerToNum(fvalues.fechaHasta);
      nuevaFechaMigrante.date = fvalues.fechaTexto;
      this.uda.identificador.dates.push(nuevaFechaMigrante);
    }

    // Antes de cerrarse la modal, grabo los Accession Records
    /*
    if (fvalues.puntosAcceso.length > 0) {
      for (let k = 0; k < fvalues.puntosAcceso.length; k++) {
        const nuevoAr = new AccessionRecord();

        if (fvalues.puntosAcceso[k]._id && fvalues.puntosAcceso[k]._id !== '') {
          nuevoAr._id = fvalues.puntosAcceso[k]._id;
        }

        nuevoAr.uda.idUda = this.uda._id;
        nuevoAr.uda.title = this.uda.identificador.title;
        nuevoAr.uda.reference_code = this.uda.identificador.reference_code;


        nuevoAr.type = fvalues.puntosAcceso[k].tipo;

        nuevoAr.migrante.barco = fvalues.puntosAcceso[k].campo;

        if (nuevoAr._id) {
          this._arService.update(nuevoAr)
          .then(ar => console.log('Actualizado AR: ', ar))
          .catch(err => console.error(err));
        } else {
          this._arService.create(nuevoAr)
            .then(ar => console.log('Creado AR: ', ar))
            .catch(err => console.error(err));
        }
      }

      // Ahora hay que ver los registros de acceso que hay que eliminar
      this.listaPuntosAccesoParaBorrar.forEach(arId => this._arService.delete(arId));
    }
  */
    this._dialogRef.close(this.uda);
  }

  agregarPuntoAcceso(): void {
    const itemPuntoAcceso = this._fb.group({
      _id: [''],
      tipo: [''],
      campo: ['']
    });

    this.puntosAcceso.push(itemPuntoAcceso);
  }

  removerPuntoAcceso(i: number): void {
    if (this.puntosAcceso.length > 0) {
      this.listaPuntosAccesoParaBorrar.push(this.puntosAcceso.value[i]._id);
      this.puntosAcceso.removeAt(i);
    }
  }

  /**
   * Inicializa el formulario de la ventana modal -para editar la UDA-
   * con una UDA existente o bien al valor por defecto
   *
   * @param uda la UDA a utilizar para inicializar el formulario
   * @private
   */
  private _inicializarFormulario(uda: UnidadDescripcion): void {
    this.form = this._fb.group({
      identificador: [uda ? uda.identificador.identifier : '', Validators.required],
      inventario: [uda ? uda.audit.inventario : '', Validators.required],
      titulo:           [uda ? uda.identificador.title : '', Validators.required],
      fechaTipo: ['', Validators.required],
      fechaTexto: ['', Validators.required],
      fechaDesde:  [''],
      fechaHasta:  [''],
      puntosAcceso:     this._fb.array([])
    });

    if (uda) {
      const fechaMigrantes = uda.identificador.dates.find(fecha => fecha.type === FECHA_MIGRANTE_VAL);

      if (fechaMigrantes) {
        this.form.get('fechaDesde').setValue(devutils.dateFromTx(fechaMigrantes.start_date));
        this.form.get('fechaHasta').setValue(devutils.dateFromTx(fechaMigrantes.end_date));
        this.form.get('fechaTexto').setValue(fechaMigrantes.date);
        this.form.get('fechaTipo').setValue(fechaMigrantes.type);
      }

      // Busco los AccessionRecords
      // this._arService.search({ idUda: uda._id })
      //   .subscribe(accessionRecords => {
      //     if (accessionRecords) {
      //       for (const ar of accessionRecords) {
      //         const arItem = this._fb.group({
      //            _id: [ar._id ? ar._id : ''],
      //           campo: [ar.migrante.barco ? ar.migrante.barco : ''],
      //           tipo: [ar.type ? ar.type : '']
      //          });

      //         (this.form.get('puntosAcceso') as FormArray).push(arItem);
      //       }
      //     }
      //   });
    }
  }

  /**
   * Dado un UDA-id, obtiene sus datos e inicializa el formulario presente en
   * este componente
   *
   * @param udaId el ID de la UDA con la que se va a trabajar
   * @private
   */
  private _inicializarUDA(udaId: string): void {
    this._service.findById(udaId)
      .then(uda => {
        this.uda = uda;
        this._inicializarFormulario(this.uda);
      })
      .catch(err => console.error(err));
  }

  get puntosAcceso() {
    return this.form.get('puntosAcceso') as FormArray;
  }
}
