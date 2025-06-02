import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { NotificationService } from '../../../../../develar-commons/notifications.service';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion.helper';
import { ChildrenUD, IdentificadorUD, UnidadDescripcion } from '../../../unidad-descripcion.model';
import { UnidadDescripcionService } from '../../../unidad-descripcion.service';
import { devutils } from '../../../../../develar-commons/utils';

const IDENTIFICADOR: string = "IDENT";
@Component({
  selector: 'form-identificador',
  templateUrl: './form-identificador.component.html',
  styleUrls: ['./form-identificador.component.scss']
})
export class FormIdentificadorComponent implements OnInit {
  @Input() identificador: IdentificadorUD;
  @Input() ud: UnidadDescripcion;
  @Input() referenceCodeTx: string;
  @Output() value = new EventEmitter<any>();
  @Output() udSelected = new EventEmitter<UnidadDescripcion>();
  @Output() lookUpModels = new EventEmitter<UnidadDescripcion[]>();

  /** Emite el identificador ingresado por el usuario */
  @Output()
  identifierEmitter: EventEmitter<string> = new EventEmitter<string>();

  /** Emite un valor booleano true toda vez que haya que cerrar el área de trabajo de los formularios */
  @Output()
  public closeInputAreaEmitter = new EventEmitter<boolean>();

  public formGroup: FormGroup;
  public docBelongsTo = { error: '' };
  public identifierOrigen: string = "";
  public descriptionLevelList = [];
  public displayNameFld: string = "";
  public selected: boolean = true;
  private searchTerms = new Subject<string>();
  public unidadDescriptions: Observable<UnidadDescripcion[]>;
  public unidadSelected: UnidadDescripcion;
  public flagErrorSelection: boolean = false;
  public flagContentChildren: boolean = false;

  /** Lista de hijos que la UDA elegida contiene */
  @Input()
  public udChildrens: ChildrenUD[] = [];

  /** Los tipos de fecha que el identificador puede contener  */
  public dateTypeList = [];

  constructor(private _fb: FormBuilder,
    private _service: UnidadDescripcionService,
    private _notification: NotificationService,
  ) { }

