import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetService } from '../asset.service';
import { Asset } from '../develar-entities';
import { NotificationService } from '../notifications.service';

@Component({
  selector: 'render-assets-modal',
  templateUrl: './render-assets-modal.component.html',
  styleUrls: ['./render-assets-modal.component.scss']
})
export class RenderAssetsModalComponent implements OnInit {

  public asset: Asset;
  public showMaster: boolean;
  public hasPDF: boolean;
  public urlDownload: string;
  constructor(
              public dialogRef: MatDialogRef<RenderAssetsModalComponent>,
              @Inject(MAT_DIALOG_DATA) public assetId: string,
              private assetService: AssetService,
              private _notificationService: NotificationService
  ){
    this.showMaster = false;
    this.hasPDF = false;
  }

  ngOnInit(): void {
    this.initOnce();
  }

  private async initOnce() {
    try {
      const asset = await this.assetService.getAsset(this.assetId)
      if(asset) {
        this.asset = asset;
        if(asset.assetType === 'image' || asset.assetType === 'pdf') {
          this.urlDownload = `/download/withserver/${this.assetId}`;
        } else if( asset.assetType === 'directory') {
          this.hasPdfWithAssetId(this.assetId);
          this.urlDownload = `/download/derivada/${this.assetId}`;
        }
        console.log('urlDownload: [%s]', this.urlDownload);
      }
    } catch (error) {
      console.error("error --> %o",error);
      this._notificationService.error(`Se ha producido un error al recuperar el Asset.`);
    }
  }


  public hasPdfWithAssetId(assetId: string): void {
    this.assetService.existPDFWithAsset(assetId)
      .subscribe(result => {
        this.hasPDF = result;
      });
  }

  public recuperarMaster(show: boolean) {
    this.showMaster = show;
  }
}