import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthorityRecord, AuthorityRecordQuery } from '../../authority-record.model';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { AuthorityRecordService } from '../../authority-record.service';
import { AuthorityRecordHelper } from '../../authority-record.helper';

@Component({
  selector: 'app-related-authority-record',
  templateUrl: './related-authority-record.component.html',
  styleUrls: ['./related-authority-record.component.scss']
})
export class RelatedAuthorityRecordComponent implements OnInit {
  public form: FormGroup;
  public categoryList = [];

  public selectedEntity: AuthorityRecord;
  public hasSelectedEntity = false;

  /**
   * Stream conteniendo los registros de autoridad coincidentes con el
   * identificador ingresado en el formulario. Se usa para auto-completado.
   */
  public authorityRecords$: Observable<AuthorityRecord[]>;
  public searchTerm$ = new Subject<string>();

  constructor(
    private authorityRecordService: AuthorityRecordService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RelatedAuthorityRecordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      category: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.categoryList = AuthorityRecordHelper.getOptionList('relationshipCategory');

    this.authorityRecords$ = this.searchTerm$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      filter(term => term.length > 3),
      switchMap(term => {
        const query = new AuthorityRecordQuery();
        query.authorizedName = term;
        return this.authorityRecordService.findByQuery(query);
      }
      )
    );
  }



  public searchEntities(term: string): void {
    this.searchTerm$.next(term);
  }

  public selectEntity(record: AuthorityRecord): void {
    this.selectedEntity = record;
    this.hasSelectedEntity = true;
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public onSubmit(): void {
    const fvalue = this.form.value;
    const result = {
      category: fvalue.category,
      authorityRecordId: this.selectedEntity._id,
      authorityRecordType: this.selectedEntity.identityArea.entityType,
      authorityRecordName: this.selectedEntity.identityArea.authorizedName
    };

    this.dialogRef.close(result);
  }
}
