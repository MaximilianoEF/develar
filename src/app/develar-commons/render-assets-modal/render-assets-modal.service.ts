import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { RenderAssetsModalComponent } from "./render-assets-modal.component";

@Injectable()
export class RenderAssetsModalService {

  constructor(
              private _matDialog: MatDialog
  ){}

  public renderAssets(assetId: string): void {
    this._openRenderAssetsModal(assetId);
  }

  private _openRenderAssetsModal(assetId: string): void {
    this._matDialog.open(RenderAssetsModalComponent,
      {
        data: assetId,
        height: '80vh',
        width: '90vw',
      }
    )
  }
}