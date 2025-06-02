import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthorityRecordHelper } from '../../authority-record.helper';
import { UnidadDescripcion, UnidadDescripcionQuery } from '../../../unidad-descripcion/unidad-descripcion.model';
import { Observable, Subject } from 'rxjs';
import { UnidadDescripcionService } from '../../../unidad-descripcion/unidad-descripcion.service';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-related-archival-description',
  templateUrl: './related-archival-description.component.html',
  styleUrls: ['./related-archival-description.component.scss']
})
export class RelatedArchivalDescriptionComponent implements OnInit {
  public form: FormGroup;
  public relationshipNatureList = [];

  public selectedEntity: UnidadDescripcion;
  public hasSelectedEntity = false;

  /**
   * Stream conteniendo las unidades de descripción coincidentes con el
   * identificador ingresado en el formulario. Se usa para auto-completado.
   */
  public archivalDescriptions$: Observable<UnidadDescripcion[]>;
  public searchTerm$ = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RelatedArchivalDescriptionComponent>,
    private archivalDescriptionService: UnidadDescripcionService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      nature: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.relationshipNatureList = AuthorityRecordHelper.getOptionList('relationshipNature');

    this.archivalDescriptions$ = this.searchTerm$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      filter(term => term.length > 3),
      switchMap(term => {
        const query = new UnidadDescripcionQuery();
        query.title = term;
        return this.archivalDescriptionService.search(query);
      })
    );
  }

  public searchEntities(term: string): void {
    this.searchTerm$.next(term);
  }

  public selectEntity(record: UnidadDescripcion): void {
    this.selectedEntity = record;
    this.hasSelectedEntity = true;
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public onSubmit(): void {
    const fvalue = this.form.value;
    const result = {
      nature: fvalue.nature,
      resourceId: this.selectedEntity._id,
      resourceIdentifier: this.selectedEntity.identificador.identifier,
      resourceTitle: this.selectedEntity.identificador.title
    };
    this.dialogRef.close(result);
  }
}
