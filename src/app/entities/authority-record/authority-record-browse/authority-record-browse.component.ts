import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthorityRecordQuery } from '../authority-record.model';
import { AuthorityRecordHelper } from '../authority-record.helper';



@Component({
  selector: 'authority-record-browse',
  templateUrl: './authority-record-browse.component.html',
  styleUrls: ['./authority-record-browse.component.scss']
})
export class AuthorityRecordBrowseComponent implements OnInit {
  @Output()
  lookUpModels = new EventEmitter<AuthorityRecordQuery>();

  public query: AuthorityRecordQuery;
  private searchTerms: Subject<AuthorityRecordQuery> = new Subject<AuthorityRecordQuery>();

  public form: FormGroup;
  public entityTypeList = [];

  constructor(
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      entityType: [null]
    });
  }


  ngOnInit(): void {
    this.entityTypeList = AuthorityRecordHelper.getOptionList('entityType');

    this.searchTerms.pipe(
      tap(term => this.lookUpModels.next(term))
    ).subscribe();
  }

  private initQuery(form: FormGroup, query: AuthorityRecordQuery): AuthorityRecordQuery {
    const fvalue = form.value;

    if (!query) {
      query = new  AuthorityRecordQuery();
    }

    query.entityType = fvalue.entityType;
    return query;
  }

  public onSelectionChange(key: string, val: string): void {
    if (!this.query) {
      this.query = new AuthorityRecordQuery();
    }

    this.query[key] = val;

    this.query = this.initQuery(this.form, this.query);
    this.query = AuthorityRecordHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  public search(): void {
    this.query = this.initQuery(this.form, this.query);
    this.query = AuthorityRecordHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }
}
