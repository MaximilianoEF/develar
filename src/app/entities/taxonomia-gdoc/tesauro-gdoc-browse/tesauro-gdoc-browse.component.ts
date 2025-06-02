import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TaxonomiaHelper } from '../taxonomia.helper';
import { TaxonomiaQuery } from '../taxonomia.model';

@Component({
  selector: 'tesauro-gdoc-browse',
  templateUrl: './tesauro-gdoc-browse.component.html',
  styleUrls: ['./tesauro-gdoc-browse.component.scss']
})
export class TesauroGDocBrowseComponent implements OnInit {

  @Output()
  lookUpModels = new EventEmitter<TaxonomiaQuery>();
  public form: FormGroup;

  public query: TaxonomiaQuery;
  private searchTerms: Subject<TaxonomiaQuery>;
  constructor(
    private fb: FormBuilder
  ) {
    this.searchTerms = new Subject<TaxonomiaQuery>();
    this.initGroup();
  }

  ngOnInit(): void {

    this.searchTerms.pipe(
      tap(term => this.lookUpModels.next(term))
    ).subscribe();

  }

  private initGroup(): void {

    this.form = this.fb.group({
      identificador: ['']
    });
  }

  private initQuery(form: FormGroup, query: TaxonomiaQuery): TaxonomiaQuery {
    const fvalue = form.value;

    if (!query) {
      query = new  TaxonomiaQuery();
    }

    query.identificador = fvalue.identificador;
    return query;
  }

  public onSelectionChange(key: string, term: string): void {
    if (!this.query) {
      this.query = new TaxonomiaQuery();
    }

    this.query[key] = term;

    this.query = this.initQuery(this.form, this.query);
    this.query = TaxonomiaHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  public search(): void {
    this.query = this.initQuery(this.form, this.query);
    this.query = TaxonomiaHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }


}

