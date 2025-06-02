import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { UcoHelper } from '../../uco.helper';
import { UcoQuery } from '../../uco.model';

@Component({
  selector: 'uco-browse',
  templateUrl: './uco-browse.component.html',
  styleUrls: ['./uco-browse.component.scss']
})
export class UcoBrowseComponent implements OnInit {

  @Output()
  lookUpModels = new EventEmitter<UcoQuery>();

  public query: UcoQuery;
  private searchTerms: Subject<any> = new Subject<any>();
  public typeDigitalizacionList : any[];
  public form: FormGroup;
  public entityTypeList = [];

  constructor(
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      slug: [null],
      cod_uco : [null],
    });
  }


  ngOnInit(): void {

    this.searchTerms.pipe(
      debounceTime(300),
      tap(term => this.lookUpModels.next(term))
    ).subscribe();

  }

  private initQuery(form: FormGroup, query: UcoQuery): UcoQuery {
    const fvalue = form.value;

    if (!query) {
      query = new  UcoQuery();
    }


    query.slug = fvalue.slug;
    query.cod_uco = fvalue.cod_uco;

    return query;
  }

  // public onSelectionChange(key: string, val: string): void {
  //   if (!this.query) {
  //     this.query = new UcoQuery();
  //   }

  //   this.query[key] = val;

  //   this.query = this.initQuery(this.form, this.query);
  //   this.query = UcoHelper.cleanQueryToken(this.query);

  //   this.searchTerms.next(this.query);
  // }


  public search(): void {
    this.query = this.initQuery(this.form, this.query);
    this.query = UcoHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }
}
