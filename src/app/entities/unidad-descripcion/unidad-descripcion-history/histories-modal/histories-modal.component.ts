import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UnidadDescripcionHistoryList } from '../../unidad-descripcion.model';

@Component({
  selector: 'app-histories-modal',
  templateUrl: './histories-modal.component.html',
  styleUrls: ['./histories-modal.component.scss']
})
export class HistoriesModalComponent implements OnInit {
  public registerTitle: string;
  public registerHistories: UnidadDescripcionHistoryList[];

  constructor(
    private dialogRef: MatDialogRef<HistoriesModalComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData: any
  ) { }

  ngOnInit(): void {
    this.registerTitle = this.dialogData.title;
    this.registerHistories = this.dialogData.historiesList;
  }

}