  ngOnInit(): void {
    this.descriptionLevelList = UnidadDescripcionHelper.getOptionList('descriptionLevel');
    this.dateTypeList = UnidadDescripcionHelper.getOptionList('identifierDateType');

    this.initGroup();
    this.checkParent();

    this.unidadDescriptions = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this._service.testUDByIdentifier(term))
    );

    this.unidadDescriptions.subscribe(tokens => {
      if (tokens && tokens.length) {
        this.lookUpModels.next(tokens);
      }
    })
  }

  private checkParent() {
    if (this.ud && this.ud.parent && this.ud.parent.title) {
      let unidAux = new UnidadDescripcion()
      unidAux._id = this.ud.parent.id_parent;
      unidAux.identificador.identifier = this.ud.parent.identifier;
      unidAux.identificador.title = this.ud.parent.title;
      unidAux.identificador.level_of_description = this.ud.parent.level_of_description;
      this.unidadSelected = unidAux;
      this.selected = true;
    }
  }

  private initGroup() {
    this.formGroup = this._fb.group({
      identifier: [this.identificador ? this.identificador.identifier : null, Validators.required],
      level_of_description: [this.identificador ? this.identificador.level_of_description : null],
      title: [this.identificador ? this.identificador.title : null, Validators.required],
      extent_and_medium: [this.identificador ? this.identificador.extent_and_medium : null],
      dates: this._fb.array([])
    })

    this.identifierOrigen = this.identificador ? this.identificador.identifier : "";
    this.addControls();
  }

  addControls(): void {
    //c onsole.log("[%s]   [%s]",this.datesGet.length.toString(), this.identificador.dates.length.toString())
    if (this.identificador && this.identificador.dates && this.identificador.dates.length && (this.identificador.dates.length > this.datesGet.length)) {
      for (let i = 0; i < this.identificador.dates.length; i++) {
        const group = this._fb.group({
          type: [this.identificador.dates[i].type ? this.identificador.dates[i].type : null, Validators.required],
          date: [this.identificador.dates[i].date ? this.identificador.dates[i].date : null, Validators.required],
          start_date: [this.identificador.dates[i].start_date ? this.identificador.dates[i].start_date : null],
          start_date_ts: [this.identificador.dates[i].start_date_ts ? this.identificador.dates[i].start_date_ts : null],
          end_date: [this.identificador.dates[i].end_date ? this.identificador.dates[i].end_date : null],
          end_date_ts: [this.identificador.dates[i].end_date_ts ? this.identificador.dates[i].end_date_ts : null],
          observacion: [this.identificador.dates[i].observacion ? this.identificador.dates[i].observacion : null]
        });
        this.datesGet.push(group);
      }
    } else {
      const group = this._fb.group({
        type: ['', Validators.required],
        date: ['', Validators.required],
        start_date: [''],
        start_date_ts: [''],
        end_date: [''],
        end_date_ts: [''],
        observacion: ['']
      });
      this.datesGet.push(group);
    }
  }

  public onInputChange(index: number, key: string, val: string): void {
    if (key === 'start_date')
      this.datesGet.at(index).get('start_date_ts').setValue(devutils.numFromISADGStr(val));

    if (key === 'end_date')
      this.datesGet.at(index).get('end_date_ts').setValue(devutils.numFromISADGStr(val, true));

  }

  get datesGet(): FormArray {
    return this.formGroup.get('dates') as FormArray;
  }

  removeControl(): void {
    let index = this.datesGet.length - 1;
    this.datesGet.removeAt(index);
  }

  hasError = (controlName: string, errorName: string) => {
    return this.formGroup.controls[controlName].hasError(errorName);
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  onSubmit() {
    const fvalue = this.formGroup.value;
    const identificador = new IdentificadorUD();
    identificador.identifier = fvalue.identifier;
    identificador.level_of_description = fvalue.level_of_description;
    identificador.title = fvalue.title;
    identificador.dates = fvalue.dates;
    identificador.extent_and_medium = fvalue.extent_and_medium
    identificador.reference_code = this.referenceCodeTx.split('-');
    const emit = {
      type: IDENTIFICADOR,
      value: identificador
    }
    this.value.emit(emit);
  }

  selectEntity(ud: UnidadDescripcion) {

    const controlLevel = this.formGroup.get('level_of_description').value;
    if (!this.unidadSelected && !controlLevel) {
      this.unidadSelected = ud;
      this.udSelected.emit(this.unidadSelected);
    } else {
      const isChildren = UnidadDescripcionHelper.verifyLevelOfDescriptionFatherAndSon
        (controlLevel, ud.identificador.level_of_description);
      if (isChildren) {
        this.unidadSelected = ud;
        this.udSelected.emit(this.unidadSelected);
      } else {
        this._notification.error("No se pudo establecer la relación que indicó. Pruebe seleccionando otra")
      }
    }

  }

  checkSelection(item: string) {
    if (this.unidadSelected) {
      const isChildren = UnidadDescripcionHelper.verifyLevelOfDescriptionFatherAndSon(item, this.unidadSelected.identificador.level_of_description);
      this.flagErrorSelection = !isChildren;
    } else {
      this.flagErrorSelection = false;
    }
    /** Esta validación se realiza para no cambiarle el nivel de descripción si ya tiene hijos vigentes */
    this.flagContentChildren = !!(this.ud && this.ud.identificador.level_of_description != this.formGroup.get('level_of_description').value && this.udChildrens && this.udChildrens.length);

  }

  vincular(e) {
    //this.selected = e.checked;
    if (this.selected) {
      this.udSelected.emit(this.unidadSelected);
      this.checkSelection(this.formGroup.get('level_of_description').value);
    } else {
      this.udSelected.emit(null);
      this.flagErrorSelection = false;
    }
    console.log('vincular3', this.selected)
  }

  hasChanges(llama: string): boolean {
    return this.formGroup.get('identifier').dirty;
  }

  public updateIdentifier(identifier: string): void {
    this.identifierEmitter.emit(identifier);
  }

  public getReferenceCode(reference_code: string[]): string {
    return UnidadDescripcionHelper.buildReferenceCode(reference_code);
  }

  public closeForm(): void {
    this.closeInputAreaEmitter.emit(true);
  }
}
