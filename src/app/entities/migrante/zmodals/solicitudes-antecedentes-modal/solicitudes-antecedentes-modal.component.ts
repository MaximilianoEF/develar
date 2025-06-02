import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { RenderAssetsModalService } from '../../../../develar-commons/render-assets-modal/render-assets-modal.service';
import { MigranteAntecedenteData } from '../../migrante.model';
import { MigranteService } from '../../migrante.service';

@Component({
  selector: 'solicitudes-antecedentes-modal',
  templateUrl: './solicitudes-antecedentes-modal.component.html',
  styleUrls: ['./solicitudes-antecedentes-modal.component.scss'],
  providers: [RenderAssetsModalService]
})
export class SolicitudesAntecedentesModalComponent implements OnInit {

  public antecedentesSolicitados$: BehaviorSubject<MigranteAntecedenteData[]>;
  constructor(
              public dialogRef: MatDialogRef<SolicitudesAntecedentesModalComponent>,
              private _service: MigranteService,
              private _assetModal: RenderAssetsModalService
  ) {
    this.antecedentesSolicitados$ = this._service.antecedentesSolicitados$;
  }

  ngOnInit(): void {
  }

  retirarItem(item: any): void {
    let antecendetesValue = this.antecedentesSolicitados$.value;
    antecendetesValue = antecendetesValue.filter(f => f._id !== item._id);
    this._service.antecedentesSolicitados$.next(antecendetesValue);
  }
  onSubmit(): void {
    if(this.antecedentesSolicitados$.value.length !== 0)
      this.dialogRef.close(true);
    else
      this.dialogRef.close(false);
  }

  public openModalRenderAsset(assetId: string): void {
    this._assetModal.renderAssets(assetId);
  }

}
