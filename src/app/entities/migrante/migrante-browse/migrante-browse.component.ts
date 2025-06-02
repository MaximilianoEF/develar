import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MigranteHelper } from '../migrante.helper';
import { MigranteQuery } from '../migrante.model';

@Component({
  selector: 'migrante-browse',
  templateUrl: './migrante-browse.component.html',
  styleUrls: ['./migrante-browse.component.scss']
})
export class MigranteBrowseComponent implements OnInit {

  @Output()
  lookUpModels = new EventEmitter<MigranteQuery>();
  public form: FormGroup;

  public query: MigranteQuery;
  private searchTerms: Subject<MigranteQuery>;
  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _location: Location
  ) {
    this.searchTerms = new Subject<MigranteQuery>();
    this.initGroup();
  }

  ngOnInit(): void {

    this.searchTerms.pipe(
      tap(term => this.lookUpModels.next(term))
    ).subscribe();

  }

  private initGroup(): void {

    this.form = this.fb.group({
      nombre: [''],
      apellido: [''],
      anioDesde: [1890],
      anioHasta: [1890],
      barconombre: ['']
    });
  }

  private initQuery(form: FormGroup, query: MigranteQuery): MigranteQuery {
    const fvalue = form.value;

    if (!query) {
      query = new  MigranteQuery();
    }

    query.nombre = fvalue.nombre;
    query.apellido = fvalue.apellido;
    query.anioDesde = fvalue.anioDesde;
    query.anioHasta = fvalue.anioHasta;
    query.barconombre = fvalue.barconombre;
    return query;
  }

  public onSelectionChange(key: string, term: string): void {
    if (!this.query) {
      this.query = new MigranteQuery();
    }

    this.query[key] = term;

    this.query = this.initQuery(this.form, this.query);
    this.query = MigranteHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  public search(): void {
    this.query = this.initQuery(this.form, this.query);
    this.query = MigranteHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  public goBack(): void {
    this._router.navigate(['']);

    //this._location.back();
  }


}
