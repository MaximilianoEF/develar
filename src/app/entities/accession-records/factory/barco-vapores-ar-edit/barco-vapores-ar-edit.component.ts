import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccessionRecordsService } from '../../accession-records.service';

@Component({
  selector: 'barco-vapores-ar-edit',
  templateUrl: './barco-vapores-ar-edit.component.html',
  styleUrls: ['./barco-vapores-ar-edit.component.scss']
})
export class BarcoVaporesArEditComponent implements OnInit {

  public form: FormGroup;

  constructor(
              private _service: AccessionRecordsService,
              private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this._initGroup();
  }

  private _initGroup(): void {
    this.form = this._fb.group({});
  }

  public closeForm(): void {
    this._service.headerAction$.next('');
    this.resetInitialValues();
  }

  public onSubmit(): void {
    const fvalue = this.form.value;
  }

  public resetInitialValues(): void {
    // this.ar = null;
    // this.isEdit = false;
    this.form.reset();
    // this._service.selectedARFromTable$.next(null);
  }

}
