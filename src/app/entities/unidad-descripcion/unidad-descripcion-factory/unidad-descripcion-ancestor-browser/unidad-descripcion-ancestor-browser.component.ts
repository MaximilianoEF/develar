import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'unidad-descripcion-ancestor-browser',
  templateUrl: './unidad-descripcion-ancestor-browser.component.html',
  styleUrls: ['./unidad-descripcion-ancestor-browser.component.scss']
})
export class UnidadDescripcionAncestorBrowserComponent implements OnInit {

  public formGroup : FormGroup;
  constructor(private _fb : FormBuilder) { }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(){
    this.formGroup = this._fb.group({
      ancestro : ['', Validators.required]
    })
  }

  onSubmit(){
    //c onsole.log(this.formGroup.value)
  }
}
