import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IngestProcess, UcoProxy } from '../../../ingesta/ingesta.model';
import { Uco, UcoQuery } from '../../uco.model';
import { UcoService } from '../../uco.service';

@Component({
  selector: 'uco-browse-modal',
  templateUrl: './uco-browse-modal.component.html',
  styleUrls: ['./uco-browse-modal.component.scss']
})
export class UcoBrowseModalComponent implements OnInit {

  public formGroup : FormGroup;
  public ucos$ : Observable<Uco[]>;
  public ucoSelected : Uco;
  constructor(public dialogRef : MatDialogRef<UcoBrowseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public pi : IngestProcess,
    private _fb : FormBuilder,
    private _ucoService : UcoService) { }

  ngOnInit(): void {
    this.formGroup = this._fb.group({
      cod_uco : [null, Validators.required]
    })
  }

  public onSubmit() : void {
    let fvalue = this.formGroup.value;
    let query = new UcoQuery();
    query.cod_uco = fvalue.cod_uco;
    this.ucos$ = this._ucoService.findByQuery(query);
  }

  public selectEntity(uco : Uco) : void {
    this.ucoSelected = uco;
  }

  public confirmarSeleccion() : void {
    let ucoProxy = new UcoProxy(this.ucoSelected);
    this.pi.ucos.push(ucoProxy);
    this.dialogRef.close(this.pi);
  }
}
