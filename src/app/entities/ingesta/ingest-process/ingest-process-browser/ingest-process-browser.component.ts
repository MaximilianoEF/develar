import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { devutils } from '../../../../develar-commons/utils';
import { IngestaHelper } from '../../ingesta.helper';
import { IngestProcessQuery } from '../../ingesta.model';

@Component({
  selector: 'ingest-process-browser',
  templateUrl: './ingest-process-browser.component.html',
  styleUrls: ['./ingest-process-browser.component.scss']
})
export class IngestProcessBrowserComponent implements OnInit {

  @Output()
  lookUpModels = new EventEmitter<IngestProcessQuery>();

  public query: IngestProcessQuery;
  private searchTerms: Subject<any> = new Subject<any>();

  public form: FormGroup;
  public entityTypeList = [];
  public nivelesAvanceList: any[];
  constructor(
              private fb: FormBuilder
  ) {
    this.nivelesAvanceList = IngestaHelper.getOptionList('nivelesAvance');
    this.initGroup();
  }


  ngOnInit(): void {

    this.searchTerms.pipe(
      debounceTime(300),
      tap(term => this.lookUpModels.next(term))
    ).subscribe();

  }

  private initGroup(): void {

    const rangoFecha = devutils.getPreviousWeek(new Date());
    this.form = this.fb.group({
      fechaDesde: [devutils.datePickerToDate(devutils.dateFromTx(rangoFecha.feDesde)), Validators.required],
      fechaHasta: [devutils.datePickerToDate(devutils.dateFromTx(rangoFecha.feHasta)), Validators.required],
      slug: [null],
      compNum: [null],
      avance: [null]
    });
  }

  private initQuery(form: FormGroup, query: IngestProcessQuery): IngestProcessQuery {
    const fvalue = form.value;

    if (!query) {
      query = new IngestProcessQuery();
    }


    query.slug = fvalue.slug;
    query.compNum = fvalue.compNum;
    query.avance = fvalue.avance;
    query.fechaDesde = devutils.datePickerToNum(fvalue.fechaDesde);
    query.fechaHasta = devutils.datePickerToNumPlusOne(fvalue.fechaHasta);
    return query;
  }


  public search(): void {
    this.query = this.initQuery(this.form, this.query);
    this.query = IngestaHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  public onSelectionChange(key: string, val: string): void {
    if (!this.query) {
      this.query = new IngestProcessQuery();
    }

    this.query[key] = val;

    if (this.form.valid) {
      this.query = this.initQuery(this.form, this.query);
      this.query = IngestaHelper.cleanQueryToken(this.query);

      this.searchTerms.next(this.query);
    }
  }




}

