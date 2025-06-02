import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { AuthorityRecordModalService } from '../../../../authority-record/authority-record-modal.service';
import { AuthorityRecordService } from '../../../../authority-record/authority-record.service';
import { AuthorityRecord, AuthorityRecordQuery } from '../../../../authority-record/authority-record.model';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';


const CONTEXT: string = "CONTEXTO";
@Component({
  selector: 'form-context',
  templateUrl: './form-context.component.html',
  styleUrls: ['./form-context.component.scss'],
  providers: [AuthorityRecordModalService]
})
export class FormContextComponent implements OnInit {
  public openEditor = false;

  @Output() value = new EventEmitter<any>();
  public formGroup : FormGroup;
  public displayNameFld: string = "";

  public authorityRecords$: Observable<AuthorityRecord[]>;
  private searchTerms$ = new Subject<string>();

  /**
   * La unidad de descripción que se está editando
   */
  @Input()
  public ud: UnidadDescripcion;

  /** Emite un valor booleano true toda vez que haya que cerrar el área de trabajo de los formularios */
  @Output()
  public closeInputAreaEmitter = new EventEmitter<boolean>();

  /**
   * Controlan el registro de autoridad que el usuario haya seleccionado
   */
  public selectedEntities: AuthorityRecord[] = [];
  public hasSelectedEntities = false;

  public areSelectedEntitiesRemovable = true;

  constructor(
    private _fb: FormBuilder,
    private authorityRecordModalService: AuthorityRecordModalService,
    private authorityRecordService: AuthorityRecordService,
  ) { }

  ngOnInit(): void {
    this.initGroup();


    this.authorityRecords$ = this.searchTerms$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      filter(term => term.length > 3),
      switchMap(term => {
        const query = new AuthorityRecordQuery();
        query.authorizedName = term;
        return this.authorityRecordService.findByQuery(query);
      })
    );
  }

  ngOnChanges(): void {
    // FIXME: Mejorar este if
    if (this.ud && this.ud.contexto && this.ud.contexto.creators.length > 0) {
      this.selectedEntities = this.ud.contexto.creators.map(item => {
        const authorityRecord = new AuthorityRecord();
        authorityRecord._id = item.authorityRecordId;
        authorityRecord.controlArea.identifier = item.authorityRecordIdentifier;
        authorityRecord.identityArea.authorizedName = item.authorityRecordName;

        return authorityRecord;
      });

      this.hasSelectedEntities = true;
    }
  }

  private initGroup() {
    this.formGroup = this._fb.group({
      repository: [this.ud ? this.ud.contexto.repository : ''],
      archival_history: [this.ud ? this.ud.contexto.archival_history : ''],
      immediate_source_of_acquisition_or_transfer: [this.ud ? this.ud.contexto.immediate_source_of_acquisition_or_transfer : '']
    });
  }

  public onSubmit(): void{
    const fvalue = this.formGroup.value;

    const emit = {
      type: CONTEXT,
      value: fvalue,
      creators: this.selectedEntities
    };

    this.value.emit(emit);
  }

  search(term: string): void {
    this.searchTerms$.next(term);
  }

  public selectEntity(record: AuthorityRecord): void {
    this.selectedEntities.push(record);
    this.hasSelectedEntities = true;
  }

  public addEntity(): void {
    const dialogRef = this.authorityRecordModalService.setupAuthorityRecordQuickCreation();
    dialogRef.subscribe(record => {
      if (record) {
        this.selectedEntities.push(record);
        this.hasSelectedEntities = true;
      }

    });
  }

  public removeRelatedEntity(record: AuthorityRecord): void {
    const index = this.selectedEntities.indexOf(record);

    if (index >= 0) {
      this.selectedEntities.splice(index, 1);
    }
  }

  public closeForm(): void {
    this.closeInputAreaEmitter.emit(true);
  }
}

