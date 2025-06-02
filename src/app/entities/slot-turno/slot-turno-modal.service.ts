import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { QuickCreateComponent } from './zmodals/quick-create/quick-create.component';
import { ConfirmationModalComponent } from './zmodals/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class SlotTurnoModalService {
  private quickCreateResult$ = new Subject<any>();
  private confirmationResult$ = new Subject<boolean>();

  constructor(
    private dialogService: MatDialog
  ) { }

  public setupQuickCreateModal(): Subject<any> {
    this.quickCreateResult$ = new Subject<any>();
    this.openQuickCreateModal();
    return this.quickCreateResult$;
  }

  private openQuickCreateModal(): void {
    const dialogRef = this.dialogService.open(QuickCreateComponent);
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.quickCreateResult$.next(dialogResult);
      }
    });
  }

  public setupConfirmationModal(): Subject<any> {
    this.quickCreateResult$ = new Subject<any>();
    this.openConfirmationModal();
    return this.quickCreateResult$;
  }

  private openConfirmationModal(): void {
    const dialogRef = this.dialogService.open(ConfirmationModalComponent);
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.confirmationResult$.next(dialogResult);
      }
    });
  }
}
