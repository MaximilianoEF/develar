import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { devutils } from '../../../develar-commons/utils';
import { AccessionRecordsHelper } from '../accession-records-helper';
import { AccessionRecordQuery } from '../accession-records-model';

@Component({
  selector: 'accession-records-browse',
  templateUrl: './accession-records-browse.component.html',
  styleUrls: ['./accession-records-browse.component.scss']
})
export class AccessionRecordsBrowseComponent implements OnInit {

  @Output()
  lookUpModels = new EventEmitter<AccessionRecordQuery>();
  public form: FormGroup;

  public query: AccessionRecordQuery;
  private searchTerms: Subject<AccessionRecordQuery>;
  public typeFechas: any[];
  constructor(
    private fb: FormBuilder
  ) {
    this.searchTerms = new Subject<AccessionRecordQuery>();
    this.typeFechas = AccessionRecordsHelper.getOptionList('typeFecha');
    this.initGroup();
  }

  ngOnInit(): void {

    this.searchTerms.pipe(
      tap(term => this.lookUpModels.next(term))
    ).subscribe();

  }

  private initGroup(): void {
    const rangoFecha = devutils.getPreviousWeek(new Date());

    this.form = this.fb.group({
      date_type: ['arribovapor', Validators.required],
      anioDesde: [1890, Validators.required],
      anioHasta: [1910, Validators.required],
    });
  }

  private initQuery(form: FormGroup, query: AccessionRecordQuery): AccessionRecordQuery {
    const fvalue = form.value;

    if (!query) {
      query = new  AccessionRecordQuery();
    }

    query.anioDesde = fvalue.anioDesde;
    query.anioHasta = fvalue.anioHasta;
    query.date_type = fvalue.date_type;
    return query;
  }

  public onSelectionChange(key: string, term: string): void {
    if (!this.query) {
      this.query = new AccessionRecordQuery();
    }

    this.query[key] = term;

    this.query = this.initQuery(this.form, this.query);
    this.query = AccessionRecordsHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  public search(): void {
    this.query = this.initQuery(this.form, this.query);
    this.query = AccessionRecordsHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }


}
