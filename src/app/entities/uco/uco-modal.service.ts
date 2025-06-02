import { Injectable } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { IngestProcess } from '../ingesta/ingesta.model';
import { UcoBrowseModalComponent } from './uco-browse/uco-browse-modal/uco-browse-modal.component';
import { UcoAltaRapidaModalComponent } from './uco-factory/uco-alta-rapida-modal/uco-alta-rapida-modal.component';
import { UcoFactoryViewComponent } from './uco-factory/uco-factory-view/uco-factory-view.component';
import { Uco } from './uco.model';

@Injectable()
export class UcoModalService {

  private dialogResult$: Subject<Uco>;

  private dialogResultBrowse$: Subject<IngestProcess>;

  constructor(private _matDialog: MatDialog) { }

  public setupAltaRapidaUcoModal(): Subject<Uco> {
    this.dialogResult$ = new Subject<Uco>();
    this.openAltaRapidaUcoModal();
    return this.dialogResult$;
  }


  private openAltaRapidaUcoModal(): void {
    const dialogRef = this._matDialog.open(UcoAltaRapidaModalComponent, {
      width: '650px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogResult$.next(result);
      }
    });
  }

  public setupBrowseUcoModal(pi: IngestProcess): Subject<IngestProcess> {
    this.dialogResultBrowse$ = new Subject<IngestProcess>();
    this.openBrowseUcoModal(pi);
    return this.dialogResultBrowse$;

  }

  private openBrowseUcoModal(pi: IngestProcess): void {
    if (pi) {
      const dialogRef = this._matDialog.open(UcoBrowseModalComponent, {
        width: '650px',
        data: pi
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.dialogResultBrowse$.next(result);
        }
      });
    }
  }
  
  public openViewModal(id : string) : void {
    const dialogRef = this._matDialog.open(UcoFactoryViewComponent, {
      width: '650px',
      data: id
    });
  }

}