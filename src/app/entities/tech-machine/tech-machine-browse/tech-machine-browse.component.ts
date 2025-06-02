import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { TechMachineHelper } from '../tech-machine.helper';
import { TechMachineQuery } from '../tech-machine.model';

@Component({
  selector: 'tech-machine-browse',
  templateUrl: './tech-machine-browse.component.html',
  styleUrls: ['./tech-machine-browse.component.scss']
})
export class TechMachineBrowseComponent implements OnInit {

  @Output()
  lookUpModels = new EventEmitter<TechMachineQuery>();

  public query: TechMachineQuery;
  private searchTerms: Subject<any> = new Subject<any>();
  public typeDigitalizacionList : any[];
  public form: FormGroup;
  public entityTypeList = [];

  constructor(
    private fb: FormBuilder
  ) {
    this.typeDigitalizacionList = TechMachineHelper.getOptionList('typeDigitalizaciones');
    this.form = this.fb.group({
      slug: [null],
      cod_machine : [null],
      marca : [null],
      type_digitalizacion : [null]
    });
  }


  ngOnInit(): void {

    this.searchTerms.pipe(
      debounceTime(300),
      tap(term => this.lookUpModels.next(term))
    ).subscribe();

  }

  private initQuery(form: FormGroup, query: TechMachineQuery): TechMachineQuery {
    const fvalue = form.value;

    if (!query) {
      query = new  TechMachineQuery();
    }


    query.slug = fvalue.slug;
    query.cod_machine = fvalue.cod_machine;
    query.marca = fvalue.marca;

    return query;
  }

  public onSelectionChange(key: string, val: string): void {
    if (!this.query) {
      this.query = new TechMachineQuery();
    }

    this.query[key] = val;

    this.query = this.initQuery(this.form, this.query);
    this.query = TechMachineHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }


  public search(): void {
    this.query = this.initQuery(this.form, this.query);
    this.query = TechMachineHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }
}
