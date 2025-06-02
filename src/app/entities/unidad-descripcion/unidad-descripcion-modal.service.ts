import { Injectable } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ListSelectedUdModalComponent } from "./apareo/list-selected-ud-modal/list-selected-ud-modal.component";
import { SyncUDAfromAtomComponent } from './sync-udafrom-atom/sync-udafrom-atom.component';
import { AtomPrepResult, ParentUD, UnidadDescripcion } from './unidad-descripcion.model';
import { UnidadDescripcionService } from './unidad-descripcion.service';
import { UnidadDescripcionAltaRapidaComponent } from './unidad-descripcion-factory/unidad-descripcion-alta-rapida/unidad-descripcion-alta-rapida.component';
import { ActionUDAModalComponent } from "./zmodals/action-udamodal/action-udamodal.component";
import {UdaMinieditorComponent} from './zmodals/uda-minieditor/uda-minieditor.component';
import { ExportarUdasModalComponent } from "./zmodals/exportar-udas-modal/exportar-udas-modal.component";
import { UdaMigracionAtomModalComponent } from "./zmodals/uda-migracion-atom-modal/uda-migracion-atom-modal.component";


@Injectable()
export class UnidadDescripcionModalService {

  private dialogResult$ = new Subject<UnidadDescripcion>();
  private dialogUdaMiniEditor$ = new Subject<UnidadDescripcion>();
  private dialogExports$ = new Subject<AtomPrepResult>();


  constructor(private dialog: MatDialog,
    private _service: UnidadDescripcionService
  ) { }



  public initAltaRapida(parent: ParentUD): Subject<UnidadDescripcion> {
    this.dialogResult$ = new Subject<UnidadDescripcion>();
    this.openDialog(parent);
    return this.dialogResult$;
  }

  private openDialog(parent: ParentUD) {
    const dialogRef = this.dialog
      .open(UnidadDescripcionAltaRapidaComponent, {
        data: parent
      });

    dialogRef.afterClosed().subscribe((result: UnidadDescripcion) => {
      if (result) this.dialogResult$.next(result);
    })
  }

  public openBrowseUDAfromAtoMSlug(): Subject<UnidadDescripcion> {
    this.dialogResult$ = new Subject<UnidadDescripcion>();
    this.openBrowse();
    return this.dialogResult$;
  }

  public openListFromUdasResults(udaList: UnidadDescripcion[]): Subject<UnidadDescripcion> {
    this.dialogResult$ = new Subject<UnidadDescripcion>();
    this.openModalListUdas(udaList);
    return this.dialogResult$;
  }

  public openActionUda(): Subject<any> {
    const subject$ = new Subject<any>();
    this.openModalActionUda(subject$);
    return subject$;
  }

  private openModalActionUda(subject$: Subject<any>): void {
    this.dialog.open(ActionUDAModalComponent).afterClosed()
      .subscribe(result => {
        if(result)
          subject$.next(result);
      })
  }

  private openModalListUdas(udaList: UnidadDescripcion[]): void {
    this.dialog.open(ListSelectedUdModalComponent,
      {data: udaList}).afterClosed().
      subscribe(result => {
        if(result){
          this.dialogResult$.next(result);
        }
      })
  }

  private openBrowse(): void {
    this.dialog.open(SyncUDAfromAtomComponent).afterClosed().
      subscribe(slug => {
        if (slug) {
          this._service.fetchUDAFromAtoMSlug(slug).subscribe(
            result => {
              if (result)
                this.dialogResult$.next(result);
            }
          )
        };
      })
  }


  openUdaMiniEditorModal(udaId: string): Subject<UnidadDescripcion> {
    this.dialogUdaMiniEditor$ = new Subject<UnidadDescripcion>();
    this._openUdaMiniEditor(udaId);
    return this.dialogUdaMiniEditor$;
  }

  private _openUdaMiniEditor(udaId: string): void {
    this.dialog.open(UdaMinieditorComponent, {data: {udaId}})
      .afterClosed()
      .subscribe(uda => {
        this.dialogUdaMiniEditor$.next(uda);
      });
  }

  public openExportModal(data: any): Subject<AtomPrepResult> {
    this.dialogExports$ = new Subject<AtomPrepResult>();
    this._openExport(data);
    return this.dialogExports$;
  }

  private _openExport(data): void {
    this.dialog.open(UdaMigracionAtomModalComponent, { data })
      .afterClosed()
      .subscribe(resultado => {
        this.dialogExports$.next(resultado);
      });
  }
}
