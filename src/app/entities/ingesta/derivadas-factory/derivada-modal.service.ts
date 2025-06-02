import { Injectable } from '@angular/core';
import { MatDialog }              from '@angular/material/dialog';
import { Subject }                from 'rxjs';
import { DerivadaAssetModalComponent } from './zmodals/derivada-asset/derivada-asset-modal.component';
import {Asset} from '../../../develar-commons/develar-entities';


@Injectable()
export class DerivadaModalService {
  /* Gestión de ventanas modales */
  private crearDerivadaResult$ = new Subject<any>();

  constructor(
    private _dialog: MatDialog
  ) { }

  /**
   * Modal para la creación de derivadas
   *
   * @return Subject
   */
  public setupCrearDerivadaParaAssetModal(asset: Asset): Subject<any> {
    this.crearDerivadaResult$ = new Subject<any>();
    this.abrirCrearDerivadaParaAssetModal(asset);
    return this.crearDerivadaResult$;
  }

  private abrirCrearDerivadaParaAssetModal(asset: Asset): void {
    const modal = this._dialog.open(DerivadaAssetModalComponent, { data: { asset }});
    modal.afterClosed().subscribe(results => {
      this.crearDerivadaResult$.next(results);
    });
  }

}
