import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SlotTurnoQuery, SlotTurno } from '../slot-turno.model';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SlotTurnoHelper } from '../slot-turno.helper';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'slot-turno-browse',
  templateUrl: './slot-turno-browse.component.html',
  styleUrls: ['./slot-turno-browse.component.scss']
})
export class SlotTurnoBrowseComponent implements OnInit {
  @Output()
  lookUpModels = new EventEmitter<SlotTurnoQuery>();

  public query: SlotTurnoQuery;
  private searchTerms: Subject<SlotTurnoQuery> = new Subject<SlotTurnoQuery>();

  public form: FormGroup;

  /** Listas para filtrado */
  // public dowList = [];
  public sedeList = [];
  public estadosList = [];
  public tipoTurneraList = [];

  constructor(
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.initGroup();
    this.initOptLists();
    this.initSearch();
  }

  private initGroup(): void {
    this.form = this.fb.group({
      // dow: [null],
      sede: [null],
      estado: [null],
      type: [null]
    });
  }

  private initOptLists(): void {
    // this.dowList = SlotTurnoHelper.getOptionList('dow');
    this.sedeList = SlotTurnoHelper.getOptionList('sede');
    this.estadosList = SlotTurnoHelper.getOptionList('estado');
    this.tipoTurneraList = SlotTurnoHelper.getOptionList('tipoTurnera');
  }

  private initSearch(): void {
    this.searchTerms.pipe(
      tap(term => this.lookUpModels.next(term))
    ).subscribe();
  }

  private initQuery(form: FormGroup, query: SlotTurnoQuery): SlotTurnoQuery {
    const fvalue = form.value;

    if (!query) {
      query = new SlotTurnoQuery();
    }

    // query.dow = fvalue.dow;
    query.sede = fvalue.sede;
    query.estado = fvalue.estado;
    query.type = fvalue.type;

    return query;
  }

  public onSelectionChange(key: string, val: string): void {
    if (!this.query) {
      this.query = new SlotTurnoQuery();
    }

    this.query[key] = val;

    this.query = this.initQuery(this.form, this.query);
    this.query = SlotTurnoHelper.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  public search(): void {
    this.query = this.initQuery(this.form, this.query);
    this.query = SlotTurnoHelper.cleanQueryToken(this.query);
    this.searchTerms.next(this.query);
  }
}
