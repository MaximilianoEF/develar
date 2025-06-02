import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { devutils } from '../../../../develar-commons/utils';

@Component({
  selector: 'tesauro-browse',
  templateUrl: './tesauro-browse.component.html',
  styleUrls: ['./tesauro-browse.component.scss']
})
export class TesauroBrowseComponent implements OnInit {

  @Output() onEmitForm : EventEmitter<TesauroSearchForm> = new EventEmitter<TesauroSearchForm>();
  maxDate : Date = new Date();
  formGroup : FormGroup;

  constructor(private _fb : FormBuilder) { }

  ngOnInit(): void {
    this.initGroup()
  }

  initGroup(){

    let rango = devutils.getPreviousWeek(new Date());
    this.formGroup = this._fb.group({
      fechaDesde : [devutils.dateFromTx(rango.feDesde), Validators.required],
      fechaHasta : [devutils.dateFromTx(rango.feHasta), Validators.required]
    })
 
  }

  onSubmit() {
    let query = new TesauroSearchForm();
    let fvalue = this.formGroup.value;

    query.fechaDesde = devutils.datePickerToNum(fvalue.fechaDesde);
    query.fechaHasta = devutils.datePickerToNumPlusOne(fvalue.fechaHasta);

    this.onEmitForm.emit(query);
  }



}

export class TesauroSearchForm {
    fechaDesde : number;
    fechaHasta : number;
}
