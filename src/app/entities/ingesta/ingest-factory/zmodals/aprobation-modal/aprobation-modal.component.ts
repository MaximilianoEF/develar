import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IngestProcess } from '../../../ingesta.model';


@Component({
  selector: 'aprobation-modal',
  templateUrl: './aprobation-modal.component.html',
  styleUrls: ['./aprobation-modal.component.scss']
})
export class AprobationModalComponent implements OnInit {
  public title: string;
  public message: string;
  private pi: IngestProcess;
  public errorMsg: Array<string> = [];
  public hasErrors = false;
  public erroMsgLable = 'El PROCESO no se puede APROBAR debido a los siguientes problemas detectados:'

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<AprobationModalComponent>
  ) {
    this.title = data.title;
    this.message = data.message;
    this.pi = data.pi;
    this.errorMsg = data.errorMsg || [];

   }

  ngOnInit(): void {
    this.hasErrors = this.errorMsg.length ? true : false;
 
  }

  public handleOnClose(): void {
    this.dialogRef.close(true);
  }

}
