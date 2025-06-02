import { Component, OnInit, Input } from '@angular/core';
import { AssetService } from '../../../../../develar-commons/asset.service';
import { Asset } from '../../../../../develar-commons/develar-entities';
import { RenderAssetsModalService } from '../../../../../develar-commons/render-assets-modal/render-assets-modal.service';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';

@Component({
  selector: 'view-content-ud',
  templateUrl: './view-content-ud.component.html',
  styleUrls: ['./view-content-ud.component.scss'],
  providers: [RenderAssetsModalService]
})
export class ViewContentUdComponent implements OnInit {

  @Input() ud: UnidadDescripcion;
  /** Array que contiene los assets de la UD */
  public assetFromUda: Asset[] = [];
  constructor(
              private assetService: AssetService,
              private _assetModal: RenderAssetsModalService
  ){}

  ngOnInit(): void {
    this.initOnce();
  }

  private async initOnce() {
    if(this.ud && this.ud.assets && this.ud.assets.length){
      /**
       * Vamos a reescribir el path del asset, ya que trabajamos con /public/ingesta/....
       * Por ende, le anteponemos el /ingesta
       * */
      for(let asset of this.ud.assets) {
        if(asset.entity !== 'directory'){
          const assetRecord = await this.assetService.getAsset(asset.entityId);
          assetRecord.path = `/ingesta${assetRecord.path}`;
          this.assetFromUda.push(assetRecord);
        }
      }
    }
  }

  public openRenderAssetModal(assetId: string): void {
    this._assetModal.renderAssets(assetId);
  }

}
