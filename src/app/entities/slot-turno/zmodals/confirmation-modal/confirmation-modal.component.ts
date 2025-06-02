import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {
  public title: string;
  public message: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<ConfirmationModalComponent>
  ) {
    this.title = data.title;
    this.message = data.message;
   }

  ngOnInit(): void {
  }

  public handleOnClose(): void {
    this.dialogRef.close(true);
  }
}
