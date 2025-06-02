import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';
import { UnidadDescripcion } from '../../unidad-descripcion.model';

@Component({
  selector: 'list-selected-ud-modal',
  templateUrl: './list-selected-ud-modal.component.html',
  styleUrls: ['./list-selected-ud-modal.component.scss']
})
export class ListSelectedUdModalComponent implements OnInit {

  @ViewChild(MatSelectionList, {static: false}) list: MatSelectionList;
  constructor(
              public dialogRef: MatDialogRef<ListSelectedUdModalComponent>,
              @Inject(MAT_DIALOG_DATA) public udaList: UnidadDescripcion[]
  ) { }

  ngOnInit(): void {
  }

  public getReferenceCode(reference_code): string {
    return UnidadDescripcionHelper.buildReferenceCode(reference_code);
  }

  public submit(): void {
    this.dialogRef.close(this.list.selectedOptions.selected[0].value);
  }

}
