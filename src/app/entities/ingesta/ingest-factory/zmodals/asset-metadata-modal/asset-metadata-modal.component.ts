import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-asset-metadata-modal',
  templateUrl: './asset-metadata-modal.component.html',
  styleUrls: ['./asset-metadata-modal.component.scss']
})
export class AssetMetadataModalComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AssetMetadataModalComponent>
  ) {
  }

  ngOnInit(): void {
    // c onsole.log('Modal received metadata: %o', this.data);
  }
}
