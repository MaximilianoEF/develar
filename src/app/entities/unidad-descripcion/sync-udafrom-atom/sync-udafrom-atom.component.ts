import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-sync-udafrom-atom',
  templateUrl: './sync-udafrom-atom.component.html',
  styleUrls: ['./sync-udafrom-atom.component.scss']
})
export class SyncUDAfromAtomComponent implements OnInit {

  public form: FormGroup;

  constructor(
              private _fb: FormBuilder,
              public matDialogRef: MatDialogRef<SyncUDAfromAtomComponent>
  ){}

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(): void {
    this.form = this._fb.group({
      atomSlug : ['', Validators.required]
    })
  }

  public onSubmit(): void {
    const fvalue = this.form.value;
    this.matDialogRef.close(fvalue.atomSlug);
  }

}
