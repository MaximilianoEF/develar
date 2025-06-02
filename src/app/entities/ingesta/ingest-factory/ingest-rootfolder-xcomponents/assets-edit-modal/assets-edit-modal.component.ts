import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Asset } from '../../../../../develar-commons/develar-entities';

@Component({
  selector: 'assets-edit-modal',
  templateUrl: './assets-edit-modal.component.html',
  styleUrls: ['./assets-edit-modal.component.scss']
})
export class AssetsEditModalComponent implements OnInit {

  public formGroup : FormGroup;
  constructor(public dialogRef : MatDialogRef<AssetsEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public asset : Asset,
    private _fb : FormBuilder) { 

    this.initGroup();
    }

  ngOnInit(): void {
    //c onsole.log("data --> %o",this.asset);
  }

  private initGroup() : void {
    this.formGroup = this._fb.group({

    })
  }

  public onSubmit() : void {

    let asset = new Asset();
    this.dialogRef.close(asset)
  }

}
