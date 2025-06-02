import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-slug-pi-edit',
  templateUrl: './slug-pi-edit.component.html',
  styleUrls: ['./slug-pi-edit.component.scss']
})
export class SlugPiEditComponent implements OnInit {

  public form: FormGroup;
  constructor(
              private _fb: FormBuilder,
              public dialogRef: MatDialogRef<SlugPiEditComponent>,
              @Inject(MAT_DIALOG_DATA) public slug: string
  ) {
    this._initForm();
  }

  ngOnInit(): void {
  }

  private _initForm(): void {
    this.form = this._fb.group({
      slug: ['', Validators.required]
    })
  }

  public onSubmit(): void {
    const fvalue = this.form.value;

    this.dialogRef.close(fvalue.slug);
  }

}
