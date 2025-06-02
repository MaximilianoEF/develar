import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnidadDescripcion } from '../../unidad-descripcion.model';

@Component({
  selector: 'unidad-descripcion-text-area',
  templateUrl: './unidad-descripcion-text-area.component.html',
  styleUrls: ['./unidad-descripcion-text-area.component.scss']
})
export class UnidadDescripcionTextAreaComponent implements OnInit {

  @Output() emitText = new EventEmitter<string>();
  @Input() ud : UnidadDescripcion;
  public formGroup : FormGroup;
  constructor(private _fb : FormBuilder) { }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(){
    this.formGroup = this._fb.group({
      text : [this.ud && this.ud.dataWord ? this.ud.dataWord : '']
    })
  }

  onSubmit(){
    //c onsole.log(this.formGroup.value)
  }

  emitTextArea(){
    this.emitText.emit(this.formGroup.get('text').value);
  }
}