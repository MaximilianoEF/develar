import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { UnidadDescripcion } from '../../unidad-descripcion/unidad-descripcion.model';
import { AltaRapidaIngestProcessModalComponent } from '../ingest-process/alta-rapida-ingest-process-modal/alta-rapida-ingest-process-modal.component';

import { RootfolderModalComponent } from './zmodals/rootfolder-modal/rootfolder-modal.component';
import { UdaSelectModalComponent } from './zmodals/uda-select-modal/uda-select-modal.component';
import { AssetsTreeviewModalComponent } from './zmodals/assets-treeview-modal/assets-treeview-modal.component';

import {IngestProcess } from '../ingesta.model';
import { Asset } from '../../../develar-commons/develar-entities';
import { AssetsEditModalComponent } from './ingest-rootfolder-xcomponents/assets-edit-modal/assets-edit-modal.component';
import { UdsFormdataModalComponent } from './zmodals/uds-formdata-modal/uds-formdata-modal.component';
import { ConfirmationModalComponent } from './zmodals/confirmation-modal/confirmation-modal.component';
import { AssetMetadataModalComponent } from './zmodals/asset-metadata-modal/asset-metadata-modal.component';
import { AprobationModalComponent } from './zmodals/aprobation-modal/aprobation-modal.component';
import { SlugPiEditComponent } from './zmodals/slug-pi-edit/slug-pi-edit.component';

@Injectable()
export class IngestaModalService {

  private dialogResult$ = new Subject<any>();
  private dialogBrowserResult$ = new Subject<UnidadDescripcion>();
  private dialogIngestProcessResult$ = new Subject<any>();
  private dialogITResult$ = new Subject<any>();
  private dialogAssetResult$ = new Subject<Asset>();
  public dialogSlugResult$ = new Subject<string>();

  /** Subject para el modal de vista de árbol de la carpeta de ingesta */
  private dialogTreeViewResult$ = new Subject<any>();
  /** Subject para el modal de carga de datos mínimos para generación de UDC-UDS */
  private dialogUdaFormDataModal$ = new Subject<any>();
  /** Subject para el modal de confirmación de acción */
  private dialogConfirmationModal$ = new Subject<boolean>();
  /** Subject para el modal de metadatos de un asset */
  private dialogAssetMetadataModal$ = new Subject<any>();

  constructor(
    private dialogService: MatDialog
  ) {
  }

  public setupAltaRapidaITModal() : Subject<any> {
    this.dialogITResult$ = new Subject<any>();
    return this.dialogITResult$;
  }

  public setupAltaRapidaCarpetaRaizModal(pathInfo: any): Subject<any> {
    this.dialogResult$ = new Subject<any>();
    this.openAltaRapidaCarpetaRaizModal(pathInfo);
    return this.dialogResult$;
  }

  public setupBrowserUDModal() : Subject<UnidadDescripcion> {
    this.dialogBrowserResult$ = new Subject<UnidadDescripcion>();
    this.openBrowserUDModal();
    return this.dialogBrowserResult$;
  }

  public setupAltaRapidaIngestProcess() : Subject<IngestProcess> {
    this.dialogIngestProcessResult$ = new Subject<IngestProcess>();
    this.openAltaRapidaIngestProcess();
    return this.dialogIngestProcessResult$;
  }

  public setupIngestFolderTreeViewModal(treeData: any): Subject<any> {
    this.dialogTreeViewResult$ = new Subject<any>();
    this.openIngestFolderTreeViewModal(treeData);
    return this.dialogTreeViewResult$;
  }

  public setupEditAssetModal(asset : Asset) : Subject<Asset> {
    this.dialogAssetResult$ = new Subject<Asset>();
    this.openEditAssetModal(asset);
    return this.dialogAssetResult$;
  }

  /**
   * Modal de carga de datos para posterior generación de UDAs
   * Pre: ninguna
   * Post: ninguna
   */
  public setupUdsFormDataModal(pi: IngestProcess): Subject<any> {
    this.dialogUdaFormDataModal$ = new Subject<any>();
    this.openUdsFormDataModal(pi);
    return this.dialogUdaFormDataModal$;
  }

  public setupEditSlugModal(slug: string): Subject<string> {
    this.dialogSlugResult$ = new Subject<string>();
    this._openEditSlugModal(slug);
    return this.dialogSlugResult$
  }

  private _openEditSlugModal(slug: string): void {
    const dialogRef = this.dialogService.open(SlugPiEditComponent,
      { data: slug});

      dialogRef.afterClosed().subscribe(slug => {
        if(slug) {
          this.dialogSlugResult$.next(slug);
        }
      })
  }

