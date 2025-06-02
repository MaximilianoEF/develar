import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnidadDescripcionHelper } from '../unidad-descripcion.helper';
import { UnidadDescripcion, UnidadDescripcionQuery} from '../unidad-descripcion.model';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { UnidadDescripcionService } from '../unidad-descripcion.service';
import { UnidadDescripcionModalService } from '../unidad-descripcion-modal.service';


const REPORTE_MIGRAR_ATOM = 'ATOM-ALTA';
const REPORTE_EXPORT_NORMAL = 'EXPORT_NORMAL';


@Component({
  selector: 'unidad-descripcion-browse',
  templateUrl: './unidad-descripcion-browse.component.html',
  styleUrls: ['./unidad-descripcion-browse.component.scss'],
  providers: [UnidadDescripcionModalService]
})
export class UnidadDescripcionBrowseComponent implements OnInit {
  @Output()
  lookUpModels = new EventEmitter<UnidadDescripcionQuery>();

  @Output()
  exportarParaAtom = new EventEmitter<number>();

  public form: FormGroup;

  public descriptionLevelList = [];
  public estadosList = [];
  public nivelAvanceList = [];
  public query: UnidadDescripcionQuery;
  private searchTerms: Subject<UnidadDescripcionQuery> = new Subject<UnidadDescripcionQuery>();
  private searchParent$: Subject<string> = new Subject<string>();
  public udasParent$: Observable<UnidadDescripcion[]>;
  public unidadSelected: UnidadDescripcion = null;

  /**
   * Guarda el estado de selección del checkbox para mostrar-ocultar
   * registros no existentes en AtoM
   */
  puedeExportarParaAtom: boolean = false;

  constructor(
              private fb: FormBuilder,
              private _service: UnidadDescripcionService,
              private _modalService: UnidadDescripcionModalService
  ) {
    this.initGroup();

  }

  ngOnInit(): void {
    this.descriptionLevelList = UnidadDescripcionHelper.getOptionList('descriptionLevel');
    this.estadosList = UnidadDescripcionHelper.getOptionList('estados');
    this.nivelAvanceList = UnidadDescripcionHelper.getOptionList('nivelAvance');

    this.udasParent$ = this.searchParent$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.selectEntity(null);
        return this._service.testUDByIdentifier(term)
      }
        )
    );

    this.searchTerms.pipe(
      tap(term => this.lookUpModels.next(term))
    ).subscribe();

  }

  private initGroup(): void {
    this.form = this.fb.group({
      descriptionlevel: [null],
      title: [null],
      estado: [null],
      navance: [null],
      identifier: [null],
      codigo_referencia: [null],
      displayNameFld: [null],
      selected: [false],
      reporte: [null]
    });
  }

  private initQuery(form: FormGroup, query: UnidadDescripcionQuery): UnidadDescripcionQuery {
    const fvalue = form.value;

    if (!query) {
      query = new  UnidadDescripcionQuery();
    }


    query.descriptionlevel = fvalue.descriptionlevel;
    query.title = fvalue.title;
    query.estado = fvalue.estado;
    query.navance = fvalue.navance;
    query.identifier = fvalue.identifier;
    query.codigo_referencia = fvalue.codigo_referencia;
    return query;
  }

  public onSelectionChange(key: string, term: string): void {
    if (!this.query) {
      this.query = new UnidadDescripcionQuery();
    }

    this.query[key] = term;

    this.query = this.initQuery(this.form, this.query);
    this.query = UnidadDescripcionHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  public search(): void {
    this.query = this.initQuery(this.form, this.query);
    this.query = UnidadDescripcionHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  exportar(): void {
    if (!this.query) {
      this.query = this.initQuery(this.form, this.query);
    }

    console.info('Work-in-progress');
  }

  searchParent(term: string): void {
    this.searchParent$.next(term);
  }

  selectEntity(ud: UnidadDescripcion) {
    if(ud) {
      this.unidadSelected = ud;
      this.form.get('codigo_referencia').setValue(ud.identificador.reference_code.join(' '));
      this.form.get('selected').setValue(true);
    } else {
      this._clearControls();
    }
  }

  getReferenceCode(reference_code: string[]): string {
    return UnidadDescripcionHelper.buildReferenceCode(reference_code);
  }

  vincular(e) {
    //this.selected = e.checked;
    if (!this.form.get('selected').value) {
      this._clearControls();
    }
  }

  /**
   * Abre la ventana de confirmación de migración de registros, emitiendo luego un evento
   * conteniendo el timestamp de la migración, que luego es utilizado para producir
   * el archivo Excel
   */
  exportarAtom(): void {
    if (!this.query) {
      this.query = this.initQuery(this.form, this.query);
    }

    this.query.reporte = REPORTE_MIGRAR_ATOM;

    this._modalService.openExportModal({ data: this.query }).subscribe(resultado => {
      if (resultado) {
        this.exportarParaAtom.next(resultado.timestamp);
      }
    });
  }

  filtrarParaAtom(estado = false): void {
    if (!this.query) {
      this.query = this.initQuery(this.form, this.query);
    }
    this.puedeExportarParaAtom = estado;

    if (this.puedeExportarParaAtom) {
      this.query.isAtom = false;
      this.query.transferidoAtom = false;
    } else {
      this.query.isAtom = null;
      this.query.transferidoAtom = null;
    }

    this.query = UnidadDescripcionHelper.cleanQueryToken(this.query);
    this.searchTerms.next(this.query);
  }

  private _clearControls(): void {
    this.unidadSelected = null;
    this.form.get('codigo_referencia').setValue(null);
  }

}
