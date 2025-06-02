import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Uco, UcoData } from '../../uco.model';
import { UcoService } from '../../uco.service';

@Component({
  selector: 'uco-factory-edit',
  templateUrl: './uco-factory-edit.component.html',
  styleUrls: ['./uco-factory-edit.component.scss']
})
export class UcoFactoryEditComponent implements OnInit {

  @Output() emitSaveChanges = new EventEmitter<Uco>();
  public uco$ : BehaviorSubject<Uco>;
  public formGroup : FormGroup;
  public typeDigitalizacionesList : any[];

  constructor(private _fb : FormBuilder,
    private _service : UcoService,
    private _router : Router) {
      this.uco$ = this._service.uco$;
     }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(){
    let uco = this.uco$.value;
    this.formGroup = this._fb.group({
      cod_uco : [uco && uco.cod_uco ? uco.cod_uco : null, Validators.required],
      slug : [uco && uco.slug ? uco.slug : null],
      descripcion : [uco && uco.descripcion ? uco.descripcion : null],
      sede : [uco && uco.ucoData.sede ? uco.ucoData.sede : null],
      sala : [uco && uco.ucoData.sala ? uco.ucoData.sala : null],
      pasillo : [uco && uco.ucoData.pasillo ? uco.ucoData.pasillo : null],
      estanteria : [uco && uco.ucoData.estanteria ? uco.ucoData.estanteria : null],
      estante : [uco && uco.ucoData.estante ? uco.ucoData.estante : null],
      cod_barras : [uco && uco.cod_barras ? uco.cod_barras : null]
    })
  }

  public onSubmit(){
    let fvalue = this.formGroup.value;
    let ucoModel = new Uco();
    ucoModel.ucoData = new UcoData();
    ucoModel.cod_uco = fvalue.cod_uco;
    ucoModel.slug = fvalue.slug;
    ucoModel.descripcion = fvalue.descripcion;
    ucoModel.cod_barras = fvalue.cod_barras;

    ucoModel.ucoData.sede = fvalue.sede;
    ucoModel.ucoData.sala = fvalue.sala;
    ucoModel.ucoData.pasillo = fvalue.pasillo;
    ucoModel.ucoData.estanteria = fvalue.estanteria;
    ucoModel.ucoData.estante = fvalue.estante;
    
    this.emitSaveChanges.emit(ucoModel)
  }

  public goToBrowse() {
    this._router.navigate(['/develar','uco']);
  }

}