  /**
   * Abre el modal de carga de datos mínimos para generación de UDC-UDS
   *
   */
  private openUdsFormDataModal(pi: IngestProcess): void {
    const dialogRef = this.dialogService.open(UdsFormdataModalComponent,
      {data: pi});
    dialogRef.afterClosed().subscribe(formdata => {
      if (formdata) {
        this.dialogUdaFormDataModal$.next(formdata);
      }
    });
  }


  /**
   * Modal de confirmación de acción; en particular se usa para confirmar la
   * eliminación de la udaList de un P.I., pero podría generalizarse para
   * cualquier otra acción
   *
   * Pre: ninguna
   * Post: el resultado se valoriza a verdadero o falso, atento a la elección del
   *       usuario
   *
   */
   public setupConfirmationModal(title: string, message: string): Subject<boolean> {
    this.dialogConfirmationModal$ = new Subject<boolean>();
    this.openConfirmationDialog(title, message);
    return this.dialogConfirmationModal$;
  }

  /**
   * Abre el modal de confirmación de acción
   */
  private openConfirmationDialog(title: string, message: string): void {
    const dialogRef = this.dialogService.open(ConfirmationModalComponent, { data: { title, message} });
    dialogRef.afterClosed().subscribe((confirmationResult) => {
      this.dialogConfirmationModal$.next(confirmationResult);
    });
  }

  /**
   * Modal de confirmación de acción; en particular se usa para confirmar la
   * eliminación de la udaList de un P.I., pero podría generalizarse para
   * cualquier otra acción
   *
   * Pre: ninguna
   * Post: el resultado se valoriza a verdadero o falso, atento a la elección del
   *       usuario
   *
   */
   public setupAprobacionModal(pi: IngestProcess, title: string, message: string, errorMsg: Array<string>): Subject<boolean> {
    let dialogEventStatus$ = new Subject<boolean>();
    this.openAprobacionDialog(pi, title, message, errorMsg, dialogEventStatus$);
    return dialogEventStatus$;
  }

  /**
   * Abre el modal de confirmación de acción
   */
  private openAprobacionDialog(pi: IngestProcess, title: string, message: string,errorMsg: Array<string>, dialogEventStatus$: Subject<boolean>): void {
    const dialogRef = this.dialogService.open(AprobationModalComponent, { data: { title, message, pi, errorMsg} });
    dialogRef.afterClosed().subscribe((confirmationResult) => {
      dialogEventStatus$.next(confirmationResult);
    });
  }




  /**
   * Modal que muestra los metadatos (datos EXIF) de un asset
   *
   * Pre:
   * - objeto con los datos EXIF del asset
   * Post: ninguna
   */
  public setupAssetMetadataModal(asset, metadata): Subject<any> {
    this.dialogAssetMetadataModal$ = new Subject<any>();
    this.openAssetMetadataModal(asset, metadata);
    return this.dialogAssetMetadataModal$;
  }

  /**
   * Abre el modal que muestra los metadatos EXIF de un asset
   */
  private openAssetMetadataModal(filename, metadata): void {
    const dialogRef = this.dialogService.open(AssetMetadataModalComponent, { data: { filename, metadata } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // c onsole.log(result);
      }
    });
  }

  /**
   * Carga el modal para visualizar los contenidos de una carpeta en forma
   * de árbol
   */
  private openIngestFolderTreeViewModal(treeData: any): void {
    const dialogRef = this.dialogService.open(AssetsTreeviewModalComponent, { data: treeData });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // c onsole.log(result);
      }
    });
  }

  private openEditAssetModal(asset : Asset) : void {
    const dialogRef = this.dialogService.open(AssetsEditModalComponent, {data : asset});

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.dialogAssetResult$.next(result);
      }
    })
  }

  private openAltaRapidaIngestProcess() : void {
    const dialogRef = this.dialogService.open(AltaRapidaIngestProcessModalComponent,{
      // height: '350px',
      width : '550px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.dialogIngestProcessResult$.next(result);
      }
    })
  }

  private openBrowserUDModal() : void {
    const dialogRef = this.dialogService.open(UdaSelectModalComponent,{
      height: '350px',
      width : '700px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.dialogBrowserResult$.next(result);
      }
    })
  }

  private openAltaRapidaCarpetaRaizModal(pathInfo: any): void {
    const dialogRef = this.dialogService.open(RootfolderModalComponent, { data: { pathInfo }});

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogResult$.next(result);
      }
    });
  }


}
