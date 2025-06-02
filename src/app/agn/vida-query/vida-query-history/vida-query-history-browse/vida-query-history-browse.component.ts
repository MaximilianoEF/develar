import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'vida-query-history-browse',
  templateUrl: './vida-query-history-browse.component.html',
  styleUrls: ['./vida-query-history-browse.component.scss']
})
export class VidaQueryHistoryBrowseComponent implements OnInit {

  formGroup : FormGroup;
  constructor(private _fb : FormBuilder) { }

  ngOnInit(): void {
    this.initGroup();
  }

  initGroup() : void {
    this.formGroup = this._fb.group({
      busqueda : ['', Validators.required]
    })
  }

  onSubmit() : void {
    //c onsole.log(this.formGroup.value)
  }
}
