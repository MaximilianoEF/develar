import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { RenderAssetsModalService } from '../../../develar-commons/render-assets-modal/render-assets-modal.service';
import { UnidadDescripcionHelper } from '../unidad-descripcion.helper';
import { UdAssets } from '../unidad-descripcion.model';


@Component({
  selector: 'unidad-descripcion-children-tree',
  templateUrl: './unidad-descripcion-children-tree.component.html',
  styleUrls: ['./unidad-descripcion-children-tree.component.scss'],
  providers: [RenderAssetsModalService]
})
export class UnidadDescripcionChildrenTreeComponent implements OnInit {

  @Input() childrensTree$: Observable<UdAssets[]>;
  public loading: boolean;
  constructor(
              private _assetModal: RenderAssetsModalService
  ) {
    this.loading = false;
  }

  ngOnInit(): void {
    this.loading = true;
    this.childrensTree$.pipe(
      tap(results => {
        results.sort((a, b) => {
          if (a.idUda === b.idParent) {
            /** a es hijo de b */
            return -1;
          }
          if (a.idParent === b.idParent) {
            /** a es hermano de b */
            return 0;
          }
          /** No hay relación */
          return 1;
        });
      }),
      finalize( () => this.loading = false)
    ).subscribe();
  }

  public getLabel(type: string, val: string): string {
    return UnidadDescripcionHelper.getOptionLabel(type, val);
  }

  public getReferenceCode(reference_code): string {
    return UnidadDescripcionHelper.buildReferenceCode(reference_code);
  }

  public openModalRenderAsset(assetId: string): void {
    this._assetModal.renderAssets(assetId);
  }
}
